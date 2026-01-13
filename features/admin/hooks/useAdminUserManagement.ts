import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../../context/authContext.tsx';
import { useToast } from '../../../context/notificationContext.tsx';
import { useTranslation } from 'react-i18next';
import { User, UserRole, ClientOrganization } from '../../../types/index';
import { userService, adminService } from '../../../lib/services/index.ts';

interface UseAdminUserManagementProps {
  setIsSaving: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useAdminUserManagement = ({ setIsSaving }: UseAdminUserManagementProps) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [usersList, setUsersList] = useState<User[]>([]);
  const [clientsList, setClientsList] = useState<ClientOrganization[]>([]); // To link users to organizations
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  // Filters and Search
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'BLOCKED'>('ALL');

  // User Modal State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: UserRole.CLIENT,
    organizationId: '',
    department: '',
    status: 'ACTIVE',
  });

  const loadUsersAndClients = useCallback(async () => {
    setIsLoadingUsers(true);
    try {
      const [users, clients] = await Promise.all([
        userService.getUsers(),
        adminService.getClients(),
      ]);
      setUsersList(users);
      setClientsList(clients.items);
    } catch (err: any) {
      console.error("[useAdminUserManagement] Erro ao carregar usuários e clientes:", err.message);
      showToast(`Erro ao carregar dados de usuários: ${err.message}`, 'error');
    } finally {
      setIsLoadingUsers(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (user) {
      loadUsersAndClients();
    }
  }, [user, loadUsersAndClients]);

  const filteredUsers = useMemo(() => {
    if (!usersList) return [];
    return usersList.filter(u => {
      const matchesSearch = (u.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || (u.email || "").toLowerCase().includes(searchTerm.toLowerCase()) || (u.organizationName || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
      const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [usersList, searchTerm, roleFilter, statusFilter]);

  const handleSaveUser = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (!editingUser) {
        await userService.signUp(formData.email, formData.password, formData.name, formData.organizationId || undefined, formData.department);
        showToast("Usuário criado com sucesso!", 'success');
      } else {
        const userPayload: User = {
          id: editingUser.id, name: formData.name, email: formData.email, role: formData.role as UserRole,
          organizationId: (formData.role === UserRole.CLIENT && formData.organizationId) ? formData.organizationId : undefined,
          status: formData.status as any, department: formData.department, lastLogin: editingUser?.lastLogin || 'Nunca'
        };
        await userService.saveUser(userPayload);
        showToast("Usuário atualizado com sucesso!", 'success');
      }
      setIsUserModalOpen(false);
      setEditingUser(null);
      setSearchTerm('');
      await loadUsersAndClients(); // Reload data after save
    } catch (err: any) {
      showToast(`Erro ao salvar usuário: ${err.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  }, [editingUser, formData, user, showToast, setIsSaving, loadUsersAndClients]);

  const openUserModal = useCallback((u?: User) => {
    if (u) {
      setEditingUser(u);
      setFormData({ name: u.name, email: u.email, password: '', role: u.role, organizationId: u.organizationId || '', status: u.status || 'ACTIVE', department: u.department || '' });
    } else {
      setFormData({ name: '', email: '', password: '', role: UserRole.CLIENT, organizationId: '', status: 'ACTIVE', department: '' });
      setEditingUser(null);
    }
    setIsUserModalOpen(true);
  }, []);

  return {
    filteredUsers,
    isLoadingUsers,
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    isUserModalOpen,
    setIsUserModalOpen,
    editingUser,
    openUserModal,
    handleSaveUser,
    formData,
    setFormData,
    clientsList, // Pass clients list for organization linking in the modal
  };
};