import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Layout } from '../components/layout/MainLayout.tsx';
import { useAuth } from '../context/authContext.tsx';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useToast } from '../context/notificationContext.tsx';
import { FileNode, ClientOrganization, FileType, FileMetadata, BreadcrumbItem } from '../types/index';
import { fileService, notificationService } from '../lib/services/index.ts';

// Feature Views
import { QualityOverview } from '../features/quality/views/QualityOverview.tsx';
import { ClientList } from '../features/quality/views/ClientList.tsx';
import { QualityAuditLog } from '../features/quality/views/QualityAuditLog.tsx';

// Generic Components
import { FileExplorer, FileExplorerHandle } from '../components/features/files/FileExplorer.tsx';
import { CreateFolderModal } from '../components/features/admin/modals/AdminModals.tsx'; // Keep shared modals here for now

// Icons
import {
  X, FileUp, ArrowLeft, Loader2, ChevronRight, FolderPlus
} from 'lucide-react';

const QualityPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeView = searchParams.get('view') || 'overview';
  const { showToast } = useToast();

  // --- Global States for Quality Page (for FileExplorer and modals) ---
  const [selectedClient, setSelectedClient] = useState<ClientOrganization | null>(null);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false); // General processing for page-level actions
  const [fileExplorerRefreshKey, setFileExplorerRefreshKey] = useState(0); // Key to force FileExplorer refresh

  // Modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadData, setUploadData] = useState<Partial<FileMetadata>>({ status: 'PENDING', productName: '', batchNumber: '', invoiceNumber: '' });
  const [selectedFileBlob, setSelectedFileBlob] = useState<File | null>(null);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const fileExplorerRef = useRef<FileExplorerHandle>(null);

  useEffect(() => {
    // Ensure a default view is always set
    if (!searchParams.get('view')) {
      setSearchParams({ view: 'overview' }, { replace: true });
    }
    // Reset view-specific states when changing main view
    setSelectedClient(null);
    setCurrentFolderId(null);
    setBreadcrumbs([]); // Clear breadcrumbs on main view change
  }, [activeView, searchParams, setSearchParams]);

  // Update Breadcrumbs when folder changes or user/t changes
  useEffect(() => {
    const updateCrumbs = async () => {
      if (!user || activeView !== 'files' || !selectedClient) return; // Only show breadcrumbs for a selected client's files view
      const crumbs = await fileService.getBreadcrumbs(currentFolderId);
      setBreadcrumbs(crumbs.map(c => ({ ...c, name: c.id === 'root' ? t('common.home') : c.name })));
    };
    updateCrumbs();
  }, [currentFolderId, user, t, activeView, selectedClient]);

  const getTitleForView = (view: string) => {
    switch (view) {
      case 'overview': return t('quality.overview');
      case 'clients': return t('quality.b2bPortfolio');
      case 'audit-log': return t('quality.myAuditLog');
      case 'files': return selectedClient ? `${selectedClient.name}` : t('menu.documents');
      default: return t('menu.documents');
    }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newFolderName.trim() || !selectedClient?.id) {
      showToast(t('quality.errorCreatingFolder', { message: 'Missing user, folder name, or selected client.' }), 'error');
      return;
    }

    setIsProcessing(true);
    try {
      await fileService.createFolder(user, currentFolderId, newFolderName.trim(), selectedClient.id);
      showToast(t('quality.folderCreatedSuccess', { folderName: newFolderName }), 'success');
      setIsCreateFolderModalOpen(false);
      setNewFolderName('');
      setFileExplorerRefreshKey(prev => prev + 1); // Refresh FileExplorer
    } catch (err: any) {
      showToast(t('quality.errorCreatingFolder', { message: err.message }), 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFileBlob || !user) return;

    let targetOwnerId: string;
    if (selectedClient) {
      targetOwnerId = selectedClient.id;
    } else {
      showToast(t('quality.selectClient'), 'error');
      return;
    }

    setIsProcessing(true);
    try {
      await fileService.uploadFile(user, {
        name: selectedFileBlob.name,
        parentId: currentFolderId,
        metadata: uploadData as any,
        fileBlob: selectedFileBlob
      } as any, targetOwnerId);

      showToast(t('quality.documentUploadedSuccess'), 'success');
      setIsUploadModalOpen(false);
      setSelectedFileBlob(null);
      setUploadData({ status: 'PENDING', productName: '', batchNumber: '', invoiceNumber: '' });
      setFileExplorerRefreshKey(prev => prev + 1); // Refresh FileExplorer
    } catch (err: any) {
      console.error("Erro no upload do arquivo:", err);
      const errorMessage = err.message || t('quality.errorUploadingFile', { message: 'Erro desconhecido' });
      showToast(t('quality.errorUploadingFile', { message: errorMessage }), 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const openUploadModalForClient = () => {
    if (!selectedClient) {
      showToast(t('quality.selectClient'), 'warning');
      return;
    }
    setIsUploadModalOpen(true);
    setUploadData({ status: 'PENDING', productName: '', batchNumber: '', invoiceNumber: '' });
    setSelectedFileBlob(null);
  };

  const handleDeleteFile = async (file: FileNode) => {
    if (!user) return;
    if (file.type !== FileType.FOLDER) {
      showToast("Permissão negada: Analistas de Qualidade não podem excluir arquivos, apenas pastas.", 'error');
      return;
    }
    if (!window.confirm(t('files.confirmDelete', { fileName: file.name }))) return;

    setIsProcessing(true);
    try {
      await fileService.deleteFile(user, file.id);
      showToast(t('files.fileDeletedSuccess', { fileName: file.name }), 'success');
      setFileExplorerRefreshKey(prev => prev + 1); // Refresh FileExplorer
    } catch (err: any) {
      console.error("Erro ao deletar arquivo/pasta:", err);
      showToast(t('files.errorDeletingFile'), 'error');
      await fileService.logAction(user, 'FILE_DELETE', file.name, 'DATA', 'ERROR', 'FAILURE', { fileId: file.id, reason: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelectForInspection = (file: FileNode | null) => {
    if (!file || file.type === FileType.FOLDER) {
        // If a folder is selected or file is null, do nothing or handle folder navigation if needed
        return;
    }
    // Navigate to the new inspection route
    navigate(`/quality/inspect/${file.id}`);
  };

  return (
    <Layout title={getTitleForView(activeView)}>
      {isProcessing && (
        <div className="fixed top-4 right-1/2 translate-x-1/2 z-[110] bg-slate-900 text-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 text-xs font-bold animate-bounce">
          <Loader2 size={14} className="animate-spin" /> {t('common.updatingDatabase')}
        </div>
      )}

      {/* Upload Modal (managed by QualityPage) */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300" role="dialog" aria-modal="true" aria-labelledby="upload-modal-title">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 id="upload-modal-title" className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <FileUp size={20} className="text-blue-600" aria-hidden="true" /> {t('quality.sendNewCertificate')}
              </h3>
              <button onClick={() => setIsUploadModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors" aria-label={t('common.close')}><X size={20} aria-hidden="true" /></button>
            </div>

            <form onSubmit={handleUpload} className="p-6 space-y-4">
              <div className="space-y-1">
                <label htmlFor="upload-file" className="text-xs font-bold text-slate-500 uppercase">{t('quality.pdfImageFile')}</label>
                <input
                  id="upload-file"
                  type="file"
                  accept="application/pdf,image/*"
                  required
                  onChange={e => setSelectedFileBlob(e.target.files?.[0] || null)}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  aria-label={t('quality.pdfImageFile')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="upload-product" className="text-xs font-bold text-slate-500 uppercase">{t('quality.product')}</label>
                  <input
                    id="upload-product"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t('quality.productPlaceholder')}
                    value={uploadData.productName}
                    onChange={e => setUploadData({ ...uploadData, productName: e.target.value })}
                    aria-label={t('quality.product')}
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="upload-batch" className="text-xs font-bold text-slate-500 uppercase">{t('quality.batchNumber')}</label>
                  <input
                    id="upload-batch"
                    required
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    placeholder="L-998"
                    value={uploadData.batchNumber}
                    onChange={e => setUploadData({ ...uploadData, batchNumber: e.target.value })}
                    aria-label={t('quality.batchNumber')}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="upload-invoice" className="text-xs font-bold text-slate-500 uppercase">{t('quality.invoiceNumber')}</label>
                <input
                  id="upload-invoice"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="NF-000123"
                  value={uploadData.invoiceNumber}
                  onChange={e => setUploadData({ ...uploadData, invoiceNumber: e.target.value })}
                  aria-label={t('quality.invoiceNumber')}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsUploadModalOpen(false)} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-all" aria-label={t('common.cancel')}>{t('common.cancel')}</button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex-[2] py-3 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center gap-2"
                  aria-label={t('quality.uploadFile')}
                >
                  {isProcessing ? <Loader2 className="animate-spin" size={18} aria-hidden="true" /> : t('quality.uploadFile')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Folder Modal (managed by QualityPage) */}
      <CreateFolderModal
        isOpen={isCreateFolderModalOpen}
        onClose={() => setIsCreateFolderModalOpen(false)}
        onSave={handleCreateFolder}
        isSaving={isProcessing}
        folderName={newFolderName}
        setFolderName={setNewFolderName}
      />

      <div className="h-[calc(100vh-190px)] relative">
        {selectedClient && activeView === 'files' ? (
          <div className="absolute inset-0 z-40 bg-slate-50 flex flex-col animate-in slide-in-from-right-4 duration-400">
            <div className="flex flex-col mb-4 pb-4 border-b border-slate-200 shrink-0 gap-4">
              <div className="flex items-center gap-4">
                <button onClick={() => { setSelectedClient(null); navigate('/quality?view=clients'); }} className="p-2.5 bg-white border border-slate-200 rounded-xl hover:text-blue-600 shadow-sm transition-all" aria-label={t('common.back')}><ArrowLeft size={20} aria-hidden="true" /></button>
                <div>
                  <h2 className="text-xl font-bold text-slate-800 leading-none">{selectedClient.name}</h2>
                  <p className="text-[10px] text-slate-400 font-mono mt-1 tracking-widest uppercase">{selectedClient.cnpj}</p>
                </div>
                <div className="flex gap-2 ml-auto">
                  <button
                    onClick={() => setIsCreateFolderModalOpen(true)}
                    className="bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-slate-900/20 active:scale-95 transition-all"
                    aria-label={t('quality.createFolder')}
                  >
                    <FolderPlus size={16} aria-hidden="true" /> {t('quality.createFolder')}
                  </button>
                  <button
                    onClick={() => openUploadModalForClient()}
                    className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-900/20 active:scale-95 transition-all"
                    aria-label={t('quality.sendNewCertificate')}
                  >
                    <FileUp size={16} aria-hidden="true" /> {t('quality.sendNewCertificate')}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto py-1 px-1" role="navigation" aria-label={t('files.breadcrumbs')}>
                {breadcrumbs.map((crumb, idx) => (
                  <React.Fragment key={crumb.id}>
                    <button
                      onClick={() => setCurrentFolderId(crumb.id === 'root' ? null : crumb.id)}
                      className={`text-[10px] font-bold uppercase tracking-wider whitespace-nowrap px-2 py-1 rounded-md transition-all ${
                        idx === breadcrumbs.length - 1 ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                      }`}
                      aria-label={crumb.name}
                    >
                      {crumb.name}
                    </button>
                    {idx < breadcrumbs.length - 1 && <ChevronRight size={10} className="text-slate-300 shrink-0" aria-hidden="true" />}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="flex-1 flex gap-4 overflow-hidden">
              <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <FileExplorer
                  ref={fileExplorerRef}
                  currentFolderId={currentFolderId}
                  onNavigate={setCurrentFolderId}
                  allowUpload={false}
                  onFileSelect={handleFileSelectForInspection} // Navigate to new inspection route
                  hideToolbar={false} {/* Fix: Removed undefined `hideToolbarForExplorer` function. Toolbar should be visible here. */}
                  refreshKey={fileExplorerRefreshKey}
                  onDeleteFile={handleDeleteFile}
                  onSetStatusToPending={async (file: FileNode) => { /* Fix: Changed signature to match (file: FileNode) => Promise<void> */ }}
                  onCreateFolder={() => setIsCreateFolderModalOpen(true)} // Allow folder creation in client view
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            {activeView === 'overview' && (
              <QualityOverview />
            )}
            {activeView === 'clients' && (
              <ClientList onSelectClient={(client) => {
                setSelectedClient(client);
                setSearchParams({ view: 'files' }); // Change view to files when client is selected
                setCurrentFolderId(null); // Reset folder to root for new client
              }} />
            )}
            {activeView === 'audit-log' && (
              <QualityAuditLog />
            )}
            {/* The FileInspection view will be rendered by React Router's Outlet */}
          </div>
        )}
      </div>
    </Layout>
  );
};