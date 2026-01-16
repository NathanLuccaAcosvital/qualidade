import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../../../context/authContext.tsx';
import { fileService } from '../../../../lib/services/index.ts';
import { useToast } from '../../../../context/notificationContext.tsx';
import { useTranslation } from 'react-i18next';
import { FileNode, BreadcrumbItem, UserRole, FileType } from '../../../../types/index.ts';

interface FileExplorerOptions {
  currentFolderId: string | null;
  refreshKey?: number;
  searchTerm: string;
  viewMode: 'grid' | 'list';
  ownerId?: string | null;
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

export const useFileExplorer = (options: FileExplorerOptions): UseFileExplorerReturn => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { showToast } = useToast();
  
  const [files, setFiles] = useState<FileNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);

  const fetchIdRef = useRef(0);
  const activeFolderId = options.currentFolderId; 

  const fetchFiles = useCallback(async (resetPage = false) => {
    if (!user) return;
    const currentPage = resetPage ? 1 : page;
    const currentFetchId = ++fetchIdRef.current;
    
    setLoading(true);
    if (resetPage) setFiles([]); 

    try {
      const [fileResult, breadcrumbResult] = await Promise.all([
        fileService.getFiles(user, activeFolderId, currentPage, 100, options.searchTerm),
        fileService.getBreadcrumbs(user, activeFolderId)
      ]);
      
      if (currentFetchId !== fetchIdRef.current) return;

      let items = fileResult.items;
      
      if (options.ownerId && options.ownerId !== 'global') {
          items = items.filter(f => f.ownerId === options.ownerId);
      }

      setFiles(prev => resetPage ? items : [...prev, ...items]);
      setHasMore(fileResult.hasMore);
      setPage(currentPage);
      setBreadcrumbs(breadcrumbResult);
    } catch (err: unknown) {
      if (currentFetchId === fetchIdRef.current) {
        console.error("[useFileExplorer] Failure:", err);
        showToast(t('files.errorLoadingFiles'), 'error');
      }
    } finally {
      if (currentFetchId === fetchIdRef.current) {
        setLoading(false);
      }
    }
  }, [user, page, activeFolderId, options.searchTerm, options.ownerId, showToast, t]);

  const handleNavigate = useCallback((folderId: string | null) => {
    setPage(1); 
    setHasMore(true);
  }, []);

  const handleUploadFile = useCallback(async (fileBlob: File, fileName: string, parentId: string | null) => {
    // Define o owner alvo baseado na pasta atual ou contexto da página
    const targetOwnerId = options.ownerId && options.ownerId !== 'global' ? options.ownerId : user?.organizationId;

    if (!user || !targetOwnerId) {
        showToast(t('files.upload.noOrgLinked'), 'error');
        return;
    }
    setLoading(true);
    try {
        await fileService.uploadFile(user, {
            name: fileName,
            fileBlob: fileBlob,
            parentId: parentId, // Garante que o arquivo seja salvo na pasta de destino onde o usuário clicou
            type: fileBlob.type.startsWith('image/') ? FileType.IMAGE : FileType.PDF,
            size: `${(fileBlob.size / 1024 / 1024).toFixed(2)} MB`,
            mimeType: fileBlob.type
        }, targetOwnerId);
        showToast(t('files.upload.success'), 'success');
        // Força o recarregamento da pasta atual para mostrar o novo arquivo
        await fetchFiles(true);
    } catch (err: any) {
        showToast(err.message || t('files.errorLoadingFiles'), 'error');
    } finally {
        setLoading(false);
    }
  }, [user, options.ownerId, showToast, t, fetchFiles]);

  const handleCreateFolder = useCallback(async (folderName: string, parentId: string | null) => {
    const targetOwnerId = options.ownerId && options.ownerId !== 'global' ? options.ownerId : user?.organizationId;

    if (!user || !targetOwnerId) {
      showToast(t('files.createFolder.noOrgLinked'), 'error');
      return;
    }
    setLoading(true);
    try {
      await fileService.createFolder(user, parentId, folderName, targetOwnerId);
      showToast(t('files.createFolder.success'), 'success');
      await fetchFiles(true);
    } catch (err: any) {
      showToast(err.message || t('files.errorLoadingFiles'), 'error');
    } finally {
      setLoading(false);
    }
  }, [user, options.ownerId, showToast, t, fetchFiles]);

  const handleDeleteFiles = useCallback(async (fileIds: string[]) => {
    if (!user || fileIds.length === 0) return;
    setLoading(true);
    try {
      await fileService.deleteFile(user, fileIds);
      showToast(t('files.delete.success'), 'success');
      await fetchFiles(true);
    } catch (err: any) {
      showToast(err.message || t('files.errorLoadingFiles'), 'error');
    } finally {
      setLoading(false);
    }
  }, [user, showToast, t, fetchFiles]);

  const handleRenameFile = useCallback(async (fileId: string, newName: string) => {
    if (!user) return;
    setLoading(true);
    try {
      await fileService.renameFile(user, fileId, newName);
      showToast(t('files.rename.success'), 'success');
      await fetchFiles(true);
    } catch (err: any) {
      showToast(err.message || t('files.errorLoadingFiles'), 'error');
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