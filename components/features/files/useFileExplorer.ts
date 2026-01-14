
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/authContext.tsx';
import { fileService } from '../../../lib/services/index.ts';
import { useToast } from '../../../context/notificationContext.tsx';
import { useTranslation } from 'react-i18next';
import { FileNode } from '../../../types/index.ts';

interface FileExplorerOptions {
  currentFolderId?: string | null;
  initialFolderId?: string | null;
  refreshKey?: number;
  onNavigate?: (folderId: string | null) => void;
}

interface UseFileExplorerReturn {
  files: FileNode[];
  loading: boolean;
  hasMore: boolean;
  activeFolderId: string | null;
  handleNavigate: (folderId: string | null) => void;
  fetchFiles: (resetPage?: boolean) => Promise<void>;
}

/**
 * Hook de Exploração de Arquivos (SRP)
 * Gerencia o estado da navegação, carregamento e paginação.
 */
export const useFileExplorer = (options: FileExplorerOptions): UseFileExplorerReturn => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { showToast } = useToast();
  
  const [files, setFiles] = useState<FileNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [internalFolderId, setInternalFolderId] = useState<string | null>(options.initialFolderId || null);

  const activeFolderId = options.currentFolderId !== undefined ? options.currentFolderId : internalFolderId;

  const fetchFiles = useCallback(async (resetPage = false) => {
    if (!user) return;
    const currentPage = resetPage ? 1 : page;
    setLoading(true);

    try {
      const result = await fileService.getFiles(user, activeFolderId, currentPage, 100);
      setFiles(prev => resetPage ? result.items : [...prev, ...result.items]);
      setHasMore(result.hasMore);
      setPage(currentPage);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("[useFileExplorer] Failure:", message);
      showToast(t('files.errorLoadingFiles'), 'error');
    } finally {
      setLoading(false);
    }
  }, [user, page, activeFolderId, showToast, t]);

  const handleNavigate = useCallback((folderId: string | null) => {
    setPage(1);
    if (options.onNavigate) {
      options.onNavigate(folderId);
    } else {
      setInternalFolderId(folderId);
    }
  }, [options]);

  useEffect(() => {
    fetchFiles(true);
  }, [activeFolderId, options.refreshKey, fetchFiles]);

  return {
    files, 
    loading, 
    hasMore, 
    activeFolderId, 
    handleNavigate, 
    fetchFiles
  };
};
