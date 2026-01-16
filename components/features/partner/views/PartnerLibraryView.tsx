
import React, { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../../context/authContext.tsx';
import { usePartnerCertificates } from '../hooks/usePartnerCertificates.ts';
import { FileExplorer } from '../../files/FileExplorer.tsx';
import { ExplorerToolbar } from '../../files/components/ExplorerToolbar.tsx';
import { FilePreviewModal } from '../../files/FilePreviewModal.tsx';
import { FileNode, UserRole, FileType, QualityStatus } from '../../../../types/index.ts';
import { fileService } from '../../../../lib/services/index.ts';
import { supabase } from '../../../../lib/supabaseClient.ts';
import { Info, ShieldCheck, HelpCircle, ArrowRight, FileCheck, Loader2 } from 'lucide-react';

export const PartnerLibraryView: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const currentFolderId = searchParams.get('folderId');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [isAutoNavigating, setIsAutoNavigating] = useState(false);
  
  const { files, isLoading, breadcrumbs, refresh } = usePartnerCertificates(currentFolderId, searchTerm);
  
  const [previewFile, setPreviewFile] = useState<FileNode | null>(null);

  const handleNavigate = useCallback((id: string | null) => {
    setSearchParams(prev => {
        if (id) prev.set('folderId', id);
        else prev.delete('folderId');
        return prev;
    }, { replace: true });
  }, [setSearchParams]);

  // Regra Vital: Redirecionamento Automático para a Pasta Raiz da Empresa
  useEffect(() => {
    if (!currentFolderId && user?.organizationId && !searchTerm) {
      setIsAutoNavigating(true);
      supabase.from('files')
        .select('id')
        .eq('owner_id', user.organizationId)
        .is('parent_id', null)
        .maybeSingle()
        .then(({ data }) => {
          if (data) handleNavigate(data.id);
        })
        .finally(() => setIsAutoNavigating(false));
    }
  }, [currentFolderId, user?.organizationId, searchTerm, handleNavigate]);

  const handleDownload = async (file: FileNode) => {
    const url = await fileService.getSignedUrl(file.storagePath);
    window.open(url, '_blank');
  };

  const handlePreviewClose = () => {
    setPreviewFile(null);
    refresh();
  };

  if (isAutoNavigating) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <Loader2 className="animate-spin text-blue-500 mb-4" size={32} />
        <p className="text-[10px] font-black uppercase tracking-[4px] text-slate-400">Acessando Diretório {user?.organizationName}...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-700">
      
      {/* Seção de Contexto Industrial */}
      {!searchTerm && (
        <section className="bg-[#081437] rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl border border-white/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="w-20 h-20 bg-white/10 rounded-[2rem] flex items-center justify-center border border-white/10 shrink-0">
               <FileCheck size={40} className="text-blue-400" />
            </div>
            <div className="flex-1 space-y-2 text-center md:text-left">
              <h2 className="text-2xl font-black tracking-tight">Biblioteca Técnica {user?.organizationName}</h2>
              <p className="text-slate-400 text-sm max-w-2xl leading-relaxed font-medium">
                Arquivos verificados e liberados para uso industrial. 
                Utilize os filtros para localizar corridas ou lotes específicos.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Container da Biblioteca */}
      <div className="flex flex-col bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden min-h-[600px]">
        <FilePreviewModal 
          initialFile={previewFile}
          allFiles={files.filter(f => f.type !== FileType.FOLDER)}
          isOpen={!!previewFile} 
          onClose={handlePreviewClose} 
          onDownloadFile={handleDownload} 
        />

        <ExplorerToolbar
          breadcrumbs={breadcrumbs}
          onNavigate={handleNavigate}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onUploadClick={() => {}} 
          onCreateFolderClick={() => {}}
          selectedCount={selectedFileIds.length}
          onDeleteSelected={() => {}} 
          onRenameSelected={() => {}}
          onDownloadSelected={() => {
              const selected = files.find(f => f.id === selectedFileIds[0]);
              if (selected) handleDownload(selected);
          }}
          viewMode={viewMode}
          onViewChange={setViewMode}
          selectedFilesData={files.filter(f => selectedFileIds.includes(f.id))}
          userRole={UserRole.CLIENT}
        />

        <div className="px-6 py-3 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dica:</span>
              <p className="text-[10px] text-slate-500 font-bold flex items-center gap-1.5 uppercase tracking-tight">
                 <HelpCircle size={12} className="text-blue-500" /> Clique em um arquivo para abrir o painel de auditoria documental e física.
              </p>
           </div>
        </div>

        <FileExplorer 
          files={files} 
          loading={isLoading}
          currentFolderId={currentFolderId}
          searchTerm={searchTerm}
          breadcrumbs={breadcrumbs}
          selectedFileIds={selectedFileIds}
          onToggleFileSelection={(id) => setSelectedFileIds(prev => prev.includes(id) ? [] : [id])}
          onNavigate={handleNavigate}
          onFileSelectForPreview={(f) => f && f.type !== FileType.FOLDER && setPreviewFile(f)}
          onDownloadFile={handleDownload}
          onRenameFile={() => {}}
          onDeleteFile={() => {}}
          viewMode={viewMode}
          userRole={UserRole.CLIENT}
        />
      </div>
    </div>
  );
};
