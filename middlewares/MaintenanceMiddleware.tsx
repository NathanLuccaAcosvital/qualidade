import React, { useEffect, useState, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { adminService } from '../lib/services';
import { UserRole, normalizeRole, SystemStatus } from '../types';
import { MaintenanceScreen } from '../components/common/MaintenanceScreen';

export const MaintenanceMiddleware: React.FC = () => {
  const { user, isLoading, systemStatus: initialStatus } = useAuth();
  const [liveStatus, setLiveStatus] = useState<SystemStatus | null>(initialStatus);
  const isSubscribed = useRef(false);

  // 1. Sincroniza estado inicial (evita flicker na tela)
  useEffect(() => {
    if (initialStatus) {
        setLiveStatus(initialStatus);
    }
  }, [initialStatus]);

  // 2. Inscrição Segura (Realtime)
  useEffect(() => {
    if (!user || isSubscribed.current) return;

    console.log("[Maintenance] Iniciando monitoramento em tempo real...");
    isSubscribed.current = true;

    const unsubscribe = adminService.subscribeToSystemStatus((newStatus) => {
      console.log("[Maintenance] Atualização recebida:", newStatus);
      setLiveStatus(newStatus);
    });

    return () => {
      isSubscribed.current = false;
      unsubscribe();
    };
  }, [user]); // Dependência apenas 'user' para recriar se o usuário mudar (ex: relogin)

  if (isLoading) return null; // Ou um Loading Spinner bonitinho

  // Se não carregou status ainda, assume que está online para não travar o usuário
  // (Fail-open strategy), a menos que a segurança seja crítica extrema.
  const currentStatus = liveStatus || initialStatus; 

  if (currentStatus?.mode === 'MAINTENANCE') {
    const role = user ? normalizeRole(user.role) : UserRole.CLIENT;
    if (role !== UserRole.ADMIN) {
      return <MaintenanceScreen status={currentStatus} onRetry={() => window.location.reload()} />;
    }
  }

  return <Outlet context={{ systemStatus: currentStatus }} />;
};