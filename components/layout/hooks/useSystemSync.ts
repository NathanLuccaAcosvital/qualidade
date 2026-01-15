
import { useState, useEffect, useCallback } from 'react';
import { adminService, notificationService } from '../../../lib/services/index.ts';
import { SystemStatus, User } from '../../../types/index.ts';

/**
 * Hook de sincronização de estado do sistema e notificações.
 * Agora recebe o status inicial do sistema via props, delegando a busca inicial
 * para um componente pai (AuthContext neste caso) para evitar duplicação.
 */
export const useSystemSync = (user: User | null, initialSystemStatus: SystemStatus | null) => {
  const [status, setStatus] = useState<SystemStatus>(initialSystemStatus || { mode: 'ONLINE' });
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Initialize status from props if available
    if (initialSystemStatus) {
      setStatus(initialSystemStatus);
    }
  }, [initialSystemStatus]);

  useEffect(() => {
    if (!user) return;
    
    // Função para buscar a contagem de não lidas e atualizar
    const syncNotifications = async () => {
      if (user) { // Verifica se user ainda existe no contexto (previne erros após logout)
        const count = await notificationService.getUnreadCount(user);
        setUnreadCount(count);
      }
    };

    syncNotifications();

    // Inscrição em tempo real para status do sistema e notificações
    const unsubStatus = adminService.subscribeToSystemStatus(setStatus);
    const unsubNotifs = notificationService.subscribeToNotifications(syncNotifications);
    
    return () => { 
      unsubStatus(); 
      unsubNotifs(); 
    };
  }, [user]);

  return { status, unreadCount };
};
