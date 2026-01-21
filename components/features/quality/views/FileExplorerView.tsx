
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../context/authContext.tsx';
import { useTranslation } from 'react-i18next';
import { FileNode, FileType, UserRole } from '../../../../types/index.ts';
import { useFileCollection } from '../../files/hooks/useFileCollection.ts';
import { useFileOperations } from '../../files/hooks/useFileOperations.ts';
import { FileExplorer, FileExplorerHandle } from '../../files/FileExplorer.tsx';
import { ExplorerToolbar } from '../../files/components/ExplorerToolbar.tsx';
import { CreateFolderModal } from '../../files/modals/CreateFolderModal.tsx';
import { RenameModal } from '../../files/modals/RenameModal.tsx';
import { UploadFileModal } from '../../files/modals/UploadFileModal.tsx';
import { DeleteConfirmationModal } from '../../files/modals/DeleteConfirmationModal.tsx';
import { PaginationControls } from '../../../common/PaginationControls.tsx';
import { QualityLoadingState, ProcessingOverlay } from '../components/ViewStates.tsx';
import { fileService } from '../../../../lib/services/index.ts';
import { supabase } from '../../../../lib/supabaseClient.ts';
import { MousePointer2 } from 'lucide-react';

interface FileExplorerViewProps {
  orgId: string;
}

