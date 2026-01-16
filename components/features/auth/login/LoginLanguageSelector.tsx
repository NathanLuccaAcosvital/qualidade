
import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown, ChevronUp, Check } from 'lucide-react';

export const LoginLanguageSelector: React.FC = () => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'pt', label: 'BR', name: 'Português', locale: 'pt-BR' },
    { code: 'en', label: 'US', name: 'English', locale: 'en-US' },
    { code: 'es', label: 'ES', name: 'Español', locale: 'es-ES' },
  ];

  const currentLang = languages.find(l => i18n.language.startsWith(l.code)) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem('i18nextLng', code);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Gatilho Principal - Fundo Escuro para Contraste com Borda Neon Suave */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2.5 bg-[#081437] border border-white/10 rounded-full hover:bg-[#0c1d4d] transition-all text-white shadow-xl shadow-slate-900/20 group active:scale-95"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={`Current language: ${currentLang.name}. Click to change.`}
      >
        <div className="relative">
            <Globe size={16} className={`transition-all duration-500 ${isOpen ? 'text-orange-400 rotate-12' : 'text-orange-500'}`} />
            <div className="absolute inset-0 bg-orange-500/20 blur-md rounded-full animate-pulse" />
        </div>
        <span className="text-xs font-bold uppercase tracking-[1.5px]">{currentLang.code}</span>
        {isOpen ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-3 w-60 bg-[#081437] border border-white/10 rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="p-2 space-y-1">
            {languages.map((lang) => {
              const isActive = i18n.language.startsWith(lang.code);
              return (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl transition-all group relative overflow-hidden ${
                    isActive ? 'bg-white/5' : 'hover:bg-white/[0.03]'
                  }`}
                  aria-label={`Switch to ${lang.name}`}
                >
                  <div className="flex items-center gap-4 relative z-10">
                    <span className={`text-[10px] font-bold tracking-widest px-2 py-0.5 rounded-md border ${
                        isActive 
                        ? 'text-orange-500 border-orange-500/30 bg-orange-500/5' 
                        : 'text-slate-500 border-white/5 bg-white/5'
                    }`}>
                      {lang.label}
                    </span>
                    <span className={`text-sm font-semibold transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'}`}>
                      {lang.name}
                    </span>
                  </div>
                  
                  {isActive && (
                    <div className="relative z-10 flex items-center gap-2">
                        <Check size={16} className="text-orange-500 shadow-sm" />
                    </div>
                  )}

                  {/* Efeito de Hover Background */}
                  <div className={`absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/5 to-orange-500/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`} />
                </button>
              );
            })}
          </div>
          
          <div className="bg-black/40 p-3.5 text-center border-t border-white/5">
            <span className="text-[9px] font-bold uppercase tracking-[4px] text-slate-500/80">
              {t('menu.brand')} GLOBAL
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
