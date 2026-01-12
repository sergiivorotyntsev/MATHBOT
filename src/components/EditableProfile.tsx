/**
 * ✏️ Editable Profile Component
 * Allows user to edit name, age, language preferences
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit2, Save, X, User, Calendar, Globe } from 'lucide-react';
import { AvatarProfile, AvatarBaseType } from '../avatar/types';
import { AvatarView } from '../avatar/AvatarView';
import { useI18n } from '../i18n/context';
import { ageToGrade } from '../engine/questionEngineAdapter';

interface UserData {
  name: string;
  age: number;
  email: string;
  registeredAt: string;
}

interface EditableProfileProps {
  userData: UserData;
  avatarProfile?: AvatarProfile;
  level: number;
  totalXP: number;
  xpProgress: number;
  xpToNextLevel: number;
  sessions: number;
  totalPlayTime: number;
  onSave: (updated: Partial<UserData>) => void;
  onAvatarChange?: (baseType: AvatarBaseType) => void;
  calculateXPForNextLevel: (level: number) => number;
}

export const EditableProfile: React.FC<EditableProfileProps> = ({
  userData,
  avatarProfile,
  level,
  totalXP,
  xpProgress,
  xpToNextLevel,
  sessions,
  totalPlayTime,
  onSave,
  onAvatarChange,
  calculateXPForNextLevel
}) => {
  const { t, language, setLanguage } = useI18n();
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    name: userData.name,
    age: userData.age
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!editedData.name || editedData.name.trim().length < 2) {
      newErrors.name = language === 'ru' ? 'Имя должно содержать минимум 2 символа' : 'Name must be at least 2 characters';
    }

    if (editedData.age < 6 || editedData.age > 18) {
      newErrors.age = language === 'ru' ? 'Возраст должен быть от 6 до 18 лет' : 'Age must be between 6 and 18';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      onSave(editedData);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedData({ name: userData.name, age: userData.age });
    setErrors({});
    setIsEditing(false);
  };

  const grade = ageToGrade(editedData.age);
  const xpForCurrentLevel = level > 1 ? calculateXPForNextLevel(level - 1) : 0;
  const xpRequired = calculateXPForNextLevel(level) - xpForCurrentLevel;
  const xpInLevel = totalXP - xpForCurrentLevel;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-slate-800 rounded-lg p-4 sm:p-8 shadow-2xl"
    >
      {/* Header with Edit Button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
          <User className="w-6 h-6 sm:w-8 sm:h-8" />
          {t('nav.profile')}
        </h2>

        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2"
            style={{ minHeight: '44px' }}
          >
            <Edit2 className="w-4 h-4" />
            {language === 'ru' ? 'Редактировать' : 'Edit'}
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2"
              style={{ minHeight: '44px' }}
            >
              <Save className="w-4 h-4" />
              {language === 'ru' ? 'Сохранить' : 'Save'}
            </button>
            <button
              onClick={handleCancel}
              className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2"
              style={{ minHeight: '44px' }}
            >
              <X className="w-4 h-4" />
              {language === 'ru' ? 'Отмена' : 'Cancel'}
            </button>
          </div>
        )}
      </div>

      {/* Large Avatar Display */}
      {avatarProfile && (
        <div className="flex justify-center mb-6">
          <AvatarView
            avatar={avatarProfile}
            size="large"
            animate={true}
          />
        </div>
      )}

      <div className="space-y-3 sm:space-y-4">
        {/* Name */}
        <div className="bg-slate-700 rounded-lg p-4 sm:p-6">
          <div className="text-gray-400 mb-2 text-sm flex items-center gap-2">
            <User className="w-4 h-4" />
            {language === 'ru' ? 'Имя:' : 'Name:'}
          </div>
          {isEditing ? (
            <div>
              <input
                type="text"
                value={editedData.name}
                onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
                className="w-full bg-slate-600 rounded-lg px-4 py-2 text-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={language === 'ru' ? 'Введите имя' : 'Enter name'}
                style={{ minHeight: '44px' }}
              />
              {errors.name && (
                <div className="text-red-400 text-sm mt-1">{errors.name}</div>
              )}
            </div>
          ) : (
            <div className="text-xl sm:text-2xl font-bold">{userData.name}</div>
          )}
        </div>

        {/* Age */}
        <div className="bg-slate-700 rounded-lg p-4 sm:p-6">
          <div className="text-gray-400 mb-2 text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {language === 'ru' ? 'Возраст:' : 'Age:'}
          </div>
          {isEditing ? (
            <div>
              <input
                type="number"
                min="6"
                max="18"
                value={editedData.age}
                onChange={(e) => setEditedData({ ...editedData, age: parseInt(e.target.value) || 6 })}
                className="w-full bg-slate-600 rounded-lg px-4 py-2 text-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ minHeight: '44px' }}
              />
              {errors.age && (
                <div className="text-red-400 text-sm mt-1">{errors.age}</div>
              )}
              {!errors.age && (
                <div className="text-blue-400 text-sm mt-1">
                  {language === 'ru' ? `Класс: ${grade}` : `Grade: ${grade}`}
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="text-xl sm:text-2xl font-bold">
                {userData.age} {language === 'ru' ? 'лет' : 'years'}
              </div>
              <div className="text-sm text-gray-400 mt-1">
                {language === 'ru' ? `Класс: ${grade}` : `Grade: ${grade}`}
              </div>
            </div>
          )}
        </div>

        {/* Email (read-only) */}
        <div className="bg-slate-700 rounded-lg p-4 sm:p-6">
          <div className="text-gray-400 mb-1 text-sm">Email:</div>
          <div className="text-xl sm:text-2xl font-bold break-all">{userData.email}</div>
        </div>

        {/* Language */}
        <div className="bg-slate-700 rounded-lg p-4 sm:p-6">
          <div className="text-gray-400 mb-2 text-sm flex items-center gap-2">
            <Globe className="w-4 h-4" />
            {language === 'ru' ? 'Язык:' : 'Language:'}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setLanguage('ru')}
              className={`px-4 py-2 rounded-lg font-bold transition-all ${
                language === 'ru'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-600 text-gray-300 hover:bg-slate-500'
              }`}
              style={{ minHeight: '44px' }}
            >
              🇷🇺 Русский
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-4 py-2 rounded-lg font-bold transition-all ${
                language === 'en'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-600 text-gray-300 hover:bg-slate-500'
              }`}
              style={{ minHeight: '44px' }}
            >
              🇬🇧 English
            </button>
          </div>
        </div>

        {/* XP and Level (read-only) */}
        <div className="bg-slate-700 rounded-lg p-4 sm:p-6">
          <div className="text-gray-400 mb-1 text-sm">{t('header.level')}:</div>
          <div className="text-xl sm:text-2xl font-bold text-yellow-400">
            {language === 'ru' ? 'Ур.' : 'Lvl'} {level}
          </div>
        </div>

        <div className="bg-slate-700 rounded-lg p-4 sm:p-6">
          <div className="text-gray-400 mb-1 text-sm">{t('header.xp')}:</div>
          <div className="text-xl sm:text-2xl font-bold text-purple-400">
            {xpInLevel} / {xpRequired} XP
          </div>
          <div className="text-xs sm:text-sm text-gray-400 mt-1">
            {language === 'ru' ? 'До следующего уровня:' : 'To next level:'} {xpToNextLevel} XP ({xpProgress.toFixed(1)}%)
          </div>
          <div className="w-full h-2 bg-slate-600 rounded-full overflow-hidden mt-2">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 transition-all duration-300"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="bg-slate-700 rounded-lg p-4 sm:p-6">
          <div className="text-gray-400 mb-1 text-sm">
            {language === 'ru' ? 'Всего сессий:' : 'Total sessions:'}
          </div>
          <div className="text-xl sm:text-2xl font-bold">{sessions}</div>
        </div>

        <div className="bg-slate-700 rounded-lg p-4 sm:p-6">
          <div className="text-gray-400 mb-1 text-sm">
            {language === 'ru' ? 'Общее время игры:' : 'Total play time:'}
          </div>
          <div className="text-xl sm:text-2xl font-bold">
            {Math.floor(totalPlayTime / 3600)}{language === 'ru' ? 'ч' : 'h'} {Math.floor((totalPlayTime % 3600) / 60)}{language === 'ru' ? 'м' : 'm'}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
