import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import your translation files
import enTranslations from './locales/en.json';
import mrTranslations from './locales/mr.json';

i18n
  // Detects user language automatically
  .use(LanguageDetector)
  // Passes i18n down to react-i18next
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      mr: { translation: mrTranslations }
    },
    fallbackLng: 'en', // If a translation is missing in Marathi, it falls back to English
    debug: false,
    interpolation: {
      escapeValue: false, // React already automatically escapes values to prevent XSS
    }
  });

export default i18n;