import React from 'react';
import { Eye, Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AuditLog } from '../../../../types/index.ts';

interface AuditLogsTableProps {
    logs: AuditLog[];
    severityFilter: string;
    onSeverityChange: (sev: string) => void;
    onInvestigate: (log: AuditLog) => void;
}

/**
 * Configuração visual de severidades (O)
 */
const SEVERITY_CONFIG: Record<string, string> = {
  INFO: 'bg-blue-100 text-blue-700',
  WARNING: 'bg-orange-100 text-orange-700',
  ERROR: 'bg-red-100 text-red-700',
  CRITICAL: 'bg-red-200 text-red-800 font-black animate-pulse',
};

export const AuditLogsTable: React.FC<AuditLogsTableProps> = ({ 
    logs, 
    severityFilter, 
    onSeverityChange, 
    onInvestigate 
}) => {
    const { t } = useTranslation();

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col animate-in fade-in duration-300">
            <FilterBar 
              filter={severityFilter} 
              onFilterChange={onSeverityChange} 
              label={t('admin.users.filters')} 
            />

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                    <TableHeader t={t} />
                    <tbody className="divide-y divide-slate-100 bg-white">
                        {logs.map(log => (
                            <AuditLogRow 
                                key={log.id} 
                                log={log} 
                                onInvestigate={() => onInvestigate(log)} 
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

/* --- Sub-componentes Especializados (SRP) --- */

interface FilterBarProps {
    filter: string;
    onFilterChange: (value: string) => void;
    label: string;
}

const FilterBar = ({ filter, onFilterChange, label }: FilterBarProps) => (
  <div className="p-3 border-b border-slate-100 flex flex-wrap gap-3 bg-slate-50/50 items-center">
      <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400" />
          <span className="text-xs font-bold text-slate-500 uppercase">{label}:</span>
      </div>
      <select 
          value={filter}
          onChange={(e) => onFilterChange(e.target.value)}
          className="text-xs border-none bg-white py-1.5 px-3 rounded-lg shadow-sm ring-1 ring-slate-200 focus:ring-blue-500 cursor-pointer"
      >
          <option value="ALL">Todas Severidades</option>
          <option value="INFO">Info</option>
          <option value="WARNING">Warning</option>
          <option value="ERROR">Error</option>
          <option value="CRITICAL">Critical</option>
      </select>
  </div>
);

const TableHeader = ({ t }: { t: any }) => (
  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 sticky top-0 z-10">
      <tr>
          <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">{t('admin.stats.headers.timestamp')}</th>
          <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">{t('admin.stats.headers.user')}</th>
          <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">{t('admin.stats.headers.action')}</th>
          <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">{t('admin.stats.headers.target')}</th>
          <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">{t('admin.stats.headers.ip')}</th>
          <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">{t('admin.stats.headers.severity')}</th>
          <th className="px-6 py-4 text-right"></th>
      </tr>
  </thead>
);

const AuditLogRow: React.FC<{ log: AuditLog, onInvestigate: () => void }> = ({ log, onInvestigate }) => (
  <tr className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={onInvestigate}>
      <td className="px-6 py-3 text-xs text-slate-500 font-mono whitespace-nowrap">
          {new Date(log.timestamp).toLocaleString()}
      </td>
      <td className="px-6 py-3 text-sm text-slate-700">
          <div className="font-medium">{log.userName}</div>
          <div className="text-xs text-slate-400">{log.userRole}</div>
      </td>
      <td className="px-6 py-3 text-sm font-bold text-slate-700">
          {log.action}
      </td>
      <td className="px-6 py-3 text-xs text-slate-500 font-mono">
          {log.target.substring(0, 30)}{log.target.length > 30 && '...'}
      </td>
      {/* CORREÇÃO AQUI: Tratamento para IP nulo ou vazio */}
      <td className="px-6 py-3 text-xs text-slate-500 font-mono">
          {log.ip ? (
            <span>{log.ip || <span className="text-slate-300 italic">N/A</span>}</span>
          ) : (
            <span className="text-slate-300 italic text-[10px]">N/A</span>
          )}
      </td>
      <td className="px-6 py-3">
          <SeverityBadge severity={log.severity} />
      </td>
      <td className="px-6 py-3 text-right">
          <button className="text-blue-600 hover:text-blue-800 text-xs font-bold flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Eye size={12} /> Investigar
          </button>
      </td>
  </tr>
);

const SeverityBadge = ({ severity }: { severity: string }) => {
  const colorClass = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.INFO;
  return (
    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${colorClass}`}>
        {severity}
    </span>
  );
};