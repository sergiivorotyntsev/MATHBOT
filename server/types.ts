/**
 * 🌐 MathBot Arena - Server Types
 * Type definitions for WebSocket server and battle management
 */

import { BattleHero, DamageResult } from '../src/battle/battleMechanics';
import { Task } from '../src/data/taskBank';

// ==================== PLAYER & QUEUE ====================

export interface Player {
  socketId: string;
  userId: string;
  hero: BattleHero;
  rank: number;
  ageCategory: 'child' | 'teen' | 'adult'; // 6-11, 12-15, 16-18
  queuedAt: number;
  inBattle: boolean;
}

export interface MatchmakingCriteria {
  maxRankDiff: number;
  maxLevelDiff: number;
  maxWaitTime: number; // milliseconds
  sameAgeCategory: boolean;
}

// ==================== BATTLE STATE ====================

export interface Battle {
  id: string;
  player1: BattlePlayer;
  player2: BattlePlayer;
  currentRound: number;
  maxRounds: number;
  currentQuestion: Task | null;
  questionStartTime: number;
  roundStartTime: number;
  status: BattleStatus;
  winner?: string; // userId
  replay: ReplayEvent[];
  createdAt: number;
}

export interface BattlePlayer {
  socketId: string;
  userId: string;
  hero: BattleHero;
  rank: number;
  answer: AnswerData | null;
  ready: boolean;
  disconnected: boolean;
  lastHeartbeat: number;
}

export interface AnswerData {
  answer: number;
  correct: boolean;
  timeTaken: number; // seconds
  timestamp: number;
}

export type BattleStatus =
  | 'WAITING_FOR_PLAYERS'
  | 'LOADING'
  | 'QUESTION_PHASE'
  | 'RESOLUTION_PHASE'
  | 'ANIMATION_PHASE'
  | 'ROUND_END'
  | 'BATTLE_END'
  | 'ABORTED';

// ==================== WEBSOCKET MESSAGES ====================

// Client → Server
export type ClientMessage =
  | {
      type: 'FIND_MATCH';
      payload: {
        userId: string;
        heroData: BattleHero;
        rank: number;
        ageCategory: 'child' | 'teen' | 'adult';
      };
    }
  | {
      type: 'CANCEL_QUEUE';
      payload: { userId: string };
    }
  | {
      type: 'SUBMIT_ANSWER';
      payload: {
        battleId: string;
        answer: number;
        timeTaken: number;
      };
    }
  | {
      type: 'USE_ULTIMATE';
      payload: {
        battleId: string;
      };
    }
  | {
      type: 'READY';
      payload: { battleId: string };
    }
  | {
      type: 'SURRENDER';
      payload: { battleId: string };
    }
  | {
      type: 'HEARTBEAT';
      payload: { battleId: string };
    };

// Server → Client
export type ServerMessage =
  | {
      type: 'QUEUE_JOINED';
      payload: {
        position: number;
        estimatedWait: number; // seconds
      };
    }
  | {
      type: 'MATCH_FOUND';
      payload: {
        battleId: string;
        opponent: {
          name: string;
          level: number;
          archetype: string;
          rank: number;
        };
      };
    }
  | {
      type: 'BATTLE_START';
      payload: {
        battleId: string;
        round: number;
        question: Task;
        timeLimit: number;
      };
    }
  | {
      type: 'OPPONENT_ANSWERED';
      payload: {
        battleId: string;
        round: number;
      };
    }
  | {
      type: 'ROUND_RESULT';
      payload: {
        battleId: string;
        round: number;
        result: RoundResultData;
        player1HP: number;
        player2HP: number;
        animation: AnimationData;
      };
    }
  | {
      type: 'ULTIMATE_USED';
      payload: {
        battleId: string;
        userId: string;
        ultimateName: string;
        effect: any;
        animation: string;
      };
    }
  | {
      type: 'BATTLE_END';
      payload: {
        battleId: string;
        winner: {
          userId: string;
          name: string;
        };
        rewards: BattleRewards;
        stats: BattleStats;
      };
    }
  | {
      type: 'OPPONENT_DISCONNECTED';
      payload: {
        battleId: string;
        countdown: number; // seconds until auto-win
      };
    }
  | {
      type: 'OPPONENT_RECONNECTED';
      payload: {
        battleId: string;
      };
    }
  | {
      type: 'BATTLE_ABORTED';
      payload: {
        battleId: string;
        reason: string;
      };
    }
  | {
      type: 'ERROR';
      payload: {
        message: string;
        code: string;
      };
    };

