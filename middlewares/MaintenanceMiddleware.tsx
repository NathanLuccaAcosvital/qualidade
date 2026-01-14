import React, { useEffect, useState, useCallback } from 'react';
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
  const { user, isLoading: authLoading, systemStatus: initialSystemStatusFromAuth } = useAuth();
  
  // Local state para segurar o status do sistema "ao vivo", inicializado do AuthContext
  const [liveSystemStatus, setLiveSystemStatus] = useState<SystemStatus | null>(initialSystemStatusFromAuth);

  // Sincroniza o estado local `liveSystemStatus` com o `initialSystemStatusFromAuth` do AuthContext
  // Isso garante que `liveSystemStatus` esteja sempre atualizado com o valor mais recente do AuthContext
  useEffect(() => {
    setLiveSystemStatus(initialSystemStatusFromAuth);
  }, [initialSystemStatusFromAuth]);

  // Efeito para se inscrever em atualizações em tempo real do status do sistema
  useEffect(() => {
    // Apenas se inscreve se houver um status inicial do AuthContext (indicando que ele carregou)
    if (initialSystemStatusFromAuth) {
      const unsubscribe = adminService.subscribeToSystemStatus(setLiveSystemStatus);
      return () => unsubscribe();
    }
    // Se initialSystemStatusFromAuth for null (ex: após logout), reseta o status local
    if (!initialSystemStatusFromAuth && liveSystemStatus) {
      setLiveSystemStatus(null);
    }
  }, [initialSystemStatusFromAuth, liveSystemStatus]); // Adicionado liveSystemStatus para dependências para resetar no logout se necessário

  const handleRetry = useCallback(async () => {
    // Força uma nova busca do status e atualiza o estado local
    const s = await adminService.getSystemStatus();
    setLiveSystemStatus(s);
  }, []);

  // Se o Auth ainda está carregando ou o status do sistema "ao vivo" ainda não foi determinado,
  // retorna null para permitir que o AuthProvider gerencie o splash screen único.
  if (authLoading || !liveSystemStatus) return null;

  const isAuthorizedToBypass = user && normalizeRole(user.role) === UserRole.ADMIN;
  const isSystemLocked = liveSystemStatus.mode === 'MAINTENANCE';

  if (isSystemLocked && !isAuthorizedToBypass) {
    return <MaintenanceScreen status={liveSystemStatus} onRetry={handleRetry} />;
  }

  return <Outlet context={{ systemStatus: liveSystemStatus }} />;
};