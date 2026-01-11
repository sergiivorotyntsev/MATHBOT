/**
 * 🌐 Internationalization Configuration
 * Supports RU/EN with localStorage persistence
 */

export type Language = 'ru' | 'en';

export const SUPPORTED_LANGUAGES: Language[] = ['ru', 'en'];

export const LANGUAGE_NAMES: Record<Language, { native: string; en: string }> = {
  ru: { native: 'Русский', en: 'Russian' },
  en: { native: 'English', en: 'English' }
};

const STORAGE_KEY = 'mathbot_language';

// Get current language from localStorage or browser
export function getCurrentLanguage(): Language {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED_LANGUAGES.includes(stored as Language)) {
      return stored as Language;
    }
  } catch (e) {
    console.warn('Failed to read language from localStorage:', e);
  }

  // Auto-detect from browser
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('ru')) return 'ru';
  return 'en'; // Default
}

// Save language preference
export function setLanguage(lang: Language): void {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch (e) {
    console.warn('Failed to save language to localStorage:', e);
  }
}

console.log('🌐 i18n config loaded');
