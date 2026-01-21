
import React from 'react';
import { Search, Building2, LayoutGrid, List, SlidersHorizontal, X, Loader2 } from 'lucide-react';

interface ToolbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  onAddCompany: () => void;
  isLoading?: boolean;
  t: any;
}

export const ClientListToolbar: React.FC<ToolbarProps> = ({ search, onSearchChange, onAddCompany, isLoading, t }) => (
  <div className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col xl:flex-row justify-between items-center gap-6 transition-all duration-300">
    <div className="relative w-full max-w-xl group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300">
        {isLoading ? (
            <Loader2 size={18} className="animate-spin text-blue-500" />
        ) : (
            <Search className="text-slate-400 group-focus-within:text-[var(--color-detail-blue)]" size={20} />
        )}
      </div>
      <input
        type="text"
        placeholder={t('quality.searchClient')}
        className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-[var(--color-detail-blue)]/10 focus:bg-white focus:border-[var(--color-detail-blue)] transition-all font-medium"
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
    <div className="flex items-center gap-3 w-full xl:w-auto justify-end">
      <button onClick={onAddCompany} className="bg-[var(--color-detail-blue)] text-white px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[2px] flex items-center gap-3 shadow-xl shadow-[var(--color-detail-blue)]/20 active:scale-95 transition-all hover:bg-blue-500">
        <Building2 size={18} /> Cadastrar Nova Empresa
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
      <div className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm hover:border-[var(--color-detail-blue)]/50 transition-colors">
        <SlidersHorizontal size={14} className="text-slate-400" />
        <select value={sortKey} onChange={(e) => onSortChange(e.target.value)} className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-slate-600 focus:ring-0 cursor-pointer">
          <option value="NAME">Ordem Alfabética</option>
          <option value="PENDING">Críticas Primeiro</option>
          <option value="NEWEST">Recentes</option>
        </select>
      </div>
    </div>
    <div className="flex items-center gap-1.5 bg-slate-200/50 p-1.5 rounded-2xl w-full lg:w-auto">
      {(['ALL', 'ACTIVE'] as const).map(s => (
        <button key={s} onClick={() => onStatusChange(s)} className={`flex-1 lg:flex-none px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${status === s ? 'bg-white text-[var(--color-primary-dark-blue)] shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>
          {s === 'ALL' ? "Ver Todas" : "Apenas Ativas"}
        </button>
      ))}
    </div>
  </div>
);
