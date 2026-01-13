import React from 'react';
import { useTranslation } from 'react-i18next';
// Fix: Added Search and X icons from lucide-react
import { Search, Filter, Eye, Loader2, X } from 'lucide-react';
import { AuditLogsTable } from '../components/AuditLogsTable.tsx';
import { useAdminAuditLogs } from '../hooks/useAdminAuditLogs.ts';
// Fix: Corrected import path for `AuditLog`
import { AuditLog } from '../../../types/index'; // Import AuditLog for type safety in modal data

export const AdminLogs: React.FC = () => {
  const { t } = useTranslation();

  const {
    filteredLogs,
    isLoadingLogs,
    searchTerm,
    setSearchTerm,
    severityFilter,
    setSeverityFilter,
    isInvestigationModalOpen,
    setIsInvestigationModalOpen,
    investigationData,
    handleOpenInvestigation,
  } = useAdminAuditLogs();

  return (
    <>
      {isInvestigationModalOpen && investigationData.targetLog && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300" role="dialog" aria-modal="true" aria-labelledby="audit-log-investigation-title">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 id="audit-log-investigation-title" className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Eye size={20} className="text-blue-600" aria-hidden="true" /> Detalhes do Log
              </h3>
              <button onClick={() => setIsInvestigationModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors" aria-label={t('common.close')}><X size={20} aria-hidden="true" /></button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-500 uppercase">Usuário:</p>
                <p className="font-semibold text-slate-800">{investigationData.targetLog.userName} ({investigationData.targetLog.userRole})</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-500 uppercase">Ação:</p>
                <p className="font-semibold text-slate-800">{investigationData.targetLog.action}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-500 uppercase">Alvo:</p>
                <p className="font-semibold text-slate-800">{investigationData.targetLog.target}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-500 uppercase">Severidade:</p>
                <p className={`font-semibold ${investigationData.targetLog.severity === 'CRITICAL' ? 'text-red-600' : 'text-slate-800'}`}>
                  {investigationData.targetLog.severity}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-500 uppercase">Metadados:</p>
                <pre className="bg-slate-50 p-3 rounded-lg text-xs overflow-x-auto border border-slate-200">
                  {JSON.stringify(investigationData.targetLog.metadata, null, 2)}
                </pre>
              </div>
              {investigationData.relatedLogs.length > 1 && (
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-500 uppercase">Atividades Relacionadas ({investigationData.relatedLogs.length - 1}):</p>
                  <ul className="list-disc pl-5 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    {investigationData.relatedLogs.filter(log => log.id !== investigationData.targetLog?.id).map(log => (
                      <li key={log.id}>
                        <span className="font-medium">{log.userName}</span>: {log.action} em <span className="font-mono">{log.target}</span> em {new Date(log.timestamp).toLocaleString()}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-100 p-4 flex flex-col sm:flex-row justify-between items-center gap-4 rounded-xl shadow-sm">
        <div className="relative group w-full sm:w-auto flex-1 max-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
          <input type="text" placeholder={t('common.search')} className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm w-full outline-none focus:ring-2 focus:ring-blue-500/20" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <div className="flex gap-2 w-full sm:w-auto justify-end">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as any)}
            className="text-xs border-none bg-white py-1.5 px-3 rounded-lg shadow-sm ring-1 ring-slate-200 focus:ring-blue-500 cursor-pointer"
            aria-label={t('admin.logs.filterBySeverity')}
          >
            <option value="ALL">{t('admin.logs.allSeverities')}</option>
            <option value="INFO">{t('admin.logs.severity.INFO')}</option>
            <option value="WARNING">{t('admin.logs.severity.WARNING')}</option>
            <option value="ERROR">{t('admin.logs.severity.ERROR')}</option>
            <option value="CRITICAL">{t('admin.logs.severity.CRITICAL')}</option>
          </select>
        </div>
      </div>

      {isLoadingLogs ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-slate-200" role="status">
          <Loader2 size={40} className="animate-spin text-blue-500" aria-hidden="true" />
          <p className="mt-4 text-sm font-bold text-slate-400 uppercase tracking-widest">{t('common.loading')}</p>
        </div>
      ) : (
        <AuditLogsTable logs={filteredLogs} severityFilter={severityFilter} onSeverityChange={setSeverityFilter} onInvestigate={handleOpenInvestigation} />
      )}
    </>
  );
};