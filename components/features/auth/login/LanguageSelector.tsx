
import React from 'react';
import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface LanguageSelectorProps {
  inHeader?: boolean; // Nova prop para estilização condicional
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ inHeader = false }) => {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('i18nextLng', lng);
  };

  const languages = [
    { code: 'pt', label: 'PT', full: 'Português' },
    // Fix: Removed duplicate 'code' property
    { code: 'en', label: 'EN', full: 'English' },
    { code: 'es', label: 'ES', full: 'Español' }
  ];

  return (
    <nav className={`p-1.5 rounded-2xl flex items-center gap-1 transition-all ${inHeader ? 'bg-white/10 border border-white/20' : 'bg-slate-100 shadow-inner border border-slate-200'}`} aria-label="Seletor de idioma">
      <div className={`px-3 ${inHeader ? 'text-slate-300' : 'text-slate-400'}`} aria-hidden="true">
        <Globe size={14} />
      </div>
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => changeLanguage(lang.code)}
          aria-label={`Mudar idioma para ${lang.full}`}
          className={`px-4 py-2 text-[10px] font-black uppercase rounded-xl transition-all duration-300 ${
            i18n.language.startsWith(lang.code) 
              ? `${inHeader ? 'bg-[var(--color-detail-blue)]' : 'bg-[var(--color-primary-dark-blue)]'} text-white shadow-lg scale-105` 
              : `${inHeader ? 'text-slate-300 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-[var(--color-primary-dark-blue)] hover:bg-white'}`
          }`}
        >
          {lang.label}
        </button>
      ))}
    </nav>
  );
};