// ==================== BATTLE RESULTS ====================

export interface RoundResultData {
  type: 'ATTACK' | 'DRAW' | 'BOTH_WRONG';
  attacker?: string; // userId
  defender?: string;
  damage?: DamageResult;
  p1Answer: { answer: number; correct: boolean; time: number };
  p2Answer: { answer: number; correct: boolean; time: number };
}

export interface AnimationData {
  type: 'normal_hit' | 'critical_hit' | 'dodge' | 'block' | 'ultimate' | 'draw';
  attacker?: string;
  defender?: string;
  damage?: number;
  displayText?: string;
  duration: number; // milliseconds
}

export interface BattleRewards {
  xp: number;
  rankChange: number;
  coins?: number;
  items?: string[];
  achievements?: string[];
}

export interface BattleStats {
  duration: number; // seconds
  totalRounds: number;
  accuracy: { player1: number; player2: number };
  avgResponseTime: { player1: number; player2: number };
  combos: { player1: number; player2: number };
  criticalHits: { player1: number; player2: number };
  damageDealt: { player1: number; player2: number };
}

// ==================== REPLAY SYSTEM ====================

export interface ReplayEvent {
  timestamp: number;
  round: number;
  type: 'QUESTION' | 'ANSWER' | 'DAMAGE' | 'ULTIMATE' | 'BUFF' | 'DEBUFF';
  data: any;
}

export interface ReplayData {
  battleId: string;
  player1: { userId: string; name: string; archetype: string; level: number };
  player2: { userId: string; name: string; archetype: string; level: number };
  events: ReplayEvent[];
  result: {
    winner: string;
    duration: number;
    rounds: number;
  };
}

// ==================== RANKING SYSTEM ====================

export interface RankTier {
  name: string;
  minRank: number;
  maxRank: number;
  color: string;
  icon: string;
}

export const RANK_TIERS: RankTier[] = [
  { name: 'Bronze', minRank: 0, maxRank: 999, color: '#CD7F32', icon: '🥉' },
  { name: 'Silver', minRank: 1000, maxRank: 1999, color: '#C0C0C0', icon: '🥈' },
  { name: 'Gold', minRank: 2000, maxRank: 2999, color: '#FFD700', icon: '🥇' },
  { name: 'Platinum', minRank: 3000, maxRank: 3999, color: '#E5E4E2', icon: '💎' },
  { name: 'Diamond', minRank: 4000, maxRank: 4999, color: '#B9F2FF', icon: '💠' },
  { name: 'Master', minRank: 5000, maxRank: 5999, color: '#9C27B0', icon: '👑' },
  { name: 'Legend', minRank: 6000, maxRank: 99999, color: '#FF1744', icon: '⚡' }
];

export function getRankTier(rank: number): RankTier {
  return RANK_TIERS.find(tier => rank >= tier.minRank && rank <= tier.maxRank) || RANK_TIERS[0];
}

// ==================== MATCHMAKING ====================

export interface MatchmakingQueue {
  child: Player[];
  teen: Player[];
  adult: Player[];
}

export function calculateMatchScore(p1: Player, p2: Player): number {
  // Lower score = better match
  const rankDiff = Math.abs(p1.rank - p2.rank);
  const levelDiff = Math.abs(p1.hero.level - p2.hero.level);
  const waitTime = Math.max(
    Date.now() - p1.queuedAt,
    Date.now() - p2.queuedAt
  );

  // Weight factors
  let score = rankDiff * 2 + levelDiff * 5;

  // After 30 seconds, reduce score to increase match probability
  if (waitTime > 30000) {
    score *= 0.7;
  }

  // After 60 seconds, reduce even more
  if (waitTime > 60000) {
    score *= 0.5;
  }

  return score;
}

// ==================== ELO RATING ====================

export function calculateEloChange(
  winnerRank: number,
  loserRank: number,
  kFactor: number = 32
): { winnerChange: number; loserChange: number } {
  // Expected win probability
  const expectedWinner = 1 / (1 + Math.pow(10, (loserRank - winnerRank) / 400));
  const expectedLoser = 1 / (1 + Math.pow(10, (winnerRank - loserRank) / 400));

  // Actual score (1 for win, 0 for loss)
  const winnerChange = Math.round(kFactor * (1 - expectedWinner));
  const loserChange = Math.round(kFactor * (0 - expectedLoser));

  return { winnerChange, loserChange };
}

console.log('🌐 Server Types loaded');
