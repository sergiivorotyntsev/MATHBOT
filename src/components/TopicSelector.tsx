/**
 * 📚 Topic Selector - Choose specific topics for training
 * Displays CCSS-aligned topic tree for age-appropriate selection
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, BookOpen, Target, Star } from 'lucide-react';
import { getAllTopicsForGrade } from '../engine/curriculumMap';
import { ageToGrade } from '../engine/questionEngineAdapter';
import { useI18n } from '../i18n/context';
import { questionService } from '../engine/questionService';
import { getQuestionTopicFromUI } from '../engine/topicMapping';

interface TopicSelectorProps {
  userAge: number;
  onSelectTopic: (topic: string, subtopic?: string) => void;
  onClose: () => void;
  currentSkillMasteries?: Map<string, number>;
}

export const TopicSelector: React.FC<TopicSelectorProps> = ({
  userAge,
  onSelectTopic,
  onClose,
  currentSkillMasteries
}) => {
  const { t, language } = useI18n();
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [questionCounts, setQuestionCounts] = useState<Record<string, number>>({});

  const grade = ageToGrade(userAge);
  const availableTopics = useMemo(() => {
    return getAllTopicsForGrade(grade);
  }, [grade]);

  // Load question counts for all topics
  useEffect(() => {
    const loadQuestionCounts = async () => {
      const counts: Record<string, number> = {};

      for (const topic of availableTopics) {
        const topicName = language === 'ru' ? topic.name.ru : topic.name.en;
        const englishTopic = getQuestionTopicFromUI(topicName);

        if (englishTopic) {
          try {
            // Get domain from topic  structure (you may need to adjust based on your data)
            const domain = topic.domain === 'OA' || topic.domain === 'NBT' || topic.domain === 'NF' ? 'Arithmetic'
              : topic.domain === 'G' ? 'Geometry'
              : 'Logic';

            const count = await questionService.countQuestionsByTopic(
              domain.toLowerCase() as any,
              englishTopic,
              userAge
            );
            counts[topic.id] = count;
          } catch (error) {
            console.error(`Failed to count questions for ${topicName}:`, error);
            counts[topic.id] = 0;
          }
        } else {
          counts[topic.id] = 0;
        }
      }

      setQuestionCounts(counts);
    };

    loadQuestionCounts();
  }, [availableTopics, userAge, language]);

  const toggleTopic = (topicId: string) => {
    setExpandedTopics(prev => {
      const next = new Set(prev);
      if (next.has(topicId)) {
        next.delete(topicId);
      } else {
        next.add(topicId);
      }
      return next;
    });
  };

  const handleSelectTopic = (topicId: string, subtopicId?: string) => {
    setSelectedTopic(subtopicId || topicId);
    onSelectTopic(topicId, subtopicId);
  };

  const getMasteryLevel = (skillId: string): number => {
    return currentSkillMasteries?.get(skillId) || 0;
  };

  const getMasteryColor = (mastery: number): string => {
    if (mastery >= 80) return 'text-green-400 bg-green-500/20';
    if (mastery >= 60) return 'text-blue-400 bg-blue-500/20';
    if (mastery >= 40) return 'text-yellow-400 bg-yellow-500/20';
    if (mastery >= 20) return 'text-orange-400 bg-orange-500/20';
    return 'text-gray-400 bg-gray-500/20';
  };

  const getMasteryLabel = (mastery: number): string => {
    if (mastery >= 80) return '⭐ Освоено';
    if (mastery >= 60) return '📈 Хорошо';
    if (mastery >= 40) return '📊 Средне';
    if (mastery >= 20) return '📉 Начинающий';
    return '🆕 Новое';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-slate-700"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-8 h-8 text-white" />
            <h2 className="text-2xl font-bold text-white">
              {language === 'ru' ? 'Выбор темы' : 'Choose Topic'}
            </h2>
          </div>
          <p className="text-purple-100 text-sm">
            {language === 'ru'
              ? `Возраст: ${userAge} лет • Класс: ${grade} • Доступно: ${availableTopics.length} тем`
              : `Age: ${userAge} • Grade: ${grade} • Available: ${availableTopics.length} topics`}
          </p>
        </div>

        {/* Topic List */}
        <div className="overflow-y-auto max-h-[calc(80vh-180px)] p-6 space-y-3">
          {availableTopics.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>{language === 'ru' ? 'Нет доступных тем для вашего возраста' : 'No topics available for your age'}</p>
            </div>
          ) : (
            availableTopics.map(topic => {
              const isExpanded = expandedTopics.has(topic.id);
              const hasSubtopics = topic.subtopics && topic.subtopics.length > 0;
              const topicMastery = getMasteryLevel(topic.id);

              return (
                <div key={topic.id} className="bg-slate-700/50 rounded-lg overflow-hidden">
                  {/* Main Topic */}
                  <div className="p-4">
                    <div className="flex items-center gap-3">
                      {hasSubtopics && (
                        <button
                          onClick={() => toggleTopic(topic.id)}
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5" />
                          ) : (
                            <ChevronRight className="w-5 h-5" />
                          )}
                        </button>
                      )}

                      <button
                        onClick={() => handleSelectTopic(topic.id)}
                        className={`flex-1 text-left group ${
                          selectedTopic === topic.id ? 'bg-purple-600/20' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-white group-hover:text-purple-300 transition-colors">
                                {language === 'ru' ? topic.name.ru : topic.name.en}
                              </h3>
                              {questionCounts[topic.id] !== undefined && (
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                  questionCounts[topic.id] > 0
                                    ? 'bg-green-500/20 text-green-300'
                                    : 'bg-red-500/20 text-red-300'
                                }`}>
                                  {questionCounts[topic.id]} {language === 'ru' ? 'вопр.' : 'qs'}
                                </span>
                              )}
                            </div>
                            {topic.ccssCode && (
                              <p className="text-xs text-gray-400 mt-1">
                                CCSS: {topic.ccssCode}
                              </p>
                            )}
                          </div>

                          {topicMastery > 0 && (
                            <div className={`ml-3 px-3 py-1 rounded-full text-xs font-medium ${getMasteryColor(topicMastery)}`}>
                              {getMasteryLabel(topicMastery)}
                            </div>
                          )}
                        </div>
                      </button>
                    </div>

                    {/* Subtopics */}
                    <AnimatePresence>
                      {isExpanded && hasSubtopics && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="ml-8 mt-3 space-y-2"
                        >
                          {topic.subtopics!.map(subtopic => {
                            const subtopicMastery = getMasteryLevel(subtopic.id);

                            return (
                              <button
                                key={subtopic.id}
                                onClick={() => handleSelectTopic(topic.id, subtopic.id)}
                                className={`w-full text-left p-3 rounded-lg transition-all hover:bg-slate-600/50 ${
                                  selectedTopic === subtopic.id ? 'bg-purple-600/20 ring-2 ring-purple-500/50' : ''
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-200">
                                      {language === 'ru' ? subtopic.name.ru : subtopic.name.en}
                                    </p>
                                    {subtopic.ccssCode && (
                                      <p className="text-xs text-gray-500 mt-1">
                                        {subtopic.ccssCode}
                                      </p>
                                    )}
                                  </div>

                                  {subtopicMastery > 0 && (
                                    <div className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${getMasteryColor(subtopicMastery)}`}>
                                      {Math.floor(subtopicMastery)}%
                                    </div>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-900/80 p-4 border-t border-slate-700 flex justify-between">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            {language === 'ru' ? 'Отмена' : 'Cancel'}
          </button>

          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Star className="w-4 h-4" />
            <span>{language === 'ru' ? 'Выберите тему для начала' : 'Select a topic to start'}</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
