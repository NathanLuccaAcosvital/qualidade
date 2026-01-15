
import React, { useState, forwardRef, useImperativeHandle } from 'react'; 
import { Loader2, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useFileExplorer } from './hooks/useFileExplorer.ts';
import { FileNode } from '../../../types/index.ts';
import { ExplorerToolbar } from './components/ExplorerToolbar.tsx';
import { FileListView, FileGridView } from './components/FileViews.tsx';

export interface FileExplorerHandle {
    clearSelection: () => void;
}

interface FileExplorerProps {
  onNavigate?: (folderId: string | null) => void; 
  onFileSelect?: (file: FileNode | null) => void; 
  currentFolderId?: string | null;
  refreshKey?: number;
  hideToolbar?: boolean;
  initialFolderId?: string | null;
}

/**
 * FileExplorer (Facade)
 * Responsável por orquestrar a visualização baseada no estado do hook de negócio.
 */
export const FileExplorer = forwardRef<FileExplorerHandle, FileExplorerProps>((props, ref) => {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const { files, loading, handleNavigate } = useFileExplorer(props);

  useImperativeHandle(ref, () => ({
      clearSelection: () => {}
  }));

  if (loading) return <LoadingState />;
  if (files.length === 0) return <EmptyState />;

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-inner border border-slate-100">
      {!props.hideToolbar && (
        <ExplorerToolbar 
          viewMode={viewMode} 
          onViewChange={setViewMode} 
          onHome={() => handleNavigate(null)}
          title={t('menu.library')}
        />
      )}

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {viewMode === 'list' ? (
          <FileListView 
            files={files} 
            onNavigate={handleNavigate} 
            onSelect={props.onFileSelect} 
          />
        ) : (
          <FileGridView 
            files={files} 
            onNavigate={handleNavigate} 
            onSelect={props.onFileSelect} 
          />
        )}
      </div>
    </div>
  );
});

const LoadingState = () => (
  <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3 min-h-[300px]">
    <Loader2 size={32} className="animate-spin text-blue-500" />
    <span className="text-[10px] font-black uppercase tracking-[4px]">Sincronizando Arquivos...</span>
  </div>
);

const EmptyState = () => (
  <div className="h-full flex flex-col items-center justify-center text-slate-300 italic py-20 min-h-[300px]">
    <FileText size={48} className="opacity-10 mb-4" />
    <p className="font-medium text-sm">Pasta vazia ou sem acesso disponível.</p>
  </div>
);

FileExplorer.displayName = 'FileExplorer';
