/**
 * ⚔️ MathBot Arena - Battle Manager
 * Orchestrates matchmaking, battle flow, and WebSocket communication
 */

import { Server as SocketServer, Socket } from 'socket.io';
import {
  Player,
  Battle,
  BattlePlayer,
  ClientMessage,
  ServerMessage,
  MatchmakingQueue,
  RoundResultData,
  AnimationData,
  BattleRewards,
  BattleStats,
  ReplayEvent,
  calculateMatchScore,
  calculateEloChange,
  getRankTier
} from './types';
import {
  BattleHero,
  resolveRound,
  isBattleOver,
  getWinner,
  processTurnEffects,
  chargeUltimate,
  useUltimate,
  AnswerSubmission
} from '../src/battle/battleMechanics';
import { Task, getTaskByDifficulty } from '../src/data/taskBank';

// ==================== BATTLE MANAGER CLASS ====================

export class BattleManager {
  private io: SocketServer;
  private queue: MatchmakingQueue;
  private battles: Map<string, Battle>;
  private playerSockets: Map<string, Socket>; // userId → Socket
  private socketToPlayer: Map<string, string>; // socketId → userId

  private readonly QUESTION_TIME_LIMIT = 45; // seconds
  private readonly MAX_ROUNDS = 10;
  private readonly DISCONNECT_TIMEOUT = 30; // seconds
  private readonly MATCHMAKING_INTERVAL = 2000; // milliseconds

  constructor(io: SocketServer) {
    this.io = io;
    this.queue = { child: [], teen: [], adult: [] };
    this.battles = new Map();
    this.playerSockets = new Map();
    this.socketToPlayer = new Map();

    // Start matchmaking loop
    setInterval(() => this.runMatchmaking(), this.MATCHMAKING_INTERVAL);

    console.log('⚔️ BattleManager initialized');
  }

  // ==================== MATCHMAKING ====================

  public joinQueue(socket: Socket, payload: ClientMessage & { type: 'FIND_MATCH' }): void {
    const { userId, heroData, rank, ageCategory } = payload.payload;

    // Check if already in queue or battle
    if (this.isPlayerInQueue(userId) || this.isPlayerInBattle(userId)) {
      this.sendError(socket, 'ALREADY_QUEUED', 'You are already in queue or in a battle');
      return;
    }

    const player: Player = {
      socketId: socket.id,
      userId,
      hero: heroData,
      rank,
      ageCategory,
      queuedAt: Date.now(),
      inBattle: false
    };

    this.queue[ageCategory].push(player);
    this.playerSockets.set(userId, socket);
    this.socketToPlayer.set(socket.id, userId);

    const queueLength = this.queue[ageCategory].length;
    const estimatedWait = queueLength > 1 ? 5 : 15; // seconds

    socket.emit('message', {
      type: 'QUEUE_JOINED',
      payload: {
        position: queueLength,
        estimatedWait
      }
    } as ServerMessage);

    console.log(`🎯 Player ${userId} joined ${ageCategory} queue (${queueLength} total)`);
  }

  public leaveQueue(userId: string): void {
    for (const category of ['child', 'teen', 'adult'] as const) {
      const index = this.queue[category].findIndex(p => p.userId === userId);
      if (index !== -1) {
        this.queue[category].splice(index, 1);
        console.log(`👋 Player ${userId} left queue`);
        return;
      }
    }
  }

  private runMatchmaking(): void {
    for (const category of ['child', 'teen', 'adult'] as const) {
      const categoryQueue = this.queue[category];

      if (categoryQueue.length < 2) continue;

      // Try to find best matches
      for (let i = 0; i < categoryQueue.length; i++) {
        if (categoryQueue[i].inBattle) continue;

        let bestMatch: { index: number; score: number } | null = null;

        for (let j = i + 1; j < categoryQueue.length; j++) {
          if (categoryQueue[j].inBattle) continue;

          const score = calculateMatchScore(categoryQueue[i], categoryQueue[j]);

          // Accept match if score is good enough
          const maxScore = 200; // Configurable threshold
          if (score < maxScore && (!bestMatch || score < bestMatch.score)) {
            bestMatch = { index: j, score };
          }
        }

        if (bestMatch) {
          this.createBattle(categoryQueue[i], categoryQueue[bestMatch.index]);

          // Mark as in battle (don't remove from queue yet)
          categoryQueue[i].inBattle = true;
          categoryQueue[bestMatch.index].inBattle = true;
        }
      }

      // Clean up players who are in battles
      this.queue[category] = categoryQueue.filter(p => !p.inBattle);
    }
  }

