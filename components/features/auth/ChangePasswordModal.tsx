import React, { useState } from 'react';
import { X, Lock, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../context/authContext.tsx';
// Fix: Import from services/index.ts to use the correctly typed and initialized service instances
import { userService } from '../../../lib/services/index.ts';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user) return;
      setError('');

      if (newPassword !== confirmPassword) {
          setError(t('changePassword.matchError'));
          return;
      }

      setLoading(true);
      try {
          await userService.changePassword(user.id, currentPassword, newPassword);
          alert(t('changePassword.success'));
          onClose();
          // Reset form
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
      } catch (err: any) {
          setError(err.message || 'Erro ao alterar senha.');
      } finally {
          setLoading(false);
      }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-2">
            <Lock className="text-blue-600" size={20} />
            <h2 className="text-lg font-bold text-slate-800">{t('changePassword.title')}</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-all">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">{t('changePassword.current')}</label>
                <input 
                    type="password"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    required
                />
            </div>
            <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">{t('changePassword.new')}</label>
                <input 
                    type="password"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                />
            </div>
            <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">{t('changePassword.confirm')}</label>
                <input 
                    type="password"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                />
            </div>

            {error && (
                <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100 font-medium">
                    {error}
                </div>
            )}

            <div className="pt-2 flex justify-end gap-3">
                <button 
                    type="button" 
                    onClick={onClose} 
                    className="px-4 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors"
                >
                    {t('common.cancel')}
                </button>
                <button 
                    type="submit" 
                    disabled={loading}
                    className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20 disabled:opacity-70 flex items-center gap-2"
                >
                    {loading ? t('common.loading') : <>{t('changePassword.submit')} <Check size={16}/></>}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};