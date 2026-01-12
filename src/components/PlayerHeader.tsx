/**
 * 👤 Player Header - Shows avatar and stats at top of screen
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Flame } from 'lucide-react';
import { AvatarProfile } from '../avatar/types';
import { useI18n } from '../i18n/context';

interface PlayerHeaderProps {
  name: string;
  level: number;
  totalXP: number;
  combo?: number;
  avatarProfile?: AvatarProfile;
}

export const PlayerHeader: React.FC<PlayerHeaderProps> = ({
  name,
  level,
  totalXP,
  combo = 0,
  avatarProfile
}) => {
  const { t } = useI18n();

  // Calculate XP progress within current level
  const xpForCurrentLevel = level * 100;
  const xpForNextLevel = (level + 1) * 100;
  const xpInCurrentLevel = totalXP - xpForCurrentLevel;
  const xpProgress = (xpInCurrentLevel / 100) * 100;

  // Get top 3 math skills
  const topSkills = avatarProfile
    ? Object.entries(avatarProfile.mathSkills)
        .sort(([, a], [, b]) => (b || 0) - (a || 0))
        .slice(0, 3)
        .filter(([, value]) => (value || 0) > 0)
    : [];

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-lg p-3 sm:p-4 mb-4 shadow-lg border border-slate-700"
    >
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Avatar Display */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-2xl sm:text-4xl shadow-lg">
            {avatarProfile?.baseType === 'warrior' ? '⚔️' : '🧙‍♂️'}
          </div>
        </div>

        {/* Player Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg sm:text-xl font-bold truncate">{name}</h2>
            <span className="bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded text-xs sm:text-sm font-bold flex items-center gap-1">
              <Star className="w-3 h-3 sm:w-4 sm:h-4" />
              {t('header.level')} {level}
            </span>
          </div>

          {/* XP Bar */}
          <div className="mb-1">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400 mb-1">
              <Trophy className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>{t('header.xp')}: {totalXP}</span>
              <span className="text-gray-500">({Math.floor(xpProgress)}% to next level)</span>
            </div>
            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-yellow-400 to-orange-400"
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Top Skills Preview */}
          {topSkills.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {topSkills.map(([skill, value]) => (
                <span
                  key={skill}
                  className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded"
                >
                  {t(`skills.${skill}` as any)}: {Math.floor(value || 0)}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Combo Indicator */}
        {combo > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex-shrink-0 bg-red-500/20 text-red-400 px-3 py-2 rounded-lg font-bold flex items-center gap-2"
          >
            <Flame className="w-5 h-5" />
            <span className="text-lg">x{combo}</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
