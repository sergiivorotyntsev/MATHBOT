/**
 * 📊 Progress Tab - Unified view of Statistics, Game Stats, and Math Skills
 * Replaces separate "Statistics" and "Skills" tabs
 */

import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Trophy, Target, Flame } from 'lucide-react';
import { AvatarProfile } from '../avatar/types';
import { SkillType } from '../data/taskBank';
import { useI18n } from '../i18n/context';
import { MATH_SKILL_NAMES, MathSkillKey } from '../types/mathSkills';
import { GAME_STAT_NAMES } from '../types/gameStats';
import { MathSkillsPanel } from './MathSkillsPanel';

interface SkillStats {
  total: number;
  correct: number;
  errorTopics: string[];
  level: number;
  xp: number;
  masteryPoints: number;
}

interface Statistics {
  totalQuestions: number;
  correctAnswers: number;
  bestCombo: number;
  sessions: number;
  totalPlayTime: number;
  skillStats: Record<SkillType, SkillStats>;
}

interface ProgressTabProps {
  avatar: AvatarProfile | undefined;
  statistics: Statistics;
  onMathSkillClick?: (skill: MathSkillKey) => void;
}

const SKILLS = {
  arithmetic: { name: 'Арифметика', icon: '➕', color: 'from-blue-600 to-cyan-600' },
  geometry: { name: 'Геометрия', icon: '📐', color: 'from-green-600 to-emerald-600' },
  logic: { name: 'Логика', icon: '🧩', color: 'from-purple-600 to-pink-600' }
} as const;

