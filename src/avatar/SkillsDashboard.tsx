/**
 * ✨ Skills Dashboard
 * Displays avatar core skills, secondary skills, unique perks, and skill history
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Star, Zap, TrendingUp, Clock } from 'lucide-react';
import { AvatarProfile, SECONDARY_SKILL_NAMES } from './types';
import { useI18n } from '../i18n/context';

interface SkillsDashboardProps {
  avatar: AvatarProfile;
}

const CORE_SKILL_ICONS: Record<keyof AvatarProfile['coreSkills'], string> = {
  arithmetic: '➕',
  geometry: '📐',
  logic: '🧩',
  speed: '⚡',
  accuracy: '🎯',
  focus: '🧠'
};

const CORE_SKILL_COLORS: Record<keyof AvatarProfile['coreSkills'], string> = {
  arithmetic: 'from-blue-500 to-cyan-500',
  geometry: 'from-green-500 to-emerald-500',
  logic: 'from-purple-500 to-pink-500',
  speed: 'from-yellow-500 to-orange-500',
  accuracy: 'from-red-500 to-rose-500',
  focus: 'from-indigo-500 to-violet-500'
};

export const SkillsDashboard: React.FC<SkillsDashboardProps> = ({ avatar }) => {
  const { t } = useI18n();

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

  return (
    <div className="space-y-6">
      {/* Core Skills Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800 rounded-xl p-6 shadow-2xl"
      >
        <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Star className="w-6 h-6 text-yellow-400" />
          {t('skills.coreSkills')}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(Object.entries(avatar.coreSkills) as [keyof typeof avatar.coreSkills, number][]).map(([skill, value]) => (
            <div key={skill} className="bg-slate-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{CORE_SKILL_ICONS[skill]}</span>
                <span className="font-bold">{t(`skills.${skill}`)}</span>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <span className="text-3xl font-bold">{value}</span>
                <span className="text-gray-400 text-sm">/ 100</span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-3 bg-slate-600 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${value}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className={`h-full bg-gradient-to-r ${CORE_SKILL_COLORS[skill]}`}
                />
              </div>

              {/* Level indicator */}
              <div className="mt-2 text-xs text-gray-400">
                {t('skills.level')}: {Math.floor(value / 10) + 1}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Secondary Skills Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-800 rounded-xl p-6 shadow-2xl"
      >
        <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-blue-400" />
          {t('skills.secondarySkills')}
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {(Object.entries(avatar.secondarySkills) as [keyof typeof avatar.secondarySkills, number][]).map(([skill, value]) => (
            <div key={skill} className="bg-slate-700 rounded-lg p-3 text-center">
              <div className="text-sm font-semibold mb-1">{SECONDARY_SKILL_NAMES[skill]}</div>
              <div className="text-2xl font-bold text-cyan-400">{value}</div>
              <div className="w-full h-1 bg-slate-600 rounded-full overflow-hidden mt-2">
                <div
                  className="h-full bg-cyan-400"
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          ))}
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
                  <span className="font-bold text-lg">{perk.name}</span>
                  {perk.rarity && (
                    <span className={`text-xs px-2 py-1 rounded ${
                      perk.rarity === 'legendary' ? 'bg-yellow-500' :
                      perk.rarity === 'epic' ? 'bg-purple-500' :
                      perk.rarity === 'rare' ? 'bg-blue-500' :
                      'bg-gray-500'
                    }`}>
                      {perk.rarity}
                    </span>
                  )}
                </div>
                <p className="text-sm text-purple-100">{perk.description}</p>
                {perk.unlockCondition && (
                  <div className="mt-2 text-xs text-purple-200 italic">
                    {t('skills.unlocked')}: {perk.unlockCondition}
                  </div>
                )}
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
            {avatar.skillHistory.slice(-10).reverse().map((event, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className="bg-slate-700 rounded-lg p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{CORE_SKILL_ICONS[event.skill as keyof typeof CORE_SKILL_ICONS] || '📊'}</span>
                  <div>
                    <div className="font-semibold">
                      {t(`skills.${event.skill}`)} {getChangeIcon(event.change)} {Math.abs(event.change)}
                    </div>
                    <div className="text-xs text-gray-400">{event.reason}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${getChangeColor(event.change)}`}>
                    {event.newValue}
                  </div>
                  <div className="text-xs text-gray-400">
                    {formatDate(event.timestamp)}
                  </div>
                </div>
              </motion.div>
            ))}
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

console.log('✨ SkillsDashboard component loaded');
