
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Lock, X, Check, ShieldAlert, Loader2, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useChangePassword } from './useChangePassword.ts';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { 
    formData, 
    updateField, 
    isLoading, 
    error, 
    handleSubmit,
    requirements,
    isValid
  } = useChangePassword(onClose);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 flex flex-col">
        
        <header className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-[#b23c0e] rounded-2xl shadow-inner border border-blue-100/50">
                <Lock size={22} />
            </div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                {t('changePassword.title')}
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-full transition-all"
            aria-label={t('common.close')}
          >
            <X size={20} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto max-h-[75vh] custom-scrollbar">
            <div className="space-y-6">
                <PasswordField 
                    label={t('changePassword.current')}
                    value={formData.currentPassword}
                    onChange={(v) => updateField('currentPassword', v)}
                    id="current-password"
                    showPassword={showCurrentPassword}
                    onToggleShowPassword={() => setShowCurrentPassword(prev => !prev)}
                />

                <div className="space-y-4">
                  <PasswordField 
                      label={t('changePassword.new')}
                      value={formData.newPassword}
                      onChange={(v) => updateField('newPassword', v)}
                      id="new-password"
                      placeholder="••••••••"
                      showPassword={showNewPassword}
                      onToggleShowPassword={() => setShowNewPassword(prev => !prev)}
                  />

                  {/* Checklist de Requisitos - Contraste Elevado */}
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">Requisitos de Segurança</p>
                    <RequirementItem met={requirements.length} text={t('changePassword.requirements.length')} />
                    <RequirementItem met={requirements.upper} text={t('changePassword.requirements.upper')} />
                    <RequirementItem met={requirements.number} text={t('changePassword.requirements.number')} />
                    <RequirementItem met={requirements.special} text={t('changePassword.requirements.special')} />
                  </div>
                </div>

                <PasswordField 
                    label={t('changePassword.confirm')}
                    value={formData.confirmPassword}
                    onChange={(v) => updateField('confirmPassword', v)}
                    id="confirm-password"
                    showPassword={showConfirmPassword}
                    onToggleShowPassword={() => setShowConfirmPassword(prev => !prev)}
                    hasError={formData.confirmPassword !== '' && !requirements.match}
                    errorMessage={!requirements.match && formData.confirmPassword !== '' ? t('changePassword.matchError') : undefined}
                />
            </div>

            {error && (
                <div className="p-4 bg-red-600 text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-3 animate-in shake">
                    <ShieldAlert size={18} className="shrink-0" />
                    {error}
                </div>
            )}

            <footer className="pt-4 flex flex-col sm:flex-row justify-end gap-3">
                <button 
                    type="button" 
                    onClick={onClose} 
                    className="order-2 sm:order-1 px-6 py-3.5 text-slate-700 font-bold text-xs uppercase tracking-widest hover:bg-slate-100 rounded-xl transition-colors"
                >
                    {t('common.cancel')}
                </button>
                <button 
                    type="submit" 
                    disabled={isLoading || !isValid}
                    className="order-1 sm:order-2 px-10 py-3.5 bg-[#b23c0e] text-white font-bold text-xs uppercase tracking-[2px] rounded-xl hover:bg-[#8a2f0b] transition-all shadow-xl shadow-[#b23c0e]/30 active:scale-95 disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-3"
                >
                    {isLoading ? (
                        <Loader2 size={18} className="animate-spin" />
                    ) : (
                        <><ShieldCheck size={18} /> {t('changePassword.submit')}</>
                    )}
                </button>
            </footer>
        </form>
      </div>
    </div>
  );
};

const RequirementItem = ({ met, text }: { met: boolean; text: string }) => (
  <div className="flex items-center gap-3 transition-all">
    <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all ${met ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-500/20' : 'bg-white border-slate-300 text-slate-300'}`}>
      {met ? <Check size={12} strokeWidth={4} /> : <div className="w-1.5 h-1.5 bg-slate-300 rounded-full" />}
    </div>
    <span className={`text-[11px] font-semibold tracking-tight transition-colors ${met ? 'text-emerald-700' : 'text-slate-600'}`}>
      {text}
    </span>
  </div>
);

interface PasswordFieldProps {
    label: string;
    value: string;
    onChange: (val: string) => void;
    id: string;
    placeholder?: string;
    hasError?: boolean;
    showPassword?: boolean;
    onToggleShowPassword?: () => void;
    errorMessage?: string;
}

const PasswordField: React.FC<PasswordFieldProps> = ({ label, value, onChange, id, placeholder, hasError, showPassword, onToggleShowPassword, errorMessage }) => {
    return (
        <div className="group space-y-2.5">
            <label htmlFor={id} className={`text-[11px] font-bold uppercase tracking-[1.5px] ml-1 transition-colors ${hasError ? 'text-red-600' : 'text-slate-700 group-focus-within:text-[#b23c0e]'}`}>
                {label}
            </label>
            <div className={`flex items-center bg-slate-50 border-2 rounded-2xl overflow-hidden transition-all duration-300
                ${hasError 
                    ? 'border-red-400 bg-red-50 ring-4 ring-red-500/10' 
                    : 'border-slate-200 focus-within:border-[#b23c0e] focus-within:bg-white ring-4 ring-[#b23c0e]/10 shadow-sm'
                }
            `}>
                <input 
                    id={id}
                    type={showPassword ? "text" : "password"}
                    placeholder={placeholder || '••••••••'}
                    className="flex-1 px-5 py-4 bg-transparent outline-none text-sm font-semibold text-slate-900 placeholder-slate-400"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    required
                />
                {onToggleShowPassword && (
                    <button 
                        type="button" 
                        onClick={onToggleShowPassword} 
                        className="w-14 h-14 flex items-center justify-center text-slate-500 hover:text-[#b23c0e] transition-colors"
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                )}
            </div>
            {errorMessage && hasError && (
                <p className="text-[11px] font-bold text-red-600 ml-1 mt-1 animate-in slide-in-from-top-1">
                    {errorMessage}
                </p>
            )}
        </div>
    );
};