export const ProgressTab: React.FC<ProgressTabProps> = ({
  avatar,
  statistics,
  onMathSkillClick
}) => {
  const { t, language } = useI18n();

  // Safe value clamping to prevent NaN
  const safeValue = (value: number | undefined): number => {
    if (value === undefined || value === null || isNaN(value)) return 0;
    return Math.max(0, Math.min(100, Math.round(value)));
  };

  const getSkillIcon = (skill: MathSkillKey): string => {
    const icons: Record<MathSkillKey, string> = {
      addition: '➕',
      subtraction: '➖',
      multiplication: '✖️',
      division: '➗',
      fractions: '¼',
      decimals: '0.5',
      percentages: '%',
      shapes: '⬛',
      perimeter: '📏',
      area: '📐',
      volume: '📦',
      angles: '∠',
      patterns: '🔢',
      sequences: '1️⃣2️⃣3️⃣',
      problemSolving: '💡',
      wordProblems: '📝'
    };
    return icons[skill] || '📊';
  };

  const getStatIcon = (stat: string): string => {
    const icons: Record<string, string> = {
      strength: '💪',
      agility: '⚡',
      defense: '🛡️',
      magic: '✨',
      wisdom: '📚',
      luck: '🍀',
      focus: '🎯'
    };
    return icons[stat] || '⭐';
  };

  return (
    <div className="space-y-6">
      {/* === BLOCK 1: BATTLE SUMMARY === */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 shadow-2xl border-2 border-purple-500/30"
      >
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-3">
          <Trophy className="w-8 h-8 text-yellow-400" />
          Статистика битв
        </h2>

        {/* Overall Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-700/50 rounded-lg p-4">
            <div className="text-gray-400 mb-1 text-sm">Всего вопросов:</div>
            <div className="text-3xl font-bold text-blue-400">{statistics.totalQuestions}</div>
          </div>

          <div className="bg-slate-700/50 rounded-lg p-4">
            <div className="text-gray-400 mb-1 text-sm">Правильных:</div>
            <div className="text-3xl font-bold text-green-400">{statistics.correctAnswers}</div>
          </div>

          <div className="bg-slate-700/50 rounded-lg p-4">
            <div className="text-gray-400 mb-1 text-sm">Точность:</div>
            <div className="text-3xl font-bold text-purple-400">
              {statistics.totalQuestions > 0
                ? ((statistics.correctAnswers / statistics.totalQuestions) * 100).toFixed(0)
                : 0}%
            </div>
          </div>

          <div className="bg-slate-700/50 rounded-lg p-4">
            <div className="text-gray-400 mb-1 text-sm">Лучшее комбо:</div>
            <div className="text-3xl font-bold text-red-400 flex items-center gap-2">
              <Flame className="w-6 h-6" />
              x{statistics.bestCombo}
            </div>
          </div>
        </div>

        {/* Per-Skill Mini Stats */}
        <h3 className="text-xl font-bold mb-4">По навыкам:</h3>
        <div className="space-y-3">
          {(Object.entries(statistics.skillStats) as [SkillType, SkillStats][]).map(([skill, stats]) => {
            const accuracy = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;

            return (
              <div key={skill} className="bg-slate-700/50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
                  <span className="font-bold text-lg">
                    {SKILLS[skill].icon} {SKILLS[skill].name} • Ур. {stats.level}
                  </span>
                  <span className="text-yellow-400 text-xl font-bold">{accuracy.toFixed(0)}%</span>
                </div>

                <div className="text-sm text-gray-400 mb-2">
                  Решено: {stats.total} | Правильно: {stats.correct} | XP: {stats.xp}
                </div>

                {/* XP Progress Bar */}
                <div className="w-full h-2 bg-slate-600 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${SKILLS[skill].color}`}
                    style={{ width: `${(stats.xp % 100)}%` }}
                  />
                </div>

                {/* Error Topics */}
                {stats.errorTopics.length > 0 && (
                  <div className="mt-2 text-xs text-red-400">
                    ⚠️ Требует внимания: {stats.errorTopics.slice(0, 3).join(', ')}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* === BLOCK 2: GAME STATS (RPG Battle Stats) === */}
      {avatar && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-xl p-6 shadow-2xl border-2 border-purple-500/50"
        >
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-purple-400" />
            🎮 Игровые характеристики
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Object.entries(avatar.gameStats).map(([stat, value]) => (
              <motion.div
                key={stat}
                whileHover={{ scale: 1.05 }}
                className="bg-slate-800/50 rounded-lg p-4 backdrop-blur-sm"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{getStatIcon(stat)}</span>
                  <span className="font-bold text-sm">
                    {GAME_STAT_NAMES[stat as keyof typeof GAME_STAT_NAMES]?.[language] || stat}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${safeValue(value)}%` }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                      />
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-purple-300 w-12 text-right">
                    {safeValue(value)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* === BLOCK 3: MATH SKILLS (School Topics - Clickable) === */}
      {avatar && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-blue-900 to-cyan-900 rounded-xl p-6 shadow-2xl border-2 border-blue-500/50"
        >
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-3">
            <Target className="w-8 h-8 text-blue-400" />
            📐 Математические навыки
          </h2>

          <p className="text-sm text-gray-300 mb-4">
            💡 Нажмите на навык, чтобы открыть материалы для обучения
          </p>

          {/* Arithmetic Group */}
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-3 text-yellow-400">➕ Арифметика (55%)</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {(['addition', 'subtraction', 'multiplication', 'division', 'fractions', 'decimals', 'percentages'] as MathSkillKey[]).map((skill) => (
                <motion.button
                  key={skill}
                  onClick={() => onMathSkillClick?.(skill)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-slate-800/50 rounded-lg p-3 text-left hover:bg-slate-700/50 transition-all backdrop-blur-sm"
                  style={{ minHeight: '44px' }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{getSkillIcon(skill)}</span>
                    <span className="font-bold text-xs">
                      {MATH_SKILL_NAMES[skill]?.[language] || skill}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-blue-400 to-cyan-400"
                          initial={{ width: 0 }}
                          animate={{ width: `${safeValue(avatar.mathSkills[skill])}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-bold text-blue-300 w-8 text-right">
                      {safeValue(avatar.mathSkills[skill])}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Geometry Group */}
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-3 text-green-400">📐 Геометрия (25%)</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
              {(['shapes', 'perimeter', 'area', 'volume', 'angles'] as MathSkillKey[]).map((skill) => (
                <motion.button
                  key={skill}
                  onClick={() => onMathSkillClick?.(skill)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-slate-800/50 rounded-lg p-3 text-left hover:bg-slate-700/50 transition-all backdrop-blur-sm"
                  style={{ minHeight: '44px' }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{getSkillIcon(skill)}</span>
                    <span className="font-bold text-xs">
                      {MATH_SKILL_NAMES[skill]?.[language] || skill}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-green-400 to-emerald-400"
                          initial={{ width: 0 }}
                          animate={{ width: `${safeValue(avatar.mathSkills[skill])}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-bold text-green-300 w-8 text-right">
                      {safeValue(avatar.mathSkills[skill])}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Logic Group */}
          <div>
            <h3 className="text-xl font-bold mb-3 text-purple-400">🧩 Логика (20%)</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {(['patterns', 'sequences', 'problemSolving', 'wordProblems'] as MathSkillKey[]).map((skill) => (
                <motion.button
                  key={skill}
                  onClick={() => onMathSkillClick?.(skill)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-slate-800/50 rounded-lg p-3 text-left hover:bg-slate-700/50 transition-all backdrop-blur-sm"
                  style={{ minHeight: '44px' }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{getSkillIcon(skill)}</span>
                    <span className="font-bold text-xs">
                      {MATH_SKILL_NAMES[skill]?.[language] || skill}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-purple-400 to-pink-400"
                          initial={{ width: 0 }}
                          animate={{ width: `${safeValue(avatar.mathSkills[skill])}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-bold text-purple-300 w-8 text-right">
                      {safeValue(avatar.mathSkills[skill])}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* === BLOCK 4: REAL-TIME MATH SKILLS (New System) === */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <MathSkillsPanel onSkillClick={onMathSkillClick} />
      </motion.div>

      {/* No Avatar Warning */}
      {!avatar && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-slate-800 rounded-xl p-8 text-center shadow-2xl"
        >
          <div className="text-6xl mb-4">✨</div>
          <h3 className="text-2xl font-bold mb-4">Создайте аватар!</h3>
          <p className="text-gray-400">
            Для отслеживания игровых характеристик и математических навыков создайте своего героя
          </p>
        </motion.div>
      )}
    </div>
  );
};
