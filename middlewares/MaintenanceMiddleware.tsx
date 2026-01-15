import React, { useEffect, useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/authContext.tsx';
import { adminService } from '../lib/services/index.ts';
import { UserRole, SystemStatus, normalizeRole } from '../types/index.ts';
import { MaintenanceScreen } from '../components/common/MaintenanceScreen.tsx';

export const MaintenanceMiddleware: React.FC = () => {
  const { user, isLoading: authLoading, systemStatus: initialSystemStatusFromAuth } = useAuth();
  
  // Local state para status "ao vivo"
  const [liveSystemStatus, setLiveSystemStatus] = useState<SystemStatus | null>(initialSystemStatusFromAuth);

  // 1. Sincroniza estado inicial (Apenas quando o Auth termina de carregar)
  useEffect(() => {
    setLiveSystemStatus(initialSystemStatusFromAuth);
  }, [initialSystemStatusFromAuth]);

  // 2. Inscrição Realtime (CORRIGIDO: Sem dependência cíclica)
  useEffect(() => {
    if (initialSystemStatusFromAuth) {
      // Inscreve apenas se já temos um status inicial válido
      const unsubscribe = adminService.subscribeToSystemStatus(setLiveSystemStatus);
      return () => {
        unsubscribe();
      };
    } else {
       // Se não tem status inicial (ex: logout), limpa o local
       setLiveSystemStatus(null);
    }
    // IMPORTANTE: 'liveSystemStatus' REMOVIDO DAQUI para evitar loop infinito
  }, [initialSystemStatusFromAuth]); 

  const handleRetry = useCallback(async () => {
    try {
      const s = await adminService.getSystemStatus();
      setLiveSystemStatus(s);
    } catch (error) {
      console.error("Erro ao reconectar:", error);
    }
  }, []);

  if (authLoading || !liveSystemStatus) return null;

  const isAuthorizedToBypass = user && normalizeRole(user.role) === UserRole.ADMIN;
  const isSystemLocked = liveSystemStatus.mode === 'MAINTENANCE';

  if (isSystemLocked && !isAuthorizedToBypass) {
    return <MaintenanceScreen status={liveSystemStatus} onRetry={handleRetry} />;
  }

  return <Outlet context={{ systemStatus: liveSystemStatus }} />;
};