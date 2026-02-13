import type { Translations } from './translations';

/**
 * Supported languages
 */
export type Language = 'en' | 'ru' | 'kk';

/**
 * Language metadata
 */
export interface LanguageInfo {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
}

/**
 * Available languages
 */
export const LANGUAGES: readonly LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: 'EN' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: 'RU' },
  { code: 'kk', name: 'Kazakh', nativeName: 'Қазақша', flag: 'KZ' },
] as const;

/**
 * Get language info by code
 */
export function getLanguageInfo(code: Language): LanguageInfo {
  return LANGUAGES.find((lang) => lang.code === code) || LANGUAGES[0];
}

/**
 * Translation keys type
 */
export type TranslationKey = keyof Translations;
