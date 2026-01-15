

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/authContext.tsx';
import { CookieBanner } from '../components/common/CookieBanner.tsx';
import { PrivacyModal } from '../components/common/PrivacyModal.tsx';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  Loader2, 
  Mail, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  Globe,
  Eye,
  EyeOff,
  AlertOctagon,
  ShieldCheck
} from 'lucide-react';

const LOGO_URL = "https://wtydnzqianhahiiasows.supabase.co/storage/v1/object/public/public_assets/hero/logo.png";
const BACKGROUND_URL = "https://wtydnzqianhahiiasows.supabase.co/storage/v1/object/public/public_assets/hero/header_login.webp";

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); 
  const [error, setError] = useState('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(0);

  const { login, isLoading } = useAuth();
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
      i18n.changeLanguage(lng);
  };

  useEffect(() => {
      let interval: any;
      if (isLocked && lockTimer > 0) {
          interval = setInterval(() => {
              setLockTimer((prev) => prev - 1);
          }, 1000);
      } else if (lockTimer === 0 && isLocked) {
          setIsLocked(false);
      }
      return () => clearInterval(interval);
  }, [isLocked, lockTimer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;
    setError('');
    
    try {
        const result = await login(email, password);
        if (!result.success) {
          setError(result.error || t('login.connectionError'));
        }
    } catch (e: any) {
        setError(t('login.connectionError'));
    }
  };

  return (
    <div className="min-h-screen flex bg-white relative selection:bg-blue-100 overflow-hidden font-['Inter',_sans-serif]">
      
      <div className="fixed inset-0 pointer-events-none opacity-[0.012] z-[100] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

      {/* Language Selector removido deste arquivo. */}

      <CookieBanner />
      <PrivacyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />

      {/* LADO ESQUERDO: BRANDING INDUSTRIAL MAGNIFICADO */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden shrink-0">
        <div 
            className="absolute inset-0 bg-cover bg-center scale-105 animate-slow-zoom"
            style={{ backgroundImage: `url("${BACKGROUND_URL}")` }} 
        />
        <div className="absolute inset-0 bg-[#081437]/60 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#081437] via-[#081437]/70 to-transparent" />
        
        <div className="relative z-30 flex flex-col justify-between p-20 w-full h-full text-white">
            <div className="animate-in fade-in slide-in-from-left-6 duration-1000">
                <img src={LOGO_URL} alt="Aços Vital" className="h-16 object-contain drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)]" />
            </div>

            <div className="space-y-12 max-w-2xl animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="h-[2px] w-12 bg-[#B23C0E]"></div>
                        <span className="text-[#B23C0E] text-xs font-black uppercase tracking-[6px]">Liderança Técnica</span>
                    </div>
                    <h1 className="text-6xl font-black leading-tight tracking-tighter text-white">
                       Aço de confiança,<br/>
                       <span className="text-[#62A5FA] block mt-2">Qualidade certificada.</span>
                    </h1>
                </div>
                
                <p className="text-lg text-slate-300/90 font-medium leading-relaxed max-w-md">
                    {t('login.sloganText')}
                </p>
                
                <div className="flex flex-wrap gap-4 pt-4">
                     <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-white bg-white/5 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 shadow-xl">
                        <CheckCircle2 size={16} className="text-[#B23C0E]" aria-hidden="true" /> {t('files.certification')}
                     </div>
                     <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-white bg-white/5 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 shadow-xl">
                        <ShieldCheck size={16} className="text-[#B23C0E]" aria-hidden="true" /> {t('files.secureData')}
                     </div>
                </div>
            </div>

            <div className="text-[10px] text-slate-400 font-bold flex items-center gap-10 uppercase tracking-[4px]">
                <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true"></span>
                    {t('menu.systemMonitoring')}
                </div>
                <button onClick={() => setIsPrivacyOpen(true)} className="hover:text-white transition-colors" aria-label={t('common.privacy')}>
                    {t('common.privacy')}
                </button>
                <span className="opacity-40" aria-hidden="true">&copy; {new Date().getFullYear()} Aços Vital S.A.</span>
            </div>
        </div>
      </div>

      {/* LADO DIREITO: FORMULÁRIO MINIMALISTA E MODERNO */}
      <div className="w-full lg:flex-1 flex items-center justify-center p-8 md:p-16 bg-white relative z-30">
        <div className="w-full max-w-[420px] space-y-10 animate-in fade-in slide-in-from-right-6 duration-1000">
            
            <div className="space-y-3">
                <h2 className="text-4xl font-black text-[#081437] tracking-tighter">{t('menu.portalName')}</h2>
                <p className="text-slate-400 text-sm font-medium">{t('login.enterCredentials')}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Campo E-mail Premium */}
                <div className="space-y-2 group">
                    <label htmlFor="email-input" className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] ml-1 transition-colors group-focus-within:text-[#62A5FA]">
                        {t('login.corpEmail')}
                    </label>
                    <div 
                        className={`flex items-center bg-slate-50 border-[1.5px] rounded-2xl overflow-hidden transition-all duration-300
                        ${focusedInput === 'email' ? 'border-[#62A5FA] bg-white ring-4 ring-[#62A5FA]/10 shadow-sm' : 'border-slate-100'}`}
                    >
                        <div className={`w-12 h-14 flex items-center justify-center border-r transition-colors ${focusedInput === 'email' ? 'text-[#62A5FA] border-[#62A5FA]/10' : 'text-slate-300 border-slate-100'}`}>
                            <Mail size={18} strokeWidth={2.5} aria-hidden="true" />
                        </div>
                        <input 
                            id="email-input"
                            type="email" 
                            required
                            className="flex-1 px-5 py-4 bg-transparent outline-none text-sm text-slate-800 placeholder-slate-300 font-normal"
                            placeholder="usuario@acosvital.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onFocus={() => setFocusedInput('email')}
                            onBlur={() => setFocusedInput(null)}
                            aria-label={t('login.corpEmail')}
                        />
                    </div>
                </div>

                {/* Campo Senha de Acesso */}
                <div className="space-y-2 group">
                    <div className="flex justify-between items-end px-1">
                        <label htmlFor="password-input" className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] transition-colors group-focus-within:text-[#62A5FA]">
                            {t('login.accessPassword')}
                        </label>
                        <a href="#" className="text-[10px] font-bold text-[#B23C0E] hover:underline underline-offset-4 tracking-wider" aria-label={t('login.forgotPassword')}>
                            {t('login.forgotPassword')}
                        </a>
                    </div>
                    <div 
                        className={`flex items-center bg-slate-50 border-[1.5px] rounded-2xl overflow-hidden transition-all duration-300
                        ${focusedInput === 'password' ? 'border-[#62A5FA] bg-white ring-4 ring-[#62A5FA]/10 shadow-sm' : 'border-slate-100'}`}
                    >
                        <div className={`w-12 h-14 flex items-center justify-center border-r transition-colors ${focusedInput === 'password' ? 'text-[#62A5FA] border-[#62A5FA]/10' : 'text-slate-300 border-slate-100'}`}>
                            <Lock size={18} strokeWidth={2.5} aria-hidden="true" />
                        </div>
                        <input 
                            id="password-input"
                            type={showPassword ? "text" : "password"}
                            required
                            className="flex-1 px-5 py-4 bg-transparent outline-none text-sm text-slate-800 placeholder-slate-300 font-normal"
                            placeholder="••••••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onFocus={() => setFocusedInput('password')}
                            onBlur={() => setFocusedInput(null)}
                            aria-label={t('login.accessPassword')}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="w-12 h-14 flex items-center justify-center text-slate-300 hover:text-[#62A5FA] transition-colors"
                            aria-label={showPassword ? t('common.hidePassword') : t('common.showPassword')} // A11y
                        >
                            {showPassword ? <Eye size={18} aria-hidden="true" /> : <EyeOff size={18} aria-hidden="true" />}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 text-red-600 text-[11px] font-bold rounded-xl border border-red-100 flex items-center gap-3 animate-in slide-in-from-top-2" role="alert">
                        <AlertOctagon size={16} className="shrink-0" aria-hidden="true" />
                        {error}
                    </div>
                )}
                
                <div className="pt-4">
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full bg-[#081437] hover:bg-[#0c1d4d] text-white font-black py-4 rounded-2xl transition-all duration-300 flex items-center justify-center shadow-lg active:scale-[0.98] disabled:opacity-70"
                        aria-label={t('login.authenticateAccess')}
                    >
                        {isLoading ? (
                            <Loader2 size={20} className="animate-spin" aria-hidden="true" />
                        ) : (
                            <div className="flex items-center gap-3">
                                <span className="tracking-[4px] uppercase text-[11px]">{t('login.authenticateAccess')}</span>
                                <ArrowRight size={18} className="text-[#62A5FA]" aria-hidden="true" />
                            </div>
                        )}
                    </button>
                </div>
            </form>

            <div className="text-center pt-8 border-t border-slate-50">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                   Acessos gerenciados pelo Administrador do Sistema.
                </p>
            </div>
        </div>
      </div>

      <style>{`
        @keyframes slow-zoom {
            0% { transform: scale(1); }
            100% { transform: scale(1.08); }
        }
        .animate-slow-zoom {
            animation: slow-zoom 30s infinite alternate ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Login;
