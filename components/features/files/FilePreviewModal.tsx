
import React, { useState, useEffect, useCallback } from 'react';
import { X, Download, ExternalLink, Loader2, FileText, AlertCircle, LucideIcon } from 'lucide-react';
import { FileNode } from '../../../types/index.ts';
import { fileService } from '../../../lib/services/index.ts';
import { useAuth } from '../../../context/authContext.tsx';
import { useTranslation } from 'react-i18next';

interface FilePreviewModalProps {
  file: FileNode | null;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Modal de Visualização de Documentos (Composite View)
 * Gerencia a recuperação de tokens de acesso e renderização segura de frames.
 */
export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ file, isOpen, onClose }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUrl = useCallback(async () => {
    if (!file || !user) return;
    setLoading(true);
    setError(null);
    try {
      const signedUrl = await fileService.getFileSignedUrl(user, file.id);
      setUrl(signedUrl);
    } catch (err: unknown) {
      console.error("[FilePreviewModal] Sync Failure:", err);
      setError(t('files.errorLoadingDocument'));
    } finally {
      setLoading(false);
    }
  }, [file, user, t]);

  useEffect(() => {
    if (isOpen && file && user) {
      loadUrl();
    } else {
      setUrl(null);
      setError(null);
    }
  }, [isOpen, file, user, loadUrl]);

  if (!isOpen) return null;

  const isImage = file?.name.match(/\.(jpg|jpeg|png|gif|webp)$/i);

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4 md:p-8 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full h-full flex flex-col overflow-hidden border border-white/20">
        
        {/* Header Section */}
        <header className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shrink-0 shadow-sm">
              <FileText size={20} />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-slate-800 truncate text-sm md:text-base leading-tight">
                {file?.name}
              </h3>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[2px] mt-0.5">
                {file?.size} • {t('files.authenticatedView')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {url && (
              <a 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                title={t('files.openInNewTab')}
              >
                <ExternalLink size={20} />
              </a>
            )}
            <button 
              onClick={onClose}
              className="p-2.5 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition-all"
              aria-label={t('common.close')}
            >
              <X size={24} />
            </button>
          </div>
        </header>

        {/* Dynamic Content Container */}
        <div className="flex-1 bg-slate-100 relative overflow-hidden flex items-center justify-center">
          {loading && <LoadingOverlay label={t('files.authenticatingAccess')} />}

          {error && (
            <ErrorOverlay 
              message={error} 
              subtext={t('files.permissionOrExpiredLink')} 
              onRetry={loadUrl} 
              retryLabel={t('maintenance.retry')}
            />
          )}

          {!loading && !error && url && (
            isImage ? (
              <img 
                src={url} 
                alt={file?.name} 
                className="max-w-full max-h-full object-contain shadow-2xl animate-in zoom-in-95 duration-500" 
              />
            ) : (
              <iframe 
                src={`${url}#toolbar=0&navpanes=0`} 
                className="w-full h-full border-none bg-white animate-in fade-in duration-700"
                title={file?.name}
              ></iframe>
            )
          )}
        </div>

        {/* Security Footer */}
        <footer className="px-6 py-3 border-t border-slate-100 bg-white flex justify-between items-center text-[9px] text-slate-400 font-black uppercase tracking-[3px]">
           <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {t('menu.brand')} INDUSTRIAL SECURE LINK
           </div>
           <span>SSL 256-BIT ENCRYPTED</span>
        </footer>
      </div>
    </div>
  );
};

/* --- Sub-componentes Puros (Clean Code) --- */

const LoadingOverlay: React.FC<{ label: string }> = ({ label }) => (
  <div className="flex flex-col items-center gap-3 text-slate-400 animate-in fade-in">
    <Loader2 size={40} className="animate-spin text-blue-500" />
    <p className="text-xs font-black uppercase tracking-[4px]">{label}</p>
  </div>
);

interface ErrorOverlayProps {
  message: string;
  subtext: string;
  onRetry: () => void;
  retryLabel: string;
}

const ErrorOverlay: React.FC<ErrorOverlayProps> = ({ message, subtext, onRetry, retryLabel }) => (
  <div className="flex flex-col items-center gap-4 text-center p-8 max-w-sm animate-in zoom-in-95">
    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center shadow-inner">
      <AlertCircle size={32} />
    </div>
    <div>
      <p className="font-black text-slate-800 uppercase tracking-tight">{message}</p>
      <p className="text-xs text-slate-500 mt-2 font-medium leading-relaxed">{subtext}</p>
    </div>
    <button 
      onClick={onRetry}
      className="mt-2 px-8 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-lg"
    >
      {retryLabel}
    </button>
  </div>
);
