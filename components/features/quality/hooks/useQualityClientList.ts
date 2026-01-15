

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../../../context/authContext.tsx';
import { useToast } from '../../../../context/notificationContext.tsx';
import { useTranslation } from 'react-i18next';
import { ClientOrganization } from '../../../../types/index.ts';
import { adminService } from '../../../../lib/services/index.ts';
import { AccountStatus } from '../../../../types/auth.ts'; // Importar AccountStatus

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
  const [statusFilter, setStatusFilter] = useState<'ALL' | AccountStatus>('ALL'); // Atualizado
  const [sortKey, setSortKey] = useState<'NAME' | 'PENDING' | 'NEWEST' | 'LAST_ANALYSIS'>('NAME');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const loadInitial = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const statusParam = statusFilter === 'ALL' ? undefined : statusFilter;
      const res = await adminService.getClients({ search, status: statusParam }, 1, CLIENTS_PER_PAGE);
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
      const statusParam = statusFilter === 'ALL' ? undefined : statusFilter;
      const res = await adminService.getClients({ search, status: statusParam }, nextPage, CLIENTS_PER_PAGE);
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
      // Ordenar por nome (padrão)
      const nameA = a.name || '';
      const nameB = b.name || '';

      switch (sortKey) {
        case 'PENDING':
          // Ordenar por mais pendências (decrescente)
          return (b.pendingDocs || 0) - (a.pendingDocs || 0);
        case 'LAST_ANALYSIS':
          // Ordenar por última análise (mais recente primeiro)
          const dateA = a.lastAnalysisDate ? new Date(a.lastAnalysisDate).getTime() : 0;
          const dateB = b.lastAnalysisDate ? new Date(b.lastAnalysisDate).getTime() : 0;
          return dateB - dateA;
        case 'NEWEST':
          // Ordenar por data de contrato (mais recente primeiro)
          const contractA = new Date(a.contractDate).getTime();
          const contractB = new Date(b.contractDate).getTime();
          return contractB - contractA;
        case 'NAME':
        default:
          return nameA.localeCompare(nameB);
      }
    });
  }, [clients, sortKey]); // Adicionar sortKey como dependência

  return {
    clients: sortedClients,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    sortKey, // Expor sortKey
    setSortKey, // Expor setSortKey
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    refresh: loadInitial
  };
};