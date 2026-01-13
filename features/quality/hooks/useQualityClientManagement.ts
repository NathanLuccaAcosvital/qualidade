import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../../context/authContext.tsx';
import { useToast } from '../../../context/notificationContext.tsx';
import { useTranslation } from 'react-i18next';
import { ClientOrganization, User, UserRole } from '../../../types/index';
import { adminService, userService } from '../../../lib/services/index.ts';

const CLIENTS_PER_PAGE = 24;

export const useQualityClientManagement = (refreshTrigger: number) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { showToast } = useToast();

  // Client List State
  const [clients, setClients] = useState<ClientOrganization[]>([]);
  const [clientsPage, setClientsPage] = useState(1);
  const [hasMoreClients, setHasMoreClients] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const [clientStatus, setClientStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [totalClientsCount, setTotalClientsCount] = useState(0);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [isLoadingMoreClients, setIsLoadingMoreClients] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // For modal saves

  // Modals for User/Client management
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: UserRole.CLIENT,
    organizationId: '',
    department: '',
    status: 'ACTIVE',
  });
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientOrganization | null>(null);
  const [clientFormData, setClientFormData] = useState({
    name: '',
    cnpj: '',
    contractDate: '',
    status: 'ACTIVE',
    qualityAnalystId: '',
  });
  const [qualityAnalysts, setQualityAnalysts] = useState<User[]>([]);

  // Initial load of quality analysts and first page of clients
  useEffect(() => {
    const loadInitialData = async () => {
      if (!user) return;
      setIsLoadingClients(true);
      try {
        const [qAnalysts, clientsRes] = await Promise.all([
          userService.getUsersByRole(UserRole.QUALITY),
          adminService.getClients({ search: clientSearch, status: clientStatus }, 1, CLIENTS_PER_PAGE),
        ]);
        setQualityAnalysts(qAnalysts);
        setClients(clientsRes.items);
        setTotalClientsCount(clientsRes.total);
        setHasMoreClients(clientsRes.hasMore);
        setClientsPage(1);
      } catch (err: any) {
        console.error("[useQualityClientManagement] Erro ao carregar dados iniciais de clientes:", err.message);
        showToast(t('quality.errorLoadingClients', { message: err.message }), 'error');
        setClients([]);
        setTotalClientsCount(0);
        setHasMoreClients(false);
      } finally {
        setIsLoadingClients(false);
      }
    };

    const timer = setTimeout(loadInitialData, 300); // Debounce initial load
    return () => clearTimeout(timer);
  }, [user, clientSearch, clientStatus, refreshTrigger, showToast, t]);

  const handleLoadMoreClients = useCallback(async () => {
    if (isLoadingMoreClients || !hasMoreClients) return;

    setIsLoadingMoreClients(true);
    try {
      const nextPage = clientsPage + 1;
      const res = await adminService.getClients({ search: clientSearch, status: clientStatus }, nextPage, CLIENTS_PER_PAGE);
      setClients(prev => [...prev, ...res.items]);
      setHasMoreClients(res.hasMore);
      setClientsPage(nextPage);
    } catch (err: any) {
      console.error("[useQualityClientManagement] Erro ao carregar mais clientes:", err.message);
      showToast(t('quality.errorLoadingMoreClients', { message: err.message }), 'error');
    } finally {
      setIsLoadingMoreClients(false);
    }
  }, [user, clientsPage, hasMoreClients, clientSearch, clientStatus, showToast, t]);

  const openUserModal = useCallback((c?: ClientOrganization, u?: User) => {
    if (u) {
      setEditingUser(u);
      setUserFormData({ name: u.name, email: u.email, password: '', role: u.role, organizationId: u.organizationId || '', status: u.status || 'ACTIVE', department: u.department || '' });
    } else {
      setUserFormData({
        name: '',
        email: '',
        password: '',
        role: UserRole.CLIENT,
        organizationId: c?.id || '', // Link to selected client if provided
        status: 'ACTIVE',
        department: ''
      });
      setEditingUser(null);
    }
    setIsUserModalOpen(true);
  }, []);

  const handleSaveUser = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      if (!editingUser) {
        if (!userFormData.organizationId) {
          showToast("É necessário vincular o usuário a uma organização.", 'error');
          setIsProcessing(false);
          return;
        }
        await userService.signUp(userFormData.email, userFormData.password, userFormData.name, userFormData.organizationId, userFormData.department);
        showToast("Usuário cliente criado com sucesso!", 'success');
      } else {
        const userPayload: User = {
          id: editingUser.id, name: userFormData.name, email: userFormData.email, role: userFormData.role as UserRole,
          organizationId: (userFormData.role === UserRole.CLIENT && userFormData.organizationId) ? userFormData.organizationId : undefined,
          status: userFormData.status as any, department: userFormData.department, lastLogin: editingUser?.lastLogin || 'Nunca'
        };
        await userService.saveUser(userPayload);
        showToast("Usuário cliente atualizado com sucesso!", 'success');
      }
      setIsUserModalOpen(false);
      setEditingUser(null);
      // Trigger a refresh of the client list in ClientList view
      // This will cause a re-fetch in the useEffect above
      setClientsPage(1); // Reset page to 1 to refetch first page with new data
    } catch (err: any) {
      showToast(`Erro ao salvar usuário cliente: ${err.message}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  }, [editingUser, userFormData, showToast, t]);

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
        qualityAnalystId: user?.id || '', // Auto-assign current quality analyst
      });
      setEditingClient(null);
    }
    setIsClientModalOpen(true);
  }, [user]);

  const handleSaveClient = useCallback(async (e: React.FormEvent, confirmEmail?: string, confirmPassword?: string) => {
    e.preventDefault();
    if (!user) return;

    setIsProcessing(true);
    try {
      if (confirmEmail && confirmPassword) { // Only perform confirmation if credentials provided
        if (confirmEmail.toLowerCase() !== user.email.toLowerCase()) {
          showToast(t('quality.emailMismatchError'), 'error');
          setIsProcessing(false);
          return;
        }

        const authResult = await userService.authenticate(confirmEmail, confirmPassword);
        if (!authResult.success) {
          showToast(t('quality.invalidConfirmationCredentials'), 'error');
          setIsProcessing(false);
          return;
        }
      }

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
      setClientsPage(1); // Trigger refresh of client list
    } catch (err: any) {
      showToast(`Erro ao salvar empresa: ${err.message}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  }, [user, clientFormData, editingClient, qualityAnalysts, showToast, t]);

  // Memoized sorted clients for rendering
  const sortedClients = useMemo(() => {
    if (!clients) return [];
    return [...clients].sort((a, b) => {
      // Default sort by name, can add more options if needed
      return a.name.localeCompare(b.name);
    });
  }, [clients]);

  return {
    // Client List Data & Controls
    sortedClients,
    clientSearch,
    setClientSearch,
    clientStatus,
    setClientStatus,
    isLoadingClients,
    isLoadingMoreClients,
    hasMoreClients,
    handleLoadMoreClients,
    totalClientsCount,
    isProcessing,

    // User Modal
    isUserModalOpen,
    setIsUserModalOpen,
    editingUser,
    openUserModal,
    handleSaveUser,
    userFormData,
    setUserFormData,

    // Client Modal
    isClientModalOpen,
    setIsClientModalOpen,
    editingClient,
    openClientModal,
    handleSaveClient,
    clientFormData,
    setClientFormData,
    qualityAnalysts,
  };
};
