
import React from 'react';
// Fix: Added missing Lucide icon imports
import { Home, ChevronRight, List, LayoutGrid, Search, UploadCloud, FolderPlus, X, Edit2, Download, MoreVertical, Trash2 } from 'lucide-react';
import { BreadcrumbItem, FileNode, FileType, UserRole } from '../../../../types/index.ts';
import { useTranslation } from 'react-i18next';

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
  onRenameSelected: () => void; // Apenas para um único item
  onDownloadSelected: () => void; // Apenas para um único arquivo
  selectedFilesData: FileNode[]; // Added to pass data about selected files
  userRole: UserRole; // Adicionada a prop userRole
}

export const ExplorerToolbar: React.FC<ExplorerToolbarProps> = ({ 
  viewMode, 
  onViewChange, 
  onNavigate, 
  breadcrumbs, 
  searchTerm, 
  onSearchChange,
  onUploadClick,
  onCreateFolderClick,
  selectedCount,
  onDeleteSelected,
  onRenameSelected,
  onDownloadSelected,
  selectedFilesData,
  userRole // Recebe userRole
}) => {
  const { t } = useTranslation();
  const isClient = userRole === UserRole.CLIENT;

  return (
    <div className="bg-white/80 backdrop-blur-md border-b border-slate-200/70 p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
      
      {/* Breadcrumbs como navegação principal */}
      <div className="flex items-center gap-1.5 flex-wrap flex-1 min-w-0">
        <Breadcrumbs breadcrumbs={breadcrumbs} onNavigate={onNavigate} />
        {/* Integração da busca no toolbar, para acesso rápido */}
        <SearchInput searchTerm={searchTerm} onSearchChange={onSearchChange} t={t} />
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {selectedCount > 0 ? (
          <SelectedActions 
            count={selectedCount} 
            onDelete={onDeleteSelected} 
            onRename={onRenameSelected} 
            onDownload={onDownloadSelected}
            selectedFilesData={selectedFilesData}
            t={t}
            userRole={userRole} // Passa userRole para SelectedActions
          />
        ) : (
          <PrimaryActions 
            onUpload={onUploadClick} 
            onCreateFolder={onCreateFolderClick} 
            viewMode={viewMode} 
            onViewChange={onViewChange}
            t={t}
            userRole={userRole} // Passa userRole para PrimaryActions
          />
        )}
      </div>
    </div>
  );
};

/* --- Sub-componentes do Toolbar --- */

const Breadcrumbs: React.FC<{ breadcrumbs: BreadcrumbItem[]; onNavigate: (id: string | null) => void }> = ({ breadcrumbs, onNavigate }) => (
  <nav className="flex items-center text-sm font-medium text-slate-500 overflow-x-auto whitespace-nowrap custom-scrollbar -ml-2 -mr-2 px-2 py-1 bg-white/70 backdrop-blur-sm rounded-xl border border-slate-100 shadow-sm" aria-label="Navegação do diretório">
    {breadcrumbs.map((item, index) => (
      <React.Fragment key={item.id || 'home'}>
        <button 
          onClick={() => onNavigate(item.id)}
          className={`px-2 py-1 rounded-lg transition-colors ${index === breadcrumbs.length - 1 ? 'font-bold text-[var(--color-detail-blue)] bg-blue-50' : 'text-slate-600 hover:bg-slate-100'}`}
          aria-label={item.name}
        >
          {item.name}
        </button>
        {index < breadcrumbs.length - 1 && <ChevronRight size={14} className="text-slate-400 mx-0.5" />}
      </React.Fragment>
    ))}
  </nav>
);

const SearchInput: React.FC<{ searchTerm: string; onSearchChange: (term: string) => void; t: any }> = ({ searchTerm, onSearchChange, t }) => (
  <div className="relative flex-1 min-w-[200px] max-w-sm ml-4 hidden md:block">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[var(--color-detail-blue)] transition-colors" size={16} />
    <input 
      type="text" 
      placeholder={t('files.searchPlaceholder')}
      className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm w-full outline-none focus:ring-2 focus:ring-[var(--color-detail-blue)]/20 focus:border-[var(--color-detail-blue)] font-medium" 
      value={searchTerm} 
      onChange={e => onSearchChange(e.target.value)} 
      aria-label={t('files.searchPlaceholder')}
    />
  </div>
);

