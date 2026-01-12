/**
 * 🎁 Reward Summary - Shows rewards earned after training/battle
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Zap, Target, TrendingUp, CheckCircle, X } from 'lucide-react';
import { Achievement } from '../types/gamification';
import { useI18n } from '../i18n/context';

interface RewardSummaryProps {
  isOpen: boolean;
  onClose: () => void;
  rewards: {
    xpGained: number;
    coinsGained: number;
    questionsAnswered: number;
    correctAnswers: number;
    accuracy: number;
    comboMax: number;
    leveledUp: boolean;
    newLevel?: number;
    dailyGoalProgress: number;
    dailyGoalComplete: boolean;
    streakUpdated: boolean;
    newStreak?: number;
    achievementsUnlocked: Achievement[];
  };
}

export const RewardSummary: React.FC<RewardSummaryProps> = ({
  isOpen,
  onClose,
  rewards
}) => {
  const { language } = useI18n();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 50 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-slate-700"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 relative overflow-hidden">
            <motion.div
              animate={{
                rotate: [0, 360],
                scale: [1, 1.2, 1]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute top-4 right-4"
            >
              <Star className="w-8 h-8 text-yellow-300 opacity-50" />
            </motion.div>

            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-10 h-10 text-yellow-400" />
              <h2 className="text-3xl font-bold text-white">
                {language === 'ru' ? 'Награды получены!' : 'Rewards Earned!'}
              </h2>
            </div>

            <p className="text-purple-100 text-sm">
              {language === 'ru' ? 'Отличная работа! Вот что вы заработали:' : 'Great job! Here\'s what you earned:'}
            </p>

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
              style={{ minHeight: '44px', minWidth: '44px' }}
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            {/* Level Up Banner */}
            {rewards.leveledUp && rewards.newLevel && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 p-4 rounded-lg mb-6 text-center"
              >
                <div className="text-3xl font-bold text-white flex items-center justify-center gap-2">
                  <Zap className="w-8 h-8" />
                  {language === 'ru' ? 'НОВЫЙ УРОВЕНЬ!' : 'LEVEL UP!'}
                  <Zap className="w-8 h-8" />
                </div>
                <div className="text-xl text-yellow-100 mt-1">
                  {language === 'ru' ? 'Уровень' : 'Level'} {rewards.newLevel}
                </div>
              </motion.div>
            )}

            {/* Main Rewards Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* XP Gained */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-lg p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-purple-400" />
                  <span className="text-sm text-purple-200">XP {language === 'ru' ? 'Получено' : 'Gained'}</span>
                </div>
                <div className="text-3xl font-bold text-white">+{rewards.xpGained}</div>
              </motion.div>

              {/* Coins Gained */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 rounded-lg p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <span className="text-sm text-yellow-200">{language === 'ru' ? 'Монеты' : 'Coins'}</span>
                </div>
                <div className="text-3xl font-bold text-white">+{rewards.coinsGained}</div>
              </motion.div>

              {/* Accuracy */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-lg p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-green-400" />
                  <span className="text-sm text-green-200">{language === 'ru' ? 'Точность' : 'Accuracy'}</span>
                </div>
                <div className="text-3xl font-bold text-white">{rewards.accuracy.toFixed(1)}%</div>
                <div className="text-xs text-gray-400 mt-1">
                  {rewards.correctAnswers}/{rewards.questionsAnswered} {language === 'ru' ? 'правильно' : 'correct'}
                </div>
              </motion.div>

              {/* Max Combo */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-red-600/20 to-pink-600/20 rounded-lg p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-red-400" />
                  <span className="text-sm text-red-200">{language === 'ru' ? 'Макс. комбо' : 'Max Combo'}</span>
                </div>
                <div className="text-3xl font-bold text-white">{rewards.comboMax}x</div>
              </motion.div>
            </div>

            {/* Daily Goal Progress */}
            {rewards.dailyGoalProgress > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-slate-700 rounded-lg p-4 mb-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-400" />
                    <span className="font-bold text-white">
                      {language === 'ru' ? 'Дневная цель' : 'Daily Goal'}
                    </span>
                  </div>
                  {rewards.dailyGoalComplete && (
                    <div className="flex items-center gap-1 text-green-400 text-sm font-medium">
                      <CheckCircle className="w-4 h-4" />
                      {language === 'ru' ? 'Выполнено!' : 'Complete!'}
                    </div>
                  )}
                </div>
                <div className="w-full h-3 bg-slate-600 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, rewards.dailyGoalProgress)}%` }}
                    transition={{ duration: 1, delay: 0.6 }}
                    className="h-full bg-gradient-to-r from-blue-400 to-cyan-400"
                  />
                </div>
              </motion.div>
            )}

            {/* Streak Update */}
            {rewards.streakUpdated && rewards.newStreak && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-gradient-to-r from-orange-600/20 to-red-600/20 rounded-lg p-4 mb-4"
              >
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-orange-400" />
                  <div>
                    <div className="font-bold text-white">
                      {language === 'ru' ? 'Серия продолжается!' : 'Streak continues!'}
                    </div>
                    <div className="text-sm text-orange-200">
                      {rewards.newStreak} {language === 'ru' ? 'дней подряд' : 'days in a row'}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Achievements Unlocked */}
            {rewards.achievementsUnlocked.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-gradient-to-br from-yellow-600/20 to-pink-600/20 rounded-lg p-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                  <h3 className="font-bold text-white text-lg">
                    {language === 'ru' ? 'Новые достижения!' : 'New Achievements!'}
                  </h3>
                </div>
                <div className="space-y-3">
                  {rewards.achievementsUnlocked.map((achievement, index) => (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9 + index * 0.1 }}
                      className="flex items-center gap-3 bg-slate-700/50 rounded-lg p-3"
                    >
                      <div className="text-3xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <div className="font-bold text-white">
                          {language === 'ru' ? achievement.name.ru : achievement.name.en}
                        </div>
                        <div className="text-xs text-gray-400">
                          {language === 'ru' ? achievement.description.ru : achievement.description.en}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-slate-900/80 p-4 border-t border-slate-700">
            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg hover:shadow-xl"
              style={{ minHeight: '44px' }}
            >
              {language === 'ru' ? 'Продолжить' : 'Continue'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
