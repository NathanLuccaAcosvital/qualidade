
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../../context/authContext.tsx';
import { useToast } from '../../../../context/notificationContext.tsx';
import { useTranslation } from 'react-i18next';
import { SystemStatus, MaintenanceEvent } from '../../../../types/index';
import { adminService } from '../../../../lib/services/index.ts';

interface SystemManagementProps {
  setIsSaving: (state: boolean) => void;
  initialSystemStatus: SystemStatus | null;
  // Removido: setSystemStatusGlobal: React.Dispatch<React.SetStateAction<SystemStatus | null>>;
}

/**
 * Hook de Controle de Disponibilidade (SRP)
 */
export const useAdminSystemManagement = ({ 
  setIsSaving, 
  initialSystemStatus, 
  // Removido: setSystemStatusGlobal
}: SystemManagementProps) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [systemStatus, setSystemStatus] = useState<SystemStatus>(
    initialSystemStatus || { mode: 'ONLINE' }
  );
  const [isScheduleMaintenanceModalOpen, setIsScheduleMaintenanceModalOpen] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false); // Novo estado local para o modal de agendamento

  useEffect(() => {
    if (initialSystemStatus) setSystemStatus(initialSystemStatus);
  }, [initialSystemStatus]);

  const handleUpdateMaintenance = useCallback(async (mode: 'ONLINE' | 'MAINTENANCE') => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const updated = await adminService.updateSystemStatus(user, { mode });
      setSystemStatus(updated);
      // Não precisa mais de setSystemStatusGlobal, o AuthContext irá capturar a mudança via subscrição
      showToast(`Gateway alterado para: ${mode}`, 'success');
    } catch {
      showToast("Falha ao comunicar com o Gateway.", 'error');
    } finally {
      setIsSaving(false);
    }
  }, [user, showToast, setIsSaving]);

  const handleScheduleMaintenance = useCallback(async (eventData: Partial<MaintenanceEvent> & { scheduledTime: string }) => {
    if (!user) return;
    
    setIsScheduling(true); // Usa o estado local de isScheduling
    setIsSaving(true); // Indica salvamento globalmente
    try {
      // Cálculo de janela de tempo
      const start = new Date(`${eventData.scheduledDate}T${eventData.scheduledTime}`);
      const end = new Date(start.getTime() + (eventData.durationMinutes || 0) * 60000);

      const eventPayload: Partial<MaintenanceEvent> = {
        title: eventData.title,
        scheduledDate: start.toISOString(),
        durationMinutes: eventData.durationMinutes,
        description: eventData.description,
        status: 'SCHEDULED'
      };

      await adminService.scheduleMaintenance(user, eventPayload);

      const statusUpdate = await adminService.updateSystemStatus(user, {
        mode: 'SCHEDULED',
        message: eventData.description,
        scheduledStart: start.toISOString(),
        scheduledEnd: end.toISOString()
      });

      setSystemStatus(statusUpdate);
      // Não precisa mais de setSystemStatusGlobal, o AuthContext irá capturar a mudança via subscrição
      showToast(t('maintenanceSchedule.scheduledSuccess', { title: eventData.title }), 'success');
      setIsScheduleMaintenanceModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro interno';
      showToast(t('maintenanceSchedule.scheduledError', { message: msg }), 'error');
    } finally {
      setIsScheduling(false); // Finaliza o estado local de isScheduling
      setIsSaving(false); // Finaliza o estado de salvamento global
    }
  }, [user, showToast, setIsSaving, t]);

  return {
    systemStatus,
    handleUpdateMaintenance,
    isScheduleMaintenanceModalOpen,
    setIsScheduleMaintenanceModalOpen,
    isScheduling, // Expor o novo estado de isScheduling
    handleScheduleMaintenance,
  };
};