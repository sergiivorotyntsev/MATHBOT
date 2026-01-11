/**
 * 🎯 Daily Quests Panel
 *
 * Displays daily quests, progress, and streak information
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Target, Flame, CheckCircle, Circle } from 'lucide-react';
import { DailyQuest } from '../quests/dailyQuests';
import { useI18n } from '../i18n/context';

interface DailyQuestsPanelProps {
  quests: DailyQuest[];
  streak: number;
  bestStreak: number;
  onClose?: () => void;
  compact?: boolean;
}

export const DailyQuestsPanel: React.FC<DailyQuestsPanelProps> = ({
  quests,
  streak,
  bestStreak,
  onClose,
  compact = false
}) => {
  const { t } = useI18n();

  const completedCount = quests.filter(q => q.completed).length;
  const completionPercentage = Math.floor((completedCount / quests.length) * 100);

  if (compact) {
    return (
      <div className="bg-slate-800 rounded-lg p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-400" />
            <span className="font-bold">Ежедневные задания</span>
          </div>
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-bold">{streak} дней</span>
          </div>
        </div>

        <div className="space-y-2">
          {quests.map((quest, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              {quest.completed ? (
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-gray-600 flex-shrink-0" />
              )}
              <span className={quest.completed ? 'text-gray-400 line-through' : ''}>
                {quest.title}
              </span>
              <span className="text-xs text-gray-500 ml-auto">
                {quest.progress}/{quest.target}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-3 w-full h-2 bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
            initial={{ width: 0 }}
            animate={{ width: `${completionPercentage}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800 rounded-xl p-6 shadow-2xl"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <Target className="w-6 h-6 text-purple-400" />
            Ежедневные задания
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            Выполни все задания, чтобы получить награды
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Streak Display */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Flame className="w-8 h-8 text-yellow-300" />
            <div>
              <div className="text-2xl font-bold">{streak} дней</div>
              <div className="text-sm text-orange-100">Текущая серия</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-yellow-300">🏆 {bestStreak}</div>
            <div className="text-xs text-orange-100">Лучшая серия</div>
          </div>
        </div>
      </div>

      {/* Quests List */}
      <div className="space-y-4">
        {quests.map((quest, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative rounded-lg p-4 ${
              quest.completed
                ? 'bg-green-900/30 border border-green-500/50'
                : 'bg-slate-700 border border-slate-600'
            }`}
          >
            {quest.completed && (
              <div className="absolute top-2 right-2">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
            )}

            <div className="flex items-start gap-3">
              <div className="text-3xl flex-shrink-0">{quest.icon}</div>
              <div className="flex-1">
                <h4 className={`font-bold mb-1 ${quest.completed ? 'text-gray-400' : ''}`}>
                  {quest.title}
                </h4>
                <p className={`text-sm mb-3 ${quest.completed ? 'text-gray-500' : 'text-gray-400'}`}>
                  {quest.description}
                </p>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Прогресс</span>
                    <span>{quest.progress}/{quest.target}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-600 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full ${
                        quest.completed
                          ? 'bg-green-500'
                          : 'bg-gradient-to-r from-purple-500 to-pink-500'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${(quest.progress / quest.target) * 100}%` }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    />
                  </div>
                </div>

                {/* Reward */}
                <div className="mt-3 flex items-center gap-2 text-xs">
                  <span className="text-yellow-400">🎁 Награда:</span>
                  <span className="text-gray-300">
                    {quest.reward.type === 'xp' && `${quest.reward.amount} XP`}
                    {quest.reward.type === 'cosmetic' && `Косметика: ${quest.reward.item}`}
                    {quest.reward.type === 'perk' && 'Уникальный перк'}
                    {quest.reward.type === 'freeze' && 'Заморозка серии'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Completion Summary */}
      <div className="mt-6 p-4 bg-slate-700 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">Выполнено заданий сегодня</span>
          <span className="font-bold text-lg">{completedCount}/{quests.length}</span>
        </div>
        <div className="w-full h-3 bg-slate-600 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500"
            initial={{ width: 0 }}
            animate={{ width: `${completionPercentage}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
        {completionPercentage === 100 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-3 text-center text-green-400 font-bold"
          >
            🎉 Все задания выполнены! Возвращайся завтра!
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

console.log('🎯 DailyQuestsPanel loaded');
