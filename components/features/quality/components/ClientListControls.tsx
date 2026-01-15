
import React from 'react';
import { Search, UserPlus, Building2, LayoutGrid, List, SlidersHorizontal } from 'lucide-react';

interface ToolbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  onAddUser: () => void;
  onAddCompany: () => void;
  t: any;
}

export const ClientListToolbar: React.FC<ToolbarProps> = ({ search, onSearchChange, onAddUser, onAddCompany, t }) => (
  <div className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col xl:flex-row justify-between items-center gap-6">
    <div className="relative w-full max-w-xl group">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[var(--color-detail-blue)] transition-colors" size={20} />
      <input
        type="text"
        placeholder={t('quality.searchClient')}
        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-[var(--color-detail-blue)]/10 focus:bg-white focus:border-[var(--color-detail-blue)] transition-all font-medium"
        value={search}
        onChange={e => onSearchChange(e.target.value)}
      />
    </div>
    <div className="flex items-center gap-3 w-full xl:w-auto justify-end">
      <button onClick={onAddUser} className="bg-[var(--color-primary-dark-blue)] text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[2px] flex items-center gap-3 shadow-xl shadow-[var(--color-primary-dark-blue)]/20 active:scale-95 transition-all hover:bg-slate-800">
        <UserPlus size={18} className="text-[var(--color-detail-blue)]" /> {t('quality.newClientUser')}
      </button>
      <button onClick={onAddCompany} className="bg-[var(--color-detail-blue)] text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[2px] flex items-center gap-3 shadow-xl shadow-[var(--color-detail-blue)]/20 active:scale-95 transition-all hover:bg-blue-500">
        <Building2 size={18} /> {t('quality.newCompany')}
      </button>
    </div>
  </div>
);

interface FilterProps {
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  sortKey: string;
  onSortChange: (key: any) => void;
  status: string;
  onStatusChange: (status: any) => void;
  t: any;
}

export const ClientListFilters: React.FC<FilterProps> = ({ viewMode, onViewModeChange, sortKey, onSortChange, status, onStatusChange, t }) => (
  <div className="flex flex-col lg:flex-row justify-between items-center gap-4 px-2">
    <div className="flex items-center gap-4 w-full lg:w-auto">
      <div className="flex bg-slate-200/50 p-1 rounded-xl">
        <button onClick={() => onViewModeChange('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-[var(--color-detail-blue)] shadow-sm' : 'text-slate-500'}`}><List size={18}/></button>
        <button onClick={() => onViewModeChange('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-[var(--color-detail-blue)] shadow-sm' : 'text-slate-500'}`}><LayoutGrid size={18}/></button>
      </div>
      <div className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm">
        <SlidersHorizontal size={14} className="text-slate-400" />
        <select value={sortKey} onChange={(e) => onSortChange(e.target.value)} className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-slate-600 focus:ring-0 cursor-pointer">
          <option value="NAME">{t('files.sort.nameAsc')}</option>
          <option value="PENDING">{t('dashboard.criticalPendencies')}</option>
          <option value="LAST_ANALYSIS">{t('dashboard.lastAnalysis')}</option>
          <option value="NEWEST">{t('dashboard.recent')}</option>
        </select>
      </div>
    </div>
    <div className="flex items-center gap-1.5 bg-slate-200/50 p-1.5 rounded-2xl w-full lg:w-auto">
      {(['ALL', 'ACTIVE'] as const).map(s => (
        <button key={s} onClick={() => onStatusChange(s)} className={`flex-1 lg:flex-none px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${status === s ? 'bg-white text-[var(--color-primary-dark-blue)] shadow-md' : 'text-slate-500'}`}>
          {s === 'ALL' ? t('dashboard.allClients') : t('dashboard.activeClients')}
        </button>
      ))}
    </div>
  </div>
);
