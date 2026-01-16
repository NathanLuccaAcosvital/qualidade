
import React, { useState, forwardRef, useImperativeHandle } from 'react'; 
import { Loader2, FileText, Download, Trash2, Edit2, LayoutGrid, List } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { FileNode, FileType, BreadcrumbItem, UserRole } from '../../../types/index.ts';
import { FileListView, FileGridView } from './components/FileViews.tsx';

export interface FileExplorerHandle {
    clearSelection: () => void;
}

interface FileExplorerProps {
  files: FileNode[];
  loading: boolean;
  currentFolderId: string | null;
  searchTerm: string;
  breadcrumbs: BreadcrumbItem[];
  selectedFileIds: string[];
  viewMode: 'grid' | 'list';
  userRole: UserRole; // Adicionada a prop userRole
  
  onNavigate: (folderId: string | null) => void; 
  onFileSelectForPreview: (file: FileNode | null) => void; 
  onToggleFileSelection: (fileId: string) => void;

  onDownloadFile: (file: FileNode) => void;
  onRenameFile: (file: FileNode) => void;
  onDeleteFile: (fileId: string) => void;
}

/**
 * FileExplorer (Pure Display Component)
 * Responsável por renderizar a lista de arquivos e pastas, e suas ações.
 */
export const FileExplorer = forwardRef<FileExplorerHandle, FileExplorerProps>((props, ref) => {
  const { t } = useTranslation();
  const { 
    files, loading, onNavigate, 
    onFileSelectForPreview, 
    selectedFileIds, onToggleFileSelection,
    onDownloadFile, onRenameFile, onDeleteFile, viewMode,
    userRole // Recebe userRole
  } = props;

  useImperativeHandle(ref, () => ({
      clearSelection: () => {} // Implementar lógica de limpeza se necessário
  }));

  if (loading) return <LoadingState t={t} />;
  if (files.length === 0) return <EmptyState t={t} />;

  const viewProps = {
    files,
    onNavigate,
    onSelectFileForPreview: onFileSelectForPreview,
    selectedFileIds,
    onToggleFileSelection,
    onDownload: onDownloadFile,
    onRename: onRenameFile,
    onDelete: onDeleteFile,
    userRole: userRole, // Passa userRole para as views
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
      {viewMode === 'list' ? (
        <FileListView {...viewProps} />
      ) : (
        <FileGridView {...viewProps} />
      )}
    </div>
  );
});

const LoadingState = ({ t }: { t: any }) => (
  <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3 min-h-[300px]">
    <Loader2 size={32} className="animate-spin text-[var(--color-detail-blue)]" />
    <span className="text-[10px] font-black uppercase tracking-[4px]">{t('common.loading')}</span>
  </div>
);

const EmptyState = ({ t }: { t: any }) => (
  <div className="h-full flex flex-col items-center justify-center text-slate-300 italic py-20 min-h-[300px]">
    <FileText size={48} className="opacity-10 mb-4" />
    <p className="font-semibold text-sm text-slate-600">{t('files.noResultsFound')}</p>
    <p className="text-xs text-slate-400 mt-2">{t('files.typeToSearch')}</p>
  </div>
);

FileExplorer.displayName = 'FileExplorer';
