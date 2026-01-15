
import React, { useState, useCallback, useRef } from 'react';
import { X, UploadCloud, FileText, Loader2, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface UploadFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File, fileName: string) => Promise<void>;
  isUploading: boolean;
  currentFolderId: string | null;
}

export const UploadFileModal: React.FC<UploadFileModalProps> = ({ isOpen, onClose, onUpload, isUploading }) => {
  const { t } = useTranslation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
      setError(null);
    } else {
      setSelectedFile(null);
      setFileName('');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError(t('files.upload.noFileSelected'));
      return;
    }
    if (!fileName.trim()) {
      setError(t('files.upload.fileNameRequired'));
      return;
    }
    await onUpload(selectedFile, fileName);
    setSelectedFile(null);
    setFileName('');
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Limpa o input file
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 flex flex-col">
        <header className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 text-[var(--color-detail-blue)] rounded-xl shadow-sm"><UploadCloud size={22} /></div>
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">{t('files.upload.title')}</h3>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-slate-200 rounded-full transition-colors text-slate-400"><X size={24} /></button>
        </header>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">{t('files.upload.selectFile')}</label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                id="file-upload-input"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-blue-50 text-[var(--color-detail-blue)] rounded-xl border border-blue-100 hover:bg-blue-100 transition-all font-bold text-sm"
              >
                <FileText size={18} /> {selectedFile ? selectedFile.name : t('files.upload.chooseFile')}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <label htmlFor="file-name" className="text-xs font-bold text-slate-600 uppercase tracking-wide">{t('files.upload.fileName')}</label>
            <input
              id="file-name"
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder={t('files.upload.fileNamePlaceholder')}
              className="w-full px-4 py-2.5 rounded-lg outline-none font-semibold text-slate-900 bg-slate-50 border border-slate-300 focus:border-[var(--color-detail-blue)] focus:bg-white transition-all"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-[11px] font-bold rounded-xl border border-red-100 flex items-center gap-2">
              <AlertCircle size={14} /> {error}
            </div>
          )}
          
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors">{t('common.cancel')}</button>
            <button type="submit" disabled={isUploading || !selectedFile || !fileName.trim()} className="px-8 py-2 bg-[var(--color-primary-dark-blue)] text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg flex items-center gap-2">
              {isUploading && <Loader2 size={16} className="animate-spin" />}
              {t('files.upload.uploadButton')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
