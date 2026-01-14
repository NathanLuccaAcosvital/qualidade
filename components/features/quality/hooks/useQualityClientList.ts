
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../../../context/authContext.tsx';
import { useToast } from '../../../../context/notificationContext.tsx';
import { useTranslation } from 'react-i18next';
import { ClientOrganization } from '../../../../types/index.ts';
import { adminService } from '../../../../lib/services/index.ts';

const CLIENTS_PER_PAGE = 24;

/**
 * Hook Especializado: Consulta e Listagem de Clientes
 */
export const useQualityClientList = (refreshTrigger: number) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [clients, setClients] = useState<ClientOrganization[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const loadInitial = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const res = await adminService.getClients({ search, status: statusFilter }, 1, CLIENTS_PER_PAGE);
      setClients(res.items || []);
      setHasMore(res.hasMore || false);
      setPage(1);
    } catch (err: any) {
      showToast(t('quality.errorLoadingClients', { message: err.message }), 'error');
    } finally {
      setIsLoading(false);
    }
  }, [user, search, statusFilter, t, showToast]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await adminService.getClients({ search, status: statusFilter }, nextPage, CLIENTS_PER_PAGE);
      setClients(prev => [...prev, ...(res.items || [])]);
      setHasMore(res.hasMore || false);
      setPage(nextPage);
    } catch (err: any) {
      showToast(t('quality.errorLoadingMoreClients', { message: err.message }), 'error');
    } finally {
      setIsLoadingMore(false);
    }
  }, [page, hasMore, search, statusFilter, t, showToast, isLoadingMore]);

  useEffect(() => {
    const timer = setTimeout(loadInitial, 300);
    return () => clearTimeout(timer);
  }, [loadInitial, refreshTrigger]);

  const sortedClients = useMemo(() => {
    if (!clients) return [];
    return [...clients].sort((a, b) => {
        const nameA = a.name || '';
        const nameB = b.name || '';
        return nameA.localeCompare(nameB);
    });
  }, [clients]);

  return {
    clients: sortedClients,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    refresh: loadInitial
  };
};
