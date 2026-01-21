import React from 'react';
import { Search, X } from 'lucide-react';

interface AuditToolbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  severity: string;
  onSeverityChange: (sev: any) => void;
  t: any;
}

export const AuditLogToolbar: React.FC<AuditToolbarProps> = ({ search, onSearchChange, severity, onSeverityChange, t }) => (
  <div className="flex flex-col xl:flex-row justify-between items-center gap-6 w-full animate-in fade-in slide-in-from-top-2 duration-500">
    
    {/* Barra de Busca Integrada */}
    <div className="relative w-full max-w-xl group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
        <Search size={18} />
      </div>
      <input
        type="text"
        placeholder={t('quality.allActivities')}
        className="w-full pl-12 pr-12 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-500/30 transition-all font-medium shadow-sm"
        value={search}
        onChange={e => onSearchChange(e.target.value)}
      />
      {search && (
        <button 
          onClick={() => onSearchChange('')}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-300 hover:text-slate-600 rounded-full transition-all"
        >
          <X size={16} />
        </button>
      )}
    </div>

    {/* Filtros de Refinamento (Segmented Control Style) */}
    <div className="flex items-center gap-1 bg-slate-200/50 p-1.5 rounded-2xl w-full xl:w-auto overflow-x-auto no-scrollbar border border-slate-200/50">
      {(['ALL', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'] as const).map(sev => {
        const isActive = severity === sev;
        return (
          <button
            key={sev}
            onClick={() => onSeverityChange(sev)}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              isActive 
                ? 'bg-white text-slate-900 shadow-md ring-1 ring-black/5' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'
            }`}
          >
            {sev === 'ALL' ? t('admin.logs.allSeverities') : t(`admin.logs.severity.${sev}`)}
          </button>
        );
      })}
    </div>
  </div>
);