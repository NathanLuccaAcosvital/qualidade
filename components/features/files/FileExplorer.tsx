
import React, { useState, useEffect, useCallback, useMemo, useRef, forwardRef, type ForwardedRef } from 'react'; 
import { 
  Folder, 
  FileText, 
  Search, 
  ChevronRight, 
  Download, 
  ArrowUp,
  CheckCircle2, 
  Clock,
  FileCheck,
  Star,
  MoreVertical,
  Trash2,
  Edit2,
  Check,
  Image as ImageIcon,
  SlidersHorizontal,
  ArrowDownAZ,
  ArrowUpZA,
  Calendar,
  Layers,
  LayoutGrid,
  List,
  MoreHorizontal,
  Home,
  Loader2,
  AlertCircle,
  Hourglass,
  FolderPlus
} from 'lucide-react';
import { useAuth } from '../../../context/authContext.tsx'; 
import { useTranslation } from 'react-i18next';
import { fileService } from '../../../lib/services/index.ts';
import { FileNode, FileType, BreadcrumbItem, FileMetadata, UserRole } from '../../../types.ts';
import { useToast } from '../../../context/notificationContext.tsx';
import { PaginatedResponse } from '../../../lib/services/interfaces.ts';

export interface FileExplorerHandle {
    triggerBulkDownload: () => Promise<void>;
    clearSelection: () => void;
}

type SortOption = 'NAME_ASC' | 'NAME_DESC' | 'DATE_NEW' | 'DATE_OLD' | 'STATUS';
type GroupOption = 'NONE' | 'STATUS' | 'PRODUCT' | 'DATE';

interface FileExplorerProps {
  allowUpload?: boolean; // Mantido, mas a lógica de renderização do botão será ajustada
  externalFiles?: FileNode[]; 
  flatMode?: boolean; 
  onRefresh?: () => void; 
  initialFolderId?: string | null; 
  currentFolderId?: string | null; 
  onNavigate?: (folderId: string | null) => void; 
  onDeleteFile?: (file: FileNode) => void; // Apenas para Admin ou casos específicos
  onSetStatusToPending?: (file: FileNode) => void;
  onEdit?: (file: FileNode) => void; // Edição de metadados de arquivo
  onUploadClick?: (currentFolderId: string | null) => void; 
  onFileSelect?: (file: FileNode | null) => void; 
  hideToolbar?: boolean; 
  filterStatus?: 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'; 
  onSelectionChange?: (count: number) => void; 
  autoHeight?: boolean; 
  refreshKey?: number;
  externalSearchQuery?: string;
  onCreateFolder?: (currentFolderId: string | null) => void; // NOVO: Para criar pasta
}

