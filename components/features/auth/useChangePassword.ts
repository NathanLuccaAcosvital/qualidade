import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../context/authContext.tsx';
import { useToast } from '../../../context/notificationContext.tsx';
import { userService } from '../../../lib/services/index.ts';

/**
 * Hook de Negócio para Alteração de Senha (SRP)
 * Responsabilidade: Gerenciar estado do formulário, validações e persistência.
 */
export const useChangePassword = (onSuccess: () => void) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const updateField = useCallback((field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  }, [error]);

  const validate = (): boolean => {
    if (formData.newPassword !== formData.confirmPassword) {
      setError(t('changePassword.matchError'));
      return false;
    }
    if (formData.newPassword.length < 6) {
      setError(t('signup.passwordPlaceholder'));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !validate()) return;

    setIsLoading(true);
    try {
      await userService.changePassword(user.id, formData.currentPassword, formData.newPassword);
      showToast(t('changePassword.success'), 'success');
      
      // Reset state on success
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      onSuccess();
    } catch (err: any) {
      const msg = err.message || t('changePassword.errorUpdatingPassword');
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    updateField,
    isLoading,
    error,
    handleSubmit
  };
};