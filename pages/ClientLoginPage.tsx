import React, { useState } from 'react';
import { useAuth } from '../context/authContext.tsx';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { CookieBanner } from '../components/common/CookieBanner.tsx';
import { UserRole, normalizeRole } from '../types/index.ts';

// Componentes Refatorados
import { LoginHero } from '../components/features/auth/login/LoginHero.tsx';
import { LoginForm } from '../components/features/auth/login/LoginForm.tsx';
import { LanguageSelector } from '../components/features/auth/login/LanguageSelector.tsx';

const ClientLoginPage: React.FC = () => {
  const { login, isLoading, user } = useAuth();
  const { t } = useTranslation();
  const [error, setError] = useState('');

  if (user && normalizeRole(user.role) === UserRole.CLIENT) {
    return <Navigate to="/client/dashboard" replace />;
  }

  const handleLogin = async (e: React.FormEvent, email: string, pass: string) => {
    e.preventDefault();
    setError('');
    const result = await login(email, pass);
    if (!result.success) {
      setError(result.error || t('login.error'));
    }
  };

  return (
    <div className="h-screen w-full flex bg-[#040a1d] relative selection:bg-blue-100 overflow-hidden font-sans">
      {/* Camada de Granulação Industrial */}
      <div className="absolute inset-0 z-[100] opacity-[0.04] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      <CookieBanner />

      {/* Hero Section */}
      <aside className="hidden lg:flex lg:w-[60%] xl:w-[68%] relative overflow-hidden h-full shrink-0 border-r border-white/5">
        <LoginHero />
      </aside>

      {/* Login Form Section: Padding reduzido para compactar a altura */}
      <main className="flex-1 h-full flex flex-col items-center justify-center p-6 md:p-8 lg:p-10 xl:p-12 bg-white lg:rounded-l-[3.5rem] relative z-10 shadow-[-20px_0_60px_rgba(0,0,0,0.2)] lg:shadow-[-40px_0_100px_rgba(0,0,0,0.4)] overflow-y-auto">
        
        {/* Language Switcher */}
        <div className="absolute top-4 right-6 md:top-6 md:right-8 z-50 animate-in fade-in duration-1000">
          <LanguageSelector />
        </div>

        {/* Login Container: Max width e spacing vertical otimizados */}
        <div className="w-full max-w-[340px] xl:max-w-[360px] animate-in zoom-in-95 duration-700 py-4">
          <div className="space-y-6 md:space-y-8">
            <div className="flex justify-center lg:hidden mb-6">
               <img src="https://wtydnzqianhahiiasows.supabase.co/storage/v1/object/public/public_assets/hero/logo.png" alt="Aços Vital" className="h-8 object-contain" />
            </div>

            <LoginForm 
              onSubmit={handleLogin}
              isLoading={isLoading}
              error={error}
            />

            <footer className="pt-6 border-t border-slate-100 text-center relative">
               <p className="text-[9px] font-medium text-slate-500 uppercase tracking-[2px]">{t('login.accessManagedByVital')}</p>
               <img 
                 src="https://wtydnzqianhahiiasows.supabase.co/storage/v1/object/public/public_assets/hero/logo.png" 
                 alt="" 
                 className="h-3 opacity-20 grayscale hidden sm:block absolute right-0 top-1/2 -translate-y-1/2"
                 aria-hidden="true" 
               />
            </footer>
          </div>
        </div>
      </main>
      
      <style>{`
        @keyframes slow-zoom {
          from { transform: scale(1); }
          to { transform: scale(1.1); }
        }
        .animate-slow-zoom {
          animation: slow-zoom 60s infinite alternate ease-in-out;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.35s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
    </div>
  );
};

export default ClientLoginPage;