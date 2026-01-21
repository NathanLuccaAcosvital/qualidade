
import { useQualityClientList } from './useQualityClientList.ts';
import { useQualityClientActions } from './useQualityClientActions.ts';
import { ClientOrganization, User, UserRole, AccountStatus } from '../../../../types/index.ts';

/**
 * useQualityClientManagement (Facade)
 * Encapsula a complexidade de listagem, paginação, filtros e modais de gestão.
 */
export const useQualityClientManagement = (refreshTrigger: number) => {
  const list = useQualityClientList(refreshTrigger);
  const actions = useQualityClientActions(list.refresh);

  const openUserModal = (c?: ClientOrganization, u?: User) => {
    actions.setUserModal({
      isOpen: true,
      editing: u || null,
      data: u 
        ? { 
            name: u.name, 
            email: u.email, 
            password: '', 
            role: u.role, 
            organizationId: u.organizationId || '', 
            status: u.status, 
            department: u.department || '' 
          } 
        : { 
            name: '', 
            email: '', 
            password: '', 
            role: UserRole.CLIENT, 
            organizationId: c?.id || '', 
            department: '', 
            status: AccountStatus.ACTIVE 
          }
    });
  };

  const openClientModal = (c?: ClientOrganization) => {
    actions.setClientModal({
      isOpen: true,
      editing: c || null,
      data: c 
        ? { 
            name: c.name, 
            cnpj: c.cnpj, 
            contractDate: c.contractDate, 
            status: c.status, 
            qualityAnalystId: c.qualityAnalystId || '' 
          }
        : { 
            name: '', 
            cnpj: '', 
            contractDate: new Date().toISOString().split('T')[0], 
            status: AccountStatus.ACTIVE, 
            qualityAnalystId: '' 
          }
    });
  };

  return {
    sortedClients: list.clients,
    clientSearch: list.search,
    setClientSearch: list.setSearch,
    clientStatus: list.statusFilter,
    setClientStatus: list.setStatusFilter,
    isLoadingClients: list.isLoading,
    
    // Paginação
    page: list.page,
    setPage: list.setPage,
    pageSize: list.pageSize,
    setPageSize: list.setPageSize,
    totalItems: list.totalItems,
    
    isProcessing: actions.isProcessing,
    qualityAnalysts: actions.qualityAnalysts,

    userModal: {
      isOpen: actions.userModal.isOpen,
      setOpen: (open: boolean) => actions.setUserModal(p => ({ ...p, isOpen: open })),
      editing: actions.userModal.editing,
      data: actions.userModal.data,
      setData: (data: any) => actions.setUserModal(p => ({ ...p, data })),
      open: openUserModal,
      save: actions.handleSaveUser
    },

    clientModal: {
      isOpen: actions.clientModal.isOpen,
      setOpen: (open: boolean) => actions.setClientModal(p => ({ ...p, isOpen: open })),
      editing: actions.clientModal.editing,
      data: actions.clientModal.data,
      setData: (data: any) => actions.setClientModal(p => ({ ...p, data })),
      open: openClientModal,
      save: actions.handleSaveClient,
      flagDeletion: actions.handleFlagClientDeletion
    }
  };
};
