import React, { useEffect, useState, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/authContext.tsx';
import { adminService } from '../lib/services/index.ts';
import { UserRole, normalizeRole, SystemStatus } from '../types/index.ts';
import { MaintenanceScreen } from '../components/common/MaintenanceScreen.tsx';

export const MaintenanceMiddleware: React.FC = () => {
  const { user, isLoading: isAuthLoading, systemStatus: initialStatus } = useAuth();
  const [liveStatus, setLiveStatus] = useState<SystemStatus | null>(initialStatus);
  const isSubscribed = useRef(false);

  useEffect(() => {
    if (initialStatus) {
        setLiveStatus(initialStatus);
    }
  }, [initialStatus]);

  useEffect(() => {
    if (!user || isSubscribed.current) return;

    isSubscribed.current = true;
    const unsubscribe = adminService.subscribeToSystemStatus((newStatus) => {
      setLiveStatus(newStatus);
    });

    return () => {
      isSubscribed.current = false;
      unsubscribe();
    };
  }, [user]);

  // Se o Auth ainda está carregando o perfil, não fazemos nada para não interferir no loader global
  if (isAuthLoading) return null; 

  const currentStatus = liveStatus || initialStatus; 

  // Só bloqueia se explicitamente estiver em modo manutenção
  if (currentStatus?.mode === 'MAINTENANCE') {
    const role = user ? normalizeRole(user.role) : UserRole.CLIENT;
    // Admins pulam a tela de manutenção para poderem consertar o sistema
    if (role !== UserRole.ADMIN) {
      return <MaintenanceScreen status={currentStatus} onRetry={() => window.location.reload()} />;
    }
  }

  return <Outlet context={{ systemStatus: currentStatus }} />;
};