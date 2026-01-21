
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useAuth } from '../../../../context/authContext.tsx';
import { fileService } from '../../../../lib/services/index.ts';
import { useToast } from '../../../../context/notificationContext.tsx';
import { useTranslation } from 'react-i18next';
import { FileNode, BreadcrumbItem, UserRole } from '../../../../types/index.ts';
import { SupabaseFileService } from '../../../../lib/services/supabaseFileService.ts';

interface FileCollectionOptions {
  currentFolderId: string | null;
  searchTerm: string;
  ownerId?: string | null;
}

export const useFileCollection = (options: FileCollectionOptions) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { showToast } = useToast();
  
  const [files, setFiles] = useState<FileNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [debouncedSearch, setDebouncedSearch] = useState(options.searchTerm);

  const fetchIdRef = useRef(0);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(options.searchTerm);
      setPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [options.searchTerm]);

  const fetchFiles = useCallback(async () => {
    if (!user) return;
    const currentFetchId = ++fetchIdRef.current;

    setLoading(true);
    try {
      let result;
      if (user.role !== UserRole.CLIENT && options.ownerId && options.ownerId !== 'global') {
        result = await SupabaseFileService.getRawFiles(options.currentFolderId, page, pageSize, debouncedSearch, options.ownerId);
      } else {
        result = await fileService.getFiles(user, options.currentFolderId, page, pageSize, debouncedSearch);
      }

      const crumbs = await fileService.getBreadcrumbs(user, options.currentFolderId);

      if (currentFetchId !== fetchIdRef.current) return;

      setFiles(result.items || []);
      setTotalItems(result.total || 0);
      setBreadcrumbs(crumbs);
    } catch (err: any) {
      if (currentFetchId === fetchIdRef.current) {
        showToast(t('files.errorLoadingFiles'), 'error');
      }
    } finally {
      if (currentFetchId === fetchIdRef.current) setLoading(false);
    }
  }, [user, options.currentFolderId, debouncedSearch, options.ownerId, page, pageSize, showToast, t]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  return { 
    files, 
    loading, 
    totalItems, 
    page, 
    setPage, 
    pageSize, 
    setPageSize, 
    breadcrumbs, 
    fetchFiles 
  };
};
