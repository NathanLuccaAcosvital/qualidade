import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
// Fix: Removed unused import `useSearchParams`
import { AuditLog } from '../../../types/index';
import { AuditLogsTable } from '../../admin/components/AuditLogsTable.tsx';
// Fix: Added Search and X icons from lucide-react
import { X, Eye, Activity, Loader2, Search } from 'lucide-react';

// Hooks
import { useQualityAuditLogs } from '../hooks/useQualityAuditLogs.ts';

export const QualityAuditLog: React.FC = () => {
  const { t } = useTranslation();
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Trigger a refresh for the hook

  const {
    qualityAuditLogs,
    loadingAuditLogs,
    auditLogSearch,
    setAuditLogSearch,
    auditLogSeverityFilter,
    setAuditLogSeverityFilter,
    isAuditLogInvestigationModalOpen,
    setIsAuditLogInvestigationModalOpen,
    auditLogInvestigationData,
    handleOpenQualityAuditLogInvestigation,
  } = useQualityAuditLogs(refreshTrigger); // Pass refreshTrigger to the hook

  return (
    <>
      {isAuditLogInvestigationModalOpen && auditLogInvestigationData.targetLog && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300" role="dialog" aria-modal="true" aria-labelledby="audit-log-investigation-title">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 id="audit-log-investigation-title" className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Eye size={20} className="text-blue-600" aria-hidden="true" /> Detalhes do Log
              </h3>
              <button onClick={() => setIsAuditLogInvestigationModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors" aria-label={t('common.close')}><X size={20} aria-hidden="true" /></button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-500 uppercase">Usuário:</p>
                <p className="font-semibold text-slate-800">{auditLogInvestigationData.targetLog.userName} ({auditLogInvestigationData.targetLog.userRole})</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-500 uppercase">Ação:</p>
                <p className="font-semibold text-slate-800">{auditLogInvestigationData.targetLog.action}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-500 uppercase">Alvo:</p>
                <p className="font-semibold text-slate-800">{auditLogInvestigationData.targetLog.target}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-500 uppercase">Severidade:</p>
                <p className={`font-semibold ${auditLogInvestigationData.targetLog.severity === 'CRITICAL' ? 'text-red-600' : 'text-slate-800'}`}>
                  {auditLogInvestigationData.targetLog.severity}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-500 uppercase">Metadados:</p>
                <pre className="bg-slate-50 p-3 rounded-lg text-xs overflow-x-auto border border-slate-200">
                  {JSON.stringify(auditLogInvestigationData.targetLog.metadata, null, 2)}
                </pre>
              </div>
              {auditLogInvestigationData.relatedLogs.length > 1 && (
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-500 uppercase">Atividades Relacionadas ({auditLogInvestigationData.relatedLogs.length - 1}):</p>
                  <ul className="list-disc pl-5 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    {auditLogInvestigationData.relatedLogs.filter(log => log.id !== auditLogInvestigationData.targetLog?.id).map(log => (
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

      <div className="flex flex-col h-full gap-4 animate-in fade-in duration-300" role="main" aria-label={t('quality.myAuditLog')}>
        <div className="bg-white p-4 rounded-2xl border shadow-sm flex flex-col xl:flex-row justify-between items-center gap-4">
          <div className="relative w-full max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" />
            <input
              type="text"
              placeholder={t('quality.allActivities')}
              className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm w-full outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              value={auditLogSearch}
              onChange={e => setAuditLogSearch(e.target.value)}
              aria-label={t('quality.allActivities')}
            />
          </div>
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl" role="group" aria-label={t('admin.logs.filterBySeverity')}>
            {(['ALL', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'] as const).map(severity => (
              <button
                key={severity}
                onClick={() => setAuditLogSeverityFilter(severity)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  auditLogSeverityFilter === severity
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
                aria-pressed={auditLogSeverityFilter === severity}
                aria-label={severity === 'ALL' ? t('admin.logs.allSeverities') : t(`admin.logs.severity.${severity}`)}
              >
                {severity === 'ALL' ? t('admin.logs.allSeverities') : t(`admin.logs.severity.${severity}`)}
              </button>
            ))}
          </div>
        </div>
        {loadingAuditLogs ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-slate-200" role="status">
            <Loader2 size={40} className="animate-spin text-blue-500" aria-hidden="true" />
            <p className="mt-4 text-sm font-bold text-slate-400 uppercase tracking-widest">{t('common.loading')}</p>
          </div>
        ) : qualityAuditLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-dashed border-slate-200" role="status">
            <Activity size={48} className="mb-4 opacity-20 text-slate-400" aria-hidden="true" />
            <p className="font-medium text-slate-600">{t('quality.noQualityLogsFound')}</p>
          </div>
        ) : (
          <AuditLogsTable
            logs={qualityAuditLogs}
            severityFilter={auditLogSeverityFilter}
            onSeverityChange={setAuditLogSeverityFilter}
            onInvestigate={handleOpenQualityAuditLogInvestigation}
          />
        )}
      </div>
    </>
  );
};