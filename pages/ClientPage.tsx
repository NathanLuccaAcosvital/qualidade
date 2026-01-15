
import React, { useState, useEffect, Suspense, useRef, useCallback } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/authContext.tsx';
import { fileService } from '../lib/services/index.ts';
import { useTranslation } from 'react-i18next';
import { 
  FileText, 
  Loader2, 
  ShieldCheck, 
  Library, 
  Star, 
  AlertTriangle,
  // Fix: Imported missing icons
  LayoutDashboard,
  Trash2,
  XCircle,
  Clock, // New: For recent documents
  BarChart3, // New: For reports
  Bell // New: For notifications
} from 'lucide-react';
import { normalizeRole, UserRole, FileNode, FileType } from '../types/index.ts';
import { FileExplorer, FileExplorerHandle } from '../components/features/files/FileExplorer.tsx';
import { FilePreviewModal } from '../components/features/files/FilePreviewModal.tsx';
import { ExplorerToolbar } from '../components/features/files/components/ExplorerToolbar.tsx';
import { UploadFileModal } from '../components/features/files/modals/UploadFileModal.tsx';
import { CreateFolderModal } from '../components/features/files/modals/CreateFolderModal.tsx';
import { RenameModal } from '../components/features/files/modals/RenameModal.tsx';
import { useFileExplorer } from '../components/features/files/hooks/useFileExplorer.ts';
import { ProcessingOverlay, QualityEmptyState } from '../components/features/quality/components/ViewStates.tsx';
import ClientDashboard from './dashboards/ClientDashboard.tsx'; // Importa o componente ClientDashboard
// import { CommandPalette } from '../components/common/CommandPalette.tsx'; // Removido
import { useLayoutState } from '../components/layout/hooks/useLayoutState.ts';
import { ClientLayout } from '../components/layout/ClientLayout.tsx'; // Importa o novo ClientLayout

const ClientPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const activeView = searchParams.get('view') || 'home';
  const currentFolderId = searchParams.get('folderId');
  const mainContentRef = useRef<HTMLElement>(null); // Ref para o elemento main

  // Efeito para rolar para o topo quando a view ou a pasta muda
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = 0;
    }
  }, [activeView, currentFolderId]);

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

  const userRole = normalizeRole(user?.role);
  const isClient = userRole === UserRole.CLIENT;

  // Redirect if not client/admin
  useEffect(() => {
    if (user && userRole !== UserRole.CLIENT && userRole !== UserRole.ADMIN) {
      navigate('/quality/dashboard', { replace: true });
      return;
    }
  }, [user, navigate, userRole]);

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

  // Function to change the active view in search params
  const handleViewChange = useCallback((viewId: string) => {
    setSearchParams(prev => {
      prev.set('view', viewId);
      if (viewId !== 'files') {
        prev.delete('folderId'); // Clear folderId if not in files view
      }
      return prev;
    }, { replace: true });
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
    if (isClient) return; // Prevent client from uploading
    await handleUploadFile(fileBlob, fileName, currentFolderId);
    setIsUploadModalOpen(false);
  }, [handleUploadFile, currentFolderId, isClient]);

  const handleCreate = useCallback(async (folderName: string) => {
    if (isClient) return; // Prevent client from creating folders
    await handleCreateFolder(folderName, currentFolderId);
    setIsCreateFolderModalOpen(false);
  }, [handleCreateFolder, currentFolderId, isClient]);

  const handleRename = useCallback(async (newName: string) => {
    if (isClient) return; // Prevent client from renaming
    if (!fileToRename) return;
    await handleRenameFile(fileToRename.id, newName);
    setIsRenameModalOpen(false);
    setFileToRename(null);
    setSelectedFileIds([]);
  }, [fileToRename, handleRenameFile, isClient]);

  const handleDeleteSelected = useCallback(async () => {
    if (isClient) return; // Prevent client from deleting
    if (selectedFileIds.length === 0) return;
    setIsConfirmDeleteOpen(false); // Close confirmation modal
    await handleDeleteFiles(selectedFileIds);
    setSelectedFileIds([]); // Clear selection after delete
  }, [selectedFileIds, handleDeleteFiles, isClient]);

  const handleRenameSelected = useCallback(() => {
    if (isClient) return; // Prevent client from renaming
    if (selectedFileIds.length === 1) {
      const file = files.find(f => f.id === selectedFileIds[0]);
      if (file) {
        setFileToRename(file);
        setIsRenameModalOpen(true);
      }
    }
  }, [selectedFileIds, files, isClient]);

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
    if (isClient) return; // Prevent client from renaming
    setFileToRename(file);
    setIsRenameModalOpen(true);
  }, [isClient]);

  const handleDeleteSingleFile = useCallback((fileId: string) => {
    if (isClient) return; // Prevent client from deleting
    setSelectedFileIds([fileId]); // Temporarily select for deletion
    setIsConfirmDeleteOpen(true);
  }, [isClient]);

  // Funções da Command Palette removidas
  // const handleCommandPaletteSearch = useCallback(async (term: string) => {
  //   if (!user) return [];
  //   const results = await fileService.searchFiles(user, term, 1, 20); // Limit to 20 results for palette
  //   return results.items;
  // }, [user]);

  // const handleCommandPaletteNavigateToFile = useCallback((file: FileNode) => {
  //   setSearchParams(prev => {
  //     prev.set('view', 'files');
  //     if (file.parentId) prev.set('folderId', file.parentId);
  //     else prev.delete('folderId');
  //     return prev;
  //   }, { replace: true });
  //   setTimeout(() => {
  //     handleFileSelectForPreview(file);
  //   }, 500); 
  //   layout.closeCommandPalette();
  // }, [setSearchParams, handleFileSelectForPreview, layout]);

  // const handleCommandPaletteNavigateToFolder = useCallback((folderId: string | null) => {
  //   handleNavigate(folderId); // Use existing navigation handler for folder
  //   layout.closeCommandPalette();
  // }, [handleNavigate, layout]);


  const selectedFilesData = files.filter(f => selectedFileIds.includes(f.id));
  const isSingleFileSelected = selectedFileIds.length === 1 && selectedFilesData[0]?.type !== FileType.FOLDER;
  const isSingleItemSelected = selectedFileIds.length === 1;

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
              userRole={userRole}
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
              userRole={userRole}
            />
          </div>
        );
      default:
        return <ClientDashboard />;
    }
  };

  return (
    <ClientLayout 
      title={activeView === 'home' ? t('menu.dashboard') : t('menu.library')} 
      activeView={activeView} 
      onViewChange={handleViewChange}
      // onOpenCommandPalette={layout.openCommandPalette} // Removido
    >
      <FilePreviewModal 
        initialFile={selectedFileForPreview}
        allFiles={files.filter(f => f.type !== FileType.FOLDER)} // Passa apenas arquivos para navegação
        isOpen={isPreviewOpen} 
        onClose={() => setIsPreviewOpen(false)} 
        onDownloadFile={handleDownloadSingleFile} // Passa a função de download
      />
      
      {/* Conditionally render modals based on user role */}
      {!isClient && (
        <>
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
        </>
      )}

      {/* Command Palette (Removido daqui) */}
      {/*
      <CommandPalette
        isOpen={layout.isCommandPaletteOpen}
        onClose={layout.closeCommandPalette}
        onSearch={() => Promise.resolve([])} // Placeholder, ClientPage passará o real
        onNavigateToFile={() => {}} // Placeholder, ClientPage passará o real
        onNavigateToFolder={() => {}} // Placeholder, ClientPage passará o real
        isLoadingResults={false} // Placeholder, ClientPage passará o real
      />
      */}

      {loading && <ProcessingOverlay message={t('files.processingFiles')} />}

      <div className="flex flex-col relative w-full gap-6 pb-20">
        <main ref={mainContentRef} className="min-h-[calc(100vh-280px)] animate-in fade-in slide-in-from-bottom-3 duration-700 overflow-y-auto"> {/* Adicionado ref e overflow-y-auto */}
            <Suspense fallback={<ClientViewLoader />}>
                {renderContent()}
            </Suspense>
        </main>
      </div>
    </ClientLayout>
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