  // ==================== BATTLE CREATION ====================

  private createBattle(player1: Player, player2: Player): void {
    const battleId = this.generateBattleId();

    const battle: Battle = {
      id: battleId,
      player1: {
        socketId: player1.socketId,
        userId: player1.userId,
        hero: { ...player1.hero }, // Deep copy
        rank: player1.rank,
        answer: null,
        ready: false,
        disconnected: false,
        lastHeartbeat: Date.now()
      },
      player2: {
        socketId: player2.socketId,
        userId: player2.userId,
        hero: { ...player2.hero },
        rank: player2.rank,
        answer: null,
        ready: false,
        disconnected: false,
        lastHeartbeat: Date.now()
      },
      currentRound: 0,
      maxRounds: this.MAX_ROUNDS,
      currentQuestion: null,
      questionStartTime: 0,
      roundStartTime: 0,
      status: 'WAITING_FOR_PLAYERS',
      replay: [],
      createdAt: Date.now()
    };

    this.battles.set(battleId, battle);

    // Notify both players
    const socket1 = this.playerSockets.get(player1.userId);
    const socket2 = this.playerSockets.get(player2.userId);

    if (socket1 && socket2) {
      socket1.emit('message', {
        type: 'MATCH_FOUND',
        payload: {
          battleId,
          opponent: {
            name: player2.hero.name,
            level: player2.hero.level,
            archetype: player2.hero.archetype,
            rank: player2.rank
          }
        }
      } as ServerMessage);

      socket2.emit('message', {
        type: 'MATCH_FOUND',
        payload: {
          battleId,
          opponent: {
            name: player1.hero.name,
            level: player1.hero.level,
            archetype: player1.hero.archetype,
            rank: player1.rank
          }
        }
      } as ServerMessage);

      console.log(`⚔️ Battle created: ${battleId} (${player1.userId} vs ${player2.userId})`);
    }
  }

  // ==================== BATTLE FLOW ====================

  public handleReady(socket: Socket, payload: { battleId: string }): void {
    const battle = this.battles.get(payload.battleId);
    if (!battle) {
      this.sendError(socket, 'BATTLE_NOT_FOUND', 'Battle not found');
      return;
    }

    const userId = this.socketToPlayer.get(socket.id);
    if (!userId) return;

    if (battle.player1.userId === userId) {
      battle.player1.ready = true;
    } else if (battle.player2.userId === userId) {
      battle.player2.ready = true;
    }

    // Start battle when both ready
    if (battle.player1.ready && battle.player2.ready) {
      battle.status = 'LOADING';
      setTimeout(() => this.startNextRound(battle), 3000); // 3s loading screen
    }
  }

  private startNextRound(battle: Battle): void {
    if (battle.status === 'BATTLE_END' || battle.status === 'ABORTED') return;

    battle.currentRound++;
    battle.status = 'QUESTION_PHASE';
    battle.player1.answer = null;
    battle.player2.answer = null;

    // Generate question based on average level
    const avgLevel = Math.floor((battle.player1.hero.level + battle.player2.hero.level) / 2);
    const difficulty = Math.min(6, Math.max(1, Math.floor(avgLevel / 5) + 1));

    const question = getTaskByDifficulty(difficulty);
    battle.currentQuestion = question;
    battle.questionStartTime = Date.now();
    battle.roundStartTime = Date.now();

    // Add to replay
    battle.replay.push({
      timestamp: Date.now(),
      round: battle.currentRound,
      type: 'QUESTION',
      data: { question }
    });

    // Broadcast question to both players
    const message: ServerMessage = {
      type: 'BATTLE_START',
      payload: {
        battleId: battle.id,
        round: battle.currentRound,
        question,
        timeLimit: question.time || this.QUESTION_TIME_LIMIT
      }
    };

    this.broadcastToBattle(battle, message);

    console.log(`📝 Round ${battle.currentRound} started in battle ${battle.id}`);

    // Set timeout for round
    setTimeout(() => {
      if (battle.status === 'QUESTION_PHASE') {
        this.resolveRoundTimeout(battle);
      }
    }, (question.time || this.QUESTION_TIME_LIMIT) * 1000);
  }

