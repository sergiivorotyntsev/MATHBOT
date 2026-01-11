/**
 * ⚔️ MathBot Arena - Battle Arena Component
 * Main PvP battle interface
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBattleSocket } from '../hooks/useBattleSocket';
import { BattleHero } from '../battle/battleMechanics';
import { ServerMessage, BattleRewards, BattleStats, RoundResultData, AnimationData } from '../../server/types';
import { Task } from '../data/taskBank';
import { Swords, Shield, Heart, Zap, Clock, Trophy, Target } from 'lucide-react';

// ==================== TYPES ====================

type BattlePhase =
  | 'MATCHMAKING'
  | 'LOADING'
  | 'QUESTION'
  | 'WAITING_ANSWER'
  | 'RESOLUTION'
  | 'ANIMATION'
  | 'ROUND_END'
  | 'BATTLE_END';

interface BattleState {
  phase: BattlePhase;
  battleId: string | null;
  round: number;
  question: Task | null;
  timeLimit: number;
  timeRemaining: number;
  questionStartTime: number;

  // Players
  myHero: BattleHero;
  opponentHero: BattleHero | null;
  opponentInfo: {
    name: string;
    level: number;
    archetype: string;
    rank: number;
  } | null;

  // Battle state
  myHP: number;
  opponentHP: number;
  myAnswer: number | null;
  opponentAnswered: boolean;

  // Results
  lastRoundResult: RoundResultData | null;
  lastAnimation: AnimationData | null;
  battleRewards: BattleRewards | null;
  battleStats: BattleStats | null;
  winner: { userId: string; name: string } | null;

  // Queue
  queuePosition: number;
  estimatedWait: number;
}

// ==================== COMPONENT ====================

interface BattleArenaProps {
  hero: BattleHero;
  rank: number;
  ageCategory: 'child' | 'teen' | 'adult';
  onBattleEnd?: (rewards: BattleRewards, stats: BattleStats) => void;
  onExit?: () => void;
}

export const BattleArena: React.FC<BattleArenaProps> = ({
  hero,
  rank,
  ageCategory,
  onBattleEnd,
  onExit
}) => {
  const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

  const [battleState, setBattleState] = useState<BattleState>({
    phase: 'MATCHMAKING',
    battleId: null,
    round: 0,
    question: null,
    timeLimit: 45,
    timeRemaining: 45,
    questionStartTime: 0,

    myHero: hero,
    opponentHero: null,
    opponentInfo: null,

    myHP: hero.maxHP,
    opponentHP: 0,
    myAnswer: null,
    opponentAnswered: false,

    lastRoundResult: null,
    lastAnimation: null,
    battleRewards: null,
    battleStats: null,
    winner: null,

    queuePosition: 0,
    estimatedWait: 0
  });

  // Message handler
  const handleMessage = useCallback((message: ServerMessage) => {
    switch (message.type) {
      case 'QUEUE_JOINED':
        setBattleState(prev => ({
          ...prev,
          queuePosition: message.payload.position,
          estimatedWait: message.payload.estimatedWait
        }));
        break;

      case 'MATCH_FOUND':
        setBattleState(prev => ({
          ...prev,
          phase: 'LOADING',
          battleId: message.payload.battleId,
          opponentInfo: message.payload.opponent,
          opponentHP: 100 + (message.payload.opponent.level * 10) // Estimate HP
        }));

        // Auto-ready after 1 second
        setTimeout(() => {
          if (message.payload.battleId) {
            ready(message.payload.battleId);
          }
        }, 1000);
        break;

      case 'BATTLE_START':
        setBattleState(prev => ({
          ...prev,
          phase: 'QUESTION',
          round: message.payload.round,
          question: message.payload.question,
          timeLimit: message.payload.timeLimit,
          timeRemaining: message.payload.timeLimit,
          questionStartTime: Date.now(),
          myAnswer: null,
          opponentAnswered: false
        }));
        break;

      case 'OPPONENT_ANSWERED':
        setBattleState(prev => ({
          ...prev,
          opponentAnswered: true
        }));
        break;

      case 'ROUND_RESULT':
        setBattleState(prev => ({
          ...prev,
          phase: 'RESOLUTION',
          lastRoundResult: message.payload.result,
          lastAnimation: message.payload.animation,
          myHP: message.payload.player1HP,
          opponentHP: message.payload.player2HP
        }));

        // Transition to animation phase
        setTimeout(() => {
          setBattleState(prev => ({ ...prev, phase: 'ANIMATION' }));
        }, 500);

        // Transition to round end or battle end
        setTimeout(() => {
          setBattleState(prev => ({
            ...prev,
            phase: 'ROUND_END'
          }));
        }, message.payload.animation.duration + 500);
        break;

      case 'ULTIMATE_USED':
        // TODO: Show ultimate animation
        console.log('⚡ Ultimate used:', message.payload);
        break;

      case 'BATTLE_END':
        setBattleState(prev => ({
          ...prev,
          phase: 'BATTLE_END',
          winner: message.payload.winner,
          battleRewards: message.payload.rewards,
          battleStats: message.payload.stats
        }));

        onBattleEnd?.(message.payload.rewards, message.payload.stats);
        break;

      case 'OPPONENT_DISCONNECTED':
        // TODO: Show disconnect countdown
        console.log('⚠️ Opponent disconnected');
        break;

      case 'OPPONENT_RECONNECTED':
        console.log('✅ Opponent reconnected');
        break;

      case 'BATTLE_ABORTED':
        console.log('❌ Battle aborted:', message.payload.reason);
        onExit?.();
        break;

      case 'ERROR':
        console.error('❌ Server error:', message.payload);
        break;
    }
  }, [onBattleEnd, onExit]);

  // WebSocket connection
  const {
    connected,
    findMatch,
    cancelQueue,
    ready,
    submitAnswer,
    useUltimate: sendUltimate,
    surrender
  } = useBattleSocket({
    serverUrl: SERVER_URL,
    userId: hero.userId,
    onMessage: handleMessage,
    onConnect: () => console.log('🔌 Connected to battle server'),
    onDisconnect: () => console.log('🔌 Disconnected from battle server'),
    onError: (error) => console.error('❌ Socket error:', error)
  });

  // Auto-find match on mount
  useEffect(() => {
    if (connected && battleState.phase === 'MATCHMAKING') {
      findMatch(hero, rank, ageCategory);
    }
  }, [connected, battleState.phase, findMatch, hero, rank, ageCategory]);

  // Timer countdown
  useEffect(() => {
    if (battleState.phase !== 'QUESTION' || !battleState.question) return;

    const interval = setInterval(() => {
      setBattleState(prev => {
        const elapsed = (Date.now() - prev.questionStartTime) / 1000;
        const remaining = Math.max(0, prev.timeLimit - elapsed);

        if (remaining === 0 && !prev.myAnswer) {
          // Auto-submit timeout (wrong answer)
          handleSubmitAnswer(-1);
        }

        return {
          ...prev,
          timeRemaining: remaining
        };
      });
    }, 100);

    return () => clearInterval(interval);
  }, [battleState.phase, battleState.question, battleState.questionStartTime]);

  // Answer submission
  const handleSubmitAnswer = useCallback((answer: number) => {
    if (!battleState.battleId || !battleState.question || battleState.myAnswer !== null) return;

    const timeTaken = (Date.now() - battleState.questionStartTime) / 1000;

    submitAnswer(battleState.battleId, answer, timeTaken);

    setBattleState(prev => ({
      ...prev,
      phase: 'WAITING_ANSWER',
      myAnswer: answer
    }));
  }, [battleState.battleId, battleState.question, battleState.myAnswer, battleState.questionStartTime, submitAnswer]);

  const handleUseUltimate = useCallback(() => {
    if (!battleState.battleId || battleState.myHero.ultimateCharge < 100) return;

    sendUltimate(battleState.battleId);
  }, [battleState.battleId, battleState.myHero.ultimateCharge, sendUltimate]);

  const handleSurrender = useCallback(() => {
    if (!battleState.battleId) return;

    if (confirm('Are you sure you want to surrender?')) {
      surrender(battleState.battleId);
      onExit?.();
    }
  }, [battleState.battleId, surrender, onExit]);

  const handleExit = useCallback(() => {
    if (battleState.phase === 'MATCHMAKING') {
      cancelQueue();
    }
    onExit?.();
  }, [battleState.phase, cancelQueue, onExit]);

  // ==================== RENDER ====================

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 z-50">
      <AnimatePresence mode="wait">
        {battleState.phase === 'MATCHMAKING' && (
          <MatchmakingScreen
            key="matchmaking"
            position={battleState.queuePosition}
            estimatedWait={battleState.estimatedWait}
            onCancel={handleExit}
          />
        )}

        {battleState.phase === 'LOADING' && battleState.opponentInfo && (
          <LoadingScreen
            key="loading"
            opponent={battleState.opponentInfo}
          />
        )}

        {(battleState.phase === 'QUESTION' ||
          battleState.phase === 'WAITING_ANSWER' ||
          battleState.phase === 'RESOLUTION' ||
          battleState.phase === 'ANIMATION' ||
          battleState.phase === 'ROUND_END') && (
          <BattleScreen
            key="battle"
            battleState={battleState}
            onSubmitAnswer={handleSubmitAnswer}
            onUseUltimate={handleUseUltimate}
            onSurrender={handleSurrender}
          />
        )}

        {battleState.phase === 'BATTLE_END' && battleState.winner && (
          <BattleEndScreen
            key="battle-end"
            winner={battleState.winner}
            rewards={battleState.battleRewards!}
            stats={battleState.battleStats!}
            isVictory={battleState.winner.userId === hero.userId}
            onExit={handleExit}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// ==================== SUB-COMPONENTS ====================

// Matchmaking Screen
const MatchmakingScreen: React.FC<{
  position: number;
  estimatedWait: number;
  onCancel: () => void;
}> = ({ position, estimatedWait, onCancel }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="flex flex-col items-center justify-center h-full text-white"
  >
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      className="mb-8"
    >
      <Swords size={64} className="text-yellow-400" />
    </motion.div>

    <h1 className="text-4xl font-bold mb-4">Finding Opponent...</h1>
    <p className="text-xl text-gray-300 mb-2">Position in queue: {position}</p>
    <p className="text-lg text-gray-400 mb-8">Estimated wait: {estimatedWait}s</p>

    <motion.div
      className="flex space-x-2"
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
    >
      <div className="w-3 h-3 bg-yellow-400 rounded-full" />
      <div className="w-3 h-3 bg-yellow-400 rounded-full" />
      <div className="w-3 h-3 bg-yellow-400 rounded-full" />
    </motion.div>

    <button
      onClick={onCancel}
      className="mt-12 px-8 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold"
    >
      Cancel
    </button>
  </motion.div>
);

// Loading Screen
const LoadingScreen: React.FC<{
  opponent: { name: string; level: number; archetype: string; rank: number };
}> = ({ opponent }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    className="flex flex-col items-center justify-center h-full text-white"
  >
    <div className="text-6xl mb-8">⚔️</div>
    <h1 className="text-5xl font-bold mb-8">MATCH FOUND!</h1>

    <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 mb-8">
      <p className="text-2xl mb-2">{opponent.name}</p>
      <p className="text-lg text-gray-300">Level {opponent.level} • {opponent.archetype}</p>
      <p className="text-lg text-yellow-400">Rank: {opponent.rank}</p>
    </div>

    <motion.p
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity }}
      className="text-xl text-gray-300"
    >
      Get Ready...
    </motion.p>
  </motion.div>
);

// Battle Screen (Question Phase)
const BattleScreen: React.FC<{
  battleState: BattleState;
  onSubmitAnswer: (answer: number) => void;
  onUseUltimate: () => void;
  onSurrender: () => void;
}> = ({ battleState, onSubmitAnswer, onUseUltimate, onSurrender }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  // Generate answer options
  const answerOptions = battleState.question
    ? generateAnswerOptions(battleState.question.a)
    : [];

  return (
    <div className="h-full flex flex-col p-6 text-white">
      {/* Top HUD */}
      <div className="flex justify-between items-start mb-6">
        {/* My Hero */}
        <div className="bg-blue-600/30 backdrop-blur-md rounded-xl p-4 w-64">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold">{battleState.myHero.name}</span>
            <span className="text-sm text-gray-300">Lv{battleState.myHero.level}</span>
          </div>
          <div className="flex items-center space-x-2 mb-2">
            <Heart size={16} className="text-red-400" />
            <div className="flex-1 bg-black/30 rounded-full h-4">
              <div
                className="bg-gradient-to-r from-red-500 to-pink-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${(battleState.myHP / battleState.myHero.maxHP) * 100}%` }}
              />
            </div>
            <span className="text-sm">{battleState.myHP}/{battleState.myHero.maxHP}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Zap size={16} className="text-yellow-400" />
            <div className="flex-1 bg-black/30 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-yellow-400 to-orange-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${battleState.myHero.ultimateCharge}%` }}
              />
            </div>
            <span className="text-xs">{battleState.myHero.ultimateCharge}%</span>
          </div>
          {battleState.myHero.ultimateCharge >= 100 && (
            <button
              onClick={onUseUltimate}
              className="mt-2 w-full py-1 bg-yellow-500 hover:bg-yellow-600 rounded font-semibold text-sm"
            >
              ⚡ ULTIMATE!
            </button>
          )}
        </div>

        {/* Center - Round Counter */}
        <div className="text-center">
          <p className="text-sm text-gray-300 mb-1">ROUND</p>
          <p className="text-4xl font-bold">{battleState.round}/10</p>
        </div>

        {/* Opponent */}
        {battleState.opponentInfo && (
          <div className="bg-red-600/30 backdrop-blur-md rounded-xl p-4 w-64">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold">{battleState.opponentInfo.name}</span>
              <span className="text-sm text-gray-300">Lv{battleState.opponentInfo.level}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Heart size={16} className="text-red-400" />
              <div className="flex-1 bg-black/30 rounded-full h-4">
                <div
                  className="bg-gradient-to-r from-red-500 to-pink-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(battleState.opponentHP / (100 + battleState.opponentInfo.level * 10)) * 100}%` }}
                />
              </div>
              <span className="text-sm">{battleState.opponentHP}</span>
            </div>
            {battleState.opponentAnswered && (
              <p className="mt-2 text-sm text-green-400">✓ Answered</p>
            )}
          </div>
        )}
      </div>

      {/* Question Panel */}
      {battleState.question && (
        <div className="flex-1 flex flex-col items-center justify-center">
          {/* Timer */}
          <div className="mb-6 flex items-center space-x-3">
            <Clock size={24} className="text-yellow-400" />
            <div className="text-5xl font-mono font-bold">
              {Math.ceil(battleState.timeRemaining)}s
            </div>
          </div>

          {/* Question */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8 max-w-2xl w-full">
            <p className="text-3xl text-center font-bold mb-8">{battleState.question.q}</p>

            {/* Answer Options */}
            <div className="grid grid-cols-2 gap-4">
              {answerOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (battleState.phase === 'QUESTION') {
                      setSelectedAnswer(option);
                      onSubmitAnswer(option);
                    }
                  }}
                  disabled={battleState.phase !== 'QUESTION'}
                  className={`
                    py-6 px-8 rounded-xl font-bold text-2xl
                    transition-all duration-200
                    ${selectedAnswer === option
                      ? 'bg-yellow-500 text-black scale-95'
                      : 'bg-white/20 hover:bg-white/30 hover:scale-105'
                    }
                    ${battleState.phase !== 'QUESTION' ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Status Text */}
          {battleState.phase === 'WAITING_ANSWER' && (
            <p className="text-xl text-gray-300">Waiting for opponent...</p>
          )}
        </div>
      )}

      {/* Bottom Actions */}
      <div className="flex justify-between">
        <button
          onClick={onSurrender}
          className="px-6 py-2 bg-red-600/50 hover:bg-red-600 rounded-lg"
        >
          Surrender
        </button>

        <div className="flex items-center space-x-4 text-sm text-gray-300">
          <div className="flex items-center space-x-1">
            <Target size={16} />
            <span>Combo: {battleState.myHero.comboStreak}</span>
          </div>
        </div>
      </div>

      {/* Animation Overlay */}
      <AnimatePresence>
        {battleState.phase === 'ANIMATION' && battleState.lastAnimation && (
          <AnimationOverlay animation={battleState.lastAnimation} />
        )}
      </AnimatePresence>
    </div>
  );
};

// Animation Overlay
const AnimationOverlay: React.FC<{ animation: AnimationData }> = ({ animation }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.5 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.5 }}
    className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
  >
    <motion.div
      animate={{
        scale: [1, 1.2, 1],
        rotate: [0, 5, -5, 0]
      }}
      transition={{ duration: 0.5 }}
      className="text-8xl"
    >
      {animation.type === 'critical_hit' && '💥'}
      {animation.type === 'dodge' && '💨'}
      {animation.type === 'block' && '🛡️'}
      {animation.type === 'normal_hit' && '⚔️'}
    </motion.div>
    {animation.displayText && (
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute bottom-1/3 text-6xl font-bold text-yellow-400"
      >
        {animation.displayText}
      </motion.p>
    )}
  </motion.div>
);

// Battle End Screen
const BattleEndScreen: React.FC<{
  winner: { userId: string; name: string };
  rewards: BattleRewards;
  stats: BattleStats;
  isVictory: boolean;
  onExit: () => void;
}> = ({ winner, rewards, stats, isVictory, onExit }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="flex flex-col items-center justify-center h-full text-white p-8"
  >
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', duration: 0.8 }}
      className="mb-8"
    >
      {isVictory ? (
        <Trophy size={120} className="text-yellow-400" />
      ) : (
        <Shield size={120} className="text-gray-400" />
      )}
    </motion.div>

    <h1 className="text-6xl font-bold mb-4">
      {isVictory ? 'VICTORY!' : 'DEFEAT'}
    </h1>
    <p className="text-2xl text-gray-300 mb-8">
      {winner.name} wins!
    </p>

    {/* Rewards */}
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-8 max-w-md w-full">
      <h2 className="text-xl font-bold mb-4">Rewards</h2>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>XP</span>
          <span className="text-yellow-400">+{rewards.xp}</span>
        </div>
        <div className="flex justify-between">
          <span>Rank</span>
          <span className={rewards.rankChange > 0 ? 'text-green-400' : 'text-red-400'}>
            {rewards.rankChange > 0 ? '+' : ''}{rewards.rankChange}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Coins</span>
          <span className="text-yellow-400">+{rewards.coins}</span>
        </div>
      </div>
    </div>

    {/* Stats */}
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-8 max-w-md w-full">
      <h2 className="text-xl font-bold mb-4">Battle Stats</h2>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Duration</span>
          <span>{Math.floor(stats.duration / 60)}m {stats.duration % 60}s</span>
        </div>
        <div className="flex justify-between">
          <span>Rounds</span>
          <span>{stats.totalRounds}</span>
        </div>
        <div className="flex justify-between">
          <span>Accuracy</span>
          <span>{stats.accuracy.player1}%</span>
        </div>
        <div className="flex justify-between">
          <span>Avg Response Time</span>
          <span>{stats.avgResponseTime.player1}s</span>
        </div>
      </div>
    </div>

    <button
      onClick={onExit}
      className="px-12 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl font-bold text-xl"
    >
      Continue
    </button>
  </motion.div>
);

// Helper: Generate answer options
function generateAnswerOptions(correctAnswer: number): number[] {
  const options = new Set<number>([correctAnswer]);
  let attempts = 0;

  while (options.size < 4 && attempts < 100) {
    attempts++;
    const offset = Math.floor(Math.random() * 20) - 10;
    const wrongAnswer = correctAnswer + offset;

    if (wrongAnswer > 0 && wrongAnswer !== correctAnswer) {
      options.add(wrongAnswer);
    }
  }

  // Fallback
  while (options.size < 4) {
    options.add(correctAnswer + options.size);
  }

  return Array.from(options).sort(() => Math.random() - 0.5);
}

console.log('⚔️ BattleArena component loaded');
