import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../../../context/authContext.tsx';
import { useToast } from '../../../../context/notificationContext.tsx';
import { useTranslation } from 'react-i18next';
import { User, ClientOrganization, UserRole, AccountStatus } from '../../../../types/index.ts';
import { userService, adminService } from '../../../../lib/services/index.ts';
import { UserFormData, ClientFormData } from '../../admin/components/AdminModals.tsx';

/**
 * Hook Especializado: Ações e Formulários de Gestão de Clientes
 */
export const useQualityClientActions = (onSuccess: () => void) => {
  const { user: currentUser } = useAuth();
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [isProcessing, setIsProcessing] = useState(false);
  const [qualityAnalysts, setQualityAnalysts] = useState<User[]>([]);

  // Estado do Modal de Usuário
  const [userModal, setUserModal] = useState({ 
    isOpen: false, 
    editing: null as User | null,
    data: { name: '', email: '', password: '', role: UserRole.CLIENT, organizationId: '', department: '', status: AccountStatus.ACTIVE } as UserFormData
  });

  // Estado do Modal de Empresa
  const [clientModal, setClientModal] = useState({
    isOpen: false,
    editing: null as ClientOrganization | null,
    data: { name: '', cnpj: '', contractDate: '', status: AccountStatus.ACTIVE, qualityAnalystId: '' } as ClientFormData
  });

  useEffect(() => {
    userService.getUsersByRole(UserRole.QUALITY).then(setQualityAnalysts);
  }, []);

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      if (!userModal.editing) {
        await userService.signUp(userModal.data.email, userModal.data.password || '', userModal.data.name, userModal.data.organizationId, userModal.data.department);
        showToast("Usuário cliente criado com sucesso!", 'success');
      } else {
        await userService.saveUser({ ...userModal.editing, ...userModal.data } as User);
        showToast("Usuário atualizado com sucesso!", 'success');
      }
      setUserModal(prev => ({ ...prev, isOpen: false }));
      onSuccess();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveClient = async (e: React.FormEvent, confirmEmail?: string, confirmPassword?: string) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsProcessing(true);
    try {
      if (confirmEmail && confirmPassword) {
        const auth = await userService.authenticate(confirmEmail, confirmPassword);
        if (!auth.success) throw new Error(t('quality.invalidConfirmationCredentials'));
      }

      const analyst = qualityAnalysts.find(qa => qa.id === clientModal.data.qualityAnalystId);
      await adminService.saveClient(currentUser, { 
        ...clientModal.data, 
        id: clientModal.editing?.id, 
        qualityAnalystName: analyst?.name 
      } as Partial<ClientOrganization>);
      
      showToast("Empresa salva com sucesso!", 'success');
      setClientModal(prev => ({ ...prev, isOpen: false }));
      onSuccess();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    qualityAnalysts,
    userModal,
    setUserModal,
    clientModal,
    setClientModal,
    handleSaveUser,
    handleSaveClient
  };
};