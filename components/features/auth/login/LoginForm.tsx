
import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, AlertOctagon, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface LoginFormProps {
  onSubmit: (e: React.FormEvent, email: string, pass: string) => Promise<void>;
  isLoading: boolean;
  error?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, isLoading, error }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  return (
    <div className="w-full space-y-6">
      <header className="space-y-3">
        {/* Gateway Seguro Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--color-accent-orange)]/10 rounded-xl border border-[var(--color-accent-orange)]/20 text-[var(--color-accent-orange)] shadow-lg shadow-[var(--color-accent-orange)]/5">
           <ShieldCheck size={12} className="text-[var(--color-accent-orange)]" />
           <span className="text-[9px] font-bold uppercase tracking-[1.5px]">Gateway Seguro Ativo</span>
        </div>
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-primary-dark-blue)] tracking-tight leading-none mb-1">
            {t('login.restrictedAccess')}
          </h2>
          <p className="text-sm md:text-base text-slate-500 font-medium tracking-tight">
            {t('login.identifyToAccess')}
          </p>
        </div>
      </header>

      <form onSubmit={(e) => onSubmit(e, email, password)} className="space-y-6">
        <div className="space-y-4">
          {/* Email Input */}
          <div className="space-y-2 group">
            <label htmlFor="login-email" className="text-[10px] md:text-xs font-semibold uppercase tracking-[1.5px] text-slate-400 group-focus-within:text-[var(--color-detail-blue)] transition-colors ml-1">
              {t('login.corpEmail')}
            </label>
            <div className={`flex items-center bg-slate-50 border-2 rounded-2xl overflow-hidden transition-all duration-300 ${focusedInput === 'email' ? 'border-[var(--color-detail-blue)] bg-white shadow-lg shadow-[var(--color-detail-blue)]/5' : 'border-slate-100'}`}>
              <div className={`w-12 h-14 flex items-center justify-center border-r transition-colors ${focusedInput === 'email' ? 'text-[var(--color-detail-blue)] border-slate-100' : 'text-slate-300 border-slate-50'}`}>
                <Mail size={18} />
              </div>
              <input 
                id="login-email"
                type="email" required 
                className="flex-1 px-4 py-3 bg-transparent outline-none text-sm md:text-base font-medium text-[var(--color-primary-dark-blue)] placeholder-slate-400"
                placeholder="tecnico@acosvital.com"
                onFocus={() => setFocusedInput('email')}
                onBlur={() => setFocusedInput(null)}
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2 group">
            <div className="flex justify-between items-end px-1">
              <label htmlFor="login-password" className="text-[10px] md:text-xs font-semibold uppercase tracking-[1.5px] text-slate-400 group-focus-within:text-[var(--color-detail-blue)] transition-colors">
                {t('login.accessPassword')}
              </label>
              <button 
                type="button" 
                className="text-[10px] md:text-xs font-bold text-[var(--color-accent-orange)] hover:text-[var(--color-accent-orange-hover)] uppercase tracking-wider transition-colors underline-offset-4 hover:underline"
              >
                {t('login.forgotPassword')}
              </button>
            </div>
            <div className={`flex items-center bg-slate-50 border-2 rounded-2xl overflow-hidden transition-all duration-300 ${focusedInput === 'password' ? 'border-[var(--color-detail-blue)] bg-white shadow-lg shadow-[var(--color-detail-blue)]/5' : 'border-slate-100'}`}>
              <div className={`w-12 h-14 flex items-center justify-center border-r transition-colors ${focusedInput === 'password' ? 'text-[var(--color-detail-blue)] border-slate-100' : 'text-slate-300 border-slate-50'}`}>
                <Lock size={18} />
              </div>
              <input 
                id="login-password"
                type={showPassword ? "text" : "password"} required 
                className="flex-1 px-4 py-3 bg-transparent outline-none text-sm md:text-base font-medium text-[var(--color-primary-dark-blue)] placeholder-slate-400 tracking-widest"
                placeholder="••••••••"
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="w-12 h-14 flex items-center justify-center text-slate-300 hover:text-[var(--color-detail-blue)] transition-colors"
                aria-label={showPassword ? t('common.hidePassword') : t('common.showPassword')}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-800 text-xs font-semibold rounded-xl border border-red-200 flex items-center gap-3 animate-shake" role="alert">
            <AlertOctagon size={16} className="text-red-700 shrink-0" />
            <span className="leading-tight">{error}</span>
          </div>
        )}

        <button 
          type="submit" disabled={isLoading}
          className="w-full bg-[var(--color-primary-dark-blue)] hover:bg-slate-800 text-white font-bold h-14 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-[var(--color-primary-dark-blue)]/10 active:scale-[0.98] disabled:opacity-70 group overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          {isLoading ? <Loader2 size={20} className="animate-spin" /> : (
            <>
              <span className="uppercase tracking-[2px] text-[10px] md:text-xs">{t('login.authenticate')}</span>
              <ArrowRight size={18} className="text-[var(--color-detail-blue)] group-hover:translate-x-1.5 transition-transform" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
