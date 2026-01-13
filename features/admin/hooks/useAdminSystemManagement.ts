import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/authContext.tsx';
import { useToast } from '../../../context/notificationContext.tsx';
import { useTranslation } from 'react-i18next';
import { SystemStatus, MaintenanceEvent } from '../../../types/index';
import { adminService } from '../../../lib/services/index.ts';

interface UseAdminSystemManagementProps {
  setIsSaving: React.Dispatch<React.SetStateAction<boolean>>;
  initialSystemStatus: SystemStatus | null;
  setPageSystemStatus: React.Dispatch<React.SetStateAction<SystemStatus | null>>; // To update global state in AdminPage
}

export const useAdminSystemManagement = ({ setIsSaving, initialSystemStatus, setPageSystemStatus }: UseAdminSystemManagementProps) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [systemStatus, setSystemStatus] = useState<SystemStatus>(initialSystemStatus || { mode: 'ONLINE' });
  const [isScheduleMaintenanceModalOpen, setIsScheduleMaintenanceModalOpen] = useState(false);

  useEffect(() => {
    if (initialSystemStatus) {
      setSystemStatus(initialSystemStatus);
    }
  }, [initialSystemStatus]);

  const handleUpdateMaintenance = useCallback(async (mode: 'ONLINE' | 'MAINTENANCE') => {
    if (!user) return;
    setIsSaving(true);
    try {
      const updatedStatus = await adminService.updateSystemStatus(user, { mode });
      setSystemStatus(updatedStatus);
      setPageSystemStatus(updatedStatus); // Update parent state
      showToast(`Sistema agora em modo: ${mode === 'ONLINE' ? 'Online' : 'Manutenção'}`, 'success');
    } catch (err) {
      showToast("Falha ao atualizar status do sistema.", 'error');
    } finally {
      setIsSaving(false);
    }
  }, [user, showToast, setIsSaving, setPageSystemStatus]);

  const handleScheduleMaintenance = useCallback(async (eventData: Partial<MaintenanceEvent> & { scheduledTime: string }) => {
    if (!user) return;
    setIsSaving(true);
    try {
      const [year, month, day] = eventData.scheduledDate?.split('-') || [];
      const [hours, minutes] = eventData.scheduledTime?.split(':') || [];

      const scheduledStart = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hours),
        parseInt(minutes)
      );

      const scheduledEnd = new Date(scheduledStart.getTime() + (eventData.durationMinutes || 0) * 60 * 1000);

      const newMaintenanceEvent: Partial<MaintenanceEvent> = {
        title: eventData.title,
        scheduledDate: scheduledStart.toISOString(),
        durationMinutes: eventData.durationMinutes,
        description: eventData.description,
        status: 'SCHEDULED'
      };

      await adminService.scheduleMaintenance(user, newMaintenanceEvent);

      const updatedStatus = await adminService.updateSystemStatus(user, {
        mode: 'SCHEDULED',
        message: eventData.description,
        scheduledStart: scheduledStart.toISOString(),
        scheduledEnd: scheduledEnd.toISOString()
      });
      setSystemStatus(updatedStatus);
      setPageSystemStatus(updatedStatus); // Update parent state

      showToast(t('maintenanceSchedule.scheduledSuccess', { title: eventData.title }), 'success');
      setIsScheduleMaintenanceModalOpen(false);
    } catch (err: any) {
      showToast(t('maintenanceSchedule.scheduledError', { message: err.message }), 'error');
    } finally {
      setIsSaving(false);
    }
  }, [user, showToast, setIsSaving, t, setPageSystemStatus]);

  return {
    systemStatus,
    handleUpdateMaintenance,
    isScheduleMaintenanceModalOpen,
    setIsScheduleMaintenanceModalOpen,
    handleScheduleMaintenance,
  };
};