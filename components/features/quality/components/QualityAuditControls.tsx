
import React from 'react';
import { Search } from 'lucide-react';

interface AuditToolbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  severity: string;
  onSeverityChange: (sev: any) => void;
  t: any;
}

export const AuditLogToolbar: React.FC<AuditToolbarProps> = ({ search, onSearchChange, severity, onSeverityChange, t }) => (
  <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col xl:flex-row justify-between items-center gap-4">
    <div className="relative w-full max-w-xl group">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[var(--color-detail-blue)]" size={18} />
      <input
        type="text"
        placeholder={t('quality.allActivities')}
        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-[var(--color-detail-blue)]/10 focus:bg-white transition-all font-medium"
        value={search}
        onChange={e => onSearchChange(e.target.value)}
      />
    </div>
    <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl w-full xl:w-auto overflow-x-auto no-scrollbar">
      {(['ALL', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'] as const).map(sev => (
        <button
          key={sev}
          onClick={() => onSeverityChange(sev)}
          className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
            severity === sev ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {sev === 'ALL' ? t('admin.logs.allSeverities') : t(`admin.logs.severity.${sev}`)}
        </button>
      ))}
    </div>
  </div>
);
