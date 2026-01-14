
import { useState, useEffect } from 'react';
import { adminService, notificationService } from '../../../lib/services/index.ts';
import { SystemStatus, User } from '../../../types/index.ts';

export const useSystemSync = (user: User | null) => {
  const [status, setStatus] = useState<SystemStatus>({ mode: 'ONLINE' });
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    
    const syncData = async () => {
      const [sysStatus, count] = await Promise.all([
        adminService.getSystemStatus(),
        notificationService.getUnreadCount(user)
      ]);
      setStatus(sysStatus);
      setUnreadCount(count);
    };

    syncData();

    // Inscrição em tempo real (O)
    const unsubStatus = adminService.subscribeToSystemStatus(setStatus);
    const unsubNotifs = notificationService.subscribeToNotifications(syncData);
    
    return () => { 
      unsubStatus(); 
      unsubNotifs(); 
    };
  }, [user]);

  return { status, unreadCount };
};
