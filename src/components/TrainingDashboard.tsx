/**
 * 📚 Training Dashboard - Modern training selection with topics
 * Uses Question Engine for CCSS-aligned content
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Target, Zap, TrendingUp, Calendar, Award, Star } from 'lucide-react';
import { SkillType } from '../data/taskBank';
import { TopicSelector } from './TopicSelector';
import { useI18n } from '../i18n/context';
import { getQuestionEngineAdapter, ageToGrade } from '../engine/questionEngineAdapter';
import { getAllTopicsForGrade } from '../engine/curriculumMap';

interface TrainingDashboardProps {
  userAge: number;
  userId: string;
  onStartTraining: (skillType: SkillType, topic?: string, subtopic?: string) => void;
  skillStats: Record<SkillType, { total: number; correct: number; level: number }>;
}

export const TrainingDashboard: React.FC<TrainingDashboardProps> = ({
  userAge,
  userId,
  onStartTraining,
  skillStats
}) => {
  const { t, language } = useI18n();
  const [showTopicSelector, setShowTopicSelector] = useState(false);
  const [selectedSkillType, setSelectedSkillType] = useState<SkillType>('arithmetic');

  const grade = ageToGrade(userAge);
  const availableTopics = useMemo(() => getAllTopicsForGrade(grade), [grade]);

  // Get weak topics from Question Engine
  const weakTopics = useMemo(() => {
    try {
      const adapter = getQuestionEngineAdapter(userId, userAge);
      const masteries = adapter.getAllSkillMasteries();
      return Array.from(masteries.entries())
        .filter(([, mastery]) => mastery < 60)
        .sort(([, a], [, b]) => a - b)
        .slice(0, 3)
        .map(([skill]) => skill);
    } catch (error) {
      return [];
    }
  }, [userId, userAge]);

  const handleTopicSelection = (topic: string, subtopic?: string) => {
    setShowTopicSelector(false);
    // Map topic to skillType (simplified)
    const skillTypeMapping: Record<string, SkillType> = {
      'Сложение': 'arithmetic',
      'Вычитание': 'arithmetic',
      'Умножение': 'arithmetic',
      'Деление': 'arithmetic',
      'Дроби': 'arithmetic',
      'Десятичные дроби': 'arithmetic',
      'Геометрия': 'geometry',
      'Фигуры': 'geometry',
      'Площадь': 'geometry',
      'Периметр': 'geometry',
      'Объём': 'geometry',
      'Логика': 'logic',
      'Паттерны': 'logic',
      'Последовательности': 'logic',
      'Текстовые задачи': 'logic'
    };

    const skillType = skillTypeMapping[topic] || selectedSkillType;
    onStartTraining(skillType, topic, subtopic);
  };

  const quickActions = [
    {
      id: 'recommended',
      icon: <Target className="w-8 h-8" />,
      title: language === 'ru' ? 'Рекомендовано' : 'Recommended',
      description: language === 'ru' ? 'Персональная подборка' : 'Personalized selection',
      color: 'from-blue-600 to-cyan-600',
      action: () => onStartTraining('arithmetic')
    },
    {
      id: 'weak',
      icon: <TrendingUp className="w-8 h-8" />,
      title: language === 'ru' ? 'Слабые темы' : 'Weak Topics',
      description: language === 'ru'
        ? weakTopics.length > 0 ? `${weakTopics.length} тем требуют внимания` : 'Нет слабых тем'
        : weakTopics.length > 0 ? `${weakTopics.length} topics need attention` : 'No weak topics',
      color: 'from-orange-600 to-red-600',
      action: () => onStartTraining('arithmetic'),
      disabled: weakTopics.length === 0
    },
    {
      id: 'school-prep',
      icon: <Calendar className="w-8 h-8" />,
      title: language === 'ru' ? `Подготовка (${grade} класс)` : `School Prep (Grade ${grade})`,
      description: language === 'ru' ? 'По школьной программе' : 'Follow curriculum',
      color: 'from-green-600 to-emerald-600',
      action: () => onStartTraining('arithmetic')
    },
    {
      id: 'challenge',
      icon: <Award className="w-8 h-8" />,
      title: language === 'ru' ? 'Испытание' : 'Challenge',
      description: language === 'ru' ? 'Повышенная сложность' : 'Harder difficulty',
      color: 'from-purple-600 to-pink-600',
      action: () => onStartTraining('logic')
    }
  ];

  const skillTypeCards: Array<{ id: SkillType; icon: string; name: string; color: string }> = [
    { id: 'arithmetic', icon: '➕', name: language === 'ru' ? 'Арифметика' : 'Arithmetic', color: 'from-blue-600 to-cyan-600' },
    { id: 'geometry', icon: '📐', name: language === 'ru' ? 'Геометрия' : 'Geometry', color: 'from-green-600 to-emerald-600' },
    { id: 'logic', icon: '🧩', name: language === 'ru' ? 'Логика' : 'Logic', color: 'from-purple-600 to-pink-600' }
  ];

  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-4 sm:p-6 mb-6 shadow-xl">
        <h2 className="text-xl sm:text-2xl font-bold mb-2 flex items-center gap-2">
          <BookOpen className="w-6 h-6" />
          {t('session.trainingMode')}
        </h2>
        <p className="text-sm sm:text-base opacity-90">
          {language === 'ru'
            ? `Доступно ${availableTopics.length} тем для ${grade} класса`
            : `${availableTopics.length} topics available for Grade ${grade}`}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {quickActions.map(action => (
          <motion.button
            key={action.id}
            onClick={action.action}
            disabled={action.disabled}
            whileHover={{ scale: action.disabled ? 1 : 1.05 }}
            whileTap={{ scale: action.disabled ? 1 : 0.95 }}
            className={`bg-gradient-to-r ${action.color} rounded-lg p-4 text-left shadow-lg hover:shadow-xl transition-all ${
              action.disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            style={{ minHeight: '44px' }}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">{action.icon}</div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm sm:text-base mb-1">{action.title}</h3>
                <p className="text-xs opacity-80 truncate">{action.description}</p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Category Selection */}
      <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
        <Star className="w-5 h-5 text-yellow-400" />
        {language === 'ru' ? 'Выбери раздел:' : 'Choose Category:'}
      </h3>
      <div className="grid sm:grid-cols-3 gap-4">
        {skillTypeCards.map(skill => {
          const stats = skillStats[skill.id];
          const accuracy = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;

          return (
            <motion.button
              key={skill.id}
              onClick={() => {
                setSelectedSkillType(skill.id);
                setShowTopicSelector(true);
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`bg-gradient-to-r ${skill.color} rounded-lg p-6 text-left shadow-xl hover:shadow-2xl transition-all`}
              style={{ minHeight: '44px' }}
            >
              <div className="text-4xl sm:text-5xl mb-4">{skill.icon}</div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2">{skill.name}</h3>

              <div className="text-yellow-300 mt-4 text-sm sm:text-base">
                {t('taskUI.level')} {stats.level}
              </div>

              {stats.total > 0 && (
                <div className="mt-3 text-xs sm:text-sm opacity-80">
                  {t('taskUI.solved')}: {stats.total} | {t('taskUI.accuracy')}: {accuracy.toFixed(0)}%
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Topic Selector Modal */}
      <AnimatePresence>
        {showTopicSelector && (
          <TopicSelector
            userAge={userAge}
            onSelectTopic={handleTopicSelection}
            onClose={() => setShowTopicSelector(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
