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
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../../context/authContext.tsx'; 
import { useTranslation } from 'react-i18next';
import { fileService } from '../../../lib/services/index.ts';
import { FileNode, FileType, BreadcrumbItem, FileMetadata } from '../../../types.ts';

export interface FileExplorerHandle {
    triggerBulkDownload: () => Promise<void>;
    clearSelection: () => void;
}

type SortOption = 'NAME_ASC' | 'NAME_DESC' | 'DATE_NEW' | 'DATE_OLD' | 'STATUS';
type GroupOption = 'NONE' | 'STATUS' | 'PRODUCT' | 'DATE';

interface FileExplorerProps {
  allowUpload?: boolean;
  externalFiles?: FileNode[]; 
  flatMode?: boolean; 
  onRefresh?: () => void; 
  initialFolderId?: string | null; 
  currentFolderId?: string | null; 
  onNavigate?: (folderId: string | null) => void; 
  onDelete?: (file: FileNode) => void;
  onEdit?: (file: FileNode) => void;
  onUploadClick?: (currentFolderId: string | null) => void; 
  onFileSelect?: (file: FileNode | null) => void; 
  hideToolbar?: boolean; 
  filterStatus?: 'ALL' | 'PENDING' | 'APPROVED'; 
  onSelectionChange?: (count: number) => void; 
  autoHeight?: boolean; 
}

