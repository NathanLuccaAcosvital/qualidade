import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../../../context/authContext.tsx';
import { fileService } from '../../../../lib/services/index.ts';
import { useToast } from '../../../../context/notificationContext.tsx';
import { useTranslation } from 'react-i18next';
import { FileNode, BreadcrumbItem, UserRole, FileType } from '../../../../types/index.ts';
import { SupabaseFileService } from '../../../../lib/services/supabaseFileService.ts';

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

/**
 * useFileExplorer (Power Hook)
 * Centraliza toda a orquestração de arquivos para qualquer perfil de usuário.
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

  const fetchIdRef = useRef(0);
  const activeFolderId = options.currentFolderId; 

  const fetchFiles = useCallback(async (resetPage = false) => {
    if (!user) return;
    const currentPage = resetPage ? 1 : page;
    const currentFetchId = ++fetchIdRef.current;
    
    setLoading(true);
    if (resetPage) setFiles([]); 

    try {
      let fileResult;
      
      // Decisão de contexto: Qualidade (Global/Específico) ou Cliente
      if (user.role !== UserRole.CLIENT && options.ownerId && options.ownerId !== 'global') {
          fileResult = await SupabaseFileService.getRawFiles(activeFolderId, currentPage, 100, options.searchTerm, options.ownerId);
      } else {
          fileResult = await fileService.getFiles(user, activeFolderId, currentPage, 100, options.searchTerm);
      }

      const breadcrumbResult = await fileService.getBreadcrumbs(user, activeFolderId);
      
      if (currentFetchId !== fetchIdRef.current) return;

      const items = fileResult.items;
      setFiles(prev => resetPage ? items : [...prev, ...items]);
      setHasMore(fileResult.hasMore);
      setPage(currentPage);
      setBreadcrumbs(breadcrumbResult);
    } catch (err: any) {
      if (currentFetchId === fetchIdRef.current) {
        console.error("[useFileExplorer] Sync Failure:", err.message);
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
    const targetOwnerId = (options.ownerId && options.ownerId !== 'global') 
      ? options.ownerId 
      : (user?.role === UserRole.CLIENT ? user.organizationId : null);

    if (!user || !targetOwnerId) {
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
        }, targetOwnerId);
        
        showToast(t('files.upload.success'), 'success');
        await fetchFiles(true);
    } catch (err: any) {
        showToast(err.message, 'error');
    } finally {
        setLoading(false);
    }
  }, [user, options.ownerId, showToast, t, fetchFiles]);

  const handleCreateFolder = useCallback(async (folderName: string, parentId: string | null) => {
    const targetOwnerId = options.ownerId && options.ownerId !== 'global' ? options.ownerId : user?.organizationId;
    
    if (!user || (!targetOwnerId && user.role === UserRole.CLIENT)) {
        showToast(t('files.createFolder.noOrgLinked'), "error");
        return;
    }

    setLoading(true);
    try {
      await fileService.createFolder(user, parentId, folderName, targetOwnerId || undefined);
      showToast(t('files.createFolder.success'), 'success');
      await fetchFiles(true);
    } catch (err: any) {
      showToast(err.message, 'error');
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
      showToast(err.message, 'error');
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
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [user, showToast, t, fetchFiles]);

  useEffect(() => {
    const timer = setTimeout(() => {
        fetchFiles(true);
    }, 150); // Debounce de segurança
    return () => clearTimeout(timer);
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