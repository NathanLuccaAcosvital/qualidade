
import React, { useState, useEffect } from 'react';
import { X, Download, Printer, ZoomIn, ZoomOut, FileText, Loader2, ExternalLink } from 'lucide-react';
import { FileNode, FileType } from '../../../types.ts';
import { useAuth } from '../../../context/authContext.tsx';
import { fileService } from '../../../lib/services/index.ts';
import { useTranslation } from 'react-i18next';

interface FilePreviewModalProps {
  file: FileNode | null;
  isOpen: boolean;
  onClose: () => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ file, isOpen, onClose }) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [isDownloading, setIsDownloading] = useState(false);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);

  useEffect(() => {
      if (isOpen && file && user) {
          const fetchUrl = async () => {
              setIsLoadingUrl(true);
              try {
                  const url = await fileService.getFileSignedUrl(user, file.id);
                  setSignedUrl(url);
              } catch (err) {
                  console.error("Erro ao obter URL assinada:", err);
              } finally {
                  setIsLoadingUrl(false);
              }
          };
          fetchUrl();
      } else if (!isOpen) {
          setSignedUrl(null);
      }
  }, [isOpen, file, user]);

  if (!isOpen || !file) return null;

  const handleDownload = async () => {
      if (!signedUrl) return;
      setIsDownloading(true);
      const link = document.createElement('a');
      link.href = signedUrl;
      link.download = file.name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsDownloading(false);
  };

  const renderContent = () => {
      if (isLoadingUrl) {
          return (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4" role="status">
                  <Loader2 size={48} className="animate-spin text-blue-500" aria-hidden="true" />
                  <p className="text-sm font-bold uppercase tracking-widest">{t('files.authenticatingAccess')}</p>
              </div>
          );
      }

      if (!signedUrl) {
          return (
              <div className="flex flex-col items-center justify-center h-full text-red-400 p-8 text-center" role="alert">
                  <X size={48} className="mb-4" aria-hidden="true" />
                  <p className="font-bold">{t('files.errorLoadingDocument')}</p>
                  <p className="text-sm mt-2">{t('files.permissionOrExpiredLink')}</p>
              </div>
          );
      }

      // PDF Viewer via iFrame (Browser Native)
      return (
          <div className="w-full h-full flex items-center justify-center bg-slate-800">
              <iframe 
                src={`${signedUrl}#toolbar=0&navpanes=0`} 
                className="w-full h-full border-none"
                title={file.name}
                aria-label={t('files.documentPreview', { fileName: file.name })}
              />
          </div>
      );
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-md flex flex-col animate-in fade-in duration-200" role="dialog" aria-modal="true" aria-labelledby="file-preview-title">
      
      {/* TOOLBAR */}
      <div className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 shrink-0 shadow-lg z-20">
          <div className="flex items-center gap-4 text-white overflow-hidden flex-1">
              <div className="p-2 bg-slate-800 rounded-lg shrink-0">
                  <FileText className="text-blue-400" size={20} aria-hidden="true" />
              </div>
              <div className="flex flex-col min-w-0">
                  <span id="file-preview-title" className="font-bold text-sm truncate">{file.name}</span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest">{t('files.authenticatedView')}</span>
              </div>
          </div>

          <div className="flex items-center gap-3">
              <button 
                onClick={handleDownload} 
                disabled={isDownloading || !signedUrl}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                aria-label={t('common.download')}
              >
                  {isDownloading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Download size={16} aria-hidden="true" />}
                  <span>{t('common.download')}</span>
              </button>
              
              <button 
                onClick={() => window.open(signedUrl!, '_blank')}
                disabled={!signedUrl}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                title={t('files.openInNewTab')}
                aria-label={t('files.openInNewTab')}
              >
                  <ExternalLink size={20} aria-hidden="true" />
              </button>

              <div className="w-px h-6 bg-slate-700 mx-2" aria-hidden="true" />
              
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-all" aria-label={t('common.close')}>
                  <X size={24} aria-hidden="true" />
              </button>
          </div>
      </div>

      {/* PREVIEW AREA */}
      <div className="flex-1 bg-slate-900 overflow-hidden relative">
          {renderContent()}
      </div>

    </div>
  );
};