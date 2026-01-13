import React from 'react';
import { useTranslation } from 'react-i18next';
import { Server, ShieldCheck, Settings as SettingsIcon, CalendarClock } from 'lucide-react';
import { SystemStatus } from '../../../types/index';
import { ScheduleMaintenanceModal } from '../modals/AdminModals.tsx';
import { useAdminSystemManagement } from '../hooks/useAdminSystemManagement.ts';

interface AdminSettingsProps {
  systemStatus: SystemStatus;
  setSystemStatus: React.Dispatch<React.SetStateAction<SystemStatus | null>>; // To update the parent's system status
  setIsSaving: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ systemStatus, setSystemStatus, setIsSaving }) => {
  const { t } = useTranslation();

  const {
    systemStatus: internalSystemStatus, // Use internal state from hook
    handleUpdateMaintenance,
    isScheduleMaintenanceModalOpen,
    setIsScheduleMaintenanceModalOpen,
    handleScheduleMaintenance,
  } = useAdminSystemManagement({
    setIsSaving,
    initialSystemStatus: systemStatus,
    setPageSystemStatus: setSystemStatus, // Pass the parent's setter
  });

  return (
    <>
      <ScheduleMaintenanceModal
        isOpen={isScheduleMaintenanceModalOpen}
        onClose={() => setIsScheduleMaintenanceModalOpen(false)}
        onSave={handleScheduleMaintenance}
        isSaving={false} // Use internal `isSaving` state from the hook, or pass a specific one for this modal
      />

      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Server size={20} className="text-blue-600" /> Controle de Disponibilidade</h3>
            <p className="text-sm text-slate-500">Altere o estado global do portal para manutenções programadas ou críticas.</p>
            <div className="pt-4 flex flex-col gap-3">
              <button
                onClick={() => handleUpdateMaintenance('ONLINE')}
                disabled={internalSystemStatus?.mode === 'ONLINE'}
                className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${internalSystemStatus?.mode === 'ONLINE' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                <ShieldCheck size={18} /> Sistema Online
              </button>
              <button
                onClick={() => handleUpdateMaintenance('MAINTENANCE')}
                disabled={internalSystemStatus?.mode === 'MAINTENANCE'}
                className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${internalSystemStatus?.mode === 'MAINTENANCE' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600'}`}
              >
                <SettingsIcon size={18} /> Entrar em Manutenção
              </button>
              <button
                onClick={() => setIsScheduleMaintenanceModalOpen(true)}
                className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-200"
              >
                <CalendarClock size={18} /> Agendar Manutenção
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};