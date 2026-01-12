
import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/authContext.tsx';
// Fix: Import from services/index.ts to use the correctly typed and initialized service instances
import { adminService } from '../lib/services/index.ts';
import { UserRole, SystemStatus } from '../types.ts';
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
      // Poll every 30 seconds to check if maintenance started
      const interval = setInterval(checkStatus, 30000);
      return () => clearInterval(interval);
  }, []);

  if (isChecking) return null; // Or a subtle loading spinner

  // Logic: Block if MAINTENANCE mode AND user is NOT Admin
  if (status.mode === 'MAINTENANCE') {
      if (!user || user.role !== UserRole.ADMIN) {
          return <MaintenanceScreen status={status} onRetry={checkStatus} />;
      }
  }

  return (
    <>
        {/* Banner removed from here to prevent pushing the Layout sidebar down. 
            It is now handled inside Layout.tsx for correct positioning. */}
        <Outlet context={{ systemStatus: status }} />
    </>
  );
};
