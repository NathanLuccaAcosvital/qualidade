import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../../context/authContext.tsx';
import { useToast } from '../../../context/notificationContext.tsx';
import { useTranslation } from 'react-i18next';
import { ClientOrganization, User, UserRole } from '../../../types/index';
import { adminService } from '../../../lib/services/index.ts';

interface UseAdminClientManagementProps {
  setIsSaving: React.Dispatch<React.SetStateAction<boolean>>;
  qualityAnalysts: User[]; // Pass quality analysts from AdminPage
}

export const useAdminClientManagement = ({ setIsSaving, qualityAnalysts }: UseAdminClientManagementProps) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [clientsList, setClientsList] = useState<ClientOrganization[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(true);

  // Filters and Search
  const [searchTerm, setSearchTerm] = useState('');

  // Client Modal State
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientOrganization | null>(null);
  const [clientFormData, setClientFormData] = useState({
    name: '',
    cnpj: '',
    contractDate: '',
    status: 'ACTIVE',
    qualityAnalystId: '',
  });

  const loadClients = useCallback(async () => {
    setIsLoadingClients(true);
    try {
      const clients = await adminService.getClients();
      setClientsList(clients.items);
    } catch (err: any) {
      console.error("[useAdminClientManagement] Erro ao carregar clientes:", err.message);
      showToast(`Erro ao carregar dados de clientes: ${err.message}`, 'error');
    } finally {
      setIsLoadingClients(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (user) {
      loadClients();
    }
  }, [user, loadClients]);

  const filteredClients = useMemo(() => {
    return clientsList.filter(c => {
      const term = searchTerm.toLowerCase();
      return (c.name || "").toLowerCase().includes(term) ||
        (c.cnpj || "").includes(term) ||
        (c.qualityAnalystName || "").toLowerCase().includes(term);
    });
  }, [clientsList, searchTerm]);

  const handleSaveClient = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    try {
      const selectedAnalyst = qualityAnalysts.find(qa => qa.id === clientFormData.qualityAnalystId);
      const clientPayload: Partial<ClientOrganization> = {
        id: editingClient?.id,
        name: clientFormData.name,
        cnpj: clientFormData.cnpj,
        contractDate: clientFormData.contractDate,
        status: clientFormData.status as any,
        qualityAnalystId: clientFormData.qualityAnalystId,
        qualityAnalystName: selectedAnalyst?.name,
      };
      await adminService.saveClient(user, clientPayload);
      showToast("Empresa salva com sucesso!", 'success');
      setIsClientModalOpen(false);
      setEditingClient(null);
      await loadClients(); // Reload data after save
    } catch (err: any) {
      showToast(`Erro ao salvar empresa: ${err.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  }, [user, clientFormData, editingClient, qualityAnalysts, showToast, setIsSaving, loadClients]);

  const openClientModal = useCallback((c?: ClientOrganization) => {
    if (c) {
      setEditingClient(c);
      setClientFormData({
        name: c.name,
        cnpj: c.cnpj,
        contractDate: c.contractDate,
        status: c.status,
        qualityAnalystId: c.qualityAnalystId || '',
      });
    } else {
      setClientFormData({
        name: '',
        cnpj: '',
        contractDate: new Date().toISOString().split('T')[0],
        status: 'ACTIVE',
        qualityAnalystId: '',
      });
      setEditingClient(null);
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