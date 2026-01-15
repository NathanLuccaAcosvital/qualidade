
import React, { useState } from 'react';
import { X, FolderPlus, Loader2, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (folderName: string) => Promise<void>;
  isCreating: boolean;
}

export const CreateFolderModal: React.FC<CreateFolderModalProps> = ({ isOpen, onClose, onCreate, isCreating }) => {
  const { t } = useTranslation();
  const [folderName, setFolderName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) {
      setError(t('files.createFolder.nameRequired'));
      return;
    }
    await onCreate(folderName);
    setFolderName('');
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 flex flex-col">
        <header className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 text-[var(--color-detail-blue)] rounded-xl shadow-sm"><FolderPlus size={22} /></div>
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">{t('files.createFolder.title')}</h3>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-slate-200 rounded-full transition-colors text-slate-400"><X size={24} /></button>
        </header>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <label htmlFor="folder-name" className="text-xs font-bold text-slate-600 uppercase tracking-wide">{t('files.createFolder.folderName')}</label>
            <input
              id="folder-name"
              type="text"
              value={folderName}
              onChange={(e) => { setFolderName(e.target.value); setError(null); }}
              placeholder={t('files.createFolder.folderNamePlaceholder')}
              className="w-full px-4 py-2.5 rounded-lg outline-none font-semibold text-slate-900 bg-slate-50 border border-slate-300 focus:border-[var(--color-detail-blue)] focus:bg-white transition-all"
              required
              autoFocus
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-[11px] font-bold rounded-xl border border-red-100 flex items-center gap-2">
              <AlertCircle size={14} /> {error}
            </div>
          )}
          
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors">{t('common.cancel')}</button>
            <button type="submit" disabled={isCreating || !folderName.trim()} className="px-8 py-2 bg-[var(--color-primary-dark-blue)] text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg flex items-center gap-2">
              {isCreating && <Loader2 size={16} className="animate-spin" />}
              {t('files.createFolder.createButton')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