export const FileExplorer = forwardRef<FileExplorerHandle, FileExplorerProps>(({ 
  allowUpload = false, 
  externalFiles, 
  flatMode = false,
  onRefresh,
  initialFolderId = null,
  currentFolderId: controlledFolderId,
  onNavigate,
  onDeleteFile, // REMOVIDO: Será tratado fora para Quality
  onSetStatusToPending,
  onEdit,
  onUploadClick,
  onFileSelect,
  hideToolbar = false,
  filterStatus,
  onSelectionChange,
  autoHeight = false,
  refreshKey = 0,
  externalSearchQuery,
  onCreateFolder // NOVO
}, ref: ForwardedRef<FileExplorerHandle>) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { showToast } = useToast();
  
  const [internalSearchQuery, setInternalSearchQuery] = useState(''); 
  const [internalFolderId, setInternalFolderId] = useState<string | null>(initialFolderId);
  const activeFolderId = controlledFolderId !== undefined ? controlledFolderId : internalFolderId;

  const [files, setFiles] = useState<FileNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list'); 
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  
  const [sortBy, setSortBy] = useState<SortOption>('DATE_NEW');
  const [groupBy, setGroupBy] = useState<GroupOption>('NONE');
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [singleSelectedId, setSingleSelectedId] = useState<string | null>(null);

  const effectiveSearchQuery = externalSearchQuery !== undefined ? externalSearchQuery : internalSearchQuery;
  const effectiveFilterStatus: 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' = filterStatus || 'ALL';

  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
      if (loading || loadingMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(entries => {
          if (entries[0].isIntersecting && hasMore && !externalFiles) {
              setPage(prevPage => prevPage + 1);
          }
      });
      if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore, externalFiles]);

  React.useImperativeHandle(ref, () => ({
      triggerBulkDownload: handleBulkDownload,
      clearSelection: () => setSelectedFiles(new Set()), 
  }));

  const fetchFiles = useCallback(async (resetPage: boolean = false) => {
      if (!user) return;
      const currentPage = resetPage ? 1 : page;

      if (resetPage) setLoading(true);
      else setLoadingMore(true);

      try {
          let result: PaginatedResponse<FileNode> = { items: [], hasMore: false, total: 0 };

          if (externalFiles) {
            result = { items: externalFiles, hasMore: false, total: externalFiles.length };
          } else if (effectiveSearchQuery || effectiveFilterStatus !== 'ALL') {
            result = await fileService.getLibraryFiles(user, { search: effectiveSearchQuery, status: effectiveFilterStatus }, currentPage);
          } else {
            result = await fileService.getFiles(user, activeFolderId, currentPage);
          }

          const fetchedItems = result.items;
          const newHasMore = result.hasMore ?? false;

          setFiles(prev => resetPage ? fetchedItems : [...prev, ...fetchedItems]);
          setHasMore(newHasMore);
          setPage(currentPage);
      } catch (err) {
          console.error("Erro ao carregar arquivos:", err);
          showToast(t('files.errorLoadingFiles'), 'error');
      } finally {
          if (resetPage) setLoading(false);
          else setLoadingMore(false);
      }
  }, [user, page, activeFolderId, externalFiles, effectiveSearchQuery, effectiveFilterStatus, t, showToast]);

  const fetchBreadcrumbs = useCallback(async () => {
      if (!user || flatMode) return;
      try {
          const crumbs = await fileService.getBreadcrumbs(activeFolderId);
          setBreadcrumbs(crumbs.map(crumb => ({
            ...crumb,
            name: crumb.id === 'root' ? t('common.home') : crumb.name
          })));
      } catch (err) {
          console.error("Erro ao carregar breadcrumbs:", err);
          showToast(t('files.errorLoadingNavigation'), 'error');
      }
  }, [user, activeFolderId, flatMode, t, showToast]);

  useEffect(() => {
      fetchFiles(true); 
      fetchBreadcrumbs();
  }, [activeFolderId, effectiveSearchQuery, effectiveFilterStatus, flatMode, externalFiles, refreshKey, fetchFiles, fetchBreadcrumbs]);

  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selectedFiles.size);
    }
  }, [selectedFiles, onSelectionChange]);

  const handleNavigate = (folderId: string | null) => {
      setInternalSearchQuery('');
      setPage(1);
      if (onNavigate) onNavigate(folderId);
      else setInternalFolderId(folderId);
  };

  const handleFileClick = (file: FileNode) => {
      if (file.type === FileType.FOLDER) {
          handleNavigate(file.id);
      } else {
          if (onFileSelect) onFileSelect(file);
      }
      setActiveActionId(null);
  };

  const handleToggleSelect = (fileId: string) => {
      setSelectedFiles(prev => {
          const newSet = new Set(prev);
          if (newSet.has(fileId)) {
              newSet.delete(fileId);
          } else {
              newSet.add(fileId);
          }
          return newSet;
      });
  };

  const handleToggleFavorite = async (file: FileNode) => {
      if (!user) return;
      try {
          const isFavorite = await fileService.toggleFavorite(user, file.id);
          setFiles(prev => prev.map(f => f.id === file.id ? { ...f, isFavorite } : f));
          showToast(isFavorite ? t('files.addFavorite') : t('files.toggleFavorite'), 'info');
          if (onRefresh) onRefresh();
      } catch (err) {
          console.error("Erro ao alternar favorito:", err);
          showToast(t('files.errorToggleFavorite'), 'error');
      } finally {
          setActiveActionId(null);
      }
  };

  const handleDownload = async (file: FileNode) => {
      if (!user) return;
      try {
          const url = await fileService.getFileSignedUrl(user, file.id);
          window.open(url, '_blank');
          showToast(t('files.downloadingFile', { fileName: file.name }), 'info');
      } catch (err) {
          showToast(t('files.permissionError'), 'error');
      } finally {
          setActiveActionId(null);
      }
  };

  const handleBulkDownload = async () => {
      if (!user || selectedFiles.size === 0) return;
      showToast(t('files.downloading'), 'info');
      setSelectedFiles(new Set());
      showToast(t('files.bulkDownloadStarted', { count: selectedFiles.size }), 'success');
  };

  const handleActionClick = (fileId: string) => {
      setActiveActionId(activeActionId === fileId ? null : fileId);
      setSingleSelectedId(fileId);
  };

  const renderFileIcon = (file: FileNode) => {
    if (file.type === FileType.FOLDER) return <Folder size={20} className="text-blue-500" aria-hidden="true" />;
    if (file.type === FileType.PDF) return <FileText size={20} className="text-red-500" aria-hidden="true" />;
    if (file.type === FileType.IMAGE) return <ImageIcon size={20} className="text-emerald-500" aria-hidden="true" />;
    return <FileText size={20} className="text-slate-500" aria-hidden="true" />;
  };

  const renderStatusBadge = (status?: string) => {
    if (!status) return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-orange-50 text-orange-600 border border-orange-100 flex items-center gap-1.5 whitespace-nowrap" aria-label={t('files.pending')}>
            <Clock size={10} aria-hidden="true"/> {t('files.pending')}
        </span>
    );

    const isClient = user?.role === UserRole.CLIENT;

    let displayStatusText: string;
    let bgColor: string;
    let textColor: string;
    let borderColor: string;
    let Icon: React.ElementType;
    let ariaLabel: string;

    switch (status) {
        case 'APPROVED':
            displayStatusText = isClient ? t('files.clientStatus.availableForDownload') : t('files.groups.approved');
            bgColor = 'bg-emerald-50';
            textColor = 'text-emerald-600';
            borderColor = 'border-emerald-100';
            Icon = CheckCircle2;
            ariaLabel = isClient ? t('files.clientStatus.availableForDownload') : t('files.groups.approved');
            break;
        case 'PENDING':
            displayStatusText = isClient ? t('files.clientStatus.processing') : t('files.groups.pending');
            bgColor = 'bg-orange-50';
            textColor = 'text-orange-600';
            borderColor = 'border-orange-100';
            Icon = Clock;
            ariaLabel = isClient ? t('files.clientStatus.processing') : t('files.groups.pending');
            break;
        case 'REJECTED':
            displayStatusText = isClient ? t('files.clientStatus.technicalConference') : t('files.groups.rejected');
            bgColor = 'bg-red-50';
            textColor = 'text-red-600';
            borderColor = 'border-red-100';
            Icon = AlertCircle;
            ariaLabel = isClient ? t('files.clientStatus.technicalConference') : t('files.groups.rejected');
            break;
        default:
            displayStatusText = t('files.pending'); // Fallback
            bgColor = 'bg-orange-50';
            textColor = 'text-orange-600';
            borderColor = 'border-orange-100';
            Icon = Clock;
            ariaLabel = t('files.pending');
            break;
    }

    return (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${bgColor} ${textColor} ${borderColor} flex items-center gap-1.5 whitespace-nowrap`} aria-label={ariaLabel}>
            <Icon size={10} aria-hidden="true"/> {displayStatusText}
        </span>
    );
  };

  const filteredAndSortedFiles: { [key: string]: FileNode[] } = useMemo(() => {
    let currentFiles = externalFiles || files;
    
    if (effectiveFilterStatus !== 'ALL') {
        currentFiles = currentFiles.filter(f => f.metadata?.status === effectiveFilterStatus);
    }
    
    const sorted = [...currentFiles].sort((a, b) => {
        if (a.type === FileType.FOLDER && b.type !== FileType.FOLDER) return -1;
        if (a.type !== FileType.FOLDER && b.type === FileType.FOLDER) return 1;

        if (sortBy === 'NAME_ASC') return a.name.localeCompare(b.name);
        if (sortBy === 'NAME_DESC') return b.name.localeCompare(a.name);
        if (sortBy === 'DATE_NEW') return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        if (sortBy === 'DATE_OLD') return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        if (sortBy === 'STATUS') return (a.metadata?.status || '').localeCompare(b.metadata?.status || '');
        return 0;
    });

    if (groupBy === 'NONE') return { Ungrouped: sorted };

    const groups: { [key: string]: FileNode[] } = {};
    sorted.forEach(file => {
        let groupKey = t('files.groups.ungrouped');
        if (groupBy === 'STATUS') {
            groupKey = file.metadata?.status ? t(`files.groups.${file.metadata.status.toLowerCase()}`) : t('files.groups.pending');
        } else if (groupBy === 'PRODUCT' && file.metadata?.productName) {
            groupKey = file.metadata.productName;
        } else if (groupBy === 'DATE') {
            groupKey = new Date(file.updatedAt).toLocaleDateString();
        }

        if (!groups[groupKey]) groups[groupKey] = [];
        groups[groupKey].push(file);
    });

    for (const key in groups) {
      groups[key].sort((a, b) => {
          if (a.type === FileType.FOLDER && b.type !== FileType.FOLDER) return -1;
          if (a.type !== FileType.FOLDER && b.type === FileType.FOLDER) return 1;
          return 0;
      });
  }

    return groups;
  }, [files, externalFiles, sortBy, groupBy, effectiveFilterStatus, t, user?.role]);

  return (
    <div className={`flex flex-col h-full bg-white rounded-2xl ${!autoHeight ? 'flex-1' : ''}`} role="region" aria-label={t('menu.library')}>
      {!hideToolbar && (
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-50">
            <div className="flex items-center gap-2 md:gap-4 flex-1 w-full md:w-auto" role="navigation" aria-label={t('files.breadcrumbs')}>
                <button onClick={() => handleNavigate(null)} className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-all shadow-sm" aria-label={t('common.home')}>
                    <Home size={18} aria-hidden="true" />
                </button>
                <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar whitespace-nowrap flex-1">
                    {breadcrumbs.map((crumb, idx) => (
                        <React.Fragment key={crumb.id}>
                            <button onClick={() => handleNavigate(crumb.id === 'root' ? null : crumb.id)} className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md transition-all ${idx === breadcrumbs.length - 1 ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`} aria-label={crumb.name}>
                                {crumb.name}
                            </button>
                            {idx < breadcrumbs.length - 1 && <ChevronRight size={10} className="text-slate-300 shrink-0" aria-hidden="true" />}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative group flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={16} aria-hidden="true" />
                    <input
                        type="text"
                        placeholder={t('common.search')}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                        value={internalSearchQuery}
                        onChange={e => setInternalSearchQuery(e.target.value)}
                        aria-label={t('common.search')}
                    />
                </div>
                
                {selectedFiles.size > 0 && (
                    <button onClick={handleBulkDownload} className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg active:scale-95" aria-label={t('files.bulkDownload', { count: selectedFiles.size })}>
                        <Download size={16} aria-hidden="true" /> {t('files.download')} ({selectedFiles.size})
                    </button>
                )}

                {/* NOVO: Botão de Criar Pasta, visível se `onCreateFolder` for fornecido */}
                {onCreateFolder && (
                    <button 
                        onClick={() => onCreateFolder(activeFolderId)}
                        className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg active:scale-95"
                        aria-label={t('quality.createFolder')}
                    >
                        <FolderPlus size={16} aria-hidden="true" /> {t('quality.createFolder')}
                    </button>
                )}

                <div className="relative">
                    <button 
                        onClick={() => setIsViewMenuOpen(!isViewMenuOpen)}
                        className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-all shadow-sm"
                        aria-label={t('files.viewOptions')}
                        aria-haspopup="true"
                        aria-expanded={isViewMenuOpen}
                    >
                        <SlidersHorizontal size={18} aria-hidden="true" />
                    </button>
                    {isViewMenuOpen && (
                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-100 z-30 overflow-hidden animate-in fade-in slide-in-from-top-2 origin-top-right" role="menu" aria-orientation="vertical">
                            <div className="p-4 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase" aria-hidden="true">{t('files.viewOptions')}</div>
                            
                            <div className="p-4 space-y-4">
                                <div className="space-y-2">
                                    <p className="text-xs font-bold text-slate-800 mb-1">{t('files.sortBy')}</p>
                                    <div className="flex flex-col gap-1.5">
                                        {/* Sort by Name */}
                                        <div className="grid grid-cols-2 gap-1.5">
                                            <button onClick={() => { setSortBy('NAME_ASC'); setIsViewMenuOpen(false); }} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${sortBy === 'NAME_ASC' ? 'bg-blue-100 text-blue-700 font-bold shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`} role="menuitem">
                                                <ArrowDownAZ size={14} aria-hidden="true"/> {t('files.sort.nameAsc')}
                                            </button>
                                            <button onClick={() => { setSortBy('NAME_DESC'); setIsViewMenuOpen(false); }} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${sortBy === 'NAME_DESC' ? 'bg-blue-100 text-blue-700 font-bold shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`} role="menuitem">
                                                <ArrowUpZA size={14} aria-hidden="true"/> {t('files.sort.nameDesc')}
                                            </button>
                                        </div>
                                        {/* Sort by Date */}
                                        <div className="grid grid-cols-2 gap-1.5">
                                            <button onClick={() => { setSortBy('DATE_NEW'); setIsViewMenuOpen(false); }} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${sortBy === 'DATE_NEW' ? 'bg-blue-100 text-blue-700 font-bold shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`} role="menuitem">
                                                <Calendar size={14} aria-hidden="true"/> {t('files.sort.dateNew')}
                                            </button>
                                            <button onClick={() => { setSortBy('DATE_OLD'); setIsViewMenuOpen(false); }} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${sortBy === 'DATE_OLD' ? 'bg-blue-100 text-blue-700 font-bold shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`} role="menuitem">
                                                <Calendar size={14} aria-hidden="true"/> {t('files.sort.dateOld')}
                                            </button>
                                        </div>
                                        {/* Sort by Status */}
                                        <div>
                                            <button onClick={() => { setSortBy('STATUS'); setIsViewMenuOpen(false); }} className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${sortBy === 'STATUS' ? 'bg-blue-100 text-blue-700 font-bold shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`} role="menuitem">
                                                <FileCheck size={14} aria-hidden="true"/> {t('files.sort.status')}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-slate-100 pt-4 space-y-2">
                                    <p className="text-xs font-bold text-slate-800 mb-1">{t('files.groupBy')}</p>
                                    <div className="grid grid-cols-2 gap-1.5">
                                        <button onClick={() => { setGroupBy('NONE'); setIsViewMenuOpen(false); }} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${groupBy === 'NONE' ? 'bg-blue-100 text-blue-700 font-bold shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`} role="menuitem">
                                            <Layers size={14} aria-hidden="true"/> {t('files.groups.ungrouped')}
                                        </button>
                                        <button onClick={() => { setGroupBy('STATUS'); setIsViewMenuOpen(false); }} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${groupBy === 'STATUS' ? 'bg-blue-100 text-blue-700 font-bold shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`} role="menuitem">
                                            <FileCheck size={14} aria-hidden="true"/> {t('files.sort.status')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-4 border-t border-slate-100 flex justify-around" role="group" aria-label={t('files.viewMode')}>
                                <button onClick={() => { setViewMode('list'); setIsViewMenuOpen(false); }} className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-blue-100 text-blue-600 shadow-sm' : 'text-slate-400 hover:bg-slate-50'}`} aria-label={t('files.listView')} aria-pressed={viewMode === 'list'}><List size={18} aria-hidden="true"/></button>
                                <button onClick={() => { setViewMode('grid'); setIsViewMenuOpen(false); }} className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600 shadow-sm' : 'text-slate-400 hover:bg-slate-50'}`} aria-label={t('files.gridView')} aria-pressed={viewMode === 'grid'}><LayoutGrid size={18} aria-hidden="true"/></button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}

      {(loading && page === 1) ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4" role="status">
              <Loader2 size={40} className="animate-spin text-blue-500" aria-hidden="true" />
              <p className="font-bold text-xs uppercase tracking-widest">{t('common.loading')} {t('menu.library')}...</p>
          </div>
      ) : Object.keys(filteredAndSortedFiles).length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4 bg-white rounded-b-2xl" role="status">
              <FileText size={48} className="mb-3 opacity-20" aria-hidden="true" />
              <p className="font-medium">{t('files.noItems')}</p>
          </div>
      ) : (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 space-y-6" role="list">
              {Object.entries(filteredAndSortedFiles).map(([groupName, groupFiles]) => (
                  <div key={groupName} className="space-y-4" role="group" aria-labelledby={`${groupName.replace(/\s/g, '-')}-heading`}>
                      {groupBy !== 'NONE' && (
                          <h3 id={`${groupName.replace(/\s/g, '-')}-heading`} className="text-sm font-bold text-slate-800 flex items-center gap-2">
                              {groupName} <span className="text-slate-400 font-medium text-xs">({groupFiles.length})</span>
                          </h3>
                      )}
                      {viewMode === 'list' ? (
                          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden" role="table">
                              <table className="w-full text-left border-collapse" aria-label={`Arquivos do grupo ${groupName}`}>
                                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                                      <tr>
                                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider w-1/2" scope="col">{t('files.name')}</th>
                                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" scope="col">{t('files.productBatch')}</th>
                                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" scope="col">{t('files.date')}</th>
                                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" scope="col">{t('files.status')}</th>
                                          <th className="px-6 py-4" scope="col"></th>
                                      </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                      {groupFiles.map(file => (
                                          <tr key={file.id} className="hover:bg-slate-50 transition-colors group" role="row">
                                              <td className="px-6 py-3" role="cell" data-label={t('files.name')}>
                                                  <div className="flex items-center gap-3">
                                                      <input
                                                          type="checkbox"
                                                          className="w-4 h-4 text-blue-600 bg-white border-slate-300 rounded focus:ring-blue-500"
                                                          checked={selectedFiles.has(file.id)}
                                                          onChange={() => handleToggleSelect(file.id)}
                                                          aria-label={selectedFiles.has(file.id) ? t('files.deselectFile', { fileName: file.name }) : t('files.selectFile', { fileName: file.name })}
                                                      />
                                                      {renderFileIcon(file)}
                                                      <span className="text-sm font-bold text-slate-800 truncate">{file.name}</span>
                                                  </div>
                                              </td>
                                              <td className="px-6 py-3 text-sm text-slate-500 font-mono" role="cell" data-label={t('files.productBatch')}>{file.metadata?.productName || file.metadata?.batchNumber || '-'}</td>
                                              <td className="px-6 py-3 text-sm text-slate-500" role="cell" data-label={t('files.date')}>{file.updatedAt}</td>
                                              <td className="px-6 py-3" role="cell" data-label={t('files.status')}>{renderStatusBadge(file.metadata?.status)}</td>
                                              <td className="px-6 py-3 text-right" role="cell">
                                                  <div className="flex items-center justify-end gap-2">
                                                      {file.type !== FileType.FOLDER && (
                                                          <button
                                                              onClick={(e) => { e.stopPropagation(); handleToggleFavorite(file); }}
                                                              className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-full transition-all"
                                                              aria-label={file.isFavorite ? t('files.toggleFavorite') : t('files.addFavorite')}
                                                          >
                                                              <Star size={16} fill={file.isFavorite ? 'currentColor' : 'none'} strokeWidth={file.isFavorite ? 2.5 : 2} aria-hidden="true" />
                                                          </button>
                                                      )}
                                                      <button 
                                                          onClick={(e) => { e.stopPropagation(); handleFileClick(file); }}
                                                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
                                                          aria-label={file.type === FileType.FOLDER ? t('common.open') : t('files.viewPDF')}
                                                      >
                                                          <MoreHorizontal size={16} aria-hidden="true" />
                                                      </button>
                                                      {allowUpload && file.type !== FileType.FOLDER && ( // allowUpload é uma prop do FileExplorer, se true, mostra o download
                                                          <button 
                                                              onClick={(e) => { e.stopPropagation(); handleDownload(file); }}
                                                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
                                                              aria-label={t('common.download')}
                                                          >
                                                              <Download size={16} aria-hidden="true" />
                                                          </button>
                                                      )}
                                                      {(file.type !== FileType.FOLDER && (onDeleteFile || onSetStatusToPending || onEdit)) && (
                                                          <div className="relative">
                                                              <button
                                                                  onClick={(e) => { e.stopPropagation(); handleActionClick(file.id); }}
                                                                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all opacity-0 group-hover:opacity-100"
                                                                  aria-label={t('common.moreActions')}
                                                                  aria-haspopup="true"
                                                                  aria-expanded={activeActionId === file.id}
                                                              >
                                                                  <MoreVertical size={16} aria-hidden="true" />
                                                              </button>
                                                              {activeActionId === file.id && (
                                                                  <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-lg border border-slate-100 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200" role="menu" aria-orientation="vertical">
                                                                      {onEdit && (
                                                                          <button
                                                                              onClick={(e) => { e.stopPropagation(); onEdit(file); setActiveActionId(null); }}
                                                                              className="w-full text-left px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                                                                              role="menuitem"
                                                                          >
                                                                              <Edit2 size={14} aria-hidden="true" className="text-blue-500" /> {t('common.edit')}
                                                                          </button>
                                                                      )}
                                                                      {onSetStatusToPending && file.metadata?.status !== 'PENDING' && (
                                                                          <button
                                                                              onClick={(e) => { e.stopPropagation(); onSetStatusToPending(file); setActiveActionId(null); }}
                                                                              className="w-full text-left px-4 py-3 text-xs font-bold text-orange-600 hover:bg-orange-50 flex items-center gap-2 transition-colors"
                                                                              role="menuitem"
                                                                          >
                                                                              <Hourglass size={14} aria-hidden="true" /> {t('quality.markAsPending')}
                                                                          </button>
                                                                      )}
                                                                      {onDeleteFile && ( // onDeleteFile só será passado se for permitido pelo pai
                                                                          <button
                                                                              onClick={(e) => { e.stopPropagation(); onDeleteFile(file); setActiveActionId(null); }}
                                                                              className="w-full text-left px-4 py-3 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                                                                              role="menuitem"
                                                                          >
                                                                              <Trash2 size={14} aria-hidden="true" /> {t('common.delete')}
                                                                          </button>
                                                                      )}
                                                                  </div>
                                                              )}
                                                          </div>
                                                      )}
                                                  </div>
                                              </td>
                                          </tr>
                                      ))}
                                  </tbody>
                              </table>
                          </div>
                      ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                              {groupFiles.map(file => (
                                  <div 
                                      key={file.id} 
                                      className="relative bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group flex flex-col items-start gap-3"
                                      onClick={() => handleFileClick(file)}
                                      role="listitem button"
                                      aria-label={`${file.name}, ${file.type === FileType.FOLDER ? 'Pasta' : 'Arquivo'}. Status: ${file.metadata?.status ? t(`files.groups.${file.metadata.status.toLowerCase()}`) : t('files.pending')}`}
                                  >
                                      <div className="absolute top-3 left-3">
                                          <input
                                              type="checkbox"
                                              className="w-4 h-4 text-blue-600 bg-white border-slate-300 rounded focus:ring-blue-500"
                                              checked={selectedFiles.has(file.id)}
                                              onChange={(e) => { e.stopPropagation(); handleToggleSelect(file.id); }}
                                              aria-label={selectedFiles.has(file.id) ? t('files.deselectFile', { fileName: file.name }) : t('files.selectFile', { fileName: file.name })}
                                          />
                                      </div>
                                      
                                      <div className="flex justify-between items-start w-full">
                                          <div className={`p-3 rounded-lg ${file.type === FileType.FOLDER ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'} group-hover:scale-110 transition-transform`} aria-hidden="true">
                                              {renderFileIcon(file)}
                                          </div>
                                          {file.type !== FileType.FOLDER && (
                                              <button
                                                  onClick={(e) => { e.stopPropagation(); handleToggleFavorite(file); }}
                                                  className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-full transition-all opacity-0 group-hover:opacity-100"
                                                  aria-label={file.isFavorite ? t('files.toggleFavorite') : t('files.addFavorite')}
                                              >
                                                  <Star size={18} fill={file.isFavorite ? 'currentColor' : 'none'} strokeWidth={file.isFavorite ? 2.5 : 2} aria-hidden="true" />
                                              </button>
                                          )}
                                      </div>
                                      
                                      <p className="text-sm font-bold text-slate-800 truncate w-full pr-8">{file.name}</p>
                                      <div className="flex items-center gap-2 text-slate-400 text-xs mt-auto w-full">
                                          <Clock size={12} aria-hidden="true" />
                                          <span>{file.updatedAt}</span>
                                      </div>
                                      <div className="flex items-center justify-between w-full mt-2">
                                          {renderStatusBadge(file.metadata?.status)}
                                          {allowUpload && file.type !== FileType.FOLDER && (
                                              <button 
                                                  onClick={(e) => { e.stopPropagation(); handleDownload(file); }}
                                                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all opacity-0 group-hover:opacity-100"
                                                  aria-label={t('common.download')}
                                              >
                                                  <Download size={16} aria-hidden="true" />
                                              </button>
                                          )}
                                          {(file.type !== FileType.FOLDER && (onDeleteFile || onSetStatusToPending || onEdit)) && (
                                              <div className="relative">
                                                  <button
                                                      onClick={(e) => { e.stopPropagation(); handleActionClick(file.id); }}
                                                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all opacity-0 group-hover:opacity-100"
                                                      aria-label={t('common.moreActions')}
                                                      aria-haspopup="true"
                                                      aria-expanded={activeActionId === file.id}
                                                  >
                                                      <MoreVertical size={16} aria-hidden="true" />
                                                  </button>
                                                  {activeActionId === file.id && (
                                                      <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-lg border border-slate-100 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200" role="menu" aria-orientation="vertical">
                                                          {onEdit && (
                                                              <button
                                                                  onClick={(e) => { e.stopPropagation(); onEdit(file); setActiveActionId(null); }}
                                                                  className="w-full text-left px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                                                                  role="menuitem"
                                                              >
                                                                  <Edit2 size={14} aria-hidden="true" className="text-blue-500" /> {t('common.edit')}
                                                              </button>
                                                          )}
                                                          {onSetStatusToPending && file.metadata?.status !== 'PENDING' && (
                                                              <button
                                                                  onClick={(e) => { e.stopPropagation(); onSetStatusToPending(file); setActiveActionId(null); }}
                                                                  className="w-full text-left px-4 py-3 text-xs font-bold text-orange-600 hover:bg-orange-50 flex items-center gap-2 transition-colors"
                                                                  role="menuitem"
                                                              >
                                                                  <Hourglass size={14} aria-hidden="true" /> {t('quality.markAsPending')}
                                                              </button>
                                                          )}
                                                          {onDeleteFile && (
                                                              <button
                                                                  onClick={(e) => { e.stopPropagation(); onDeleteFile(file); setActiveActionId(null); }}
                                                                  className="w-full text-left px-4 py-3 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                                                                  role="menuitem"
                                                              >
                                                                  <Trash2 size={14} aria-hidden="true" /> {t('common.delete')}
                                                              </button>
                                                          )}
                                                      </div>
                                                  )}
                                              </div>
                                          )}
                                      </div>
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>
              ))}

              {hasMore && !externalFiles && (
                  <div ref={lastElementRef} className="py-8 flex justify-center">
                      {loadingMore ? (
                          <Loader2 size={24} className="animate-spin text-blue-500" aria-hidden="true" />
                      ) : (
                          <button onClick={() => setPage(prevPage => prevPage + 1)} className="px-6 py-2 bg-blue-500 text-white rounded-full text-sm font-bold hover:bg-blue-600 transition-all">
                              {t('common.loading')}...
                          </button>
                      )}
                  </div>
              )}
          </div>
      )}
    </div>
  );
});