  public handleAnswer(socket: Socket, payload: { battleId: string; answer: number; timeTaken: number }): void {
    const battle = this.battles.get(payload.battleId);
    if (!battle || battle.status !== 'QUESTION_PHASE') {
      this.sendError(socket, 'INVALID_STATE', 'Cannot submit answer in current state');
      return;
    }

    const userId = this.socketToPlayer.get(socket.id);
    if (!userId) return;

    const question = battle.currentQuestion;
    if (!question) return;

    const answerData = {
      answer: payload.answer,
      correct: payload.answer === question.a,
      timeTaken: payload.timeTaken,
      timestamp: Date.now()
    };

    // Store answer
    if (battle.player1.userId === userId) {
      battle.player1.answer = answerData;
      // Notify opponent
      const socket2 = this.playerSockets.get(battle.player2.userId);
      socket2?.emit('message', {
        type: 'OPPONENT_ANSWERED',
        payload: { battleId: battle.id, round: battle.currentRound }
      } as ServerMessage);
    } else if (battle.player2.userId === userId) {
      battle.player2.answer = answerData;
      // Notify opponent
      const socket1 = this.playerSockets.get(battle.player1.userId);
      socket1?.emit('message', {
        type: 'OPPONENT_ANSWERED',
        payload: { battleId: battle.id, round: battle.currentRound }
      } as ServerMessage);
    }

    // Add to replay
    battle.replay.push({
      timestamp: Date.now(),
      round: battle.currentRound,
      type: 'ANSWER',
      data: { userId, ...answerData }
    });

    // Resolve round if both answered
    if (battle.player1.answer && battle.player2.answer) {
      setTimeout(() => this.resolveRound(battle), 500); // Small delay for UX
    }
  }

  private resolveRoundTimeout(battle: Battle): void {
    // Treat missing answers as incorrect
    if (!battle.player1.answer) {
      battle.player1.answer = {
        answer: -1,
        correct: false,
        timeTaken: battle.currentQuestion?.time || this.QUESTION_TIME_LIMIT,
        timestamp: Date.now()
      };
    }

    if (!battle.player2.answer) {
      battle.player2.answer = {
        answer: -1,
        correct: false,
        timeTaken: battle.currentQuestion?.time || this.QUESTION_TIME_LIMIT,
        timestamp: Date.now()
      };
    }

    this.resolveRound(battle);
  }

