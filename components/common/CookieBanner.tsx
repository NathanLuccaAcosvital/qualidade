
import React, { useState, useEffect, useCallback } from 'react';
import { Cookie, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const useCookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('lgpd_consent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptConsent = useCallback(() => {
    localStorage.setItem('lgpd_consent', 'true');
    localStorage.setItem('lgpd_consent_date', new Date().toISOString());
    setIsVisible(false);
  }, []);

  const rejectConsent = useCallback(() => {
    window.location.href = 'https://acosvital.com.br/';
  }, []);

  return { isVisible, acceptConsent, rejectConsent };
};

export const CookieBanner: React.FC = () => {
  const { t } = useTranslation();
  const { isVisible, acceptConsent, rejectConsent } = useCookieConsent();

  if (!isVisible) return null;

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-[120] p-4 md:p-6 flex justify-center animate-in slide-in-from-bottom-10 duration-500"
      role="complementary"
    >
      <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-[2rem] shadow-2xl max-w-5xl w-full p-6 md:p-10 flex flex-col md:flex-row items-start md:items-center gap-8 border border-white/10">
        
        <div className="bg-white/5 p-4 rounded-2xl shrink-0 hidden md:block border border-white/10">
            <Cookie className="text-[var(--color-detail-blue)]" size={36} />
        </div>

        <div className="flex-1">
            <h4 className="text-lg font-black mb-2 flex items-center gap-2 uppercase tracking-tighter">
                {t('cookie.title')}
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed font-medium">
                {t('cookie.text')}
            </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0 w-full md:w-auto">
            <button 
                onClick={rejectConsent}
                className="flex-1 md:flex-none px-6 py-3.5 bg-transparent hover:bg-white/10 text-slate-300 hover:text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all border border-white/10"
            >
                Recusar
            </button>
            <button 
                onClick={acceptConsent}
                className="flex-1 md:flex-none px-8 py-3.5 bg-[var(--color-detail-blue)] hover:bg-[var(--color-primary-dark-blue)] text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-[var(--color-detail-blue)]/20 active:scale-95 border border-transparent"
            >
                {t('cookie.accept')}
            </button>
            <button 
                onClick={rejectConsent}
                className="hidden md:flex p-3 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                aria-label="Recusar e sair"
            >
                <X size={20} />
            </button>
        </div>
      </div>
    </div>
  );
};
