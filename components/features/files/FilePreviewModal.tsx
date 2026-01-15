
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, Download, ExternalLink, Loader2, FileText, AlertCircle, LucideIcon, ChevronLeft, ChevronRight, Info, Calendar, User, HardDrive, Maximize2, Minimize2 } from 'lucide-react';
import { FileNode, FileType } from '../../../types/index.ts';
import { fileService } from '../../../lib/services/index.ts';
import { useAuth } from '../../../context/authContext.tsx';
import { useTranslation } from 'react-i18next';
import { FileStatusBadge } from './components/FileStatusBadge.tsx';
import { QualityStatus } from '../../../types/metallurgy.ts';

interface FilePreviewModalProps {
  initialFile: FileNode | null; // O arquivo a ser exibido inicialmente
  allFiles: FileNode[]; // Todos os arquivos na pasta atual para navegação
  isOpen: boolean;
  onClose: () => void;
  onDownloadFile: (file: FileNode) => void; // Ação de download delegada
}

/**
 * Modal de Visualização de Documentos (Immersive Quick Look)
 * Gerencia a recuperação de tokens de acesso, renderização segura de frames e navegação imersiva.
 */
export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ initialFile, allFiles, isOpen, onClose, onDownloadFile }) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [currentFileInPreview, setCurrentFileInPreview] = useState<FileNode | null>(initialFile);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);

  // Efeito para sincronizar o arquivo inicial e a lista
  useEffect(() => {
    if (isOpen && initialFile) {
      const idx = allFiles.findIndex(f => f.id === initialFile.id);
      if (idx !== -1) {
        setCurrentIndex(idx);
        setCurrentFileInPreview(allFiles[idx]);
      } else {
        // Fallback: se o initialFile não estiver na lista (ex: lista vazia ou filtro aplicado)
        setCurrentFileInPreview(initialFile);
        setCurrentIndex(-1); // Indica que não está na lista para navegação
      }
    } else {
      // Resetar estado quando o modal é fechado
      setCurrentFileInPreview(null);
      setCurrentIndex(-1);
      setUrl(null);
      setError(null);
    }
  }, [isOpen, initialFile, allFiles]);

  // Efeito para carregar a URL assinada quando o arquivo de preview muda
  useEffect(() => {
    if (currentFileInPreview && user) {
      setLoading(true);
      setError(null);
      fileService.getFileSignedUrl(user, currentFileInPreview.id)
        .then(signedUrl => setUrl(signedUrl))
        .catch(err => {
          console.error("[FilePreviewModal] Sync Failure:", err);
          setError(t('files.errorLoadingDocument'));
        })
        .finally(() => setLoading(false));
    } else {
      setUrl(null);
      setError(null);
    }
  }, [currentFileInPreview, user, t]);

  // Lógica de navegação entre arquivos
  const navigateFile = useCallback((direction: 'next' | 'prev') => {
    if (allFiles.length === 0 || currentIndex === -1) return; // Não navega se não há arquivos ou arquivo atual não está na lista

    let newIndex = currentIndex;
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % allFiles.length;
    } else { // prev
      newIndex = (currentIndex - 1 + allFiles.length) % allFiles.length;
    }
    setCurrentIndex(newIndex);
    setCurrentFileInPreview(allFiles[newIndex]);
  }, [allFiles, currentIndex]);

  // Manipulador de eventos de teclado (Escape, ArrowLeft, ArrowRight)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowRight') {
        navigateFile('next');
      } else if (e.key === 'ArrowLeft') {
        navigateFile('prev');
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, navigateFile, onClose]);

  if (!isOpen) return null;
  if (!currentFileInPreview) return null; // Não renderiza se não há arquivo para preview

  const isImage = currentFileInPreview.name.match(/\.(jpg|jpeg|png|gif|webp)$/i);
  const canNavigate = allFiles.length > 1 && currentIndex !== -1;

  return (
    <div 
      className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/80 backdrop-blur-lg p-4 md:p-8 animate-in fade-in duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="file-preview-title"
    >
      <div className="flex flex-row w-full h-full max-w-[1500px] max-h-[95vh] bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in-95 duration-300">
        
        {/* Main Content Area (Viewer) */}
        <section className="flex-1 bg-black relative overflow-hidden flex items-center justify-center">
          {/* Floating Buttons */}
          <div className="absolute top-4 right-4 flex gap-3 z-10">
            <button
              onClick={() => onDownloadFile(currentFileInPreview)}
              className="p-3 bg-white/20 backdrop-blur-md text-white rounded-xl shadow-md hover:bg-white/30 transition-all active:scale-95 border border-white/30"
              title={t('files.downloadButton')}
              aria-label={t('files.downloadButton')}
            >
              <Download size={20} />
            </button>
            <button
              onClick={() => setShowSidebar(prev => !prev)}
              className="p-3 bg-white/20 backdrop-blur-md text-white rounded-xl shadow-md hover:bg-white/30 transition-all active:scale-95 border border-white/30"
              title={showSidebar ? "Minimizar Sidebar" : "Maximizar Sidebar"}
              aria-label={showSidebar ? "Minimizar Sidebar" : "Maximizar Sidebar"}
            >
              {showSidebar ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
            <button
              onClick={onClose}
              className="p-3 bg-white/20 backdrop-blur-md text-white rounded-xl shadow-md hover:bg-white/30 transition-all active:scale-95 border border-white/30"
              aria-label={t('common.close')}
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Arrows */}
          {canNavigate && (
            <>
              <button
                onClick={() => navigateFile('prev')}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-md text-white rounded-full shadow-md hover:bg-white/30 transition-all active:scale-95 z-10"
                aria-label="Arquivo Anterior"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={() => navigateFile('next')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-md text-white rounded-full shadow-md hover:bg-white/30 transition-all active:scale-95 z-10"
                aria-label="Próximo Arquivo"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          {/* Viewer Content */}
          {loading && <LoadingOverlay label={t('files.authenticatingAccess')} />}

          {error && (
            <ErrorOverlay 
              message={error} 
              subtext={t('files.permissionOrExpiredLink')} 
              onRetry={() => {}} // Retry function is tied to currentFileInPreview effect
              retryLabel={t('maintenance.retry')}
            />
          )}

          {!loading && !error && url && (
            isImage ? (
              <img 
                src={url} 
                alt={currentFileInPreview.name} 
                className="max-w-full max-h-full object-contain shadow-2xl animate-in zoom-in-95 duration-500" 
              />
            ) : (
              <iframe 
                src={`${url}#toolbar=0&navpanes=0`} 
                className="w-full h-full border-none bg-white animate-in fade-in duration-700"
                title={currentFileInPreview.name}
              ></iframe>
            )
          )}
        </section>

        {/* Metadata Sidebar */}
        {showSidebar && (
          <MetadataSidebar file={currentFileInPreview} t={t} />
        )}
      </div>
    </div>
  );
};

/* --- Sub-componentes Puros (Clean Code) --- */

const LoadingOverlay: React.FC<{ label: string }> = ({ label }) => (
  <div className="flex flex-col items-center gap-3 text-white animate-in fade-in">
    <Loader2 size={40} className="animate-spin text-[var(--color-detail-blue)]" />
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
      <p className="font-black text-white uppercase tracking-tight">{message}</p>
      <p className="text-xs text-slate-300 mt-2 font-medium leading-relaxed">{subtext}</p>
    </div>
    {/* Removed retry button from here, as the URL loading is handled by effect. */}
    {/* <button 
      onClick={onRetry}
      className="mt-2 px-8 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-lg"
    >
      {retryLabel}
    </button> */}
  </div>
);

const MetadataSidebar: React.FC<{ file: FileNode; t: any }> = ({ file, t }) => (
  <aside className="w-80 shrink-0 bg-white/10 backdrop-blur-xl border-l border-white/20 p-6 space-y-6 text-white text-sm">
    <h3 id="file-preview-title" className="text-xl font-bold mb-4 tracking-tight leading-none text-[var(--color-detail-blue)]">{file.name}</h3>

    <MetadataItem icon={FileText} label="Tipo" value={file.mimeType || 'N/A'} />
    <MetadataItem icon={HardDrive} label="Tamanho" value={file.size || 'N/A'} />
    <MetadataItem icon={Calendar} label="Data de Upload" value={new Date(file.updatedAt).toLocaleDateString('pt-BR')} />
    
    <div className="pt-4 border-t border-white/10">
      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">{t('common.status')}</h4>
      <FileStatusBadge status={file.metadata?.status} />
    </div>

    {file.metadata?.status === QualityStatus.REJECTED && file.metadata?.rejectionReason && (
      <div className="p-3 bg-red-500/20 rounded-lg border border-red-400/30 text-red-100 text-xs italic">
        <strong className="block mb-1">Motivo da Recusa:</strong> {file.metadata.rejectionReason}
      </div>
    )}

    {file.metadata?.inspectedBy && (
      <div className="pt-4 border-t border-white/10">
        <MetadataItem icon={User} label="Analisado por" value={file.metadata.inspectedBy} />
      </div>
    )}
     {file.metadata?.inspectedAt && (
      <div className="border-t border-white/10 pt-4">
        <MetadataItem icon={Calendar} label="Data da Análise" value={new Date(file.metadata.inspectedAt).toLocaleDateString('pt-BR')} />
      </div>
    )}
  </aside>
);

const MetadataItem: React.FC<{ icon: LucideIcon; label: string; value: string }> = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3">
    <Icon size={16} className="text-[var(--color-detail-blue)] shrink-0" />
    <div className="flex-1">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-300">{label}</p>
      <p className="font-medium text-white break-words">{value}</p>
    </div>
  </div>
);
