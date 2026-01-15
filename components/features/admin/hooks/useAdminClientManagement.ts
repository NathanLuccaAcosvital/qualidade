
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../../../context/authContext.tsx';
import { useToast } from '../../../../context/notificationContext.tsx';
import { ClientOrganization, User, AccountStatus } from '../../../../types/index.ts';
import { adminService } from '../../../../lib/services/index.ts';
import { ClientFormData } from '../components/AdminModals.tsx';

interface UseAdminClientProps {
  setIsSaving: (state: boolean) => void;
  qualityAnalysts: User[];
}

/**
 * Hook de Gestão de Clientes (Clean Code)
 */
export const useAdminClientManagement = ({ setIsSaving, qualityAnalysts }: UseAdminClientProps) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [clientsList, setClientsList] = useState<ClientOrganization[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientOrganization | null>(null);
  
  // Fix: Initialize status with enum value instead of string literal
  const [clientFormData, setClientFormData] = useState<ClientFormData>({
    name: '',
    cnpj: '',
    contractDate: '',
    status: AccountStatus.ACTIVE,
    qualityAnalystId: '',
  });

  const loadClients = useCallback(async () => {
    setIsLoadingClients(true);
    try {
      const response = await adminService.getClients();
      setClientsList(response.items);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao carregar portfólio';
      showToast(msg, 'error');
    } finally {
      setIsLoadingClients(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (user) loadClients();
  }, [user, loadClients]);

  const filteredClients = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return clientsList.filter(c => 
      c.name.toLowerCase().includes(term) || 
      c.cnpj.includes(term) ||
      (c.qualityAnalystName?.toLowerCase().includes(term))
    );
  }, [clientsList, searchTerm]);

  const handleSaveClient = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    try {
      const analyst = qualityAnalysts.find(qa => qa.id === clientFormData.qualityAnalystId);
      
      // Fix: Ensured payload status is compatible with ClientOrganization.status
      const payload: Partial<ClientOrganization> = {
        ...clientFormData,
        id: editingClient?.id,
        qualityAnalystName: analyst?.name,
      };

      await adminService.saveClient(user, payload);
      showToast(`Empresa ${editingClient ? 'atualizada' : 'registrada'} com sucesso!`, 'success');
      setIsClientModalOpen(false);
      await loadClients();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha na persistência';
      showToast(msg, 'error');
    } finally {
      setIsSaving(false);
    }
  }, [user, clientFormData, editingClient, qualityAnalysts, showToast, setIsSaving, loadClients]);

  const openClientModal = useCallback((client?: ClientOrganization) => {
    if (client) {
      setEditingClient(client);
      setClientFormData({
        name: client.name,
        cnpj: client.cnpj,
        contractDate: client.contractDate,
        status: client.status,
        qualityAnalystId: client.qualityAnalystId || '',
      });
    } else {
      setEditingClient(null);
      setClientFormData({
        name: '',
        cnpj: '',
        contractDate: new Date().toISOString().split('T')[0],
        status: AccountStatus.ACTIVE,
        qualityAnalystId: '',
      });
    }
    setIsClientModalOpen(true);
  }, []);

  return {
    filteredClients,
    isLoadingClients,
    searchTerm,
    setSearchTerm,
    isClientModalOpen,
    setIsClientModalOpen,
    editingClient,
    openClientModal,
    handleSaveClient,
    clientFormData,
    setClientFormData,
  };
};
