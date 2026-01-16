import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../../context/authContext.tsx';
import { useTranslation } from 'react-i18next';
import { FileNode, FileType, UserRole, QualityStatus } from '../../../../types/index.ts';
import { useFileExplorer } from '../../files/hooks/useFileExplorer.ts';
import { FileExplorer, FileExplorerHandle } from '../../files/FileExplorer.tsx';
import { ExplorerToolbar } from '../../files/components/ExplorerToolbar.tsx';
import { FilePreviewModal } from '../../files/FilePreviewModal.tsx';
import { CreateFolderModal } from '../../files/modals/CreateFolderModal.tsx';
import { RenameModal } from '../../files/modals/RenameModal.tsx';
import { UploadFileModal } from '../../files/modals/UploadFileModal.tsx';
import { DeleteConfirmationModal } from '../../files/modals/DeleteConfirmationModal.tsx';
import { ProcessingOverlay, QualityLoadingState } from '../components/ViewStates.tsx';
import { fileService } from '../../../../lib/services/index.ts';
import { useToast } from '../../../../context/notificationContext.tsx';
import { supabase } from '../../../../lib/supabaseClient.ts';

interface FileExplorerViewProps {
  orgId: string;
}

export const FileExplorerView: React.FC<FileExplorerViewProps> = ({ orgId }) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const currentFolderId = searchParams.get('folderId');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedFileForPreview, setSelectedFileForPreview] = useState<FileNode | null>(null);
  const [isAutoNavigating, setIsAutoNavigating] = useState(false);
  
  // Estados para Operações de Arquivos
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [fileToRename, setFileToRename] = useState<FileNode | null>(null);
  
  // Estados para Exclusão
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [idsToDelete, setIdsToDelete] = useState<string[]>([]);
  
  // Estados para Upload
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const fileExplorerRef = useRef<FileExplorerHandle>(null);

  const {
    files, loading, breadcrumbs,
    handleDeleteFiles, handleRenameFile, handleCreateFolder, handleUploadFile
  } = useFileExplorer({
    currentFolderId,
    searchTerm,
    viewMode,
    ownerId: orgId === 'global' ? null : orgId
  });

  const handleNavigate = useCallback((folderId: string | null) => {
    setSelectedFileIds([]);
    setSearchParams(prev => {
      if (folderId) prev.set('folderId', folderId);
      else prev.delete('folderId');
      return prev;
    }, { replace: true });
  }, [setSearchParams]);

  // REGRA VITAL: Ao carregar o portfólio de um cliente, entra automaticamente na pasta raiz dele
  // Isso evita que uploads sejam feitos "ao lado" da pasta do cliente em vez de "dentro"
  useEffect(() => {
    if (!currentFolderId && orgId && orgId !== 'global' && !searchTerm) {
        setIsAutoNavigating(true);
        supabase.from('files')
            .select('id')
            .eq('owner_id', orgId)
            .is('parent_id', null)
            .maybeSingle()
            .then(({ data }) => {
                if (data) handleNavigate(data.id);
            })
            .finally(() => setIsAutoNavigating(false));
    }
  }, [orgId, currentFolderId, searchTerm, handleNavigate]);

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

  const handleDownloadSingleFile = useCallback((file: FileNode) => {
    if (user && file.type !== FileType.FOLDER) {
      fileService.getFileSignedUrl(user, file.id).then(url => {
        window.open(url, '_blank');
      }).catch(err => console.error("Download failed:", err));
    }
  }, [user]);

  const handleUploadAction = async (file: File, fileName: string) => {
    setIsUploading(true);
    try {
      // Passa explicitamente o currentFolderId para garantir que o upload respeite a pasta atual
      await handleUploadFile(file, fileName, currentFolderId);
      setIsUploadModalOpen(false);
    } catch (error: any) {
      showToast(error.message || "Falha ao transmitir arquivo para o servidor.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateFolderAction = async (folderName: string) => {
    setIsCreatingFolder(true);
    try {
      await handleCreateFolder(folderName, currentFolderId); 
      setIsCreateFolderModalOpen(false);
    } catch (error) {
      showToast("Falha ao registrar nova pasta no sistema.", "error");
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const handleRenameAction = async (newName: string) => {
    if (!fileToRename) return;
    setIsRenaming(true);
    try {
      await handleRenameFile(fileToRename.id, newName);
      setIsRenameModalOpen(false);
      setFileToRename(null);
    } catch (error) {
      showToast("Erro ao renomear item.", "error");
    } finally {
      setIsRenaming(false);
    }
  };

  const triggerRename = (file: FileNode) => {
    setFileToRename(file);
    setIsRenameModalOpen(true);
  };

  const openDeleteModal = (ids: string[]) => {
    if (!user || ids.length === 0) return;
    
    // Verificação de Segurança Vital: Impedir exclusão de pasta raiz
    const targets = files.filter(f => ids.includes(f.id));
    const hasRootFolder = targets.some(f => f.type === FileType.FOLDER && f.parentId === null);
    
    if (hasRootFolder) {
        showToast("Proteção de Integridade: Pastas raiz de empresas não podem ser removidas.", "warning");
        return;
    }

    setIdsToDelete(ids);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDeletion = async () => {
    setIsDeleting(true);
    try {
        await handleDeleteFiles(idsToDelete);
        setIsDeleteModalOpen(false);
        setSelectedFileIds([]);
        showToast("Recursos removidos permanentemente.", "success");
    } catch (e) {
        showToast("Falha ao sincronizar exclusão. Verifique conexões.", "error");
    } finally {
        setIsDeleting(false);
        setIdsToDelete([]);
    }
  };

  const selectedFilesData = files.filter(f => selectedFileIds.includes(f.id));

  if (isAutoNavigating) {
    return <QualityLoadingState message="Localizando Diretório da Organização..." />;
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
      <FilePreviewModal 
        initialFile={selectedFileForPreview}
        allFiles={files.filter(f => f.type !== FileType.FOLDER)}
        isOpen={isPreviewOpen} 
        onClose={() => setIsPreviewOpen(false)} 
        onDownloadFile={handleDownloadSingleFile} 
      />

      <UploadFileModal 
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUploadAction}
        isUploading={isUploading}
        currentFolderId={currentFolderId}
      />

      <CreateFolderModal 
        isOpen={isCreateFolderModalOpen}
        onClose={() => setIsCreateFolderModalOpen(false)}
        onCreate={handleCreateFolderAction}
        isCreating={isCreatingFolder}
      />

      <RenameModal 
        isOpen={isRenameModalOpen}
        onClose={() => setIsRenameModalOpen(false)}
        onRename={handleRenameAction}
        isRenaming={isRenaming}
        currentName={fileToRename?.name || ''}
      />

      <DeleteConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDeletion}
        isDeleting={isDeleting}
        itemCount={idsToDelete.length}
        hasFolder={files.filter(f => idsToDelete.includes(f.id)).some(f => f.type === FileType.FOLDER)}
      />

      {(loading || isCreatingFolder || isRenaming || isUploading || isDeleting) && (
        <ProcessingOverlay message={
          isCreatingFolder ? "Sincronizando nova estrutura..." : 
          isRenaming ? "Atualizando identificador..." : 
          isUploading ? "Transmitindo arquivo para nuvem..." :
          isDeleting ? "Removendo recursos do servidor..." :
          t('files.processingFiles')
        } />
      )}

      <ExplorerToolbar
        breadcrumbs={breadcrumbs}
        onNavigate={handleNavigate}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onUploadClick={() => setIsUploadModalOpen(true)} 
        onCreateFolderClick={() => setIsCreateFolderModalOpen(true)}
        selectedCount={selectedFileIds.length}
        onDeleteSelected={() => openDeleteModal(selectedFileIds)} 
        onRenameSelected={() => selectedFilesData.length === 1 && triggerRename(selectedFilesData[0])}
        onDownloadSelected={() => {
           if (selectedFilesData.length === 1) handleDownloadSingleFile(selectedFilesData[0]);
        }}
        viewMode={viewMode}
        onViewChange={setViewMode}
        selectedFilesData={selectedFilesData}
        userRole={UserRole.QUALITY}
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
        onRenameFile={triggerRename}
        onDeleteFile={(id) => openDeleteModal([id])}
        viewMode={viewMode}
        userRole={UserRole.QUALITY}
      />
    </div>
  );
};