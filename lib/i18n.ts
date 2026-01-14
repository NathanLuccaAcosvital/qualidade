
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { pt } from '../locales/pt.ts';
import { en } from '../locales/en.ts';
import { es } from '../locales/es.ts';

const resources = {
  pt: { translation: pt },
  en: { translation: en },
  es: { translation: es }
};

// Detecção de idioma com fallback persistente
const savedLanguage = localStorage.getItem('i18nextLng') || 'pt';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: "pt",
    interpolation: {
      escapeValue: false 
    },
    react: {
      useSuspense: true
    }
  });

export default i18n;
