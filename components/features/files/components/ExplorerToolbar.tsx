
import React from 'react';
import { List, LayoutGrid, UploadCloud, FolderPlus, Trash2, MoreHorizontal, Download, Search, Filter, X } from 'lucide-react';
import { BreadcrumbItem, FileNode, UserRole } from '../../../../types/index.ts';
import { Breadcrumbs } from './Breadcrumbs.tsx';

interface ExplorerToolbarProps {
  viewMode: 'grid' | 'list';
  onViewChange: (mode: 'grid' | 'list') => void;
  onNavigate: (folderId: string | null) => void;
  breadcrumbs: BreadcrumbItem[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onUploadClick: () => void;
  onCreateFolderClick: () => void;
  selectedCount: number;
  onDeleteSelected: () => void;
  onRenameSelected: () => void;
  onDownloadSelected: () => void;
  userRole: UserRole;
  selectedFilesData: FileNode[];
}

export const ExplorerToolbar: React.FC<ExplorerToolbarProps> = ({ 
  viewMode, onViewChange, onNavigate, breadcrumbs, searchTerm, onSearchChange,
  onUploadClick, onCreateFolderClick, selectedCount, onDeleteSelected, onRenameSelected, onDownloadSelected, userRole
}) => {
  const isClient = userRole === UserRole.CLIENT;

  return (
    <div className="bg-white border-b border-slate-200 flex flex-col shrink-0 z-20">
      
      {/* Top Bar: Navigation & Hierarchy */}
      <div className="px-6 py-4 flex items-center justify-between gap-4 border-b border-slate-50">
        <div className="flex-1 min-w-0 overflow-hidden">
          <Breadcrumbs breadcrumbs={breadcrumbs} onNavigate={onNavigate} />
        </div>

        <div className="flex items-center gap-2">
           <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/50">
             <button 
                onClick={() => onViewChange('list')} 
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                title="Lista Detalhada"
             >
                <List size={18}/>
             </button>
             <button 
                onClick={() => onViewChange('grid')} 
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                title="Grade de Ícones"
             >
                <LayoutGrid size={18}/>
             </button>
           </div>
        </div>
      </div>

      {/* Main Actions Area */}
      <div className="px-6 py-3 flex flex-wrap items-center justify-between gap-4 bg-slate-50/30">
        
        {/* Search Input */}
        <div className="relative group flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Rastrear por Lote ou Descritor..."
            className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600/30 transition-all placeholder:text-slate-400 shadow-sm" 
            value={searchTerm} 
            onChange={e => onSearchChange(e.target.value)} 
          />
          {searchTerm && (
              <button 
                onClick={() => onSearchChange('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-300 hover:text-slate-600 transition-all"
              >
                  <X size={14} />
              </button>
          )}
        </div>

        {/* Global Context Actions or Selection Actions */}
        <div className="flex items-center gap-3">
          {selectedCount > 0 ? (
            <div className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-2xl shadow-lg shadow-blue-600/20 animate-in zoom-in-95">
                <span className="text-[10px] font-black uppercase tracking-widest mr-2 border-r border-white/20 pr-3">{selectedCount} selecionados</span>
                <button onClick={onDownloadSelected} className="p-1.5 hover:bg-white/10 rounded-lg" title="Exportar"><Download size={14}/></button>
                {!isClient && (
                    <>
                        <button onClick={onRenameSelected} className="p-1.5 hover:bg-white/10 rounded-lg" title="Renomear"><MoreHorizontal size={14}/></button>
                        <button onClick={onDeleteSelected} className="p-1.5 hover:bg-red-500 rounded-lg" title="Excluir"><Trash2 size={14}/></button>
                    </>
                )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {!isClient && (
                <>
                  <button onClick={onUploadClick} className="flex items-center gap-2.5 px-5 py-2.5 bg-[#081437] text-white rounded-2xl text-[10px] font-black uppercase tracking-[2px] hover:bg-slate-800 transition-all active:scale-95 shadow-md">
                    <UploadCloud size={16} className="text-blue-400" /> Importar Ativo
                  </button>
                  <button onClick={onCreateFolderClick} className="p-2.5 text-slate-500 hover:text-slate-900 bg-white border border-slate-200 rounded-2xl transition-all shadow-sm" title="Novo Dossier">
                    <FolderPlus size={18} />
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
