
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, Hand, Pencil, Highlighter, Square, Circle, 
  Eraser, Download, Loader2, ChevronLeft, 
  ChevronRight, ZoomIn, ZoomOut, Plus, Save, Undo, 
  RotateCcw, CheckCircle2, XCircle, RefreshCw, Maximize2
} from 'lucide-react';
import { useAuth } from '../../context/authContext.tsx';
import { useFilePreview } from '../../components/features/files/hooks/useFilePreview.ts';
import { PdfViewport } from '../../components/features/files/components/PdfViewport.tsx';
import { DrawingCanvas, DrawingTool } from '../../components/features/files/components/DrawingCanvas.tsx';
import { UserRole, normalizeRole, FileNode, DocumentAnnotations } from '../../types/index.ts';
import { useToast } from '../../context/notificationContext.tsx';

const COLORS = [
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#10b981' },
  { name: 'Yellow', value: '#eab308' }
];

const LINE_WIDTHS = [
  { label: 'Fina', value: 2 },
  { label: 'Média', value: 5 },
  { label: 'Grossa', value: 10 },
  { label: 'Larga', value: 20 }
];

export const FilePreviewPage: React.FC = () => {
  const { fileId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const initialFileStub = useMemo(() => ({ id: fileId } as FileNode), [fileId]);
  const {
    currentFile, url, pageNum, setPageNum, zoom, setZoom,
    handleDownload, handleUpdateMetadata, isSyncing, forceRefresh
  } = useFilePreview(user, initialFileStub);

  const role = normalizeRole(user?.role);
  const isAuditMode = searchParams.get('mode') === 'audit';
  const showNotesParam = searchParams.get('notes') === 'true';
  const shouldShowAnnotations = isAuditMode || showNotesParam;
  const isStep2Finished = !!currentFile?.metadata?.signatures?.step2_documental;
  const canAnnotate = role === UserRole.CLIENT && !isStep2Finished;
  
  const [activeTool, setActiveTool] = useState<DrawingTool>('hand');
  const [selectedColor, setSelectedColor] = useState('#ef4444');
  const [selectedWidth, setSelectedWidth] = useState(5);
  const [stampText, setStampText] = useState<'APROVADO' | 'REJEITADO'>('APROVADO');
  const [showToolsMenu, setShowToolsMenu] = useState(false);
  const [numPages, setNumPages] = useState(0);
  const [annotations, setAnnotations] = useState<DocumentAnnotations>({});

  useEffect(() => {
    if (currentFile?.metadata?.documentalDrawings) {
      try {
        setAnnotations(JSON.parse(currentFile.metadata.documentalDrawings));
      } catch (e) { console.error("Erro de parse nas anotações"); }
    }
  }, [currentFile?.id, currentFile?.metadata?.documentalDrawings]);

  const handleReturn = () => {
    if (isAuditMode || showNotesParam || role !== UserRole.CLIENT) navigate(`/quality/inspection/${fileId}`);
    else navigate(-1);
  };

  const handlePersistChanges = async () => {
    if (!currentFile || !canAnnotate) return;
    try {
        await handleUpdateMetadata({ documentalDrawings: JSON.stringify(annotations) });
        showToast("Ledger sincronizado com sucesso.", "success");
    } catch (e) { showToast("Falha na persistência.", "error"); }
  };

  const handleUndo = () => {
    setAnnotations(prev => {
      const pageItems = prev[pageNum] || [];
      if (pageItems.length === 0) return prev;
      return { ...prev, [pageNum]: pageItems.slice(0, -1) };
    });
  };

  return (
    <div className="h-screen w-screen bg-[#020617] flex flex-col overflow-hidden font-sans text-slate-200">
      
      {/* Header Premium Glass */}
      <header className="h-16 flex items-center justify-between px-8 bg-[#081437]/60 backdrop-blur-3xl border-b border-white/10 z-50 shrink-0 shadow-2xl">
        <div className="flex items-center gap-6">
          <button onClick={handleReturn} className="p-2.5 text-slate-400 hover:text-white transition-all bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 group">
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-3">
               <h2 className="text-white text-xs font-black uppercase tracking-[4px] truncate max-w-md">{currentFile?.name || "CARREGANDO..." || "DOCUMENTO VITAL"}</h2>
               <span className="px-2 py-0.5 bg-blue-600 text-[8px] font-black uppercase rounded shadow-lg shadow-blue-500/20">v{currentFile?.versionNumber || 1}.0</span>
            </div>
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">
              {isStep2Finished ? 'Modo de Leitura de Laudo' : isAuditMode ? 'Terminal de Auditoria B2B Ativo' : 'Visualização Segura Protocolada'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
            {isSyncing && (
                <div className="flex items-center gap-2.5 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full animate-pulse">
                    <Loader2 size={14} className="animate-spin text-blue-400" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-blue-300">Sync Ativo</span>
                </div>
            )}
            {isAuditMode && canAnnotate && (
                <button onClick={handlePersistChanges} disabled={isSyncing || !url} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[9px] font-black uppercase tracking-[3px] flex items-center gap-2.5 transition-all shadow-xl shadow-emerald-600/20 active:scale-95 disabled:opacity-30">
                    <Save size={14} /> Salvar Veredito
                </button>
            )}
            <button onClick={handleDownload} disabled={!url} className="p-3 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-2xl transition-all border border-white/5" title="Baixar Original">
               <Download size={20} />
            </button>
        </div>
      </header>

      {/* Main Viewport */}
      <div className="flex-1 relative overflow-hidden">
        {url ? (
          <PdfViewport 
            url={url} 
            pageNum={pageNum} 
            zoom={zoom} 
            onPdfLoad={setNumPages} 
            onZoomChange={setZoom}
            isHandToolActive={activeTool === 'hand'}
            renderOverlay={(w, h) => shouldShowAnnotations ? (
              <DrawingCanvas 
                tool={canAnnotate ? activeTool : 'hand'} 
                color={selectedColor} 
                lineWidth={selectedWidth}
                stampText={stampText}
                width={w} height={h} 
                pageAnnotations={annotations[pageNum] || []}
                onAnnotationsChange={(newItems) => canAnnotate && setAnnotations(prev => ({ ...prev, [pageNum]: newItems }))}
              />
            ) : null}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 animate-in fade-in duration-1000">
             <div className="relative">
                <Loader2 size={64} className="animate-spin text-blue-600" />
                <div className="absolute inset-0 blur-3xl bg-blue-600/20 rounded-full animate-pulse" />
             </div>
             <div className="text-center space-y-3">
                <p className="text-[11px] font-black uppercase tracking-[6px] text-slate-500 animate-pulse">Sincronizando Viewport Industrial</p>
                {isSyncing && (
                    <button onClick={forceRefresh} className="flex items-center gap-2 mx-auto text-[9px] font-black text-blue-400 uppercase tracking-[3px] hover:text-white transition-all">
                        <RefreshCw size={12} /> Forçar Reconexão
                    </button>
                )}
             </div>
          </div>
        )}
      </div>

      {/* Premium Floating Controls */}
      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 bg-[#081437]/80 backdrop-blur-3xl border border-white/10 p-2.5 rounded-[2.5rem] shadow-[0_40px_80px_rgba(0,0,0,0.8)] animate-in slide-in-from-bottom-20 duration-700">
        
        {/* Paginador Hardware-like */}
        <div className="flex items-center gap-1 bg-black/60 p-1.5 rounded-full border border-white/5">
          <button disabled={pageNum <= 1} onClick={() => setPageNum(pageNum - 1)} className="p-3 text-slate-400 hover:text-white disabled:opacity-10 transition-all rounded-full hover:bg-white/5 active:scale-90"><ChevronLeft size={20} /></button>
          <div className="px-5 min-w-[90px] text-center">
            <p className="text-[11px] font-black text-blue-400 font-mono tracking-tighter">{pageNum} / {numPages || '--'}</p>
            <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest mt-0.5">Folha</p>
          </div>
          <button disabled={pageNum >= numPages} onClick={() => setPageNum(pageNum + 1)} className="p-3 text-slate-400 hover:text-white disabled:opacity-10 transition-all rounded-full hover:bg-white/5 active:scale-90"><ChevronRight size={20} /></button>
        </div>

        <div className="w-px h-8 bg-white/10 mx-1" />

        {/* Toolbar Section */}
        <div className="flex items-center gap-1.5">
          <PremiumToolBtn 
            icon={Hand} 
            active={activeTool === 'hand'} 
            onClick={() => setActiveTool('hand')} 
            title="Mover (Arrastar)" 
          />
          
          {isAuditMode && canAnnotate && (
            <div className="relative">
              <button 
                onClick={() => setShowToolsMenu(!showToolsMenu)} 
                className={`p-3.5 rounded-full transition-all border shadow-lg ${showToolsMenu ? 'bg-blue-600 border-blue-500 text-white rotate-45' : 'bg-white/10 border-white/10 text-slate-300 hover:bg-white/20'}`}
              >
                <Plus size={22} strokeWidth={3} />
              </button>
              
              {showToolsMenu && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-8 bg-[#081437]/95 backdrop-blur-2xl border border-white/10 p-6 rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.9)] flex flex-col gap-8 animate-in zoom-in-95 duration-300 min-w-[320px]">
                  <div className="space-y-4 text-center">
                    <p className="text-[9px] font-black uppercase text-slate-500 tracking-[4px]">Ferramentas de Traço</p>
                    <div className="flex justify-center gap-2">
                      <PremiumToolBtn icon={Pencil} active={activeTool === 'pencil'} onClick={() => {setActiveTool('pencil'); setShowToolsMenu(false);}} />
                      <PremiumToolBtn icon={Highlighter} active={activeTool === 'marker'} onClick={() => {setActiveTool('marker'); setShowToolsMenu(false);}} />
                      <PremiumToolBtn icon={Square} active={activeTool === 'rect'} onClick={() => {setActiveTool('rect'); setShowToolsMenu(false);}} />
                      <PremiumToolBtn icon={Circle} active={activeTool === 'circle'} onClick={() => {setActiveTool('circle'); setShowToolsMenu(false);}} />
                      <PremiumToolBtn icon={Eraser} active={activeTool === 'eraser'} onClick={() => {setActiveTool('eraser'); setShowToolsMenu(false);}} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[9px] font-black uppercase text-slate-500 tracking-[4px] text-center">Espessura</p>
                    <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5">
                      {LINE_WIDTHS.map(w => (
                        <button key={w.value} onClick={() => setSelectedWidth(w.value)} className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${selectedWidth === w.value ? 'bg-white text-slate-950 shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}>{w.label}</button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[9px] font-black uppercase text-slate-500 tracking-[4px] text-center">Carimbos Industriais</p>
                    <div className="grid grid-cols-2 gap-3">
                       <button onClick={() => { setActiveTool('stamp'); setStampText('APROVADO'); setShowToolsMenu(false); }} className={`py-3 rounded-2xl flex flex-col items-center gap-1.5 transition-all border-2 ${activeTool === 'stamp' && stampText === 'APROVADO' ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400' : 'bg-white/5 border-white/5 text-slate-500 hover:bg-emerald-600/10'}`}>
                          <CheckCircle2 size={20} strokeWidth={3} />
                          <span className="text-[8px] font-black uppercase tracking-widest">APROVAR</span>
                       </button>
                       <button onClick={() => { setActiveTool('stamp'); setStampText('REJEITADO'); setShowToolsMenu(false); }} className={`py-3 rounded-2xl flex flex-col items-center gap-1.5 transition-all border-2 ${activeTool === 'stamp' && stampText === 'REJEITADO' ? 'bg-red-600/20 border-red-500 text-red-400' : 'bg-white/5 border-white/5 text-slate-500 hover:bg-red-600/10'}`}>
                          <XCircle size={20} strokeWidth={3} />
                          <span className="text-[8px] font-black uppercase tracking-widest">REJEITAR</span>
                       </button>
                    </div>
                  </div>

                  <div className="h-px bg-white/10" />
                  
                  <div className="flex justify-center gap-4">
                    {COLORS.map(c => (
                      <button key={c.value} onClick={() => setSelectedColor(c.value)} className={`w-8 h-8 rounded-full border-4 transition-all hover:scale-125 active:scale-90 ${selectedColor === c.value ? 'border-white ring-4 ring-white/20' : 'border-transparent opacity-40 hover:opacity-100'}`} style={{ backgroundColor: c.value }} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          {isAuditMode && canAnnotate && <PremiumToolBtn icon={Undo} onClick={handleUndo} disabled={(annotations[pageNum] || []).length === 0} title="Desfazer" />}
        </div>

        <div className="w-px h-8 bg-white/10 mx-1" />

        {/* Zoom Engine */}
        <div className="flex items-center gap-1.5">
          <PremiumToolBtn icon={ZoomOut} onClick={() => setZoom(Math.max(0.1, zoom - 0.2))} />
          <div className="px-4 py-2.5 bg-black/60 rounded-2xl min-w-[75px] text-center border border-white/5 shadow-inner">
            <span className="text-[10px] font-black text-blue-400 font-mono tracking-tighter transition-all">
              {Math.round(zoom * 100)}%
            </span>
          </div>
          <PremiumToolBtn icon={ZoomIn} onClick={() => setZoom(Math.min(5, zoom + 0.2))} />
          <PremiumToolBtn icon={RotateCcw} onClick={() => setZoom(1.0)} title="Reset View" />
        </div>
      </div>
    </div>
  );
};

const PremiumToolBtn = ({ icon: Icon, active, onClick, disabled, title }: any) => (
  <button 
    disabled={disabled} onClick={onClick} title={title}
    className={`p-3.5 rounded-full transition-all relative group flex items-center justify-center disabled:opacity-5 active:scale-90 ${
        active 
        ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] ring-2 ring-blue-400' 
        : 'text-slate-400 hover:text-white hover:bg-white/10'
    }`}
  >
    <Icon size={20} strokeWidth={active ? 3 : 2.5} />
  </button>
);

export default FilePreviewPage;
