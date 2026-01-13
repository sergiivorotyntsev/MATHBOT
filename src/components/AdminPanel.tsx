/**
 * 🔧 Admin Panel - Question Management
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Plus, Search, Trash2, Edit, CheckCircle, XCircle } from 'lucide-react';
import { apiClient } from '../api/client';
import { useI18n } from '../i18n/context';

interface AdminPanelProps {
  userRole: string;
  onClose: () => void;
}

interface QuestionStats {
  skillId: string;
  count: number;
  domain: string;
  topic: string;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ userRole, onClose }) => {
  const { language } = useI18n();
  const [stats, setStats] = useState<Record<string, QuestionStats>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Check admin access
  if (userRole !== 'admin') {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="bg-slate-800 rounded-lg p-8 max-w-md text-center"
        >
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">
            {language === 'ru' ? 'Доступ запрещён' : 'Access Denied'}
          </h2>
          <p className="text-gray-400 mb-4">
            {language === 'ru'
              ? 'Только администраторы могут получить доступ к этой панели.'
              : 'Only administrators can access this panel.'}
          </p>
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-lg transition-colors"
          >
            {language === 'ru' ? 'Закрыть' : 'Close'}
          </button>
        </motion.div>
      </div>
    );
  }

  // Load statistics
  useEffect(() => {
    const loadStats = async () => {
      try {
        const skillStats = await apiClient.getSkillStats();
        setStats(skillStats);
      } catch (error) {
        console.error('[AdminPanel] Failed to load stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const filteredStats = Object.entries(stats).filter(
    ([skillId, data]) =>
      skillId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      data.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      data.domain.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalQuestions = Object.values(stats).reduce((sum, s) => sum + s.count, 0);
  const totalSkills = Object.keys(stats).length;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-slate-800 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden border border-slate-700"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="w-8 h-8 text-white" />
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {language === 'ru' ? 'Админ-панель' : 'Admin Panel'}
                </h2>
                <p className="text-purple-100 text-sm">
                  {language === 'ru' ? 'Управление вопросами' : 'Question Management'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="bg-slate-900/50 p-6 border-b border-slate-700">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-slate-700/50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-blue-400">{totalSkills}</div>
              <div className="text-sm text-gray-400">
                {language === 'ru' ? 'Навыков' : 'Skills'}
              </div>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-green-400">{totalQuestions}</div>
              <div className="text-sm text-gray-400">
                {language === 'ru' ? 'Вопросов' : 'Questions'}
              </div>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-purple-400">
                {totalSkills > 0 ? Math.floor(totalQuestions / totalSkills) : 0}
              </div>
              <div className="text-sm text-gray-400">
                {language === 'ru' ? 'Среднее на навык' : 'Avg per skill'}
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'ru' ? 'Поиск навыков...' : 'Search skills...'}
              className="w-full bg-slate-700 text-white pl-10 pr-4 py-3 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Skills List */}
        <div className="overflow-y-auto max-h-[calc(90vh-350px)] p-6">
          {loading ? (
            <div className="text-center py-12 text-gray-400">
              {language === 'ru' ? 'Загрузка...' : 'Loading...'}
            </div>
          ) : filteredStats.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              {language === 'ru' ? 'Навыки не найдены' : 'No skills found'}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredStats.map(([skillId, data]) => (
                <motion.div
                  key={skillId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-slate-700/50 rounded-lg p-4 hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-white">{data.topic}</h3>
                        <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded">
                          {data.domain}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 font-mono">{skillId}</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${
                          data.count >= 20
                            ? 'text-green-400'
                            : data.count >= 10
                            ? 'text-yellow-400'
                            : 'text-red-400'
                        }`}>
                          {data.count}
                        </div>
                        <div className="text-xs text-gray-500">
                          {language === 'ru' ? 'вопросов' : 'questions'}
                        </div>
                      </div>

                      {data.count >= 20 ? (
                        <CheckCircle className="w-6 h-6 text-green-400" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-400" />
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-900/80 p-4 border-t border-slate-700">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">
              {language === 'ru'
                ? `Показано ${filteredStats.length} из ${totalSkills} навыков`
                : `Showing ${filteredStats.length} of ${totalSkills} skills`}
            </p>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                {language === 'ru' ? 'Закрыть' : 'Close'}
              </button>
              <button
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center gap-2"
                onClick={() => alert(language === 'ru' ? 'Функция добавления вопросов в разработке' : 'Add question feature in development')}
              >
                <Plus className="w-4 h-4" />
                {language === 'ru' ? 'Добавить вопрос' : 'Add Question'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
