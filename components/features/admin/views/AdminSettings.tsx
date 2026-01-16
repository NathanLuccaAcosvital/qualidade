import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  AlertTriangle, History, Lock, Globe, ShieldCheck, CalendarClock 
} from 'lucide-react';
import { SystemStatus } from '../../../../types/index.ts';
import { ScheduleMaintenanceModal } from '../components/AdminModals.tsx';
import { useAdminSystemManagement } from '../hooks/useAdminSystemManagement.ts';

interface AdminSettingsProps {
  systemStatus: SystemStatus;
  setSystemStatus: React.Dispatch<React.SetStateAction<SystemStatus | null>>;
  setIsSaving: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * AdminSettings View (Orchestrator)
 */
export const AdminSettings: React.FC<AdminSettingsProps> = ({ systemStatus, setSystemStatus, setIsSaving }) => {
  const { t } = useTranslation();
  const sysManager = useAdminSystemManagement({
    setIsSaving,
    initialSystemStatus: systemStatus,
    setPageSystemStatus: setSystemStatus,
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <ScheduleMaintenanceModal
        isOpen={sysManager.isScheduleMaintenanceModalOpen}
        onClose={() => sysManager.setIsScheduleMaintenanceModalOpen(false)}
        onSave={sysManager.handleScheduleMaintenance}
        isSaving={false}
      />

      <SystemStatusHeader status={sysManager.systemStatus} onUpdate={sysManager.handleUpdateMaintenance} />

      <MaintenanceSchedulerSection onOpenModal={() => sysManager.setIsScheduleMaintenanceModalOpen(true)} />

      <ActivityHistoryPlaceholder />
    </div>
  );
};

/* --- Módulos de Configuração (SRP) --- */

const SystemStatusHeader = ({ status, onUpdate }: { status: SystemStatus, onUpdate: (m: any) => void }) => {
  const isOnline = status?.mode === 'ONLINE';
  
  return (
    <section className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
      <div className={`p-8 flex flex-col md:flex-row items-center justify-between gap-8 ${
        isOnline ? 'bg-emerald-50/30' : 'bg-orange-50/30'
      }`}>
        <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-xl transition-transform hover:rotate-3 ${
            isOnline ? 'bg-emerald-500 text-white' : 'bg-[var(--color-accent-orange)] text-white'
          }`}>
            {isOnline ? <Globe size={40} /> : <AlertTriangle size={40} />}
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              Gateway: {isOnline ? 'Operação Global' : 'Manutenção'}
            </h2>
            <p className="text-slate-500 text-sm font-medium">
              {isOnline 
                ? 'Todos os módulos estão acessíveis para clientes e analistas técnicos.' 
                : 'Apenas administradores de sistema podem acessar o portal neste momento.'}
            </p>
          </div>
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <ActionButton 
            onClick={() => onUpdate('ONLINE')} 
            disabled={isOnline} 
            icon={ShieldCheck} 
            label="Ativar Online" 
            variant="success" 
          />
          <ActionButton 
            onClick={() => onUpdate('MAINTENANCE')} 
            disabled={!isOnline} 
            icon={Lock} 
            label="Bloquear Portal" 
            variant="danger" 
          />
        </div>
      {/* Fix: Removed extraneous closing div tag that was causing a syntax error in JSX parsing */}
    </section>
  );
};

const MaintenanceSchedulerSection = ({ onOpenModal }: any) => (
  <section className="bg-[var(--color-primary-dark-blue)] rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl group">
    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[var(--color-detail-blue)]/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 transition-all group-hover:bg-[var(--color-detail-blue)]/20" />
    <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
      <div className="space-y-4 max-w-xl text-center lg:text-left">
        <h3 className="text-2xl font-black flex items-center gap-4 justify-center lg:justify-start">
          <CalendarClock size={32} className="text-[var(--color-detail-blue)]" /> Janelas de Downtime Técnico
        </h3>
        <p className="text-slate-400 text-base leading-relaxed">
          Planeje atualizações de infraestrutura com antecedência. O sistema exibirá alertas proativos para todos os usuários logados.
        </p>
      </div>
      <button 
        onClick={onOpenModal}
        className="bg-[var(--color-detail-blue)] hover:bg-blue-500 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[3px] transition-all shadow-xl shadow-[var(--color-detail-blue)]/40 active:scale-95 whitespace-nowrap"
      >
        Agendar Manutenção
      </button>
    </div>
  </section>
);

const ActionButton = ({ onClick, disabled, icon: Icon, label, variant }: any) => {
  const styles = {
    success: 'hover:border-emerald-500 hover:text-emerald-600',
    danger: 'hover:border-red-500 hover:text-red-600',
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex-1 md:flex-none py-4 px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 transition-all border shadow-sm ${
        disabled 
        ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed opacity-50' 
        : `bg-white text-slate-600 border-slate-200 ${styles[variant as keyof typeof styles]} active:scale-95`
      }`}
    >
      <Icon size={18} /> {label}
    </button>
  );
};

const ActivityHistoryPlaceholder = () => (
  <div className="space-y-4">
    <h4 className="text-[10px] font-black uppercase tracking-[5px] text-slate-400 flex items-center gap-2 ml-4">
      <History size={14} /> Auditoria de Governança
    </h4>
    <div className="bg-white rounded-[2.5rem] border border-slate-200 p-12 text-center shadow-sm">
        <p className="text-slate-400 text-sm font-medium italic">O histórico de alterações globais é sincronizado automaticamente com os logs forenses.</p>
    </div>
  </div>
);