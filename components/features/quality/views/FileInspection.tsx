
import React from 'react';
import { Layout } from '../../../layout/MainLayout.tsx';
import { FilePreviewModal } from '../../files/FilePreviewModal.tsx';
import { InspectionSidebar } from '../components/InspectionSidebar.tsx';
import { ProcessingOverlay, QualityLoadingState } from '../components/ViewStates.tsx';
import { useFileInspection } from '../hooks/useFileInspection.ts';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { QualityStatus } from '../../../../types/metallurgy.ts';

/**
 * FileInspection (Orchestrator View)
 */
export const FileInspection: React.FC = () => {
  const { t } = useTranslation();
  const {
    inspectorFile, loadingFile, isProcessing, previewFile, setPreviewFile,
    mainPreviewUrl, handleInspectAction, handleDownload, handleBackToClientFiles,
  } = useFileInspection();

  const onInspectActionWithReason = async (status: QualityStatus, reason?: string) => {
    const action = status === QualityStatus.APPROVED ? 'APPROVE' : 'REJECT';
    await handleInspectAction(action, reason);
  };

  if (loadingFile) {
    return (
      <Layout title={t('quality.overview')}>
        <QualityLoadingState message="Autenticando Documento..." />
      </Layout>
    );
  }

  if (!inspectorFile) {
    return (
      <Layout title={t('quality.overview')}>
        <div className="flex-1 flex flex-col items-center justify-center text-red-400 gap-4 h-full" role="alert">
          <p className="font-bold uppercase tracking-widest">{t('files.errorLoadingDocument')}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={inspectorFile.name}>
      {/* Fix: Changed 'file' prop to 'initialFile' to match FilePreviewModalProps interface */}
      <FilePreviewModal 
        initialFile={previewFile} 
        allFiles={inspectorFile ? [inspectorFile] : []} // Assuming only the current inspectorFile is relevant for navigation here
        isOpen={!!previewFile} 
        onClose={() => setPreviewFile(null)}
        onDownloadFile={handleDownload}
      />

      <div className="h-[calc(100vh-190px)] relative flex flex-col">
        {isProcessing && <ProcessingOverlay message={t('common.updatingDatabase')} />}

        <header className="flex items-center gap-4 mb-4 pb-4 border-b border-slate-200 shrink-0">
          <button 
            onClick={handleBackToClientFiles} 
            className="p-2.5 bg-white border border-slate-200 rounded-xl hover:text-blue-600 shadow-sm transition-all active:scale-95" 
            aria-label={t('common.back')}
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-bold text-slate-800 leading-none">{inspectorFile.name}</h2>
        </header>

        <div className="flex-1 flex gap-4 overflow-hidden">
          <section className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="flex-1 bg-slate-900 overflow-hidden relative">
              {mainPreviewUrl ? (
                <iframe
                  src={`${mainPreviewUrl}#toolbar=0&navpanes=0`}
                  className="w-full h-full border-none"
                  title={inspectorFile.name}
                  loading="lazy"
                  allowFullScreen
                ></iframe>
              ) : (
                <QualityLoadingState message="Renderizando Ledger..." />
              )}
            </div>
          </section>

          <InspectionSidebar
            file={inspectorFile}
            isProcessing={isProcessing}
            onAction={onInspectActionWithReason}
            onClose={handleBackToClientFiles}
            onPreview={setPreviewFile}
            onDownload={handleDownload}
          />
        </div>
      </div>
    </Layout>
  );
};
