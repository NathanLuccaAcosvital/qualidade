
import React, { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../context/authContext.tsx';
import { useToast } from '../../../context/notificationContext.tsx';
import { userService } from '../../../lib/services/index.ts';

/**
 * Hook de Negócio para Alteração de Senha com Validação de Entropia.
 * Inclui re-autenticação para validar senha atual.
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

  /**
   * Validação de Requisitos de Segurança (Entropia Industrial)
   */
  const requirements = useMemo(() => ({
    length: formData.newPassword.length >= 8,
    upper: /[A-Z]/.test(formData.newPassword) && /[a-z]/.test(formData.newPassword),
    number: /[0-9]/.test(formData.newPassword),
    special: /[^A-Za-z0-9]/.test(formData.newPassword),
    match: formData.newPassword !== '' && formData.newPassword === formData.confirmPassword
  }), [formData.newPassword, formData.confirmPassword]);

  const isValid = useMemo(() => 
    requirements.length && 
    requirements.upper && 
    requirements.number && 
    requirements.special && 
    requirements.match, 
  [requirements]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !isValid) return;

    setIsLoading(true);
    setError(null);

    try {
      // 1. Verificar senha atual no gateway (Segurança de Identidade)
      const authVerify = await userService.authenticate(user.email, formData.currentPassword);
      if (!authVerify.success) {
        // O erro já vem como chave de tradução do authenticate
        throw new Error(t(authVerify.error || 'auth.errors.invalidCredentials'));
      }

      // 2. Executar alteração criptográfica
      await userService.changePassword(user.id, formData.currentPassword, formData.newPassword);
      
      showToast(t('changePassword.success'), 'success');
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      onSuccess();
    } catch (err: any) {
      // Tenta traduzir a mensagem. Se err.message já for uma chave (ex: auth.errors.samePassword), t() resolve.
      const translatedMsg = t(err.message) || t('changePassword.errorUpdatingPassword');
      setError(translatedMsg);
      showToast(translatedMsg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    updateField,
    isLoading,
    error,
    handleSubmit,
    requirements,
    isValid
  };
};
