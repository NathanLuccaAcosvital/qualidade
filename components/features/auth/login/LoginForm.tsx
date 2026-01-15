
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
    <div className="w-full space-y-4"> {/* Reduzido space-y-6 para space-y-4 */}
      <header className="space-y-2"> {/* Reduzido space-y-3 para space-y-2 */}
        {/* Gateway Seguro Badge */}
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#b23c0e]/10 rounded-lg border border-[#b23c0e]/20 text-[#8a2e0b] shadow-sm"> {/* Reduzido padding, gap, rounded */}
           <ShieldCheck size={10} className="text-[#b23c0e]" /> {/* Reduzido size={12} para size={10} */}
           <span className="text-[8px] font-black uppercase tracking-[1px]">Gateway Seguro Ativo</span> {/* Reduzido text-[9px] para text-[8px], tracking-[1.5px] para tracking-[1px] */}
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-black text-[#040a1d] tracking-tighter leading-none mb-0.5"> {/* Reduzido text-2xl/3xl para xl/2xl */}
            {t('login.restrictedAccess')}
          </h2>
          <p className="text-xs md:text-sm text-slate-500 font-medium tracking-tight"> {/* Reduzido text-sm/base para xs/sm */}
            {t('login.identifyToAccess')}
          </p>
        </div>
      </header>

      <form onSubmit={(e) => onSubmit(e, email, password)} className="space-y-5"> {/* Reduzido space-y-6 para space-y-5 */}
        <div className="space-y-3"> {/* Reduzido space-y-4 para space-y-3 */}
          {/* Email Input */}
          <div className="space-y-1 group"> {/* Reduzido space-y-2 para space-y-1 */}
            <label htmlFor="login-email" className="text-[9px] md:text-[10px] font-black uppercase tracking-[1.5px] text-slate-400 group-focus-within:text-blue-700 transition-colors ml-0.5"> {/* Reduzido text-[10px]/xs para 9px/10px, tracking-[2px] para 1.5px, ml-1 para ml-0.5 */}
              {t('login.corpEmail')}
            </label>
            <div className={`flex items-center bg-slate-50 border-2 rounded-xl overflow-hidden transition-all duration-300 ${focusedInput === 'email' ? 'border-blue-700 bg-white shadow-lg shadow-blue-500/5' : 'border-slate-100'}`}> {/* Reduzido rounded-2xl para xl */}
              <div className={`w-10 h-12 flex items-center justify-center border-r transition-colors ${focusedInput === 'email' ? 'text-blue-700 border-slate-100' : 'text-slate-300 border-slate-50'}`}> {/* Reduzido w-12 h-14 para w-10 h-12 */}
                <Mail size={16} /> {/* Reduzido size={18} para size={16} */}
              </div>
              <input 
                id="login-email"
                type="email" required 
                className="flex-1 px-3 py-2.5 bg-transparent outline-none text-xs md:text-sm font-semibold text-[#040a1d] placeholder-slate-400" {/* Reduzido px-4 py-3 para px-3 py-2.5, text-sm/base para xs/sm */}
                placeholder="tecnico@acosvital.com"
                onFocus={() => setFocusedInput('email')}
                onBlur={() => setFocusedInput(null)}
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1 group"> {/* Reduzido space-y-2 para space-y-1 */}
            <div className="flex justify-between items-end px-0.5"> {/* Reduzido px-1 para px-0.5 */}
              <label htmlFor="login-password" className="text-[9px] md:text-[10px] font-black uppercase tracking-[1.5px] text-slate-400 group-focus-within:text-blue-700 transition-colors"> {/* Reduzido text-[10px]/xs para 9px/10px, tracking-[2px] para 1.5px */}
                {t('login.accessPassword')}
              </label>
              <button 
                type="button" 
                onClick={() => { /* TODO: Implement password reset flow */ }}
                className="text-[9px] font-black text-[#b23c0e] hover:text-[#8a2e0b] uppercase tracking-widest transition-colors underline-offset-4 hover:underline" {/* Reduzido text-[10px]/xs para 9px */}
              >
                {t('login.forgotPassword')}
              </button>
            </div>
            <div className={`flex items-center bg-slate-50 border-2 rounded-xl overflow-hidden transition-all duration-300 ${focusedInput === 'password' ? 'border-blue-700 bg-white shadow-lg shadow-blue-500/5' : 'border-slate-100'}`}> {/* Reduzido rounded-2xl para xl */}
              <div className={`w-10 h-12 flex items-center justify-center border-r transition-colors ${focusedInput === 'password' ? 'text-blue-700 border-slate-100' : 'text-slate-300 border-slate-50'}`}> {/* Reduzido w-12 h-14 para w-10 h-12 */}
                <Lock size={16} /> {/* Reduzido size={18} para size={16} */}
              </div>
              <input 
                id="login-password"
                type={showPassword ? "text" : "password"} required 
                className="flex-1 px-3 py-2.5 bg-transparent outline-none text-xs md:text-sm font-semibold text-[#040a1d] placeholder-slate-400 tracking-widest" {/* Reduzido px-4 py-3 para px-3 py-2.5, text-sm/base para xs/sm */}
                placeholder="••••••••"
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="w-10 h-12 flex items-center justify-center text-slate-300 hover:text-blue-700 transition-colors" {/* Reduzido w-12 h-14 para w-10 h-12 */}
                aria-label={showPassword ? t('common.hidePassword') : t('common.showPassword')}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />} {/* Reduzido size={18} para size={16} */}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-800 text-xs font-bold rounded-lg border border-red-200 flex items-center gap-2 animate-shake" role="alert"> {/* Reduzido p-4 para p-3, text-sm/base para xs, rounded-xl para lg, gap-3 para gap-2 */}
            <AlertOctagon size={14} className="text-red-700 shrink-0" /> {/* Reduzido size={16} para size={14} */}
            <span className="leading-tight">{error}</span>
          </div>
        )}

        <button 
          type="submit" disabled={isLoading}
          className="w-full bg-[#040a1d] hover:bg-slate-800 text-white font-black h-10 rounded-xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-900/10 active:scale-[0.98] disabled:opacity-70 group overflow-hidden relative" {/* Reduzido h-14 para h-10, rounded-2xl para xl, shadow-2xl para xl, gap-3 para gap-2 */}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : ( 
            // Fix: Corrected JSX comment placement. Comments within JSX elements must be wrapped in curly braces.
            <> {/* Reduzido size={20} para size={16} */}
              <span className="uppercase tracking-[3px] text-[9px] md:text-[10px]">{t('login.authenticate')}</span> {/* Reduzido tracking-[4px] para 3px, text-[8px]/xs para 9px/10px */}
              <ArrowRight size={16} className="text-blue-400 group-hover:translate-x-1 transition-transform" /> {/* Reduzido size={18} para size={16}, translate-x-1.5 para 1 */}
            </>
          )}
        </button>
      </form>
    </div>
  );
};
