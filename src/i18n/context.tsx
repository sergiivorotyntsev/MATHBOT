/**
 * 🌐 i18n Context Provider
 * React context for language management
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Language, getCurrentLanguage, setLanguage as saveLanguage } from './config';
import { t as translate, Translations } from './translations';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(getCurrentLanguage());

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    saveLanguage(lang);
  }, []);

  const t = useCallback((key: string, replacements?: Record<string, string | number>) => {
    return translate(language, key, replacements);
  }, [language]);

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}

console.log('🌐 i18n context loaded');