export const FileExplorer = forwardRef<FileExplorerHandle, FileExplorerProps>(({ 
  allowUpload = false, 
  externalFiles, 
  flatMode = false,
  onRefresh,
  initialFolderId = null,
  currentFolderId: controlledFolderId,
  onNavigate,
  onDelete,
  onEdit,
  onUploadClick,
  onFileSelect,
  hideToolbar = false,
  filterStatus = 'ALL',
  onSelectionChange,
  autoHeight = false
}, ref: ForwardedRef<FileExplorerHandle>) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  
  const [internalFolderId, setInternalFolderId] = useState<string | null>(initialFolderId);
  const activeFolderId = controlledFolderId !== undefined ? controlledFolderId : internalFolderId;

  // Pagination State
  const [files, setFiles] = useState<FileNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const [searchQuery, searchQuerySet] = useState('');
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list'); 
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  
  const [sortBy, setSortBy] = useState<SortOption>('DATE_NEW');
  const [groupBy, setGroupBy] = useState<GroupOption>('NONE');
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [singleSelectedId, setSingleSelectedId] = useState<string | null>(null);

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

  // Expose methods via ref for parent components
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
          let result: FileNode[] | { items: FileNode[]; hasMore: boolean; total: number; } = { items: [], hasMore: false, total: 0 };

          if (externalFiles) {
            // If externalFiles are provided, we don't paginate or call the service directly
            result = externalFiles;
            setHasMore(false);
          } else if (searchQuery) {
            result = await fileService.searchFiles(user, searchQuery, currentPage);
          } else {
            result = await fileService.getFiles(user, activeFolderId, currentPage);
          }

          const fetchedItems = (result as { items: FileNode[] }).items || (result as FileNode[]);
          const newHasMore = (result as { hasMore: boolean }).hasMore ?? false;

          setFiles(prev => resetPage ? fetchedItems : [...prev, ...fetchedItems]);
          setHasMore(newHasMore);
          setPage(currentPage);
      } catch (err) {
          console.error("Erro ao carregar arquivos:", err);
      } finally {
          if (resetPage) setLoading(false);
          else setLoadingMore(false);
      }
  }, [user, page, searchQuery, activeFolderId, externalFiles]);

  const fetchBreadcrumbs = useCallback(async () => {
      if (!user || flatMode) return;
      try {
          const crumbs = await fileService.getBreadcrumbs(activeFolderId);
          setBreadcrumbs(crumbs);
      } catch (err) {
          console.error("Erro ao carregar breadcrumbs:", err);
      }
  }, [user, activeFolderId, flatMode]);

  useEffect(() => {
      fetchFiles(true); // Always reset files when folder, search or externalFiles change
      fetchBreadcrumbs();
  }, [activeFolderId, searchQuery, flatMode, externalFiles, filterStatus, fetchFiles, fetchBreadcrumbs]);

  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selectedFiles.size);
    }
  }, [selectedFiles, onSelectionChange]);

  const handleNavigate = (folderId: string | null) => {
      // Fix: Used the correct setter `searchQuerySet` for `searchQuery` state.
      searchQuerySet('');
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
          if (onRefresh) onRefresh(); // Notify parent to refresh if it's a favorites/recent view
      } catch (err) {
          console.error("Erro ao alternar favorito:", err);
      } finally {
          setActiveActionId(null);
      }
  };

  const handleDownload = async (file: FileNode) => {
      if (!user) return;
      try {
          const url = await fileService.getFileSignedUrl(user, file.id);
          window.open(url, '_blank');
      } catch (err) {
          alert(t('files.permissionError'));
      } finally {
          setActiveActionId(null);
      }
  };

  const handleBulkDownload = async () => {
      if (!user || selectedFiles.size === 0) return;
      alert(t('files.downloading'));
      // Lógica de download em massa (simulada ou via API de backend para zip)
      // Exemplo: Iterar e baixar individualmente, ou enviar IDs para um endpoint de zip
      setSelectedFiles(new Set()); // Clear selection after initiating download
  };

  const handleActionClick = (fileId: string) => {
      setActiveActionId(activeActionId === fileId ? null : fileId);
      setSingleSelectedId(fileId); // Set single selected file for contextual menu
  };

  const handleDelete = async (file: FileNode) => {
      if (!user || !onDelete) return;
      if (!window.confirm(`Tem certeza que deseja excluir "${file.name}"?`)) return;
      try {
          await fileService.deleteFile(user, file.id);
          setFiles(prev => prev.filter(f => f.id !== file.id));
          onDelete(file);
      } catch (err) {
          alert("Erro ao excluir arquivo.");
      } finally {
          setActiveActionId(null);
      }
  };

  const handleEdit = (file: FileNode) => {
    if (onEdit) onEdit(file);
    setActiveActionId(null);
  };

  const filteredAndSortedFiles = useMemo(() => {
    let currentFiles = externalFiles || files;

    if (filterStatus !== 'ALL') {
        currentFiles = currentFiles.filter(f => f.metadata?.status === filterStatus);
    }
    
    // Sort
    const sorted = [...currentFiles].sort((a, b) => {
        // Folders always first
        if (a.type === FileType.FOLDER && b.type !== FileType.FOLDER) return -1;
        if (a.type !== FileType.FOLDER && b.type === FileType.FOLDER) return 1;

        if (sortBy === 'NAME_ASC') return a.name.localeCompare(b.name);
        if (sortBy === 'NAME_DESC') return b.name.localeCompare(a.name);
        if (sortBy === 'DATE_NEW') return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        if (sortBy === 'DATE_OLD') return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        if (sortBy === 'STATUS') return (a.metadata?.status || '').localeCompare(b.metadata?.status || '');
        return 0;
    });

    // Group
    if (groupBy === 'NONE') return { Ungrouped: sorted };

    const groups: { [key: string]: FileNode[] } = {};
    sorted.forEach(file => {
        let groupKey = 'Outros';
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

    // Ensure folders are always first in groups too
    for (const key in groups) {
      groups[key].sort((a, b) => {
          if (a.type === FileType.FOLDER && b.type !== FileType.FOLDER) return -1;
          if (a.type !== FileType.FOLDER && b.type === FileType.FOLDER) return 1;
          return 0;
      });
  }

    return groups;
}, [files, externalFiles, sortBy, groupBy, filterStatus, t]);


const renderFileIcon = (file: FileNode) => {
    if (file.type === FileType.FOLDER) return <Folder size={20} className="text-blue-500" />;
    if (file.type === FileType.PDF) return <FileText size={20} className="text-red-500" />;
    if (file.type === FileType.IMAGE) return <ImageIcon size={20} className="text-emerald-500" />;
    return <FileText size={20} className="text-slate-500" />;
};

const renderStatusBadge = (status?: string) => {
    if (!status) return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-orange-50 text-orange-600 border border-orange-100 flex items-center gap-1.5 whitespace-nowrap">
            <Clock size={10}/> {t('files.pending')}
        </span>
    );
    switch (status) {
        case 'APPROVED': return (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center gap-1.5 whitespace-nowrap">
                <CheckCircle2 size={10}/> {t('files.groups.approved')}
            </span>
        );
        case 'PENDING': return (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-orange-50 text-orange-600 border border-orange-100 flex items-center gap-1.5 whitespace-nowrap">
                <Clock size={10}/> {t('files.pending')}
            </span>
        );
        case 'REJECTED': return (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-50 text-red-600 border border-red-100 flex items-center gap-1.5 whitespace-nowrap">
                <AlertCircle size={10}/> {t('files.groups.rejected')}
            </span>
        );
        default: return null;
    }
};

  return (
    <div className={`flex flex-col h-full bg-white rounded-2xl ${!autoHeight ? 'flex-1' : ''}`}>
      {!hideToolbar && (
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-50">
            <div className="flex items-center gap-2 md:gap-4 flex-1 w-full md:w-auto">
                <button onClick={() => handleNavigate(null)} className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-all shadow-sm">
                    <Home size={18} />
                </button>
                <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar whitespace-nowrap flex-1">
                    {breadcrumbs.map((crumb, idx) => (
                        <React.Fragment key={crumb.id}>
                            <button onClick={() => handleNavigate(crumb.id === 'root' ? null : crumb.id)} className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md transition-all ${idx === breadcrumbs.length - 1 ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}>
                                {crumb.name}
                            </button>
                            {idx < breadcrumbs.length - 1 && <ChevronRight size={10} className="text-slate-300 shrink-0" />}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative group flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={16} />
                    <input
                        type="text"
                        placeholder={t('common.search')}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                        value={searchQuery}
                        onChange={e => searchQuerySet(e.target.value)}
                    />
                </div>
                
                {selectedFiles.size > 0 && (
                    <button onClick={handleBulkDownload} className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg active:scale-95">
                        <Download size={16} /> {t('files.download')} ({selectedFiles.size})
                    </button>
                )}

                <div className="relative">
                    <button 
                        onClick={() => setIsViewMenuOpen(!isViewMenuOpen)}
                        className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-all shadow-sm"
                    >
                        <SlidersHorizontal size={18} />
                    </button>
                    {isViewMenuOpen && (
                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-100 z-30 overflow-hidden animate-in fade-in slide-in-from-top-2 origin-top-right">
                            <div className="p-4 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase">{t('files.viewOptions')}</div>
                            
                            <div className="p-4 space-y-4">
                                <div className="space-y-2">
                                    <p className="text-xs font-bold text-slate-800 mb-1">{t('files.sortBy')}</p>
                                    <div className="flex flex-col gap-1.5">
                                        {/* Sort by Name */}
                                        <div className="grid grid-cols-2 gap-1.5">
                                            <button onClick={() => { setSortBy('NAME_ASC'); setIsViewMenuOpen(false); }} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${sortBy === 'NAME_ASC' ? 'bg-blue-100 text-blue-700 font-bold shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>
                                                <ArrowDownAZ size={14}/> {t('files.sort.nameAsc')}
                                            </button>
                                            <button onClick={() => { setSortBy('NAME_DESC'); setIsViewMenuOpen(false); }} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${sortBy === 'NAME_DESC' ? 'bg-blue-100 text-blue-700 font-bold shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>
                                                <ArrowUpZA size={14}/> {t('files.sort.nameDesc')}
                                            </button>
                                        </div>
                                        {/* Sort by Date */}
                                        <div className="grid grid-cols-2 gap-1.5">
                                            <button onClick={() => { setSortBy('DATE_NEW'); setIsViewMenuOpen(false); }} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${sortBy === 'DATE_NEW' ? 'bg-blue-100 text-blue-700 font-bold shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>
                                                <Calendar size={14}/> {t('files.sort.dateNew')}
                                            </button>
                                            <button onClick={() => { setSortBy('DATE_OLD'); setIsViewMenuOpen(false); }} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${sortBy === 'DATE_OLD' ? 'bg-blue-100 text-blue-700 font-bold shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>
                                                <Calendar size={14}/> {t('files.sort.dateOld')}
                                            </button>
                                        </div>
                                        {/* Sort by Status */}
                                        <div>
                                            <button onClick={() => { setSortBy('STATUS'); setIsViewMenuOpen(false); }} className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${sortBy === 'STATUS' ? 'bg-blue-100 text-blue-700 font-bold shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>
                                                <FileCheck size={14}/> {t('files.sort.status')}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-slate-100 pt-4 space-y-2">
                                    <p className="text-xs font-bold text-slate-800 mb-1">{t('files.groupBy')}</p>
                                    <div className="grid grid-cols-2 gap-1.5">
                                        <button onClick={() => { setGroupBy('NONE'); setIsViewMenuOpen(false); }} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${groupBy === 'NONE' ? 'bg-blue-100 text-blue-700 font-bold shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>
                                            <Layers size={14}/> {t('files.groups.ungrouped')}
                                        </button>
                                        <button onClick={() => { setGroupBy('STATUS'); setIsViewMenuOpen(false); }} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${groupBy === 'STATUS' ? 'bg-blue-100 text-blue-700 font-bold shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>
                                            <FileCheck size={14}/> {t('files.sort.status')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-4 border-t border-slate-100 flex justify-around">
                                <button onClick={() => { setViewMode('list'); setIsViewMenuOpen(false); }} className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-blue-100 text-blue-600 shadow-sm' : 'text-slate-400 hover:bg-slate-50'}`}><List size={18}/></button>
                                <button onClick={() => { setViewMode('grid'); setIsViewMenuOpen(false); }} className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600 shadow-sm' : 'text-slate-400 hover:bg-slate-50'}`}><LayoutGrid size={18}/></button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}

      {(loading && page === 1) ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4">
              <Loader2 size={40} className="animate-spin text-blue-500" />
              <p className="font-bold text-xs uppercase tracking-widest">{t('common.loading')} {t('menu.library')}...</p>
          </div>
      ) : Object.keys(filteredAndSortedFiles).length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4 bg-white rounded-b-2xl">
              <FileText size={48} className="mb-3 opacity-20" />
              <p className="font-medium">{t('files.noItems')}</p>
          </div>
      ) : (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 space-y-6">
              {Object.entries(filteredAndSortedFiles).map(([groupName, groupFiles]) => (
                  <div key={groupName} className="space-y-4">
                      {groupBy !== 'NONE' && (
                          <div className="flex items-center gap-3">
                              <div className="h-px flex-1 bg-slate-200"></div>
                              <span className="text-xs font-black text-slate-400 uppercase tracking-[4px]">{groupName}</span>
                              <div className="h-px flex-1 bg-slate-200"></div>
                          </div>
                      )}
                      <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4' : 'space-y-2'}>
                          {groupFiles.map((file, idx) => {
                              const isLastItem = idx === groupFiles.length - 1;
                              const isSelected = selectedFiles.has(file.id);
                              const ActionIcon = file.isFavorite ? Star : MoreHorizontal; // Example icon

                              return (
                                  <div 
                                      key={file.id} 
                                      className={`relative group p-3 ${viewMode === 'grid' ? 'bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center hover:border-blue-300 hover:shadow-md' : 'bg-white rounded-xl border border-slate-200 shadow-sm flex items-center hover:border-blue-300 hover:shadow-md'} transition-all cursor-pointer`}
                                      onClick={() => handleFileClick(file)}
                                      ref={!externalFiles && hasMore && isLastItem ? lastElementRef : null}
                                  >
                                      {/* Checkbox for selection */}
                                      <input 
                                          type="checkbox" 
                                          checked={isSelected}
                                          onChange={e => {e.stopPropagation(); handleToggleSelect(file.id);}}
                                          className="absolute top-3 left-3 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer z-10"
                                      />
                                      
                                      {/* File/Folder Icon and Name */}
                                      <div className={`flex items-center ${viewMode === 'grid' ? 'flex-col gap-3 pt-6' : 'gap-3 pl-8 flex-1'}`}>
                                          <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-slate-50 group-hover:bg-blue-50 transition-colors">
                                              {renderFileIcon(file)}
                                          </div>
                                          <div className={`min-w-0 ${viewMode === 'grid' ? 'text-center' : 'text-left flex-1'}`}>
                                              <p className="font-semibold text-slate-800 text-sm truncate w-full" title={file.name}>{file.name}</p>
                                              {viewMode === 'list' && (
                                                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                                      <span>{file.size}</span>
                                                      <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                                                      <span>{file.updatedAt}</span>
                                                  </div>
                                              )}
                                          </div>
                                      </div>

                                      {/* Metadata and Actions (Grid View) */}
                                      {viewMode === 'grid' && file.type !== FileType.FOLDER && (
                                          <div className="mt-4 pt-3 border-t border-slate-100 w-full">
                                              {renderStatusBadge(file.metadata?.status)}
                                          </div>
                                      )}

                                      {/* Actions Dropdown */}
                                      <div className={`absolute ${viewMode === 'grid' ? 'top-3 right-3' : 'right-3 top-1/2 -translate-y-1/2'} z-10`}>
                                          <button 
                                              onClick={(e) => { e.stopPropagation(); handleActionClick(file.id); }}
                                              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition-all opacity-0 group-hover:opacity-100"
                                          >
                                              <MoreVertical size={16} />
                                          </button>
                                          {activeActionId === file.id && (
                                              <>
                                                  <div className="fixed inset-0 z-40" onClick={() => setActiveActionId(null)} />
                                                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 origin-top-right">
                                                      {file.type !== FileType.FOLDER && (
                                                          <button onClick={() => handleDownload(file)} className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors">
                                                              <Download size={14} className="text-blue-500" /> {t('common.download')}
                                                          </button>
                                                      )}
                                                      <button onClick={() => handleToggleFavorite(file)} className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors">
                                                              <Star size={14} className={file.isFavorite ? 'text-amber-500 fill-amber-500' : 'text-slate-400'} /> {file.isFavorite ? 'Desfavoritar' : 'Adicionar aos favoritos'}
                                                      </button>
                                                      {onEdit && (
                                                          <button onClick={() => handleEdit(file)} className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors">
                                                              <Edit2 size={14} className="text-blue-500" /> {t('common.edit')}
                                                          </button>
                                                      )}
                                                      {onDelete && (
                                                          <button onClick={() => handleDelete(file)} className="w-full text-left px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-3 border-t border-slate-50">
                                                              <Trash2 size={14} /> {t('common.delete')}
                                                          </button>
                                                      )}
                                                  </div>
                                              </>
                                          )}
                                      </div>
                                  </div>
                              );
                          })}
                      </div>
                  </div>
              ))}
              {loadingMore && (
                  <div className="flex justify-center py-4">
                      <Loader2 size={24} className="animate-spin text-blue-500" />
                  </div>
              )}
          </div>
      )}
    </div>
  );
});