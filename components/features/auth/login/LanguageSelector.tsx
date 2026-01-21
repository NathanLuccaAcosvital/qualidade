
import React from 'react';
import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface LanguageSelectorProps {
  inHeader?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('i18nextLng', lng);
  };

  const languages = [
    { code: 'pt', label: 'PT' },
    { code: 'en', label: 'EN' },
    { code: 'es', label: 'ES' }
  ];

  return (
    <nav 
      className="inline-flex items-center gap-0.5 p-0.5 bg-white border border-slate-200 rounded-lg" 
      aria-label="Seletor de idioma"
    >
      <div className="px-2 text-slate-300" aria-hidden="true">
        <Globe size={12} strokeWidth={2} />
      </div>
      {languages.map((lang) => {
        const isActive = i18n.language.startsWith(lang.code);
        return (
          <button
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={`
              px-3 py-1.5 text-[10px] font-bold uppercase rounded-md transition-colors duration-200
              ${isActive 
                ? 'bg-slate-100 text-slate-900' 
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}
            `}
          >
            {lang.label}
          </button>
        );
      })}
    </nav>
  );
};
