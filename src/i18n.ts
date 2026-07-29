
import { TOP_50_LANGUAGES } from './data/languages';
import { Language } from './types';

export const SUPPORTED_LANGUAGES: Language[] = TOP_50_LANGUAGES;

export type TranslationsDict = Record<string, any>;

let currentLangCode = 'ar';
let activeTranslations: TranslationsDict = {};
let fallbackTranslations: TranslationsDict = {};

/**
 * Main translation lookup function t(key: string): string
 * Searches active translations dictionary, falling back to English
 */
export function t(key: string, defaultText?: string): string {
  const resolved = getValueByPath(activeTranslations, key) || getValueByPath(fallbackTranslations, key);
  if (resolved && typeof resolved === 'string') {
    return resolved;
  }
  return defaultText || key;
}

/**
 * Compatibility wrapper for existing component calls
 */
export function translateKey(_lang: string, key: string, defaultText?: string): string {
  return t(key, defaultText);
}

function getValueByPath(obj: Record<string, any>, keyPath: string): string | undefined {
  if (!obj || typeof obj !== 'object') return undefined;

  if (obj[keyPath] !== undefined && typeof obj[keyPath] === 'string') {
    return obj[keyPath];
  }

  const parts = keyPath.split('.');
  let current: any = obj;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }
  return typeof current === 'string' ? current : undefined;
}

/**
 * Gets currently active language code
 */
export function getCurrentLanguage(): string {
  return currentLangCode;
}

/**
 * Detects initial user language from localStorage or navigator
 */
export function getInitialLanguage(): string {
  if (typeof window === 'undefined') return 'ar';
  
  const saved = localStorage.getItem('i18n_language') || localStorage.getItem('app_language');
  if (saved && SUPPORTED_LANGUAGES.some((l) => l.code === saved)) {
    return saved;
  }

  if (typeof navigator !== 'undefined' && navigator.language) {
    const browserLang = navigator.language.split('-')[0].toLowerCase();
    if (SUPPORTED_LANGUAGES.some((l) => l.code === browserLang)) {
      return browserLang;
    }
  }

  return 'ar';
}

/**
 * Iterates through DOM elements with data-i18n and data-i18n-placeholder and translates them
 */
export function updateDOMTranslations(): void {
  if (typeof document === 'undefined') return;

  const langConfig = SUPPORTED_LANGUAGES.find((l) => l.code === currentLangCode);
  const dir = langConfig?.dir || (['ar', 'fa', 'ur', 'he'].includes(currentLangCode) ? 'rtl' : 'ltr');

  document.documentElement.setAttribute('dir', dir);
  document.documentElement.setAttribute('lang', currentLangCode);

  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (key) {
      const translated = t(key);
      if (translated && translated !== key) {
        el.textContent = translated;
      }
    }
  });

  const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
  placeholderElements.forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (key) {
      const translated = t(key);
      if (translated && translated !== key) {
        (el as HTMLInputElement).placeholder = translated;
      }
    }
  });
}

/**
 * Dynamic language switcher that fetches locales/${langCode}.json
 */
export async function setLanguage(langCode: string): Promise<void> {
  currentLangCode = langCode;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('i18n_language', langCode);
    localStorage.setItem('app_language', langCode);
  }

  try {
    const fallbackResponse = await fetch(`/locales/en.json`);
    if(fallbackResponse.ok){
        fallbackTranslations = await fallbackResponse.json();
    }
    const response = await fetch(`/locales/${langCode}.json`);
    if (response.ok) {
      const data = await response.json();
      activeTranslations = data;
    } else {
      console.warn(`Failed to fetch translations for ${langCode}. Falling back to 'en'.`);
      activeTranslations = fallbackTranslations;
    }
  } catch (err) {
    console.warn(`Error loading translations for ${langCode}:`, err);
    activeTranslations = fallbackTranslations;
  }

  updateDOMTranslations();
  notifySubscribers();
}

type LangChangeCallback = (lang: string) => void;
const subscribers: Set<LangChangeCallback> = new Set();

export function subscribeLanguageChange(callback: LangChangeCallback): () => void {
  subscribers.add(callback);
  return () => {
    subscribers.delete(callback);
  };
}

function notifySubscribers(): void {
  subscribers.forEach((cb) => cb(currentLangCode));
}

// Automatically initialize language state on module load
if (typeof window !== 'undefined') {
  const initial = getInitialLanguage();
  setLanguage(initial);
}
