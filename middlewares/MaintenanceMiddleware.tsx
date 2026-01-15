import React, { useEffect } from 'react'; // Removido useState e useRef
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/authContext'; // Importa useAuth
// import { adminService } from '../lib/services'; // Não precisa mais de adminService aqui
import { UserRole, normalizeRole } from '../types';
import { MaintenanceScreen } from '../components/common/MaintenanceScreen';

export const MaintenanceMiddleware: React.FC = () => {
  const { user, isLoading, systemStatus } = useAuth(); // Obtém systemStatus diretamente do AuthContext

  if (isLoading) return null; // Ou um Loading Spinner bonitinho

  // systemStatus já está sendo atualizado em tempo real pelo AuthContext.
  // Não precisamos de um estado local `liveStatus` nem de subscrição aqui.
  const currentStatus = systemStatus; 

  if (currentStatus?.mode === 'MAINTENANCE') {
    const role = user ? normalizeRole(user.role) : UserRole.CLIENT;
    if (role !== UserRole.ADMIN) {
      return <MaintenanceScreen status={currentStatus} onRetry={() => window.location.reload()} />;
    }
  }

  // Se o modo for SCHEDULED ou ONLINE, ou se for ADMIN em MAINTENANCE, permite o fluxo normal.
  return <Outlet context={{ systemStatus: currentStatus }} />;
};