const PrimaryActions: React.FC<{ 
  onUpload: () => void; 
  onCreateFolder: () => void; 
  viewMode: 'grid' | 'list'; 
  onViewChange: (mode: 'grid' | 'list') => void; 
  t: any;
  userRole: UserRole; // Recebe userRole
}> = ({ 
  onUpload, onCreateFolder, viewMode, onViewChange, t, userRole 
}) => {
  const isClient = userRole === UserRole.CLIENT;
  return (
    <div className="flex items-center gap-3">
      {/* Botões de Upload e Nova Pasta são visíveis apenas para não-clientes */}
      {!isClient && (
        <>
          <button 
            onClick={onUpload} 
            className="bg-[var(--color-detail-blue)] hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-[var(--color-detail-blue)]/20"
            aria-label={t('files.upload.title')}
          >
            <UploadCloud size={16} /> <span className="hidden md:inline">{t('files.upload.button')}</span>
          </button>
          <button 
            onClick={onCreateFolder} 
            className="bg-[var(--color-primary-dark-blue)] hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-[var(--color-primary-dark-blue)]/20"
            aria-label={t('files.createFolder.title')}
          >
            <FolderPlus size={16} /> <span className="hidden md:inline">{t('files.createFolder.button')}</span>
          </button>
          <div className="h-6 w-px bg-slate-100 hidden md:block" />
        </>
      )}
      
      <div className="flex bg-slate-200/50 p-1 rounded-lg">
        <ViewButton 
          active={viewMode === 'list'} 
          onClick={() => onViewChange('list')} 
          icon={List} 
          label={t('files.listView')} 
        />
        <ViewButton 
          active={viewMode === 'grid'} 
          onClick={() => onViewChange('grid')} 
          icon={LayoutGrid} 
          label={t('files.gridView')} 
        />
      </div>
    </div>
  );
};

const SelectedActions: React.FC<{ 
  count: number; 
  onDelete: () => void; 
  onRename: () => void; 
  onDownload: () => void; 
  t: any; 
  selectedFilesData: FileNode[];
  userRole: UserRole; // Recebe userRole
}> = ({ count, onDelete, onRename, onDownload, t, selectedFilesData, userRole }) => {
  const isSingleFileSelected = count === 1 && selectedFilesData[0]?.type !== FileType.FOLDER;
  const isSingleItemSelected = count === 1;
  const isClient = userRole === UserRole.CLIENT;

  return (
    <div className="flex items-center gap-3 bg-blue-50 text-blue-800 px-4 py-2.5 rounded-xl border border-blue-100 shadow-sm animate-in zoom-in-95">
      <span className="text-xs font-black uppercase tracking-widest">{count} {count === 1 ? t('files.itemSelected') : t('files.itemsSelected')}</span>
      <div className="h-6 w-px bg-blue-100" />
      
      {/* Botões de Excluir e Renomear são visíveis apenas para não-clientes */}
      {!isClient && (
        <>
          <button 
            onClick={onDelete} 
            className="p-2 text-red-600 hover:bg-red-100 rounded-md transition-all"
            aria-label={t('common.delete')}
          >
            <Trash2 size={18} />
          </button>
          {isSingleItemSelected && (
            <button 
              onClick={onRename} 
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-md transition-all"
              aria-label={t('files.rename.title')}
            >
              <Edit2 size={18} />
            </button>
          )}
        </>
      )}

      {/* Botão de Download sempre visível para arquivos (se for o único selecionado) */}
      {isSingleFileSelected && (
        <button 
          onClick={onDownload} 
          className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-md transition-all"
          aria-label={t('files.downloadButton')}
        >
          <Download size={18} />
        </button>
      )}
    </div>
  );
};

const ViewButton = ({ active, onClick, icon: Icon, label }: any) => (
  <button 
    onClick={onClick} 
    className={`p-1.5 rounded-md transition-all ${active ? 'bg-white shadow-sm text-[var(--color-detail-blue)]' : 'text-slate-400 hover:text-slate-600'}`}
    aria-label={`Visualização em ${label}`}
  >
    <Icon size={16}/>
  </button>
);
