/**
 * 🌐 Language Switcher Component
 *
 * Allows users to switch between Russian and English
 */

import React from 'react';
import { Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { useI18n } from '../i18n/context';
import { Language } from '../i18n/config';

interface LanguageSwitcherProps {
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ className = '' }) => {
  const { language, setLanguage } = useI18n();

  const toggleLanguage = () => {
    const newLang: Language = language === 'ru' ? 'en' : 'ru';
    setLanguage(newLang);
  };

  return (
    <motion.button
      onClick={toggleLanguage}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded-lg transition-all ${className}`}
      style={{ minHeight: '44px', minWidth: '44px' }}
      title="Switch language / Переключить язык"
    >
      <Globe className="w-5 h-5" />
      <span className="font-bold uppercase">{language}</span>
    </motion.button>
  );
};

console.log('🌐 LanguageSwitcher loaded');
