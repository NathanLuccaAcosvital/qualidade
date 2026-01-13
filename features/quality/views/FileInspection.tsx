import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '../../../components/layout/MainLayout.tsx'; // Import Layout
import { FilePreviewModal } from '../../../components/features/files/FilePreviewModal.tsx';
import { InspectionSidebar } from '../components/InspectionSidebar.tsx';
import { useFileInspection } from '../hooks/useFileInspection.ts';
import { useTranslation } from 'react-i18next';
// Fix: Added Loader2 import from lucide-react
import { Loader2, ArrowLeft } from 'lucide-react';

export const FileInspection: React.FC = () => {
  const { t } = useTranslation();
  const { fileId } = useParams<{ fileId: string }>();

  const {
    inspectorFile,
    loadingFile,
    isProcessing,
    previewFile,
    setPreviewFile,
    mainPreviewUrl, // Fix: Destructure mainPreviewUrl from hook
    handleInspectAction,
    handleDownload,
    handleSetStatusToPending,
    handleBackToClientFiles,
  } = useFileInspection();

  const [rejectionReason, setRejectionReason] = useState(''); // Local state for rejection reason

  const onInspectActionWithReason = async (action: 'APPROVE' | 'REJECT') => {
    await handleInspectAction(action, rejectionReason);
    setRejectionReason(''); // Clear reason after action
  };

  if (loadingFile) {
    return (
      <Layout title={t('quality.overview')}> {/* Generic title while loading */}
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4 h-full" role="status">
          <Loader2 size={40} className="animate-spin text-blue-500" aria-hidden="true" />
          <p className="font-bold text-xs uppercase tracking-widest">{t('common.loading')}</p>
        </div>
      </Layout>
    );
  }

  if (!inspectorFile) {
    return (
      <Layout title={t('quality.overview')}>
        <div className="flex-1 flex flex-col items-center justify-center text-red-400 gap-4 h-full" role="alert">
          <p className="font-bold">{t('files.errorLoadingDocument')}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={inspectorFile.name}>
      <FilePreviewModal file={previewFile} isOpen={!!previewFile} onClose={() => setPreviewFile(null)} />

      <div className="h-[calc(100vh-190px)] relative flex flex-col">
        {isProcessing && (
          <div className="fixed top-4 right-1/2 translate-x-1/2 z-[110] bg-slate-900 text-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 text-xs font-bold animate-bounce">
            <Loader2 size={14} className="animate-spin" /> {t('common.updatingDatabase')}
          </div>
        )}

        <div className="flex items-center gap-4 mb-4 pb-4 border-b border-slate-200 shrink-0">
          <button onClick={handleBackToClientFiles} className="p-2.5 bg-white border border-slate-200 rounded-xl hover:text-blue-600 shadow-sm transition-all" aria-label={t('common.back')}><ArrowLeft size={20} aria-hidden="true" /></button>
          <h2 className="text-xl font-bold text-slate-800 leading-none">{inspectorFile.name}</h2>
        </div>

        <div className="flex-1 flex gap-4 overflow-hidden">
          <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="flex-1 bg-slate-900 overflow-hidden relative">
              {/* Fix: Use mainPreviewUrl from hook for iframe src, conditionally render */}
              {mainPreviewUrl ? (
                <iframe
                  src={`${mainPreviewUrl}#toolbar=0&navpanes=0`}
                  className="w-full h-full border-none"
                  title={inspectorFile.name}
                  aria-label={t('files.documentPreview', { fileName: inspectorFile.name })}
                  loading="lazy"
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4" role="status">
                  <Loader2 size={40} className="animate-spin text-blue-500" aria-hidden="true" />
                  <p className="font-bold text-xs uppercase tracking-widest">{t('common.loading')}</p>
                </div>
              )}
            </div>
          </div>

          <InspectionSidebar
            inspectorFile={inspectorFile}
            onInspectAction={onInspectActionWithReason}
            onDownload={handleDownload}
            onSetPreviewFile={setPreviewFile}
            onSetInspectorFile={() => handleBackToClientFiles()} // Closing sidebar means going back from inspection
            onSetStatusToPending={handleSetStatusToPending}
            isProcessing={isProcessing}
            rejectionReason={rejectionReason}
            setRejectionReason={setRejectionReason}
          />
        </div>
      </div>
    </Layout>
  );
};