
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/authContext.tsx';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { CookieBanner } from '../components/common/CookieBanner.tsx';
import { UserRole, normalizeRole } from '../types/index.ts';
import { CheckCircle2 } from 'lucide-react';

// Componentes Refatorados
import { LoginHero } from '../components/features/auth/login/LoginHero.tsx';
import { LoginForm } from '../components/features/auth/login/LoginForm.tsx';
import { LoginLanguageSelector } from '../components/features/auth/login/LoginLanguageSelector.tsx';

const ClientLoginPage: React.FC = () => {
  const { login, isLoading, user } = useAuth();
  const { t } = useTranslation();
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const [showLoginSuccessAnimation, setShowLoginSuccessAnimation] = useState(false);

  useEffect(() => {
    if (user && location.pathname === '/login') {
      const role = normalizeRole(user.role);
      const targetPath = 
        role === UserRole.CLIENT ? "/client/dashboard" :
        role === UserRole.ADMIN ? "/admin/dashboard" :
        role === UserRole.QUALITY ? "/quality/dashboard" : "/";
      
      setShowLoginSuccessAnimation(true);
      const timer = setTimeout(() => {
          setShowLoginSuccessAnimation(false);
          navigate(targetPath, { replace: true });
      }, 1800);

      return () => clearTimeout(timer);
    }
  }, [user, navigate, location.pathname]);

  const handleLogin = async (e: React.FormEvent, email: string, pass: string) => {
    e.preventDefault();
    setError('');
    const result = await login(email, pass);
    if (!result.success) {
      // Resolve a chave de tradução retornada pelo serviço ou usa o fallback padrão
      setError(result.error ? t(result.error) : t('login.error'));
    }
  };

  if (showLoginSuccessAnimation) {
      return (
          <div className="h-screen w-full flex flex-col items-center justify-center bg-[#081437] animate-in fade-in duration-500">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full animate-pulse" />
                <CheckCircle2 className="text-emerald-500 relative z-10 animate-bounce" size={64} />
              </div>
              <p className="text-sm font-bold text-white uppercase tracking-[4px] animate-in slide-in-from-bottom-2">
                {t('login.successTitle')}
              </p>
              <p className="text-[10px] text-slate-400 uppercase font-medium tracking-[2px] mt-3 animate-in fade-in duration-1000 delay-300">
                {t('login.successSubtitle')}
              </p>
          </div>
      );
  }

  return (
    <div className="h-screen w-full flex bg-[#040a1d] relative selection:bg-blue-100 overflow-hidden font-sans">
      <div className="absolute inset-0 z-[100] opacity-[0.04] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      <CookieBanner />

      <aside className="hidden lg:flex lg:w-[60%] xl:w-[68%] relative overflow-hidden h-full shrink-0 border-r border-white/5">
        <LoginHero />
      </aside>

      <main className="flex-1 h-full flex flex-col items-center justify-center p-6 md:p-8 lg:p-10 xl:p-12 bg-white lg:rounded-l-[3.5rem] relative z-10 shadow-[-20px_0_60px_rgba(0,0,0,0.2)] lg:shadow-[-40px_0_100px_rgba(0,0,0,0.4)] overflow-y-auto">
        
        <div className="absolute top-8 right-8 z-50">
            <LoginLanguageSelector />
        </div>

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
               <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-[2px]">{t('login.accessManagedByVital')}</p>
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
