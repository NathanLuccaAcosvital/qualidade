
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../../../context/authContext.tsx';
import { useToast } from '../../../../context/notificationContext.tsx';
import { User, UserRole, ClientOrganization, AccountStatus } from '../../../../types/index';
import { userService, adminService } from '../../../../lib/services/index.ts';
import { UserFormData } from '../components/AdminModals.tsx';

interface UseAdminUserProps {
  setIsSaving: (state: boolean) => void;
}

/**
 * Hook de Gestão de Identidades (DIP)
 */
export const useAdminUserManagement = ({ setIsSaving }: UseAdminUserProps) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [usersList, setUsersList] = useState<User[]>([]);
  const [clientsList, setClientsList] = useState<ClientOrganization[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL');
  
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    role: UserRole.QUALITY,
    organizationId: '',
    department: '',
    status: AccountStatus.ACTIVE,
  });

  const loadData = useCallback(async () => {
    setIsLoadingUsers(true);
    try {
      const [users, clients] = await Promise.all([
        userService.getUsers(),
        adminService.getClients(),
      ]);
      setUsersList(users);
      setClientsList(clients.items);
    } catch (err: unknown) {
      showToast("Erro ao sincronizar base de usuários.", 'error');
    } finally {
      setIsLoadingUsers(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (user) loadData();
  }, [user, loadData]);

  const filteredUsers = useMemo(() => {
    const search = searchTerm.toLowerCase();
    return usersList.filter(u => {
      const matchesSearch = 
        u.name.toLowerCase().includes(search) || 
        u.email.toLowerCase().includes(search);
        
      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [usersList, searchTerm, roleFilter]);

  const handleSaveUser = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (!editingUser) {
        await userService.signUp(
          formData.email, 
          formData.password || '', 
          formData.name, 
          formData.organizationId || undefined, 
          formData.department
        );
        showToast("Novo acesso configurado com sucesso!", 'success');
      } else {
        const payload: User = {
          ...editingUser,
          name: formData.name,
          email: formData.email,
          role: formData.role,
          organizationId: formData.organizationId || undefined,
          status: formData.status,
          department: formData.department
        };
        await userService.saveUser(payload);
        showToast("Perfil de usuário atualizado.", 'success');
      }
      setIsUserModalOpen(false);
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao salvar usuário';
      showToast(msg, 'error');
    } finally {
      setIsSaving(false);
    }
  }, [editingUser, formData, showToast, setIsSaving, loadData]);

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
        department: target.department || ''
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '', email: '', password: '', 
        role: UserRole.QUALITY, organizationId: '', 
        status: AccountStatus.ACTIVE, department: ''
      });
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
    isUserModalOpen,
    setIsUserModalOpen,
    editingUser,
    openUserModal,
    handleSaveUser,
    formData,
    setFormData,
    clientsList,
  };
};
