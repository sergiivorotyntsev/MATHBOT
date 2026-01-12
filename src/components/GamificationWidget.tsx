/**
 * 🎮 Gamification Widget - Daily goals and streaks display
 * Shows compact progress info in the main UI
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Target, Flame, Trophy } from 'lucide-react';
import { GamificationData } from '../types/gamification';
import { useI18n } from '../i18n/context';

interface GamificationWidgetProps {
  gamification: GamificationData;
  compact?: boolean;
}

export const GamificationWidget: React.FC<GamificationWidgetProps> = ({
  gamification,
  compact = false
}) => {
  const { language } = useI18n();
  const { dailyGoal, streak, coins } = gamification;

  const goalProgress = (dailyGoal.completed / dailyGoal.target) * 100;

  if (compact) {
    return (
      <div className="flex items-center gap-3 text-sm">
        {/* Daily Goal */}
        <div className="flex items-center gap-1.5 bg-blue-600/20 px-3 py-1.5 rounded-full">
          <Target className="w-4 h-4 text-blue-400" />
          <span className="text-blue-200 font-medium">
            {dailyGoal.completed}/{dailyGoal.target}
          </span>
        </div>

        {/* Streak */}
        {streak.current > 0 && (
          <div className="flex items-center gap-1.5 bg-orange-600/20 px-3 py-1.5 rounded-full">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="text-orange-200 font-medium">
              {streak.current}
            </span>
          </div>
        )}

        {/* Coins */}
        {coins > 0 && (
          <div className="flex items-center gap-1.5 bg-yellow-600/20 px-3 py-1.5 rounded-full">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-200 font-medium">
              {coins}
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800 rounded-lg p-4 shadow-lg border border-slate-700"
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Daily Goal */}
        <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-blue-200">
              {language === 'ru' ? 'Дневная цель' : 'Daily Goal'}
            </h3>
          </div>
          <div className="text-2xl font-bold text-white mb-2">
            {dailyGoal.completed} / {dailyGoal.target}
          </div>
          <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, goalProgress)}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-blue-400 to-cyan-400"
            />
          </div>
          {dailyGoal.isComplete && (
            <div className="text-xs text-green-400 mt-2 font-medium">
              {language === 'ru' ? '✓ Выполнено!' : '✓ Complete!'}
            </div>
          )}
        </div>

        {/* Streak */}
        <div className="bg-gradient-to-br from-orange-600/20 to-red-600/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-5 h-5 text-orange-400" />
            <h3 className="font-bold text-orange-200">
              {language === 'ru' ? 'Серия' : 'Streak'}
            </h3>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {streak.current} {language === 'ru' ? 'дней' : 'days'}
          </div>
          <div className="text-xs text-gray-400">
            {language === 'ru' ? 'Рекорд:' : 'Best:'} {streak.best}
          </div>
        </div>

        {/* Coins */}
        <div className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <h3 className="font-bold text-yellow-200">
              {language === 'ru' ? 'Монеты' : 'Coins'}
            </h3>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {coins}
          </div>
          <div className="text-xs text-gray-400">
            {language === 'ru' ? 'Достижения:' : 'Achievements:'} {gamification.achievements.filter(a => a.isUnlocked).length}/{gamification.achievements.length}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
