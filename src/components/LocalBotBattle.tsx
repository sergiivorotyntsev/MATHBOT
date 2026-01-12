/**
 * 🤖 Local Bot Battle - Fight against AI opponent without server
 * Replaces the WebSocket-based PvP system
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Trophy, Heart, Zap, ArrowLeft } from 'lucide-react';
import { Task, SkillType } from '../data/taskBank';
import { getTasksForTraining } from '../data/taskProvider';
import { AvatarProfile } from '../avatar/types';
import { useI18n } from '../i18n/context';

interface LocalBotBattleProps {
  playerAvatar: AvatarProfile | undefined;
  playerLevel: number;
  playerName: string;
  onBattleEnd: (won: boolean, xpGained: number) => void;
  onExit: () => void;
}

interface TaskWithOptions extends Task {
  options: number[];
}

interface BotOpponent {
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  avatar: string;
}

export const LocalBotBattle: React.FC<LocalBotBattleProps> = ({
  playerAvatar,
  playerLevel,
  playerName,
  onBattleEnd,
  onExit
}) => {
  const { t } = useI18n();

  const [playerHP, setPlayerHP] = useState(100 + playerLevel * 10);
  const [maxPlayerHP] = useState(100 + playerLevel * 10);
  const [bot, setBot] = useState<BotOpponent>({
    name: 'МатБот-' + Math.floor(Math.random() * 1000),
    level: Math.max(1, playerLevel + Math.floor(Math.random() * 3) - 1),
    hp: 100 + playerLevel * 10,
    maxHp: 100 + playerLevel * 10,
    avatar: ['🤖', '🦾', '🧠', '⚡', '🎯'][Math.floor(Math.random() * 5)]
  });

  const [currentTask, setCurrentTask] = useState<TaskWithOptions | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [round, setRound] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [playerWon, setPlayerWon] = useState(false);

  // Generate random task using task provider
  const generateTask = useCallback(() => {
    const skillTypes: SkillType[] = ['arithmetic', 'geometry', 'logic'];
    const randomSkill = skillTypes[Math.floor(Math.random() * skillTypes.length)];

    // Get a random task from the generator
    const tasks = getTasksForTraining(randomSkill, 1, playerName);
    const randomTask = tasks[0];

    // Generate answer options
    const options = new Set<number>([randomTask.a]);
    while (options.size < 4) {
      const wrongAnswer = randomTask.a + Math.floor(Math.random() * 20) - 10;
      if (wrongAnswer > 0 && wrongAnswer !== randomTask.a) {
        options.add(wrongAnswer);
      }
    }

    return {
      ...randomTask,
      options: Array.from(options).sort(() => Math.random() - 0.5)
    };
  }, [playerName]);

  // Start new round
  useEffect(() => {
    if (!gameOver) {
      setCurrentTask(generateTask());
      setTimeLeft(30);
      setFeedback(null);
    }
  }, [round, gameOver, generateTask]);

  // Timer countdown
  useEffect(() => {
    if (!gameOver && currentTask && feedback === null && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !feedback) {
      handleTimeout();
    }
  }, [timeLeft, gameOver, currentTask, feedback]);

  // Handle timeout
  const handleTimeout = () => {
    setFeedback('⏱️ Время вышло! Бот атакует!');
    setBattleLog(prev => [`Раунд ${round}: ⏱️ Время вышло`, ...prev].slice(0, 5));

    // Bot attacks player
    const botDamage = 15 + Math.floor(Math.random() * 10);
    setPlayerHP(prev => {
      const newHP = Math.max(0, prev - botDamage);
      if (newHP === 0) {
        setGameOver(true);
        setPlayerWon(false);
      }
      return newHP;
    });

    setBattleLog(prev => [`Бот нанёс ${botDamage} урона!`, ...prev].slice(0, 5));
    setTimeout(() => nextRound(), 2000);
  };

  // Handle player answer
  const handleAnswer = (answer: number) => {
    if (!currentTask || feedback) return;

    const correct = answer === currentTask.a;

    // Phase 1: Player's turn
    if (correct) {
      setFeedback('✅ Правильно! Вы атакуете!');
      setBattleLog(prev => [`Раунд ${round}: ✅ Правильный ответ`, ...prev].slice(0, 5));

      // Calculate player damage based on avatar stats
      const baseDamage = 20;
      const strengthBonus = playerAvatar ? Math.floor(playerAvatar.gameStats.strength / 5) : 0;
      const playerDamage = baseDamage + strengthBonus + Math.floor(Math.random() * 10);

      setBot(prev => {
        const newHP = Math.max(0, prev.hp - playerDamage);
        if (newHP === 0) {
          setGameOver(true);
          setPlayerWon(true);
        }
        return { ...prev, hp: newHP };
      });

      setBattleLog(prev => [`Вы нанесли ${playerDamage} урона!`, ...prev].slice(0, 5));
    } else {
      setFeedback(`❌ Неверно! Правильный ответ: ${currentTask.a}`);
      setBattleLog(prev => [`Раунд ${round}: ❌ Ошибка`, ...prev].slice(0, 5));
    }

    // Phase 2: Bot's turn (ALWAYS happens, making it truly turn-based)
    // Simulate bot answering with accuracy based on level
    const botAccuracy = 0.5 + (bot.level * 0.03);
    const botAnswersCorrectly = Math.random() < botAccuracy;

    // Delay bot's action to show it's a separate turn
    setTimeout(() => {
      if (botAnswersCorrectly) {
        const botDamage = 15 + Math.floor(Math.random() * 10);
        setBattleLog(prev => [t('botBattle.botAnsweredCorrect'), ...prev].slice(0, 5));

        setPlayerHP(prev => {
          const newHP = Math.max(0, prev - botDamage);
          if (newHP === 0) {
            setGameOver(true);
            setPlayerWon(false);
          }
          return newHP;
        });

        setBattleLog(prev => [`${t('botBattle.botDealt')} ${botDamage} ${t('botBattle.damage')}!`, ...prev].slice(0, 5));
      } else {
        setBattleLog(prev => [t('botBattle.botAnsweredWrong'), ...prev].slice(0, 5));
      }

      // Move to next round after both turns complete
      setTimeout(() => nextRound(), 1500);
    }, 1000);
  };

  // Next round
  const nextRound = () => {
    if (!gameOver) {
      setRound(r => r + 1);
      setFeedback(null);
    }
  };

  // Handle battle end
  useEffect(() => {
    if (gameOver) {
      const xpGained = playerWon ? 100 + (bot.level * 20) : 20;
      setTimeout(() => onBattleEnd(playerWon, xpGained), 2000);
    }
  }, [gameOver, playerWon, bot.level, onBattleEnd]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={onExit}
            className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-lg hover:bg-slate-700 transition-all"
            style={{ minHeight: '44px' }}
          >
            <ArrowLeft className="w-5 h-5" />
            {t('botBattle.exit')}
          </button>

          <div className="text-xl font-bold flex items-center gap-2">
            <Swords className="w-6 h-6 text-yellow-400" />
            {t('botBattle.title')} • {t('botBattle.round')} {round}
          </div>
        </div>

        {/* Battle Arena */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Player */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="bg-gradient-to-br from-blue-900 to-purple-900 rounded-xl p-6 border-2 border-blue-500"
          >
            <div className="text-center mb-4">
              <div className="text-6xl mb-2">{playerAvatar?.baseType === 'warrior' ? '⚔️' : '🧙‍♂️'}</div>
              <h3 className="text-2xl font-bold">{playerName}</h3>
              <div className="text-sm text-gray-300">{t('botBattle.levelLabel')} {playerLevel}</div>
            </div>

            <div className="mb-2">
              <div className="flex justify-between text-sm mb-1">
                <span>❤️ {t('botBattle.hp')}:</span>
                <span>{playerHP}/{maxPlayerHP}</span>
              </div>
              <div className="w-full h-4 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-red-500 to-pink-500"
                  initial={{ width: '100%' }}
                  animate={{ width: `${(playerHP / maxPlayerHP) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {playerAvatar && (
              <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                <div>💪 {t('skills.strength')}: {playerAvatar.gameStats.strength}</div>
                <div>⚡ {t('skills.agility')}: {playerAvatar.gameStats.agility}</div>
                <div>🛡️ {t('skills.defense')}: {playerAvatar.gameStats.defense}</div>
                <div>✨ {t('skills.magic')}: {playerAvatar.gameStats.magic}</div>
              </div>
            )}
          </motion.div>

          {/* Bot Opponent */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="bg-gradient-to-br from-red-900 to-orange-900 rounded-xl p-6 border-2 border-red-500"
          >
            <div className="text-center mb-4">
              <div className="text-6xl mb-2">{bot.avatar}</div>
              <h3 className="text-2xl font-bold">{bot.name}</h3>
              <div className="text-sm text-gray-300">{t('botBattle.levelLabel')} {bot.level}</div>
            </div>

            <div className="mb-2">
              <div className="flex justify-between text-sm mb-1">
                <span>❤️ {t('botBattle.hp')}:</span>
                <span>{bot.hp}/{bot.maxHp}</span>
              </div>
              <div className="w-full h-4 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                  initial={{ width: '100%' }}
                  animate={{ width: `${(bot.hp / bot.maxHp) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            <div className="mt-4 p-3 bg-black/30 rounded-lg text-center text-sm">
              {t('botBattle.aiOpponent')}
            </div>
          </motion.div>
        </div>

        {/* Battle Log */}
        <div className="bg-slate-800 rounded-lg p-4 mb-6 h-32 overflow-y-auto">
          <h4 className="font-bold mb-2 text-yellow-400">{t('botBattle.battleLog')}</h4>
          {battleLog.map((log, i) => (
            <div key={i} className="text-sm text-gray-300">{log}</div>
          ))}
        </div>

        {/* Question Area */}
        {!gameOver && currentTask && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800 rounded-xl p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{t('botBattle.solveToAttack')}</h3>
              <div className={`text-2xl font-bold ${timeLeft < 10 ? 'text-red-400 animate-pulse' : 'text-blue-400'}`}>
                ⏱️ {timeLeft}с
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 mb-6 text-center">
              <div className="text-3xl font-bold mb-2">{currentTask.q}</div>
              <div className="text-sm text-gray-200">{currentTask.t}</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {currentTask.options.map((option, i) => (
                <motion.button
                  key={i}
                  onClick={() => !feedback && handleAnswer(option)}
                  disabled={!!feedback}
                  whileHover={{ scale: feedback ? 1 : 1.05 }}
                  whileTap={{ scale: feedback ? 1 : 0.95 }}
                  className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50 p-6 rounded-lg text-3xl font-bold transition-all"
                  style={{ minHeight: '44px' }}
                >
                  {option}
                </motion.button>
              ))}
            </div>

            {feedback && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6 p-4 bg-blue-900 rounded-lg text-center text-xl font-bold"
              >
                {feedback}
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Game Over */}
        <AnimatePresence>
          {gameOver && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
            >
              <div className={`max-w-md w-full rounded-xl p-8 text-center ${
                playerWon ? 'bg-gradient-to-br from-green-600 to-blue-600' : 'bg-gradient-to-br from-red-600 to-gray-600'
              }`}>
                <div className="text-8xl mb-4">{playerWon ? '🏆' : '💔'}</div>
                <h2 className="text-4xl font-bold mb-4">
                  {playerWon ? t('botBattle.won') : t('botBattle.lost')}
                </h2>
                <p className="text-xl mb-6">
                  {playerWon
                    ? `${t('botBattle.youDefeated')} ${bot.name}!`
                    : `${bot.name} ${t('botBattle.defeated')}`
                  }
                </p>
                <p className="text-lg">
                  +{playerWon ? 100 + (bot.level * 20) : 20} XP
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
