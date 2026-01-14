
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/authContext.tsx';
import { adminService } from '../lib/services/index.ts';
import { UserRole, SystemStatus, normalizeRole } from '../types/index.ts';
import { MaintenanceScreen } from '../components/common/MaintenanceScreen.tsx';

/**
 * Middleware de Controle de Disponibilidade do Sistema.
 * Otimizado para não causar flicker com o Auth.
 */
export const MaintenanceMiddleware: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const isFetching = useRef(false);

  const fetchStatus = useCallback(async () => {
    if (isFetching.current) return;
    isFetching.current = true;
    try {
      const s = await adminService.getSystemStatus();
      setStatus(s);
    } finally {
      isFetching.current = false;
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const unsubscribe = adminService.subscribeToSystemStatus(setStatus);
    return () => unsubscribe();
  }, [fetchStatus]);

  // Se o Auth ainda está carregando ou o status do sistema ainda não veio,
  // não renderizamos nada para o AuthProvider gerenciar o splash screen único.
  if (authLoading || !status) return null;

  const isAuthorizedToBypass = user && normalizeRole(user.role) === UserRole.ADMIN;
  const isSystemLocked = status.mode === 'MAINTENANCE';

  if (isSystemLocked && !isAuthorizedToBypass) {
    return <MaintenanceScreen status={status} onRetry={fetchStatus} />;
  }

  return <Outlet context={{ systemStatus: status }} />;
};