  private resolveRound(battle: Battle): void {
    if (!battle.player1.answer || !battle.player2.answer || !battle.currentQuestion) {
      return;
    }

    battle.status = 'RESOLUTION_PHASE';

    const answer1: AnswerSubmission = {
      playerId: battle.player1.userId,
      answer: battle.player1.answer.answer,
      correct: battle.player1.answer.correct,
      timeTaken: battle.player1.answer.timeTaken,
      timestamp: battle.player1.answer.timestamp
    };

    const answer2: AnswerSubmission = {
      playerId: battle.player2.userId,
      answer: battle.player2.answer.answer,
      correct: battle.player2.answer.correct,
      timeTaken: battle.player2.answer.timeTaken,
      timestamp: battle.player2.answer.timestamp
    };

    // Use battle mechanics to resolve
    const roundResult = resolveRound(
      battle.player1.hero,
      battle.player2.hero,
      battle.currentQuestion,
      answer1,
      answer2
    );

    // Charge ultimates
    const p1Won = roundResult.attacker === battle.player1.hero.id;
    const p2Won = roundResult.attacker === battle.player2.hero.id;
    chargeUltimate(battle.player1.hero, p1Won);
    chargeUltimate(battle.player2.hero, p2Won);

    // Process turn effects (buffs/debuffs)
    processTurnEffects(battle.player1.hero);
    processTurnEffects(battle.player2.hero);

    // Prepare result data
    const resultData: RoundResultData = {
      type: roundResult.type,
      attacker: roundResult.attacker,
      defender: roundResult.defender,
      damage: roundResult.damage,
      p1Answer: {
        answer: battle.player1.answer.answer,
        correct: battle.player1.answer.correct,
        time: battle.player1.answer.timeTaken
      },
      p2Answer: {
        answer: battle.player2.answer.answer,
        correct: battle.player2.answer.correct,
        time: battle.player2.answer.timeTaken
      }
    };

    // Create animation data
    const animation: AnimationData = {
      type: roundResult.damage?.animation || 'draw',
      attacker: roundResult.attacker,
      defender: roundResult.defender,
      damage: roundResult.damage?.damage,
      displayText: roundResult.damage?.displayText,
      duration: roundResult.damage ? 2000 : 1000
    };

    // Add to replay
    battle.replay.push({
      timestamp: Date.now(),
      round: battle.currentRound,
      type: 'DAMAGE',
      data: { ...resultData, animation }
    });

    // Broadcast result
    const message: ServerMessage = {
      type: 'ROUND_RESULT',
      payload: {
        battleId: battle.id,
        round: battle.currentRound,
        result: resultData,
        player1HP: battle.player1.hero.currentHP,
        player2HP: battle.player2.hero.currentHP,
        animation
      }
    };

    this.broadcastToBattle(battle, message);

    console.log(`💥 Round ${battle.currentRound} resolved: ${roundResult.type}`);

    // Check if battle is over
    setTimeout(() => {
      if (isBattleOver(battle.player1.hero, battle.player2.hero)) {
        this.endBattle(battle);
      } else if (battle.currentRound >= this.MAX_ROUNDS) {
        // Max rounds reached - whoever has more HP wins
        this.endBattle(battle);
      } else {
        // Continue to next round
        battle.status = 'ROUND_END';
        setTimeout(() => this.startNextRound(battle), 2000);
      }
    }, animation.duration);
  }

  // ==================== ULTIMATE SKILLS ====================

  public handleUltimate(socket: Socket, payload: { battleId: string }): void {
    const battle = this.battles.get(payload.battleId);
    if (!battle) {
      this.sendError(socket, 'BATTLE_NOT_FOUND', 'Battle not found');
      return;
    }

    const userId = this.socketToPlayer.get(socket.id);
    if (!userId) return;

    let user: BattlePlayer | null = null;
    let target: BattlePlayer | null = null;

    if (battle.player1.userId === userId) {
      user = battle.player1;
      target = battle.player2;
    } else if (battle.player2.userId === userId) {
      user = battle.player2;
      target = battle.player1;
    }

    if (!user || !target) return;

    try {
      const result = useUltimate(user.hero, target.hero);

      // Add to replay
      battle.replay.push({
        timestamp: Date.now(),
        round: battle.currentRound,
        type: 'ULTIMATE',
        data: { userId, result }
      });

      // Broadcast ultimate use
      const message: ServerMessage = {
        type: 'ULTIMATE_USED',
        payload: {
          battleId: battle.id,
          userId,
          ultimateName: user.hero.archetype,
          effect: result,
          animation: result.animation
        }
      };

      this.broadcastToBattle(battle, message);

      console.log(`⚡ Ultimate used by ${userId} in battle ${battle.id}`);
    } catch (error) {
      this.sendError(socket, 'ULTIMATE_NOT_READY', 'Ultimate is not charged');
    }
  }

  // ==================== BATTLE END ====================

