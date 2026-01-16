
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../../../context/authContext.tsx';
import { useToast } from '../../../../context/notificationContext.tsx';
import { User, UserRole, ClientOrganization, AccountStatus, normalizeRole } from '../../../../types/index.ts';
import { userService, adminService } from '../../../../lib/services/index.ts';
import { UserFormData } from '../components/AdminModals.tsx';

interface UseAdminUserProps {
  setIsSaving: (state: boolean) => void;
  isSavingGlobal: boolean;
  restrictedToRole?: UserRole;
}

export const useAdminUserManagement = ({ setIsSaving, isSavingGlobal, restrictedToRole }: UseAdminUserProps) => {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();

  const [usersList, setUsersList] = useState<User[]>([]);
  const [clientsList, setClientsList] = useState<ClientOrganization[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>(restrictedToRole || 'ALL');
  const [viewMode, setViewMode] = useState<'ACTIVE' | 'ARCHIVED'>('ACTIVE');
  
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    role: restrictedToRole || UserRole.CLIENT,
    organizationId: '',
    department: 'CLIENT_INTERNAL',
    status: AccountStatus.ACTIVE,
  });

  const loadData = useCallback(async () => {
    if (!currentUser) return;
    setIsLoadingUsers(true);
    try {
      const [users, clients] = await Promise.all([
        userService.getUsers(),
        adminService.getClients({ status: 'ACTIVE' }, 1, 1000),
      ]);
      
      setUsersList(users);
      setClientsList(clients.items);
    } catch (err: any) {
      console.error("[Data Sync Error]", err);
      showToast("Falha na comunicação com a base de dados.", 'error');
    } finally {
      setIsLoadingUsers(false);
    }
  }, [currentUser, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredUsers = useMemo(() => {
    const search = searchTerm.toLowerCase();

    return usersList.filter(u => {
      const isArchived = u.department === 'PENDING_DELETION';
      if (viewMode === 'ACTIVE' && isArchived) return false;
      if (viewMode === 'ARCHIVED' && !isArchived) return false;

      const uRole = normalizeRole(u.role);
      const targetRole = restrictedToRole || roleFilter;
      const matchesRole = targetRole === 'ALL' || uRole === normalizeRole(targetRole);
      if (!matchesRole) return false;

      const matchesSearch = 
        u.name.toLowerCase().includes(search) || 
        u.email.toLowerCase().includes(search);
        
      return matchesSearch;
    });
  }, [usersList, searchTerm, roleFilter, viewMode, restrictedToRole]);

  const handleSaveUser = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSavingGlobal) return;

    setIsSaving(true);
    try {
      const targetOrgId = (formData.organizationId && formData.organizationId.trim() !== "") 
        ? formData.organizationId 
        : undefined;

      if (!editingUser) {
        await userService.signUp(
          formData.email, 
          formData.password || '', 
          formData.name, 
          targetOrgId,
          formData.department,
          formData.role
        );
        showToast("Novo parceiro credenciado com sucesso!", 'success');
      } else {
        await userService.saveUser({ 
          ...editingUser, 
          ...formData,
          organizationId: targetOrgId 
        } as User);
        showToast("Perfil de acesso atualizado.", 'success');
      }
      setIsUserModalOpen(false);
      await loadData();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  }, [editingUser, formData, showToast, setIsSaving, loadData, isSavingGlobal]);

  const handleFlagDeletion = useCallback(async (userId: string) => {
    if (!currentUser || isSavingGlobal) return;
    setIsSaving(true);
    try {
        await userService.flagUserForDeletion(userId, currentUser);
        showToast("Usuário sinalizado para auditoria de exclusão.", 'info');
        setIsUserModalOpen(false);
        await loadData();
    } catch (err: any) {
        showToast(err.message, 'error');
    } finally {
        setIsSaving(false);
    }
  }, [currentUser, setIsSaving, showToast, loadData, isSavingGlobal]);

  const openUserModal = useCallback((target?: User) => {
    if (target) {
      setEditingUser(target);
      setFormData({
        name: target.name,
        email: target.email,
        password: '',
        role: target.role,
        organizationId: target.organizationId || '',
        status: target.status,
        department: target.department || 'CLIENT_INTERNAL'
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '', email: '', password: '', 
        role: restrictedToRole || UserRole.CLIENT, 
        organizationId: '', 
        status: AccountStatus.ACTIVE, department: 'CLIENT_INTERNAL'
      });
    }
    setIsUserModalOpen(true);
  }, [restrictedToRole]);

  return {
    filteredUsers,
    isLoadingUsers,
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    viewMode,
    setViewMode,
    isUserModalOpen,
    setIsUserModalOpen,
    editingUser,
    openUserModal,
    handleSaveUser,
    handleFlagDeletion,
    formData,
    setFormData,
    clientsList: clientsList
  };
};
