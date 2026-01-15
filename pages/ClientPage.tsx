


import React, { useState, useEffect, Suspense, useRef, useCallback } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Layout } from '../components/layout/MainLayout.tsx';
import { useAuth } from '../context/authContext.tsx';
import { fileService } from '../lib/services/index.ts';
import { DashboardStatsData } from '../lib/services/interfaces.ts';
import { useTranslation } from 'react-i18next';
import { 
  Clock, 
  FileText, 
  Loader2, 
  ArrowUpRight, 
  ShieldCheck, 
  Library, 
  Star, 
  Search,
  Grid,
  List as ListIcon,
  ChevronRight,
  Download,
  MoreVertical,
  History,
  XCircle,
  AlertTriangle,
  // Fix: Imported missing icons
  LayoutDashboard,
  Trash2,
  Command
} from 'lucide-react';
// Fix: Imported missing FileType
import { normalizeRole, UserRole, FileNode, FileType } from '../types/index.ts';
import { FileExplorer, FileExplorerHandle } from '../components/features/files/FileExplorer.tsx';
import { FilePreviewModal } from '../components/features/files/FilePreviewModal.tsx';
import { ExplorerToolbar } from '../components/features/files/components/ExplorerToolbar.tsx';
import { UploadFileModal } from '../components/features/files/modals/UploadFileModal.tsx';
import { CreateFolderModal } from '../components/features/files/modals/CreateFolderModal.tsx';
import { RenameModal } from '../components/features/files/modals/RenameModal.tsx';
import { useFileExplorer } from '../components/features/files/hooks/useFileExplorer.ts';
import { ProcessingOverlay } from '../components/features/quality/components/ViewStates.tsx';
import ClientDashboard from './dashboards/ClientDashboard.tsx'; // Importa o componente ClientDashboard
import { CommandPalette } from '../components/common/CommandPalette.tsx';
import { useLayoutState } from '../components/layout/hooks/useLayoutState.ts';


const ClientPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const activeView = searchParams.get('view') || 'home';
  const currentFolderId = searchParams.get('folderId');

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [fileToRename, setFileToRename] = useState<FileNode | null>(null);

  // Modals state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedFileForPreview, setSelectedFileForPreview] = useState<FileNode | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  
  const fileExplorerRef = useRef<FileExplorerHandle>(null);

  const {
    files, loading, breadcrumbs,
    handleUploadFile, handleCreateFolder, handleDeleteFiles, handleRenameFile,
    fetchFiles // Keep fetchFiles to trigger manual refresh if needed
  } = useFileExplorer({
    currentFolderId,
    searchTerm,
    viewMode
  });

  const layout = useLayoutState(); // Access layout state including command palette

  // Redirect if not client/admin
  useEffect(() => {
    const role = normalizeRole(user?.role);
    if (user && role !== UserRole.CLIENT && role !== UserRole.ADMIN) {
      navigate('/quality/dashboard', { replace: true });
      return;
    }
  }, [user, navigate]);

  // Handle URL folderId changes
  const handleNavigate = useCallback((folderId: string | null) => {
    setSelectedFileIds([]); // Clear selection on folder navigation
    if (folderId) {
      setSearchParams(prev => {
        prev.set('folderId', folderId);
        prev.set('view', 'files'); // Ensure view is 'files'
        return prev;
      }, { replace: true });
    } else {
      setSearchParams(prev => {
        prev.delete('folderId');
        prev.set('view', 'files'); // Ensure view is 'files'
        return prev;
      }, { replace: true });
    }
  }, [setSearchParams]);

  const handleFileSelectForPreview = useCallback((file: FileNode | null) => {
    if (file && file.type !== FileType.FOLDER) {
        setSelectedFileForPreview(file);
        setIsPreviewOpen(true);
    }
  }, []);

  const handleToggleFileSelection = useCallback((fileId: string) => {
    setSelectedFileIds(prev => 
      prev.includes(fileId) ? prev.filter(id => id !== fileId) : [...prev, fileId]
    );
  }, []);

  const handleUpload = useCallback(async (fileBlob: File, fileName: string) => {
    await handleUploadFile(fileBlob, fileName, currentFolderId);
    setIsUploadModalOpen(false);
  }, [handleUploadFile, currentFolderId]);

  const handleCreate = useCallback(async (folderName: string) => {
    await handleCreateFolder(folderName, currentFolderId);
    setIsCreateFolderModalOpen(false);
  }, [handleCreateFolder, currentFolderId]);

  const handleRename = useCallback(async (newName: string) => {
    if (!fileToRename) return;
    await handleRenameFile(fileToRename.id, newName);
    setIsRenameModalOpen(false);
    setFileToRename(null);
    setSelectedFileIds([]);
  }, [fileToRename, handleRenameFile]);

  const handleDeleteSelected = useCallback(async () => {
    if (selectedFileIds.length === 0) return;
    setIsConfirmDeleteOpen(false); // Close confirmation modal
    await handleDeleteFiles(selectedFileIds);
    setSelectedFileIds([]); // Clear selection after delete
  }, [selectedFileIds, handleDeleteFiles]);

  const handleRenameSelected = useCallback(() => {
    if (selectedFileIds.length === 1) {
      const file = files.find(f => f.id === selectedFileIds[0]);
      if (file) {
        setFileToRename(file);
        setIsRenameModalOpen(true);
      }
    }
  }, [selectedFileIds, files]);

  const handleDownloadSelected = useCallback(() => {
    if (selectedFileIds.length === 1) {
      const file = files.find(f => f.id === selectedFileIds[0]);
      if (file && file.type !== FileType.FOLDER) {
        fileService.getFileSignedUrl(user!, file.id).then(url => {
          window.open(url, '_blank');
        });
      }
    }
  }, [selectedFileIds, files, user]);

  const handleDownloadSingleFile = useCallback((file: FileNode) => {
    if (user && file.type !== FileType.FOLDER) {
      fileService.getFileSignedUrl(user, file.id).then(url => {
        window.open(url, '_blank');
      }).catch(err => console.error("Download failed:", err));
    }
  }, [user]);

  const handleRenameSingleFile = useCallback((file: FileNode) => {
    setFileToRename(file);
    setIsRenameModalOpen(true);
  }, []);

  const handleDeleteSingleFile = useCallback((fileId: string) => {
    setSelectedFileIds([fileId]); // Temporarily select for deletion
    setIsConfirmDeleteOpen(true);
  }, []);

  const handleCommandPaletteSearch = useCallback(async (term: string) => {
    if (!user) return [];
    const results = await fileService.searchFiles(user, term, 1, 20); // Limit to 20 results for palette
    return results.items;
  }, [user]);

  const handleCommandPaletteNavigateToFile = useCallback((file: FileNode) => {
    // Navigate to files view first, then open preview modal
    setSearchParams(prev => {
      prev.set('view', 'files');
      if (file.parentId) prev.set('folderId', file.parentId);
      else prev.delete('folderId');
      return prev;
    }, { replace: true });
    // This will trigger a re-render and re-fetch files, then open the preview
    // We might need a small delay or a more robust state management to ensure file data is available
    setTimeout(() => {
      handleFileSelectForPreview(file);
    }, 500); // Small delay to allow URL/data to update
    layout.closeCommandPalette();
  }, [setSearchParams, handleFileSelectForPreview, layout]);

  const handleCommandPaletteNavigateToFolder = useCallback((folderId: string | null) => {
    handleNavigate(folderId); // Use existing navigation handler for folder
    layout.closeCommandPalette();
  }, [handleNavigate, layout]);


  const selectedFilesData = files.filter(f => selectedFileIds.includes(f.id));
  const isSingleFileSelected = selectedFileIds.length === 1 && selectedFilesData[0]?.type !== FileType.FOLDER;
  const isSingleItemSelected = selectedFileIds.length === 1;

  const VIEWS = [
    { id: 'home', label: t('menu.dashboard'), icon: LayoutDashboard },
    { id: 'files', label: t('menu.library'), icon: Library },
    { id: 'favorites', label: t('menu.favorites'), icon: Star },
  ];

  const renderContent = () => {
    switch (activeView) {
      case 'home':
        return <ClientDashboard />;
      case 'files':
        return (
          <div className="flex flex-col h-full bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[600px]">
            <ExplorerToolbar
              breadcrumbs={breadcrumbs}
              onNavigate={handleNavigate}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onUploadClick={() => setIsUploadModalOpen(true)}
              onCreateFolderClick={() => setIsCreateFolderModalOpen(true)}
              selectedCount={selectedFileIds.length}
              onDeleteSelected={() => setIsConfirmDeleteOpen(true)}
              onRenameSelected={handleRenameSelected}
              onDownloadSelected={handleDownloadSelected}
              viewMode={viewMode}
              onViewChange={setViewMode}
              selectedFilesData={selectedFilesData}
            />

            <FileExplorer 
              ref={fileExplorerRef}
              files={files} 
              loading={loading}
              currentFolderId={currentFolderId}
              searchTerm={searchTerm}
              breadcrumbs={breadcrumbs}
              selectedFileIds={selectedFileIds}
              onToggleFileSelection={handleToggleFileSelection}
              onNavigate={handleNavigate}
              onFileSelectForPreview={handleFileSelectForPreview}
              onDownloadFile={handleDownloadSingleFile}
              onRenameFile={handleRenameSingleFile}
              onDeleteFile={handleDeleteSingleFile}
              viewMode={viewMode}
            />
          </div>
        );
      case 'favorites':
        return (
          <div className="flex flex-col h-full bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[600px]">
            <header className="p-8 border-b border-slate-100">
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
                  <Star className="text-amber-400" size={24} />
                  {t('menu.favorites')}
              </h3>
              <p className="text-slate-400 text-sm font-medium mt-1">Seus certificados marcados para acesso rápido.</p>
            </header>
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-300 italic">
                <FileText size={48} className="opacity-10 mb-4" />
                <p className="font-semibold text-slate-600 text-sm">Funcionalidade de favoritos em sincronização...</p>
            </div>
          </div>
        );
      default:
        return <ClientDashboard />;
    }
  };

  return (
    <Layout title={activeView === 'home' ? t('menu.dashboard') : t('menu.library')} onOpenCommandPalette={layout.openCommandPalette}>
      <FilePreviewModal 
        file={selectedFileForPreview} 
        isOpen={isPreviewOpen} 
        onClose={() => setIsPreviewOpen(false)} 
      />
      <UploadFileModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUpload}
        isUploading={loading}
        currentFolderId={currentFolderId}
      />
      <CreateFolderModal
        isOpen={isCreateFolderModalOpen}
        onClose={() => setIsCreateFolderModalOpen(false)}
        onCreate={handleCreate}
        isCreating={loading}
      />
      {fileToRename && (
        <RenameModal
          isOpen={isRenameModalOpen}
          onClose={() => setIsRenameModalOpen(false)}
          onRename={handleRename}
          isRenaming={loading}
          currentName={fileToRename.name}
        />
      )}

      {isConfirmDeleteOpen && (
        <div className="fixed inset-0 z-[170] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden border border-red-200 flex flex-col">
            <header className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-red-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-red-100 text-red-600 rounded-xl shadow-sm"><AlertTriangle size={22} /></div>
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">{t('files.delete.confirmTitle')}</h3>
              </div>
              <button onClick={() => setIsConfirmDeleteOpen(false)} className="p-2.5 hover:bg-slate-200 rounded-full transition-colors text-slate-400"><XCircle size={24} /></button>
            </header>
            <div className="p-8 space-y-6">
              <p className="text-sm text-slate-700">{t('files.delete.confirmMessage', { count: selectedFileIds.length })}</p>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setIsConfirmDeleteOpen(false)} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors">{t('common.cancel')}</button>
                <button type="button" onClick={handleDeleteSelected} className="px-8 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg flex items-center gap-2">
                  <Trash2 size={16} /> {t('files.delete.button')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Command Palette */}
      <CommandPalette
        isOpen={layout.isCommandPaletteOpen}
        onClose={layout.closeCommandPalette}
        onSearch={handleCommandPaletteSearch}
        onNavigateToFile={handleCommandPaletteNavigateToFile}
        onNavigateToFolder={handleCommandPaletteNavigateToFolder}
        isLoadingResults={loading} // Reuse the file explorer's loading state for now
      />

      {loading && <ProcessingOverlay message={t('files.processingFiles')} />}

      <div className="flex flex-col relative w-full gap-6 pb-20">
        
        {/* Navegação Superior por Abas - Estilo Industrial Premium */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-20 z-40">
            <nav className="bg-white/80 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200 inline-flex shadow-sm">
                {VIEWS.map((view) => {
                    const isActive = activeView === view.id;
                    return (
                        <button
                            key={view.id}
                            onClick={() => setSearchParams({ view: view.id })}
                            className={`
                                flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-300
                                ${isActive 
                                    ? 'bg-[#081437] text-white shadow-lg shadow-slate-900/20 translate-y-[-1px]' 
                                    : 'text-slate-500 hover:text-[#081437] hover:bg-slate-50'}
                            `}
                        >
                            <view.icon size={14} className={isActive ? 'text-blue-400' : 'text-slate-400'} />
                            {view.label}
                        </button>
                    );
                })}
            </nav>

            <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase bg-white/80 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="relative">
                    <ShieldCheck size={16} className="text-emerald-500" />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-ping opacity-75"></span>
                </div>
                Portal de Dados Seguro
            </div>
        </header>

        {/* Container Principal de Conteúdo */}
        <main className="min-h-[calc(100vh-280px)] animate-in fade-in slide-in-from-bottom-3 duration-700">
            <Suspense fallback={<ClientViewLoader />}>
                {renderContent()}
            </Suspense>
        </main>
      </div>
    </Layout>
  );
};

const ClientViewLoader = () => (
  <div className="flex flex-col items-center justify-center h-96 bg-white rounded-[3rem] border border-dashed border-slate-200">
    <div className="relative mb-6">
      <Loader2 size={56} className="animate-spin text-blue-500" />
      <ShieldCheck size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#081437]" />
    </div>
    <p className="font-black text-[10px] uppercase tracking-[6px] text-slate-400 animate-pulse">Autenticando Camadas...</p>
  </div>
);

export default ClientPage;