  private endBattle(battle: Battle): void {
    battle.status = 'BATTLE_END';

    const winner = getWinner(battle.player1.hero, battle.player2.hero);
    const isDraw = !winner;

    let winnerId: string;
    let winnerName: string;
    let loserId: string;

    if (isDraw) {
      // Handle draw (rare)
      winnerId = battle.player1.hero.currentHP > battle.player2.hero.currentHP
        ? battle.player1.userId
        : battle.player2.userId;
      winnerName = battle.player1.hero.currentHP > battle.player2.hero.currentHP
        ? battle.player1.hero.name
        : battle.player2.hero.name;
      loserId = winnerId === battle.player1.userId ? battle.player2.userId : battle.player1.userId;
    } else {
      winnerId = winner.userId;
      winnerName = winner.name;
      loserId = winnerId === battle.player1.userId ? battle.player2.userId : battle.player1.userId;
    }

    // Calculate ELO changes
    const winnerRank = winnerId === battle.player1.userId ? battle.player1.rank : battle.player2.rank;
    const loserRank = winnerId === battle.player1.userId ? battle.player2.rank : battle.player1.rank;
    const { winnerChange, loserChange } = calculateEloChange(winnerRank, loserRank);

    // Calculate stats
    const stats = this.calculateBattleStats(battle);

    // Calculate rewards
    const winnerRewards: BattleRewards = {
      xp: 100 + (battle.currentRound * 10),
      rankChange: winnerChange,
      coins: 50 + (battle.currentRound * 5),
      items: [],
      achievements: []
    };

    const loserRewards: BattleRewards = {
      xp: 50 + (battle.currentRound * 5),
      rankChange: loserChange,
      coins: 20 + (battle.currentRound * 2),
      items: [],
      achievements: []
    };

    // Send results to both players
    const winnerSocket = this.playerSockets.get(winnerId);
    const loserSocket = this.playerSockets.get(loserId);

    winnerSocket?.emit('message', {
      type: 'BATTLE_END',
      payload: {
        battleId: battle.id,
        winner: { userId: winnerId, name: winnerName },
        rewards: winnerRewards,
        stats
      }
    } as ServerMessage);

    loserSocket?.emit('message', {
      type: 'BATTLE_END',
      payload: {
        battleId: battle.id,
        winner: { userId: winnerId, name: winnerName },
        rewards: loserRewards,
        stats
      }
    } as ServerMessage);

    console.log(`🏆 Battle ${battle.id} ended: ${winnerName} wins!`);

    // Clean up battle after 30 seconds
    setTimeout(() => {
      this.battles.delete(battle.id);
      console.log(`🗑️ Battle ${battle.id} cleaned up`);
    }, 30000);
  }

  private calculateBattleStats(battle: Battle): BattleStats {
    const duration = Math.floor((Date.now() - battle.createdAt) / 1000);

    // Calculate accuracy and avg response time from replay
    let p1Correct = 0;
    let p2Correct = 0;
    let p1Total = 0;
    let p2Total = 0;
    let p1TotalTime = 0;
    let p2TotalTime = 0;
    let p1Combos = battle.player1.hero.comboStreak;
    let p2Combos = battle.player2.hero.comboStreak;
    let p1Crits = 0;
    let p2Crits = 0;
    let p1Damage = battle.player2.hero.maxHP - battle.player2.hero.currentHP;
    let p2Damage = battle.player1.hero.maxHP - battle.player1.hero.currentHP;

    for (const event of battle.replay) {
      if (event.type === 'ANSWER') {
        if (event.data.userId === battle.player1.userId) {
          p1Total++;
          if (event.data.correct) p1Correct++;
          p1TotalTime += event.data.timeTaken;
        } else {
          p2Total++;
          if (event.data.correct) p2Correct++;
          p2TotalTime += event.data.timeTaken;
        }
      }

      if (event.type === 'DAMAGE' && event.data.damage?.isCritical) {
        if (event.data.attacker === battle.player1.hero.id) p1Crits++;
        else p2Crits++;
      }
    }

    return {
      duration,
      totalRounds: battle.currentRound,
      accuracy: {
        player1: p1Total > 0 ? Math.round((p1Correct / p1Total) * 100) : 0,
        player2: p2Total > 0 ? Math.round((p2Correct / p2Total) * 100) : 0
      },
      avgResponseTime: {
        player1: p1Total > 0 ? Math.round(p1TotalTime / p1Total) : 0,
        player2: p2Total > 0 ? Math.round(p2TotalTime / p2Total) : 0
      },
      combos: { player1: p1Combos, player2: p2Combos },
      criticalHits: { player1: p1Crits, player2: p2Crits },
      damageDealt: { player1: p1Damage, player2: p2Damage }
    };
  }

