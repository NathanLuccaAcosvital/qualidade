
import React from 'react';
import { Home, ChevronRight, List, LayoutGrid } from 'lucide-react';

interface ExplorerToolbarProps {
  viewMode: 'grid' | 'list';
  onViewChange: (mode: 'grid' | 'list') => void;
  onHome: () => void;
  title: string;
}

export const ExplorerToolbar: React.FC<ExplorerToolbarProps> = ({ viewMode, onViewChange, onHome, title }) => (
  <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
    <div className="flex items-center gap-2">
      <button 
        onClick={onHome} 
        className="p-2 hover:bg-white rounded-xl transition-all hover:text-blue-600 group"
        aria-label="Ir para raiz"
      >
        <Home size={18} className="text-slate-400 group-hover:text-blue-500"/>
      </button>
      <ChevronRight size={14} className="text-slate-300" />
      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{title}</span>
    </div>
    
    <div className="flex bg-slate-200/50 p-1 rounded-lg">
      <ViewButton 
        active={viewMode === 'list'} 
        onClick={() => onViewChange('list')} 
        icon={List} 
        label="Lista" 
      />
      <ViewButton 
        active={viewMode === 'grid'} 
        onClick={() => onViewChange('grid')} 
        icon={LayoutGrid} 
        label="Grade" 
      />
    </div>
  </div>
);

const ViewButton = ({ active, onClick, icon: Icon, label }: any) => (
  <button 
    onClick={onClick} 
    className={`p-1.5 rounded-md transition-all ${active ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
    aria-label={`Visualização em ${label}`}
  >
    <Icon size={16}/>
  </button>
);
