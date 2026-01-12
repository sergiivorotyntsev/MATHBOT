/**
 * ✨ Skills Dashboard v3.0 - GAME STATS UPDATE
 * Displays avatar game stats, math skills, unique perks, and skill history
 *
 * NEW: Separated into Game Stats (battle) and Math Skills (topics)
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Star, Zap, TrendingUp, Clock, BookOpen } from 'lucide-react';
import { AvatarProfile } from './types';
import { GAME_STAT_ICONS, GAME_STAT_COLORS, GAME_STAT_NAMES } from '../types/gameStats';
import { MATH_SKILL_ICONS, MATH_SKILL_NAMES, MathSkillKey } from '../types/mathSkills';
import { useI18n } from '../i18n/context';

interface SkillsDashboardProps {
  avatar: AvatarProfile;
  onMathSkillClick?: (skill: MathSkillKey) => void; // Navigate to Materials
}

export const SkillsDashboard: React.FC<SkillsDashboardProps> = ({ avatar, onMathSkillClick }) => {
  const { t, language } = useI18n();

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const getChangeColor = (change: number): string => {
    if (change > 0) return 'text-green-400';
    if (change < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const getChangeIcon = (change: number): string => {
    if (change > 0) return '↑';
    if (change < 0) return '↓';
    return '→';
  };

  // Clamp function to prevent NaN
  const safeValue = (value: number | undefined): number => {
    if (value === undefined || value === null || isNaN(value)) return 0;
    return Math.max(0, Math.min(100, Math.round(value)));
  };

  return (
    <div className="space-y-6">
      {/* Game Stats Panel (RPG Battle Stats) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-xl p-6 shadow-2xl border-2 border-purple-500"
      >
        <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Star className="w-6 h-6 text-yellow-400" />
          {language === 'ru' ? '🎮 Игровые характеристики' : '🎮 Game Stats'}
        </h3>

        <p className="text-sm text-purple-200 mb-4">
          {language === 'ru'
            ? 'Боевые статы для сражений и прогресса'
            : 'Battle stats for combat and progression'}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(Object.entries(avatar.gameStats) as [keyof typeof avatar.gameStats, number][]).map(([stat, value]) => {
            const displayValue = safeValue(value);

            return (
              <div key={stat} className="bg-slate-800/80 rounded-lg p-4 border border-purple-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{GAME_STAT_ICONS[stat]}</span>
                  <span className="font-bold text-sm">{GAME_STAT_NAMES[stat][language]}</span>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <span className="text-3xl font-bold text-yellow-400">{displayValue}</span>
                  <span className="text-gray-400 text-sm">/ 100</span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${displayValue}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={`h-full bg-gradient-to-r ${GAME_STAT_COLORS[stat]}`}
                  />
                </div>

                {/* Level indicator */}
                <div className="mt-2 text-xs text-gray-400">
                  {language === 'ru' ? 'Уровень' : 'Level'}: {Math.floor(displayValue / 10) + 1}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Math Skills Grid (Clickable Topics) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-800 rounded-xl p-6 shadow-2xl"
      >
        <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-blue-400" />
          {language === 'ru' ? '📐 Математические навыки' : '📐 Math Skills'}
        </h3>

        <p className="text-sm text-gray-400 mb-4">
          {language === 'ru'
            ? 'Нажмите на тему, чтобы открыть материалы и начать тренировку'
            : 'Click a topic to open materials and start training'}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {(Object.entries(avatar.mathSkills) as [keyof typeof avatar.mathSkills, number][]).map(([skill, value]) => {
            const displayValue = safeValue(value);
            const isClickable = !!onMathSkillClick;

            return (
              <motion.button
                key={skill}
                onClick={() => onMathSkillClick?.(skill as MathSkillKey)}
                disabled={!isClickable}
                whileHover={isClickable ? { scale: 1.05 } : {}}
                whileTap={isClickable ? { scale: 0.95 } : {}}
                className={`bg-slate-700 rounded-lg p-3 text-center transition-all ${
                  isClickable ? 'cursor-pointer hover:bg-slate-600 hover:border-2 hover:border-cyan-400' : ''
                }`}
              >
                <div className="text-2xl mb-1">{MATH_SKILL_ICONS[skill]}</div>
                <div className="text-xs font-semibold mb-1">{MATH_SKILL_NAMES[skill][language]}</div>
                <div className="text-xl font-bold text-cyan-400">{displayValue}</div>
                <div className="w-full h-1 bg-slate-600 rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-cyan-400"
                    style={{ width: `${displayValue}%` }}
                  />
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Unique Perks */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-800 rounded-xl p-6 shadow-2xl"
      >
        <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Zap className="w-6 h-6 text-purple-400" />
          {t('skills.uniquePerks')}
        </h3>

        {avatar.uniquePerks.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <p>{t('skills.noPerksYet')}</p>
            <p className="text-sm mt-2">{t('skills.earnPerksHint')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {avatar.uniquePerks.map((perk, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg p-4 shadow-lg"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{perk.icon}</span>
                  <span className="font-bold text-lg">{perk.name[language]}</span>
                  {perk.rarity && (
                    <span className={`text-xs px-2 py-1 rounded ${
                      perk.rarity === 'legendary' ? 'bg-yellow-500' :
                      perk.rarity === 'epic' ? 'bg-purple-500' :
                      perk.rarity === 'rare' ? 'bg-blue-500' :
                      'bg-gray-500'
                    }`}>
                      {t(`skills.${perk.rarity}`)}
                    </span>
                  )}
                </div>
                <p className="text-sm text-purple-100">{perk.description[language]}</p>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Skill History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-slate-800 rounded-xl p-6 shadow-2xl"
      >
        <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Clock className="w-6 h-6 text-green-400" />
          {t('skills.skillHistory')}
        </h3>

        {avatar.skillHistory.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <p>{t('skills.noHistoryYet')}</p>
            <p className="text-sm mt-2">{t('skills.historyHint')}</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {avatar.skillHistory.slice(-10).reverse().map((event, index) => {
              const displayChange = Math.abs(event.change || 0);
              const displayValue = safeValue(event.newValue);

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="bg-slate-700 rounded-lg p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">
                      {GAME_STAT_ICONS[event.skill as keyof typeof GAME_STAT_ICONS] ||
                       MATH_SKILL_ICONS[event.skill as MathSkillKey] || '📊'}
                    </span>
                    <div>
                      <div className="font-semibold">
                        {event.skill} {getChangeIcon(event.change)} {displayChange.toFixed(1)}
                      </div>
                      <div className="text-xs text-gray-400">{event.details || event.reason}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${getChangeColor(event.change)}`}>
                      {displayValue}
                    </div>
                    <div className="text-xs text-gray-400">
                      {formatDate(event.timestamp)}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl p-6 shadow-2xl"
      >
        <h3 className="text-xl font-bold mb-4">{t('skills.summary')}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold">{avatar.level}</div>
            <div className="text-sm text-purple-200">{t('skills.level')}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{avatar.streak}</div>
            <div className="text-sm text-purple-200">{t('skills.streak')}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{avatar.rating}</div>
            <div className="text-sm text-purple-200">{t('skills.rating')}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{avatar.pvpRank}</div>
            <div className="text-sm text-purple-200">{t('skills.pvpRank')}</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

console.log('✨ SkillsDashboard v3.0 component loaded (Game Stats Update)');
