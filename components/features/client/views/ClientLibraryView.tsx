import React, { useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../context/authContext.tsx';
import { useFileCollection } from '../../files/hooks/useFileCollection.ts';
import { FileExplorer } from '../../files/FileExplorer.tsx';
import { ExplorerToolbar } from '../../files/components/ExplorerToolbar.tsx';
import { FileNode, UserRole, FileType } from '../../../../types/index.ts';
import { fileService, partnerService } from '../../../../lib/services/index.ts';
import { PaginationControls } from '../../../common/PaginationControls.tsx';
import { QualityLoadingState } from '../../quality/components/ViewStates.tsx';
import { Layers, FileCheck } from 'lucide-react';

export const ClientLibraryView: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const currentFolderId = searchParams.get('folderId');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => 
    (localStorage.getItem('explorer_view_mode') as 'grid' | 'list') || 'grid'
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);

  const collection = useFileCollection({ 
    currentFolderId, 
    searchTerm, 
    ownerId: user?.organizationId 
  });

  const handleNavigate = useCallback((id: string | null) => {
    setSelectedFileIds([]);
    setSearchParams(prev => {
        if (id) prev.set('folderId', id);
        else prev.delete('folderId');
        return prev;
    }, { replace: true });
  }, [setSearchParams]);

  const handleFileClick = async (file: FileNode) => {
    if (file.type === FileType.FOLDER) {
        handleNavigate(file.id);
    } else {
        if (user) await partnerService.logFileView(user, file);
        navigate(`/preview/${file.id}`);
    }
  };

  const handleDownload = async (file: FileNode) => {
    try {
        const url = await fileService.getFileSignedUrl(user!, file.id);
        window.open(url, '_blank');
    } catch (e) {
        console.error("Falha ao baixar arquivo:", e);
    }
  };

  if (collection.loading && collection.files.length === 0) {
      return <QualityLoadingState message="Sincronizando Biblioteca de Ativos..." />;
  }

  return (
    <div className="flex-1 flex flex-col h-full animate-in fade-in duration-700 font-sans overflow-hidden">
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 px-1 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#081437] rounded-2xl flex items-center justify-center shadow-lg shrink-0">
             <Layers size={24} className="text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">Biblioteca de Ativos</h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[3px]">Arquivos técnicos e certificados industriais</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-2 rounded-2xl shadow-sm">
             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Recursos: <span className="text-slate-900 ml-1">{collection.totalItems}</span></p>
             <div className="w-px h-3 bg-slate-200" />
             <div className="flex items-center gap-1.5 text-emerald-500">
                <FileCheck size={14} />
                <span className="text-[9px] font-black uppercase tracking-widest">Vault Vital</span>
             </div>
        </div>
      </section>

      <div className="flex-1 flex flex-col min-h-0 bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="shrink-0 border-b border-slate-100">
          <ExplorerToolbar
              viewMode={viewMode}
              onViewChange={(mode) => {
                setViewMode(mode);
                localStorage.setItem('explorer_view_mode', mode);
              }}
              onNavigate={handleNavigate}
              breadcrumbs={collection.breadcrumbs}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onUploadClick={() => {}} 
              onCreateFolderClick={() => {}}
              selectedCount={selectedFileIds.length}
              onDeleteSelected={() => {}} 
              onRenameSelected={() => {}}
              onDownloadSelected={() => {
                  const selected = collection.files.find(f => f.id === selectedFileIds[0]);
                  if (selected) handleDownload(selected);
              }}
              userRole={UserRole.CLIENT}
              selectedFilesData={collection.files.filter(f => selectedFileIds.includes(f.id))}
          />
        </div>

        <div className="flex-1 relative min-h-0">
            <FileExplorer 
                files={collection.files} 
                loading={collection.loading}
                currentFolderId={currentFolderId}
                searchTerm={searchTerm}
                breadcrumbs={collection.breadcrumbs}
                selectedFileIds={selectedFileIds}
                onToggleFileSelection={(id) => setSelectedFileIds(prev => prev.includes(id) ? [] : [id])}
                onNavigate={handleNavigate}
                onFileSelectForPreview={handleFileClick}
                onDownloadFile={handleDownload}
                onRenameFile={() => {}}
                onDeleteFile={() => {}}
                viewMode={viewMode}
                userRole={UserRole.CLIENT}
            />
        </div>

        <div className="shrink-0">
          <PaginationControls 
            currentPage={collection.page}
            pageSize={collection.pageSize}
            totalItems={collection.totalItems}
            onPageChange={collection.setPage}
            onPageSizeChange={collection.setPageSize}
            isLoading={collection.loading}
          />
        </div>
      </div>
    </div>
  );
};
