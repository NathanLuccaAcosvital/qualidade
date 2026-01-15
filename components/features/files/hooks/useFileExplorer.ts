

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../../context/authContext.tsx';
import { fileService } from '../../../../lib/services/index.ts';
import { useToast } from '../../../../context/notificationContext.tsx';
import { useTranslation } from 'react-i18next';
import { FileNode, BreadcrumbItem, UserRole, FileType } from '../../../../types/index.ts';

interface FileExplorerOptions {
  currentFolderId: string | null;
  refreshKey?: number;
  searchTerm: string; // Adicionado para pesquisa
  viewMode: 'grid' | 'list'; // Adicionado para estado da view
}

interface UseFileExplorerReturn {
  files: FileNode[];
  loading: boolean;
  hasMore: boolean;
  breadcrumbs: BreadcrumbItem[];
  handleNavigate: (folderId: string | null) => void;
  fetchFiles: (resetPage?: boolean) => Promise<void>;
  handleUploadFile: (fileBlob: File, fileName: string, parentId: string | null) => Promise<void>;
  handleCreateFolder: (folderName: string, parentId: string | null) => Promise<void>;
  handleDeleteFiles: (fileIds: string[]) => Promise<void>;
  handleRenameFile: (fileId: string, newName: string) => Promise<void>;
}

/**
 * Hook de Negócio: Gestão do Ciclo de Vida do Explorador de Arquivos.
 */
export const useFileExplorer = (options: FileExplorerOptions): UseFileExplorerReturn => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { showToast } = useToast();
  
  const [files, setFiles] = useState<FileNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);

  // Fix: Use options.currentFolderId directly as the activeFolderId
  const activeFolderId = options.currentFolderId; 

  const fetchFiles = useCallback(async (resetPage = false) => {
    if (!user) return;
    const currentPage = resetPage ? 1 : page;
    setLoading(true);

    try {
      // Fix: Pass searchTerm to fileService.getFiles
      const [fileResult, breadcrumbResult] = await Promise.all([
        fileService.getFiles(user, activeFolderId, currentPage, 100, options.searchTerm),
        fileService.getBreadcrumbs(activeFolderId)
      ]);
      
      setFiles(prev => resetPage ? fileResult.items : [...prev, ...fileResult.items]);
      setHasMore(fileResult.hasMore);
      setPage(currentPage);
      setBreadcrumbs(breadcrumbResult);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("[useFileExplorer] Failure:", message);
      showToast(t('files.errorLoadingFiles'), 'error');
    } finally {
      setLoading(false);
    }
  }, [user, page, activeFolderId, options.searchTerm, showToast, t]);

  const handleNavigate = useCallback((folderId: string | null) => {
    // A navegação agora é controlada pelo componente pai (ClientPage) via options.currentFolderId
    // Este método pode ser usado para triggar a navegação *externa* se o hook for usado de forma mais independente.
    // Para ClientPage, a mudança de folderId é externa, via URL params.
    // Aqui, apenas atualizamos o estado interno de paginação para nova fetch.
    setPage(1); 
    setHasMore(true);
  }, []);

  const handleUploadFile = useCallback(async (fileBlob: File, fileName: string, parentId: string | null) => {
    if (!user || !user.organizationId) {
        showToast(t('files.upload.noOrgLinked'), 'error');
        return;
    }
    setLoading(true);
    try {
        await fileService.uploadFile(user, {
            name: fileName,
            fileBlob: fileBlob,
            parentId: parentId,
            type: fileBlob.type.startsWith('image/') ? FileType.IMAGE : FileType.PDF,
            size: `${(fileBlob.size / 1024 / 1024).toFixed(2)} MB`,
            mimeType: fileBlob.type
        }, user.organizationId);
        showToast(t('files.upload.success'), 'success');
        await fetchFiles(true); // Recarrega a pasta atual
    } catch (err: any) {
        showToast(err.message, 'error');
    } finally {
        setLoading(false);
    }
  }, [user, showToast, t, fetchFiles]);

  const handleCreateFolder = useCallback(async (folderName: string, parentId: string | null) => {
    if (!user || !user.organizationId) {
      showToast(t('files.createFolder.noOrgLinked'), 'error');
      return;
    }
    setLoading(true);
    try {
      await fileService.createFolder(user, parentId, folderName, user.organizationId);
      showToast(t('files.createFolder.success'), 'success');
      await fetchFiles(true); // Recarrega a pasta atual
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [user, showToast, t, fetchFiles]);

  const handleDeleteFiles = useCallback(async (fileIds: string[]) => {
    if (!user || fileIds.length === 0) return;
    setLoading(true);
    try {
      // Fix: Passed fileIds as an array, matching the updated IFileService signature
      await fileService.deleteFile(user, fileIds);
      showToast(t('files.delete.success'), 'success');
      await fetchFiles(true);
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [user, showToast, t, fetchFiles]);

  const handleRenameFile = useCallback(async (fileId: string, newName: string) => {
    if (!user) return;
    setLoading(true);
    try {
      // Fix: Use fileService.renameFile which is now declared in IFileService
      await fileService.renameFile(user, fileId, newName);
      showToast(t('files.rename.success'), 'success');
      await fetchFiles(true);
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [user, showToast, t, fetchFiles]);

  useEffect(() => {
    fetchFiles(true);
  }, [activeFolderId, options.refreshKey, options.searchTerm, fetchFiles]);

  return {
    files, 
    loading, 
    hasMore, 
    breadcrumbs,
    handleNavigate, 
    fetchFiles,
    handleUploadFile,
    handleCreateFolder,
    handleDeleteFiles,
    handleRenameFile
  };
};