import React from 'react';
import { Filter, Eye, Download } from 'lucide-react';
// Fix: Updated import path for 'types' module to explicitly include '/index'
import { AuditLog } from '../../../types/index'; // Atualizado
import { useTranslation } from 'react-i18next';

interface AuditLogsTableProps {
    logs: AuditLog[];
    severityFilter: string;
    onSeverityChange: (sev: any) => void;
    onInvestigate: (log: AuditLog) => void;
}

export const AuditLogsTable: React.FC<AuditLogsTableProps> = ({ logs, severityFilter, onSeverityChange, onInvestigate }) => {
    const { t } = useTranslation();

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col animate-in fade-in duration-300" role="region" aria-label={t('admin.tabs.logs')}>
            <div className="p-3 border-b border-slate-100 flex flex-wrap gap-3 bg-slate-50/50 items-center">
                <div className="flex items-center gap-2">
                    <Filter size={14} className="text-slate-400" aria-hidden="true" />
                    <span className="text-xs font-bold text-slate-500 uppercase">{t('admin.users.filters')}:</span>
                </div>
                <select 
                    value={severityFilter}
                    onChange={(e) => onSeverityChange(e.target.value)}
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

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]" role="table" aria-label={t('admin.tabs.logs')}>
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 sticky top-0 z-10">
                        <tr role="row">
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" scope="col">{t('admin.stats.headers.timestamp')}</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" scope="col">{t('admin.stats.headers.user')}</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" scope="col">{t('admin.stats.headers.action')}</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" scope="col">{t('admin.stats.headers.target')}</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" scope="col">{t('admin.stats.headers.ip')}</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" scope="col">{t('admin.stats.headers.severity')}</th>
                            <th className="px-6 py-4 text-right" scope="col"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white" role="rowgroup">
                        {logs.map(log => {
                            let sevColor = 'bg-blue-100 text-blue-700';
                            if (log.severity === 'WARNING') sevColor = 'bg-orange-100 text-orange-700';
                            if (log.severity === 'ERROR') sevColor = 'bg-red-100 text-red-700';
                            if (log.severity === 'CRITICAL') sevColor = 'bg-red-200 text-red-800 font-black animate-pulse';

                            return (
                                <tr 
                                  key={log.id} 
                                  className="hover:bg-slate-50 transition-colors group cursor-pointer" 
                                  onClick={() => onInvestigate(log)}
                                  role="row"
                                  aria-label={`${t('admin.stats.headers.timestamp')}: ${new Date(log.timestamp).toLocaleString()}, ${t('admin.stats.headers.user')}: ${log.userName}, ${t('admin.stats.headers.action')}: ${log.action}, ${t('admin.stats.headers.target')}: ${log.target}, ${t('admin.stats.headers.severity')}: ${t(`admin.logs.severity.${log.severity}`)}`}
                                >
                                    <td className="px-6 py-3 text-xs text-slate-500 font-mono whitespace-nowrap" role="cell" data-label={t('admin.stats.headers.timestamp')}>
                                        {new Date(log.timestamp).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-3 text-sm text-slate-700" role="cell" data-label={t('admin.stats.headers.user')}>
                                        <div className="font-medium">{log.userName}</div>
                                        <div className="text-xs text-slate-400">{log.userRole}</div>
                                    </td>
                                    <td className="px-6 py-3 text-sm font-bold text-slate-700" role="cell" data-label={t('admin.stats.headers.action')}>
                                        {log.action}
                                    </td>
                                    <td className="px-6 py-3 text-xs text-slate-500 font-mono" role="cell" data-label={t('admin.stats.headers.target')}>
                                        {log.target.substring(0, 30)}{log.target.length > 30 && '...'}
                                    </td>
                                    <td className="px-6 py-3 text-xs text-slate-500 font-mono" role="cell" data-label={t('admin.stats.headers.ip')}>
                                        {log.ip}
                                    </td>
                                    <td className="px-6 py-3" role="cell" data-label={t('admin.stats.headers.severity')}>
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${sevColor}`} aria-label={t(`admin.logs.severity.${log.severity}`)}>
                                            {t(`admin.logs.severity.${log.severity}`)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-right" role="cell">
                                        <button 
                                          className="text-blue-600 hover:text-blue-800 text-xs font-bold flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                          aria-label={t('admin.logs.investigate')} 
                                        >
                                            <Eye size={12} aria-hidden="true" /> {t('admin.logs.investigate')}
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        {logs.length === 0 && (
                            <tr role="row">
                                <td colSpan={7} className="px-6 py-20 text-center text-slate-400 italic" role="cell">
                                    {t('admin.logs.noLogsFound')} 
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};