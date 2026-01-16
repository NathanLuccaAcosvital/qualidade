
import React from 'react';
import { Layout } from '../../../layout/MainLayout.tsx';
import { FilePreviewModal } from '../../files/FilePreviewModal.tsx';
import { InspectionSidebar } from '../components/InspectionSidebar.tsx';
import { ProcessingOverlay, QualityLoadingState } from '../components/ViewStates.tsx';
import { useFileInspection } from '../hooks/useFileInspection.ts';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, AlertCircle, ExternalLink } from 'lucide-react';
// Fix: Import QualityStatus from enums where it is defined and exported
import { QualityStatus } from '../../../../types/enums.ts';

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
    // Fix: Ensured status passed to handleInspectAction is a valid QualityStatus
    await handleInspectAction(status, reason);
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
      <FilePreviewModal 
        initialFile={previewFile} 
        allFiles={inspectorFile ? [inspectorFile] : []}
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
                <object 
                  data={mainPreviewUrl} 
                  type="application/pdf" 
                  className="w-full h-full"
                  title={inspectorFile.name}
                >
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 p-10 text-center gap-6">
                    <AlertCircle size={48} className="text-orange-500" />
                    <div className="space-y-2">
                      <p className="text-lg font-bold text-white">Visualização Bloqueada pelo Chrome</p>
                      <p className="text-sm">Seu navegador impediu a exibição interna do PDF. Você pode visualizá-lo em uma nova aba com segurança.</p>
                    </div>
                    <button 
                      onClick={() => window.open(mainPreviewUrl, '_blank')}
                      className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-xl font-bold transition-all border border-white/10"
                    >
                      <ExternalLink size={18} /> Abrir Documento em Nova Aba
                    </button>
                  </div>
                </object>
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