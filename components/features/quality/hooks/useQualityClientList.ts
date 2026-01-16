
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../../context/authContext.tsx';
import { useToast } from '../../../../context/notificationContext.tsx';
import { useTranslation } from 'react-i18next';
import { ClientOrganization } from '../../../../types/index.ts';
import { qualityService } from '../../../../lib/services/index.ts';

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
      const res = await qualityService.getManagedClients(user.id, { search, status: statusFilter }, 1);
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
    if (!user || isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await qualityService.getManagedClients(user.id, { search, status: statusFilter }, nextPage);
      setClients(prev => [...prev, ...(res.items || [])]);
      setHasMore(res.hasMore || false);
      setPage(nextPage);
    } catch (err: any) {
      showToast(t('quality.errorLoadingClients', { message: err.message }), 'error');
    } finally {
      setIsLoadingMore(false);
    }
  }, [user, search, statusFilter, page, isLoadingMore, hasMore, t, showToast]);

  useEffect(() => {
    const timer = setTimeout(loadInitial, 300);
    return () => clearTimeout(timer);
  }, [loadInitial, refreshTrigger]);

  return {
    clients,
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
