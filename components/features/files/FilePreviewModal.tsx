
import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Download, ShieldCheck, FileText, Loader2, 
  Pencil, Highlighter, Square, Circle, Eraser, Save, 
  Hand, History
} from 'lucide-react';
import { FileNode, UserRole, SteelBatchMetadata, DocumentAnnotations, AnnotationItem } from '../../../types/index.ts';
import { useAuth } from '../../../context/authContext.tsx';
import { AuditWorkflow } from '../quality/components/AuditWorkflow.tsx';
import { PdfViewport } from './components/PdfViewport.tsx';
import { DrawingCanvas, DrawingTool } from './components/DrawingCanvas.tsx';
import { useFilePreview } from './hooks/useFilePreview.ts';

export const FilePreviewModal: React.FC<{ 
  initialFile: FileNode | null; 
  isOpen: boolean; 
  onClose: () => void; 
  onDownloadFile?: (file: FileNode) => void;
}> = ({ initialFile, isOpen, onClose }) => {
  const { user } = useAuth();
  const [activeTool, setActiveTool] = useState<DrawingTool>('hand');
  const [annotations, setAnnotations] = useState<DocumentAnnotations>({});
  
  const {
    currentFile,
    url,
    isSyncing,
    pageNum,
    setPageNum,
    zoom,
    setZoom,
    handleUpdateMetadata,
    handleDownload
  } = useFilePreview(user, initialFile);

  useEffect(() => {
    if (currentFile?.metadata?.documentalDrawings) {
      try {
        const saved = JSON.parse(currentFile.metadata.documentalDrawings);
        setAnnotations(saved);
      } catch (e) {
        console.error("Falha ao analisar anotações salvas no modal:", e);
        setAnnotations({});
      }
    } else {
        setAnnotations({});
    }
  }, [currentFile?.id, currentFile?.metadata?.documentalDrawings]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] bg-[#020617] flex animate-in fade-in duration-500 overflow-hidden font-sans">
      
      {/* Visualização Técnica com Camada de Desenho (Esquerda) */}
      <div className="w-1/2 relative border-r border-white/5 flex flex-col bg-[#020617]">
        <header className="h-20 flex items-center justify-between px-8 bg-[#081437]/80 backdrop-blur-xl border-b border-white/10 z-20">
          <div className="flex items-center gap-5">
             <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400 shadow-inner"><FileText size={22} /></div>
             <div>
                <h2 className="text-white text-xs font-black uppercase tracking-[4px] leading-tight truncate max-w-xs">{currentFile?.name}</h2>
                <div className="flex items-center gap-3 mt-1">
                   <p className="text-[9px] text-slate-500 font-mono uppercase tracking-widest flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Protocolo Seguro Vital
                   </p>
                   <span className="text-[8px] font-black bg-blue-600 text-white px-1.5 py-0.5 rounded">v{currentFile?.versionNumber || 1}</span>
                </div>
             </div>
          </div>
          
          <div className="flex items-center gap-1.5 bg-black/40 p-1.5 rounded-2xl border border-white/5">
            <ToolButton icon={Hand} active={activeTool === 'hand'} onClick={() => setActiveTool('hand')} label="Pan" />
            <div className="w-px h-6 bg-white/10 mx-1" />
            <ToolButton icon={Pencil} active={activeTool === 'pencil'} onClick={() => setActiveTool('pencil')} label="Lápis" />
            <ToolButton icon={Highlighter} active={activeTool === 'marker'} onClick={() => setActiveTool('marker')} label="Marcador" />
            <ToolButton icon={Square} active={activeTool === 'rect'} onClick={() => setActiveTool('rect')} label="Retângulo" />
            <ToolButton icon={Circle} active={activeTool === 'circle'} onClick={() => setActiveTool('circle')} label="Círculo" />
            <ToolButton icon={Eraser} active={activeTool === 'eraser'} onClick={() => setActiveTool('eraser')} label="Borracha" />
          </div>
        </header>

        <div className="flex-1 relative overflow-hidden bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-[#020617] to-black">
            <PdfViewport 
                url={url} 
                pageNum={pageNum} 
                zoom={zoom} 
                onPdfLoad={() => {}} 
                isHandToolActive={activeTool === 'hand'}
                renderOverlay={(w, h) => (
                    /* Fix: Added missing lineWidth prop required by DrawingCanvasProps */
                    <DrawingCanvas 
                        tool={activeTool} 
                        color="#ef4444" 
                        lineWidth={5}
                        width={w} 
                        height={h} 
                        pageAnnotations={annotations[pageNum] || []}
                        onAnnotationsChange={(newItems) => {
                            setAnnotations(prev => ({ ...prev, [pageNum]: newItems }));
                        }}
                    />
                )}
            />
        </div>
      </div>

      {/* Estação de Workflow e Decisão (Direita) */}
      <div className="w-1/2 flex flex-col bg-white overflow-hidden shadow-[-40px_0_80px_rgba(0,0,0,0.4)]">
        <header className="h-20 flex items-center justify-between px-10 bg-slate-50/50 border-b border-slate-100 backdrop-blur-md shrink-0">
           <div className="flex items-center gap-5">
              <div className="relative">
                <div className="w-3 h-3 rounded-full bg-[#b23c0e] animate-ping absolute inset-0 opacity-40" />
                <div className="w-3 h-3 rounded-full bg-[#b23c0e] relative" />
              </div>
              <div>
                <h3 className="text-sm font-black text-[#081437] uppercase tracking-[4px]">Estação de Inspeção B2B</h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Modo de Leitura de Metadados</p>
              </div>
           </div>
           <button onClick={onClose} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-red-600 transition-all shadow-sm hover:shadow-lg active:scale-95"><X size={24} /></button>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-10 bg-white">
            <div className="max-w-2xl mx-auto">
              <AuditWorkflow 
                metadata={currentFile?.metadata} 
                userRole={user?.role as UserRole} 
                userName={user?.name || ''}
                userEmail={user?.email || ''}
                fileId={currentFile?.id || ''}
                onUpdate={handleUpdateMetadata}
              />
            </div>
        </div>

        <footer className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
           <div className="flex items-center gap-4 text-slate-400">
              <ShieldCheck size={24} className="text-emerald-500" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-[3px] text-slate-600">Vital Compliance SGQ</p>
                <p className="text-[9px] font-bold uppercase text-slate-400">Rastreabilidade Digital Ativa</p>
              </div>
           </div>
           <button 
              onClick={handleDownload}
              className="px-8 py-4 bg-[#081437] text-white rounded-2xl text-[10px] font-black uppercase tracking-[3px] hover:bg-[#b23c0e] transition-all flex items-center gap-3 active:scale-95 shadow-xl"
           >
              <Download size={16} className="text-blue-400" /> Exportar Laudo Original
           </button>
        </footer>
      </div>
      
      {isSyncing && (
          <div className="fixed inset-0 z-[400] bg-[#081437]/60 backdrop-blur-md flex flex-col items-center justify-center text-white">
              <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
              <p className="text-[11px] font-black uppercase tracking-[6px]">Sincronizando Ledger Vital...</p>
          </div>
      )}
    </div>
  );
};

const ToolButton = ({ icon: Icon, active, onClick, label }: any) => (
  <button 
    onClick={onClick}
    title={label}
    className={`p-3 rounded-xl transition-all relative group flex items-center justify-center ${
        active 
        ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' 
        : 'text-slate-400 hover:text-white hover:bg-white/10'
    }`}
  >
    <Icon size={18} strokeWidth={active ? 3 : 2} />
    {active && (
        <span className="absolute -bottom-1 w-1 h-1 bg-white rounded-full" />
    )}
  </button>
);
