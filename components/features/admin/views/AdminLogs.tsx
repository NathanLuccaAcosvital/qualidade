import React from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, Loader2, Search, X, Activity } from 'lucide-react';
import { AuditLogsTable } from '../components/AuditLogsTable.tsx';
import { useAdminAuditLogs } from '../hooks/useAdminAuditLogs.ts';
import { AuditLog } from '../../../../types/index.ts';

/**
 * AdminLogs View (Orchestrator)
 */
export const AdminLogs: React.FC = () => {
  const { t } = useTranslation();
  const logsContext = useAdminAuditLogs();

  return (
    <div className="space-y-6">
      <LogInvestigationModal 
        isOpen={logsContext.isInvestigationModalOpen}
        onClose={() => logsContext.setIsInvestigationModalOpen(false)}
        data={logsContext.investigationData}
        t={t}
      />

      <LogsToolbar 
        searchTerm={logsContext.searchTerm}
        onSearchChange={logsContext.setSearchTerm}
        severityFilter={logsContext.severityFilter}
        onSeverityChange={logsContext.setSeverityFilter}
        t={t}
      />

      {logsContext.isLoadingLogs ? (
        <LoadingLogsState t={t} />
      ) : (
        // Fix: Wrapped state setter in arrow function and cast value to satisfy union type requirements from AuditLogsTable
        <AuditLogsTable 
          logs={logsContext.filteredLogs} 
          severityFilter={logsContext.severityFilter} 
          onSeverityChange={(sev) => logsContext.setSeverityFilter(sev as any)} 
          onInvestigate={logsContext.handleOpenInvestigation} 
        />
      )}
    </div>
  );
};

/* --- Sub-componentes Especializados (SRP) --- */

const LogsToolbar = ({ searchTerm, onSearchChange, severityFilter, onSeverityChange, t }: any) => (
  <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border border-slate-200 p-4 flex flex-col md:flex-row justify-between items-center gap-4 rounded-2xl shadow-sm">
    <div className="relative group w-full md:w-auto flex-1 max-w-lg">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[var(--color-detail-blue)] transition-colors" size={16} />
      <input 
        type="text" 
        placeholder="Pesquisar por usuário, ação ou IP..." 
        className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm w-full outline-none focus:ring-2 focus:ring-[var(--color-detail-blue)]/20" 
        value={searchTerm} 
        onChange={e => onSearchChange(e.target.value)} 
      />
    </div>
    <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
      {(['ALL', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'] as const).map(sev => (
        <button
          key={sev}
          onClick={() => onSeverityChange(sev)}
          className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${
            severityFilter === sev ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {sev === 'ALL' ? 'Todos' : sev}
        </button>
      ))}
    </div>
  </div>
);

const LogInvestigationModal = ({ isOpen, onClose, data, t }: { isOpen: boolean, onClose: () => void, data: any, t: any }) => {
  if (!isOpen || !data.targetLog) return null;
  const log = data.targetLog as AuditLog;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 flex flex-col">
        <header className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-[var(--color-detail-blue)] rounded-xl"><Eye size={20}/></div>
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Investigação Forense</h3>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-slate-200 rounded-full transition-colors text-slate-400"><X size={24}/></button>
        </header>
        
        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-2 gap-6">
            <InfoBlock label="Usuário" value={`${log.userName} (${log.userRole})`} />
            <InfoBlock label="Ação" value={log.action} />
            <InfoBlock label="Endereço IP" value={log.ip} />
            <InfoBlock label="Data/Hora" value={new Date(log.timestamp).toLocaleString()} />
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alvo do Evento</p>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 font-mono text-xs text-slate-600 break-all">
              {log.target}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payload de Metadados</p>
            <pre className="bg-slate-900 p-5 rounded-2xl text-[10px] overflow-x-auto text-[var(--color-detail-blue)] shadow-inner">
              {JSON.stringify(log.metadata, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoBlock = ({ label, value }: { label: string, value: string }) => (
  <div className="space-y-1">
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[2px]">{label}</p>
    <p className="text-sm font-bold text-slate-800">{value}</p>
  </div>
);

const LoadingLogsState = ({ t }: any) => (
  <div className="flex flex-col items-center justify-center h-64 bg-white rounded-3xl border border-slate-200 shadow-inner" role="status">
    <Loader2 size={40} className="animate-spin text-[var(--color-detail-blue)]" aria-hidden="true" />
    <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-[4px]">{t('common.loading')}</p>
  </div>
);