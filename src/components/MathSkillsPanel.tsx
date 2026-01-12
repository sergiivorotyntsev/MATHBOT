/**
 * 📊 New Math Skills Panel
 *
 * Displays math skills from the new question service stats system.
 * Shows mastery levels, accuracy, recent performance, etc.
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Target, TrendingUp, Clock, Award, Zap } from 'lucide-react';
import { questionService } from '../engine/questionService';
import type { SkillStatistics } from '../types/skillStats';
import { useI18n } from '../i18n/context';

interface MathSkillsPanelProps {
  onSkillClick?: (skillId: string) => void;
}

export const MathSkillsPanel: React.FC<MathSkillsPanelProps> = ({ onSkillClick }) => {
  const { language } = useI18n();
  const [skills, setSkills] = useState<Array<SkillStatistics & { isMastered: boolean }>>([]);
  const [loading, setLoading] = useState(true);

  // Load stats from question service
  useEffect(() => {
    const loadStats = async () => {
      try {
        const stats = await questionService.exportStats();
        setSkills(stats.skills);
        setLoading(false);
      } catch (error) {
        console.error('[MathSkillsPanel] Failed to load stats:', error);
        setLoading(false);
      }
    };

    loadStats();

    // Reload stats every 2 seconds to catch updates
    const interval = setInterval(loadStats, 2000);

    return () => clearInterval(interval);
  }, []);

  const getSkillDisplayName = (skillId: string): string => {
    // Parse skill ID: "domain_topic_subtopic"
    const parts = skillId.split('_');
    const topic = parts[1] || skillId;

    // Convert snake_case to Title Case
    return topic
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getSkillIcon = (skillId: string): string => {
    const domain = skillId.split('_')[0];

    const icons: Record<string, string> = {
      arithmetic: '➕',
      geometry: '📐',
      logic: '🧩'
    };

    return icons[domain] || '📊';
  };

  const getMasteryColor = (mastery: number): string => {
    if (mastery >= 0.8) return 'from-green-500 to-emerald-500';
    if (mastery >= 0.6) return 'from-blue-500 to-cyan-500';
    if (mastery >= 0.4) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  const getMasteryLabel = (mastery: number): string => {
    if (mastery >= 0.8) return language === 'ru' ? 'Мастер' : 'Master';
    if (mastery >= 0.6) return language === 'ru' ? 'Опытный' : 'Proficient';
    if (mastery >= 0.4) return language === 'ru' ? 'Учусь' : 'Learning';
    return language === 'ru' ? 'Новичок' : 'Beginner';
  };

  const formatTime = (ms: number): string => {
    const seconds = Math.round(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (loading) {
    return (
      <div className="bg-slate-800 rounded-xl p-6 shadow-2xl">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (skills.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800 rounded-xl p-6 shadow-2xl"
      >
        <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-blue-400" />
          {language === 'ru' ? '📐 Математические навыки' : '📐 Math Skills'}
        </h3>

        <div className="text-center text-gray-400 py-12">
          <p className="text-lg mb-2">
            {language === 'ru' ? 'Навыки появятся после первой тренировки' : 'Skills will appear after your first training session'}
          </p>
          <p className="text-sm">
            {language === 'ru' ? 'Начните тренировку, чтобы увидеть свой прогресс!' : 'Start training to see your progress!'}
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800 rounded-xl p-6 shadow-2xl"
    >
      <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <BookOpen className="w-6 h-6 text-blue-400" />
        {language === 'ru' ? '📐 Математические навыки' : '📐 Math Skills'}
        <span className="ml-auto text-sm font-normal text-gray-400">
          {skills.filter(s => s.isMastered).length} / {skills.length} {language === 'ru' ? 'освоено' : 'mastered'}
        </span>
      </h3>

      <p className="text-sm text-gray-400 mb-4">
        {language === 'ru'
          ? 'Нажмите на навык, чтобы начать практику'
          : 'Click a skill to start practicing'}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {skills
          .sort((a, b) => b.attempts - a.attempts) // Most practiced first
          .map((skill) => {
            const masteryPercent = Math.round(skill.masteryScore * 100);
            const isClickable = !!onSkillClick;

            return (
              <motion.button
                key={skill.skillId}
                onClick={() => onSkillClick?.(skill.skillId)}
                disabled={!isClickable}
                whileHover={isClickable ? { scale: 1.02 } : {}}
                whileTap={isClickable ? { scale: 0.98 } : {}}
                className={`bg-slate-700 rounded-lg p-4 text-left transition-all ${
                  isClickable ? 'cursor-pointer hover:bg-slate-600 hover:border-2 hover:border-blue-400' : ''
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getSkillIcon(skill.skillId)}</span>
                    <div>
                      <div className="font-bold text-sm">{getSkillDisplayName(skill.skillId)}</div>
                      <div className="text-xs text-gray-400">{skill.attempts} {language === 'ru' ? 'попыток' : 'attempts'}</div>
                    </div>
                  </div>

                  {skill.isMastered && (
                    <Award className="w-5 h-5 text-yellow-400" />
                  )}
                </div>

                {/* Mastery Progress */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-gray-300">
                      {getMasteryLabel(skill.masteryScore)}
                    </span>
                    <span className="text-xs font-bold text-white">{masteryPercent}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-600 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${getMasteryColor(skill.masteryScore)}`}
                      style={{ width: `${masteryPercent}%` }}
                    />
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <Target className="w-3 h-3 text-green-400" />
                    <span className="text-gray-300">{Math.round(skill.accuracy)}%</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-yellow-400" />
                    <span className="text-gray-300">{skill.currentStreak}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-blue-400" />
                    <span className="text-gray-300">{formatTime(skill.avgTimeMs)}</span>
                  </div>
                </div>

                {/* Recent Performance Indicator */}
                {skill.recentHistory.length > 0 && (
                  <div className="mt-3 flex gap-0.5">
                    {skill.recentHistory.slice(-10).map((correct, idx) => (
                      <div
                        key={idx}
                        className={`h-1 flex-1 rounded-full ${
                          correct ? 'bg-green-400' : 'bg-red-400'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </motion.button>
            );
          })}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t border-slate-700">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {skills.reduce((sum, s) => sum + s.attempts, 0)}
            </div>
            <div className="text-xs text-gray-400">
              {language === 'ru' ? 'Всего попыток' : 'Total Attempts'}
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {skills.reduce((sum, s) => sum + s.correct, 0)}
            </div>
            <div className="text-xs text-gray-400">
              {language === 'ru' ? 'Правильных' : 'Correct'}
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">
              {skills.length > 0
                ? Math.round(
                    (skills.reduce((sum, s) => sum + s.correct, 0) /
                      skills.reduce((sum, s) => sum + s.attempts, 0)) *
                      100
                  )
                : 0}%
            </div>
            <div className="text-xs text-gray-400">
              {language === 'ru' ? 'Точность' : 'Accuracy'}
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {Math.max(...skills.map(s => s.bestStreak), 0)}
            </div>
            <div className="text-xs text-gray-400">
              {language === 'ru' ? 'Лучшая серия' : 'Best Streak'}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