  // ==================== DISCONNECT HANDLING ====================

  public handleDisconnect(socket: Socket): void {
    const userId = this.socketToPlayer.get(socket.id);
    if (!userId) return;

    // Remove from queue
    this.leaveQueue(userId);

    // Check if in battle
    const battle = this.findBattleByUserId(userId);
    if (battle) {
      this.handleBattleDisconnect(battle, userId);
    }

    // Cleanup
    this.playerSockets.delete(userId);
    this.socketToPlayer.delete(socket.id);

    console.log(`👋 Player ${userId} disconnected`);
  }

  private handleBattleDisconnect(battle: Battle, userId: string): void {
    let disconnectedPlayer: BattlePlayer;
    let opponentId: string;

    if (battle.player1.userId === userId) {
      disconnectedPlayer = battle.player1;
      opponentId = battle.player2.userId;
    } else {
      disconnectedPlayer = battle.player2;
      opponentId = battle.player1.userId;
    }

    disconnectedPlayer.disconnected = true;

    // Notify opponent
    const opponentSocket = this.playerSockets.get(opponentId);
    opponentSocket?.emit('message', {
      type: 'OPPONENT_DISCONNECTED',
      payload: {
        battleId: battle.id,
        countdown: this.DISCONNECT_TIMEOUT
      }
    } as ServerMessage);

    // Auto-win after timeout
    setTimeout(() => {
      if (disconnectedPlayer.disconnected) {
        // Opponent wins
        battle.status = 'BATTLE_END';
        battle.winner = opponentId;

        opponentSocket?.emit('message', {
          type: 'BATTLE_END',
          payload: {
            battleId: battle.id,
            winner: {
              userId: opponentId,
              name: opponentId === battle.player1.userId ? battle.player1.hero.name : battle.player2.hero.name
            },
            rewards: {
              xp: 100,
              rankChange: 25,
              coins: 50,
              items: [],
              achievements: []
            },
            stats: this.calculateBattleStats(battle)
          }
        } as ServerMessage);

        console.log(`⏰ Battle ${battle.id} ended due to disconnect`);
      }
    }, this.DISCONNECT_TIMEOUT * 1000);
  }

  // ==================== HELPER METHODS ====================

  private broadcastToBattle(battle: Battle, message: ServerMessage): void {
    const socket1 = this.playerSockets.get(battle.player1.userId);
    const socket2 = this.playerSockets.get(battle.player2.userId);

    socket1?.emit('message', message);
    socket2?.emit('message', message);
  }

  private sendError(socket: Socket, code: string, message: string): void {
    socket.emit('message', {
      type: 'ERROR',
      payload: { code, message }
    } as ServerMessage);
  }

  private isPlayerInQueue(userId: string): boolean {
    for (const category of ['child', 'teen', 'adult'] as const) {
      if (this.queue[category].some(p => p.userId === userId)) {
        return true;
      }
    }
    return false;
  }

  private isPlayerInBattle(userId: string): boolean {
    return this.findBattleByUserId(userId) !== null;
  }

  private findBattleByUserId(userId: string): Battle | null {
    for (const battle of this.battles.values()) {
      if (battle.player1.userId === userId || battle.player2.userId === userId) {
        if (battle.status !== 'BATTLE_END' && battle.status !== 'ABORTED') {
          return battle;
        }
      }
    }
    return null;
  }

  private generateBattleId(): string {
    return `battle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // ==================== PUBLIC GETTERS ====================

  public getQueueStatus(): { child: number; teen: number; adult: number } {
    return {
      child: this.queue.child.length,
      teen: this.queue.teen.length,
      adult: this.queue.adult.length
    };
  }

  public getActiveBattles(): number {
    return this.battles.size;
  }

  public getBattleReplay(battleId: string): ReplayEvent[] | null {
    const battle = this.battles.get(battleId);
    return battle ? battle.replay : null;
  }
}

console.log('⚔️ BattleManager class loaded');
