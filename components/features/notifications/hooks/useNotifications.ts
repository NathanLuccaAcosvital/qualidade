
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../../../context/authContext.tsx';
import { useToast } from '../../../../context/notificationContext.tsx';
import { AppNotification } from '../../../../types/index.ts';
import { notificationService } from '../../../../lib/services/index.ts';

/**
 * Hook Core de Notificações Vital
 * Gerencia o ciclo de vida de alertas persistentes.
 */
export const useNotifications = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const isMounted = useRef(true);

  const fetchAll = useCallback(async () => {
    if (!user || !isMounted.current) return;
    try {
      const [list, count] = await Promise.all([
        notificationService.getNotifications(user),
        notificationService.getUnreadCount(user)
      ]);
      if (isMounted.current) {
        setNotifications(list);
        setUnreadCount(count);
      }
    } catch (err) {
      console.error("[Notifications] Falha na sincronia:", err);
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  }, [user]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      await fetchAll();
    } catch (e) {
      showToast("Falha ao arquivar alerta.", "error");
    }
  }, [fetchAll, showToast]);

  const markAllRead = useCallback(async () => {
    if (!user) return;
    try {
      await notificationService.markAllAsRead(user);
      await fetchAll();
      showToast("Central de alertas limpa.", "success");
    } catch (e) {
      showToast("Erro ao processar limpeza em massa.", "error");
    }
  }, [user, fetchAll, showToast]);

  // Efeito de Real-time e Foco
  useEffect(() => {
    isMounted.current = true;
    fetchAll();

    const handleFocus = () => fetchAll();
    window.addEventListener('focus', handleFocus);

    // Inscrição Real-time Supabase
    const unsubscribe = notificationService.subscribeToNotifications(() => {
      fetchAll();
    });

    return () => {
      isMounted.current = false;
      window.removeEventListener('focus', handleFocus);
      unsubscribe();
    };
  }, [fetchAll]);

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllRead,
    refresh: fetchAll
  };
};
