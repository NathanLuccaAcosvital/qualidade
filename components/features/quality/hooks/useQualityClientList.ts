
import { useState, useEffect, useCallback, useMemo } from 'react';
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
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset para primeira página ao buscar
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const loadData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const res = await qualityService.getManagedClients(
        user.id, 
        { search: debouncedSearch, status: statusFilter }, 
        page,
        // Nota: O serviço precisa ser atualizado para aceitar pageSize se possível, 
        // caso contrário ele usa o default de 20.
      );
      setClients(res.items || []);
      setTotalItems(res.total || 0);
    } catch (err: any) {
      showToast(t('quality.errorLoadingClients', { message: err.message }), 'error');
    } finally {
      setIsLoading(false);
    }
  }, [user, debouncedSearch, statusFilter, page, t, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData, refreshTrigger, pageSize]);

  return {
    clients,
    totalItems,
    page,
    setPage,
    pageSize,
    setPageSize,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    isLoading,
    refresh: loadData
  };
};
