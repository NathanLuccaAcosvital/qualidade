import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/authContext.tsx';
import { adminService } from '../lib/services/index.ts';
// Fix: Updated import path for 'types' module to explicitly include '/index'
import { UserRole, SystemStatus } from '../types/index'; // Atualizado
import { MaintenanceScreen } from '../components/common/MaintenanceScreen.tsx';

export const MaintenanceMiddleware: React.FC = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<SystemStatus>({ mode: 'ONLINE' });
  const [isChecking, setIsChecking] = useState(true);

  const checkStatus = async () => {
      const s = await adminService.getSystemStatus();
      setStatus(s);
      setIsChecking(false);
  };

  useEffect(() => {
      checkStatus();
      const interval = setInterval(checkStatus, 30000);
      return () => clearInterval(interval);
  }, []);

  if (isChecking) return null;

  if (status.mode === 'MAINTENANCE') {
      if (!user || user.role !== UserRole.ADMIN) {
          return <MaintenanceScreen status={status} onRetry={checkStatus} />;
      }
  }

  return (
    <>
        <Outlet context={{ systemStatus: status }} />
    </>
  );
};