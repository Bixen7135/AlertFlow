'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Language } from './types';
import { translations, type Translations } from './translations';

/**
 * Language context state
 */
interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

/**
 * Language context
 */
const LanguageContext = createContext<LanguageState | undefined>(undefined);

/**
 * Language storage key for localStorage
 */
const LANGUAGE_STORAGE_KEY = 'alertflow-language';

/**
 * Get initial language from localStorage or browser settings
 */
function getInitialLanguage(): Language {
  if (typeof window === 'undefined') return 'en';

  // Try localStorage first
  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (stored && ['en', 'ru', 'kk'].includes(stored)) {
    return stored as Language;
  }

  // Fall back to browser language
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('kk')) return 'kk';
  if (browserLang.startsWith('ru')) return 'ru';

  return 'en';
}

/**
 * Provider props
 */
interface LanguageProviderProps {
  children: React.ReactNode;
  defaultLanguage?: Language;
}

/**
 * Language provider component
 */
export function LanguageProvider({ children, defaultLanguage }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(
    defaultLanguage || getInitialLanguage()
  );

  // Persist language to localStorage
  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  }, []);

  const value: LanguageState = {
    language,
    setLanguage,
    t: translations[language],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * Hook to use language context
 */
export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }

  return context;
}

/**
 * Hook to get current language code
 */
export function useLanguageCode(): Language {
  const { language } = useLanguage();
  return language;
}

/**
 * Hook to get translations
 */
export function useTranslations(): Translations {
  const { t } = useLanguage();
  return t;
}
