
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Lock, X, Check, ShieldAlert, Loader2, Eye, EyeOff } from 'lucide-react'; // Importado Eye e EyeOff
import { useChangePassword } from './useChangePassword.ts';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Modal de Alteração de Senha (Apresentação)
 * (S) Responsabilidade: Renderizar a interface de usuário e delegar lógica ao hook.
 */
export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { 
    formData, 
    updateField, 
    isLoading, 
    error, 
    handleSubmit 
  } = useChangePassword(onClose);

  // Estados locais para a visibilidade das senhas
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validação em tempo real para campos de nova senha
  const newPasswordMismatch = formData.newPassword !== '' && formData.newPassword !== formData.confirmPassword;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 flex flex-col">
        
        <header className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-[var(--color-detail-blue)] rounded-xl shadow-sm">
                <Lock size={20} />
            </div>
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">
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

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="space-y-4">
                <PasswordField 
                    label={t('changePassword.current')}
                    value={formData.currentPassword}
                    onChange={(v) => updateField('currentPassword', v)}
                    id="current-password"
                    autoFocus
                    showPassword={showCurrentPassword}
                    onToggleShowPassword={() => setShowCurrentPassword(prev => !prev)}
                />

                <div className="h-px bg-slate-100 my-2" />

                <PasswordField 
                    label={t('changePassword.new')}
                    value={formData.newPassword}
                    onChange={(v) => updateField('newPassword', v)}
                    id="new-password"
                    placeholder={t('changePassword.minCharacters', {count: 6})}
                    showPassword={showNewPassword}
                    onToggleShowPassword={() => setShowNewPassword(prev => !prev)}
                />

                <PasswordField 
                    label={t('changePassword.confirm')}
                    value={formData.confirmPassword}
                    onChange={(v) => updateField('confirmPassword', v)}
                    id="confirm-password"
                    hasError={newPasswordMismatch}
                    showPassword={showConfirmPassword}
                    onToggleShowPassword={() => setShowConfirmPassword(prev => !prev)}
                    errorMessage={newPasswordMismatch ? t('changePassword.matchError') : undefined}
                />
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-600 text-[11px] font-bold rounded-xl border border-red-100 flex items-center gap-3 animate-in slide-in-from-top-2" role="alert">
                    <ShieldAlert size={16} className="shrink-0" />
                    {error}
                </div>
            )}

            <footer className="pt-4 flex flex-col sm:flex-row justify-end gap-3">
                <button 
                    type="button" 
                    onClick={onClose} 
                    className="order-2 sm:order-1 px-6 py-3 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 rounded-xl transition-colors"
                >
                    {t('common.cancel')}
                </button>
                <button 
                    type="submit" 
                    disabled={isLoading || newPasswordMismatch}
                    className="order-1 sm:order-2 px-8 py-3 bg-[var(--color-primary-dark-blue)] text-white font-black text-[10px] uppercase tracking-[3px] rounded-xl hover:bg-blue-900 transition-all shadow-lg shadow-[var(--color-primary-dark-blue)]/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <Loader2 size={16} className="animate-spin" />
                    ) : (
                        <><Check size={16} /> {t('changePassword.submit')}</>
                    )}
                </button>
            </footer>
        </form>
      </div>
    </div>
  );
};

/* --- Sub-componente Interno (Pure UI) --- */

interface PasswordFieldProps {
    label: string;
    value: string;
    onChange: (val: string) => void;
    id: string;
    placeholder?: string;
    autoFocus?: boolean;
    hasError?: boolean;
    showPassword?: boolean; // Nova prop
    onToggleShowPassword?: () => void; // Nova prop
    errorMessage?: string; // Nova prop para mensagens de erro específicas do campo
}

const PasswordField: React.FC<PasswordFieldProps> = ({ label, value, onChange, id, placeholder, autoFocus, hasError, showPassword, onToggleShowPassword, errorMessage }) => {
    const { t } = useTranslation();
    return (
        <div className="space-y-2">
            <label htmlFor={id} className={`text-[10px] font-black uppercase tracking-[2px] ml-1 transition-colors ${hasError ? 'text-red-500' : 'text-slate-400'}`}>
                {label}
            </label>
            <div className={`flex items-center bg-slate-50 border-[1.5px] rounded-2xl overflow-hidden transition-all duration-300
                ${hasError 
                    ? 'border-red-200 bg-red-50/30 focus-within:border-red-500 ring-4 ring-red-500/10' 
                    : 'border-slate-100 focus-within:border-[var(--color-detail-blue)] focus-within:bg-white ring-4 ring-[var(--color-detail-blue)]/0 focus-within:ring-[var(--color-detail-blue)]/10'
                }
            `}>
                <input 
                    id={id}
                    type={showPassword ? "text" : "password"}
                    autoFocus={autoFocus}
                    placeholder={placeholder || '••••••••'}
                    className="flex-1 px-5 py-3.5 bg-transparent outline-none text-sm font-medium text-slate-900 placeholder-slate-400"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    required
                />
                {onToggleShowPassword && (
                    <button 
                        type="button" 
                        onClick={onToggleShowPassword} 
                        className="w-12 h-14 flex items-center justify-center text-slate-300 hover:text-[var(--color-detail-blue)] transition-colors"
                        aria-label={showPassword ? t('common.hidePassword') : t('common.showPassword')}
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                )}
            </div>
            {errorMessage && hasError && (
                <p className="text-[10px] font-bold text-red-500 ml-1 mt-1 animate-in fade-in slide-in-from-top-1">
                    {errorMessage}
                </p>
            )}
        </div>
    );
};
