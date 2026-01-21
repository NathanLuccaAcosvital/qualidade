
import React, { useState, useCallback } from 'react';
import { useAuth } from '../../../../context/authContext.tsx';
import { useToast } from '../../../../context/notificationContext.tsx';
import { User, UserRole, AccountStatus } from '../../../../types/index.ts';
import { userService } from '../../../../lib/services/index.ts';
import { UserFormData } from '../components/AdminModals.tsx';

export const useUserFormState = (onSuccess: () => void) => {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    name: '', email: '', password: '', role: UserRole.CLIENT,
    organizationId: '', department: 'CLIENT_INTERNAL', status: AccountStatus.ACTIVE
  });

  const openModal = useCallback((user?: User, defaultRole?: UserRole) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name, email: user.email, password: '',
        role: user.role, organizationId: user.organizationId || '',
        status: user.status, department: user.department || 'CLIENT_INTERNAL'
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '', email: '', password: '', role: defaultRole || UserRole.CLIENT,
        organizationId: '', status: AccountStatus.ACTIVE, department: 'CLIENT_INTERNAL'
      });
    }
    setIsOpen(true);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      if (!editingUser) {
        await userService.signUp(formData.email, formData.password || '', formData.name, formData.organizationId || undefined, formData.department, formData.role);
        showToast("Novo credenciamento efetivado.", 'success');
      } else {
        await userService.saveUser({ ...editingUser, ...formData } as User);
        showToast("Perfil atualizado.", 'success');
      }
      setIsOpen(false);
      onSuccess();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFlagDeletion = async (userId: string) => {
    if (!currentUser) return;
    setIsProcessing(true);
    try {
      await userService.flagUserForDeletion(userId, currentUser);
      showToast("Exclusão sinalizada.", 'info');
      setIsOpen(false);
      onSuccess();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return { isOpen, setIsOpen, editingUser, formData, setFormData, openModal, handleSave, handleFlagDeletion, isProcessing };
};
