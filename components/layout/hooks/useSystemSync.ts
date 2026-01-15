import { useState, useEffect } from 'react';
import { notificationService } from '../../../lib/services/index.ts';
import { SystemStatus, User } from '../../../types/index.ts';

/**
 * Hook de sincronização de estado do sistema e notificações.
 * Agora recebe o status inicial do sistema via props, delegando a busca inicial
 * para um componente pai (AuthContext neste caso) para evitar duplicação.
 */
export const useSystemSync = (user: User | null, systemStatusFromAuth: SystemStatus | null) => { // Renomeado initialSystemStatus para systemStatusFromAuth
  // Removido: const [status, setStatus] = useState<SystemStatus>(initialSystemStatus || { mode: 'ONLINE' });
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Removido: Sincroniza o status do sistema uma única vez do AuthContext (fonte da verdade)
    // if (systemStatusFromAuth) {
    //   setStatus(systemStatusFromAuth);
    // }
  }, [systemStatusFromAuth]); // Depende apenas do systemStatusFromAuth

  useEffect(() => {
    if (!user) return;
    
    // Busca contagem inicial de não lidas
    const syncNotifications = async () => {
      const count = await notificationService.getUnreadCount(user);
      setUnreadCount(count);
    };

    syncNotifications();

    // Inscrição em tempo real APENAS para notificações.
    // O status do sistema agora é gerenciado e fornecido pelo AuthContext.
    const unsubNotifs = notificationService.subscribeToNotifications(syncNotifications);
    
    return () => { 
      // Não desinscreve de systemStatus, pois não é subscrito aqui
      unsubNotifs(); 
    };
  }, [user]);

  return { status: systemStatusFromAuth || { mode: 'ONLINE' }, unreadCount }; // Retorna diretamente o status do AuthContext
};