export const FileExplorerView: React.FC<FileExplorerViewProps> = ({ orgId }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const currentFolderId = searchParams.get('folderId');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => 
    (localStorage.getItem('explorer_view_mode') as 'grid' | 'list') || 'grid'
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  
  const [isReady, setIsReady] = useState(false);
  const [isDraggingExternal, setIsDraggingExternal] = useState(false);
  const [externalFiles, setExternalFiles] = useState<File[]>([]);
  
  const [modals, setModals] = useState({
    upload: false, folder: false, rename: false, delete: false
  });
  
  const [fileToRename, setFileToRename] = useState<FileNode | null>(null);
  const fileExplorerRef = useRef<FileExplorerHandle>(null);
  const [contextualOwnerId, setContextualOwnerId] = useState<string | null>(orgId === 'global' ? null : orgId);

  const handleViewChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    localStorage.setItem('explorer_view_mode', mode);
  };

  useEffect(() => {
    const resolveInitialFolder = async () => {
      if (orgId === 'global') {
        setIsReady(true);
        return;
      }

      if (orgId && !currentFolderId) {
        setIsReady(false);
        const { data } = await supabase.from('files').select('id').eq('owner_id', orgId).is('parent_id', null).maybeSingle();
        if (data?.id) {
          setSearchParams(p => { p.set('folderId', data.id); p.set('orgId', orgId); return p; }, { replace: true });
        }
      }
      setIsReady(true);
    };
    resolveInitialFolder();
  }, [orgId, currentFolderId, setSearchParams]);

  useEffect(() => {
    const resolveContextualOwner = async () => {
      if (orgId !== 'global') {
        setContextualOwnerId(orgId);
        return;
      }
      if (!currentFolderId) {
        setContextualOwnerId(null);
        return;
      }
      const { data } = await supabase.from('files').select('owner_id').eq('id', currentFolderId).single();
      setContextualOwnerId(data?.owner_id || null);
    };
    resolveContextualOwner();
  }, [orgId, currentFolderId]);

  const collection = useFileCollection({ currentFolderId, searchTerm, ownerId: orgId });
  const ops = useFileOperations(contextualOwnerId, () => collection.fetchFiles());

  const activeSelectedFile = collection.files.find(f => f.id === selectedFileIds[selectedFileIds.length - 1]) || null;

  const handleNavigate = useCallback((folderId: string | null) => {
    setSelectedFileIds([]);
    setSearchParams(prev => {
      if (folderId) prev.set('folderId', folderId);
      else prev.delete('folderId');
      prev.set('orgId', orgId); 
      return prev;
    }, { replace: true });
  }, [setSearchParams, orgId]);

  const handleFileClick = (file: FileNode) => {
    if (file.type === FileType.FOLDER) {
      handleNavigate(file.id);
    } else {
      navigate(`/preview/${file.id}`);
    }
  };

  // Drag & Drop Externo
  const onDragOver = (e: React.DragEvent) => {
    if (user?.role === UserRole.CLIENT) return;
    e.preventDefault();
    setIsDraggingExternal(true);
  };

  const onDragLeave = () => setIsDraggingExternal(false);

  const onDrop = (e: React.DragEvent) => {
    if (user?.role === UserRole.CLIENT) return;
    e.preventDefault();
    setIsDraggingExternal(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
        setExternalFiles(files);
        setModals(m => ({ ...m, upload: true }));
    }
  };

  if (!isReady) return <QualityLoadingState message="Sincronizando Vault..." />;

  return (
    <div 
        className="flex flex-col h-full bg-white overflow-hidden animate-in fade-in duration-500 relative"
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
    >
      {ops.isProcessing && (
        <ProcessingOverlay 
            message={ops.uploadProgress.total > 0 
                ? `Processando Ativos (${ops.uploadProgress.current}/${ops.uploadProgress.total})...` 
                : "Atualizando Base de Dados..."} 
        />
      )}
      
      {isDraggingExternal && (
          <div className="absolute inset-0 z-[400] bg-blue-600/10 backdrop-blur-md border-4 border-dashed border-blue-500 m-4 rounded-[3rem] flex flex-col items-center justify-center animate-in zoom-in-95 pointer-events-none">
              <div className="p-6 bg-blue-600 text-white rounded-3xl shadow-2xl animate-bounce mb-6">
                  <MousePointer2 size={48} />
              </div>
              <h3 className="text-2xl font-black text-blue-900 uppercase tracking-[4px]">Solte para Iniciar Upload</h3>
              <p className="text-blue-700 font-bold uppercase tracking-widest mt-2">Múltiplos arquivos serão enfileirados</p>
          </div>
      )}
      
      <UploadFileModal 
        isOpen={modals.upload} 
        onClose={() => { setModals(m => ({...m, upload: false})); setExternalFiles([]); }} 
        onUpload={async (files) => { await ops.handleUploadBatch(files, currentFolderId); setModals(m => ({...m, upload: false})); setExternalFiles([]); }} 
        isUploading={ops.isProcessing} 
        currentFolderId={currentFolderId}
        initialFiles={externalFiles}
      />

      <CreateFolderModal isOpen={modals.folder} onClose={() => setModals(m => ({...m, folder: false}))} onCreate={async (n) => { await ops.handleCreateFolder(n, currentFolderId); setModals(m => ({...m, folder: false})); }} isCreating={ops.isProcessing} />
      <RenameModal isOpen={modals.rename} onClose={() => setModals(m => ({...m, rename: false}))} onRename={async (n) => { await ops.handleRename(fileToRename!.id, n); setModals(m => ({...m, rename: false})); }} isRenaming={ops.isProcessing} currentName={fileToRename?.name || ''} />
      <DeleteConfirmationModal isOpen={modals.delete} onClose={() => setModals(m => ({...m, delete: false}))} onConfirm={async () => { await ops.handleDelete(selectedFileIds); setModals(m => ({...m, delete: false})); setSelectedFileIds([]); }} isDeleting={ops.isProcessing} itemCount={selectedFileIds.length} hasFolder={collection.files.some(f => selectedFileIds.includes(f.id) && f.type === FileType.FOLDER)} />

      <ExplorerToolbar 
        breadcrumbs={collection.breadcrumbs} 
        onNavigate={handleNavigate} 
        searchTerm={searchTerm} 
        onSearchChange={setSearchTerm} 
        onUploadClick={() => { setExternalFiles([]); setModals(m => ({...m, upload: true})); }} 
        onCreateFolderClick={() => setModals(m => ({...m, folder: true}))} 
        selectedCount={selectedFileIds.length} 
        onDeleteSelected={() => setModals(m => ({...m, delete: true}))} 
        onRenameSelected={() => { if(activeSelectedFile) { setFileToRename(activeSelectedFile); setModals(m => ({...m, rename: true})); } }} 
        onDownloadSelected={async () => { if(activeSelectedFile) { const url = await fileService.getFileSignedUrl(user!, activeSelectedFile.id); window.open(url, '_blank'); } }} 
        viewMode={viewMode} 
        onViewChange={handleViewChange} 
        userRole={user?.role as UserRole} 
        selectedFilesData={collection.files.filter(f => selectedFileIds.includes(f.id))} 
      />

      <div className="flex-1 relative bg-slate-50 flex flex-col min-h-0">
        <div className="flex-1 relative min-h-0">
          <FileExplorer 
              ref={fileExplorerRef} 
              files={collection.files} 
              loading={collection.loading} 
              currentFolderId={currentFolderId} 
              searchTerm={searchTerm} 
              breadcrumbs={collection.breadcrumbs} 
              selectedFileIds={selectedFileIds} 
              onToggleFileSelection={(id) => setSelectedFileIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])} 
              onNavigate={handleNavigate} 
              onFileSelectForPreview={handleFileClick} 
              onDownloadFile={() => {}} 
              onRenameFile={(f) => { setFileToRename(f); setModals(m => ({...m, rename: true})); }} 
              onDeleteFile={(id) => { setSelectedFileIds([id]); setModals(m => ({...m, delete: true})); }} 
              viewMode={viewMode} 
              userRole={user?.role as UserRole} 
          />
        </div>
        
        {/* pb-20 no mobile para compensar a Dock/MobileNav */}
        <div className="shrink-0 pb-20 lg:pb-0">
            <PaginationControls 
              currentPage={collection.page}
              pageSize={collection.pageSize}
              totalItems={collection.totalItems}
              onPageChange={collection.setPage}
              onPageSizeChange={collection.setPageSize}
              isLoading={collection.loading}
            />
        </div>
      </div>
    </div>
  );
};
