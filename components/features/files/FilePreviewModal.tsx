import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  X, Download, Loader2, FileText, 
  ZoomIn, ZoomOut, CheckCircle2, XCircle, 
  Pencil, Square, Circle, Eraser, 
  User, Calendar, ShieldCheck, 
  ChevronRight, Undo2, Redo2, 
  ImageDown, ArrowUpRight, Trash2, MessageSquare, Plus,
  Hand, ChevronLeft, ChevronRight as ChevronRightIcon,
  Type, Highlighter, Stamp, Layers, Maximize2, MoreHorizontal,
  ChevronUp, Camera, Clock, ClipboardCheck, Tag, Info, Send, ShieldAlert,
  FileCheck
} from 'lucide-react';
import { FileNode, UserRole, QualityStatus, SteelBatchMetadata } from '../../../types/index.ts';
import { fileService, qualityService } from '../../../lib/services/index.ts';
import { useAuth } from '../../../context/authContext.tsx';
import { FileStatusBadge } from './components/FileStatusBadge.tsx';
import { useToast } from '../../../context/notificationContext.tsx';
import { supabase } from '../../../lib/supabaseClient.ts';

if (typeof window !== 'undefined' && (window as any).pdfjsLib) {
  (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
}

type AnnotationType = 'pencil' | 'rect' | 'circle' | 'arrow' | 'hand' | 'text' | 'highlight' | 'stamp_ok' | 'stamp_no';
interface Point { x: number; y: number; }
interface Annotation {
  id: string;
  type: Exclude<AnnotationType, 'hand'>;
  color: string;
  normalizedPoints?: Point[];
  normalizedStart?: Point;
  normalizedEnd?: Point;
  text?: string;
  page: number;
}

export const FilePreviewModal: React.FC<{ 
  initialFile: FileNode | null; 
  allFiles?: FileNode[];
  isOpen: boolean; 
  onClose: () => void; 
  onDownloadFile: (file: FileNode) => void | Promise<void>; 
}> = ({ initialFile, isOpen, onClose, onDownloadFile }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const viewportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const annotationCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const [currentFile, setCurrentFile] = useState<FileNode | null>(initialFile);
  const [loading, setLoading] = useState(false);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pageNum, setPageNum] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [zoom, setZoom] = useState(1.2);
  const [isActioning, setIsActioning] = useState(false);
  
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [drawingTool, setDrawingTool] = useState<AnnotationType | 'eraser'>('hand');
  const [tempAnnotation, setTempAnnotation] = useState<Annotation | null>(null);

  // Estados do Fluxo de Auditoria
  const [rejectMode, setRejectMode] = useState<'NONE' | 'DOCUMENTAL' | 'PHYSICAL'>('NONE');
  const [observations, setObservations] = useState('');
  const [selectedFlags, setSelectedFlags] = useState<string[]>([]);
  const [currentFlagInput, setCurrentFlagInput] = useState('');

  const SUGGESTED_DOCUMENTAL = ['Divergência de Lote', 'Norma Incorreta', 'Erro de Composição', 'Dados Ilegíveis'];
  const SUGGESTED_PHYSICAL = ['Avaria de Transporte', 'Sem Identificação', 'Material Oxidado', 'Dimensões Incorretas'];

  const denormalize = (val: number, max: number) => val * max;

  useEffect(() => {
    if (isOpen && initialFile) {
      setCurrentFile(initialFile);
      setAnnotations([]);
      setDrawingTool('hand');
      setZoom(1.2);
      setPageNum(1);
      setRejectMode('NONE');
      setObservations('');
      setSelectedFlags([]);
      setCurrentFlagInput('');
    }
  }, [isOpen, initialFile]);

  useEffect(() => {
    if (isOpen && currentFile && user) {
      setLoading(true);
      fileService.getFileSignedUrl(user, currentFile.id).then(async (signedUrl) => {
          const loadingTask = (window as any).pdfjsLib.getDocument(signedUrl);
          const pdf = await loadingTask.promise;
          setPdfDoc(pdf);
          setNumPages(pdf.numPages);
          setPageNum(1);
        }).catch(() => showToast("Erro ao carregar PDF", "error"))
        .finally(() => setLoading(false));
    } else if (!isOpen) {
      setPdfDoc(null);
    }
  }, [currentFile, user, isOpen]);

  const renderPdfPage = useCallback(async () => {
    if (!isOpen || !pdfDoc || !canvasRef.current) return;
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: zoom });
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    if (annotationCanvasRef.current) {
        annotationCanvasRef.current.width = viewport.width;
        annotationCanvasRef.current.height = viewport.height;
    }
    await page.render({ canvasContext: ctx, viewport }).promise;
  }, [pdfDoc, pageNum, zoom, isOpen]);

  useEffect(() => {
    if (pdfDoc) renderPdfPage();
  }, [pdfDoc, pageNum, zoom, renderPdfPage]);

  const drawAnnotations = useCallback(() => {
    const annCanvas = annotationCanvasRef.current;
    if (!annCanvas || !isOpen) return;
    const ctx = annCanvas.getContext('2d')!;
    const { width, height } = annCanvas;
    ctx.clearRect(0, 0, width, height);
    
    const pageAnns = annotations.filter(a => a.page === pageNum);
    const allToDraw = tempAnnotation ? [...pageAnns, tempAnnotation] : pageAnns;

    allToDraw.forEach(ann => {
        ctx.strokeStyle = ann.color;
        ctx.lineWidth = ann.type === 'highlight' ? 20 : 3;
        ctx.lineCap = 'round';
        ctx.globalAlpha = ann.type === 'highlight' ? 0.35 : 1.0;

        if (ann.type === 'pencil' || ann.type === 'highlight') {
            if (ann.normalizedPoints) {
                ctx.beginPath();
                ann.normalizedPoints.forEach((p, i) => {
                    const x = denormalize(p.x, width), y = denormalize(p.y, height);
                    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
                });
                ctx.stroke();
            }
        }
    });
    ctx.globalAlpha = 1.0;
  }, [annotations, tempAnnotation, pageNum, zoom, isOpen]);

  useEffect(() => { drawAnnotations(); }, [annotations, tempAnnotation, drawAnnotations]);

  const handleAction = async (status: QualityStatus, type: 'SENT' | 'DOCUMENTAL' | 'PHYSICAL') => {
    if (!currentFile || !user) return;
    setIsActioning(true);
    try {
      const timestamp = new Date().toISOString();
      const updatedMetadata: SteelBatchMetadata = { ...currentFile.metadata! };

      if (type === 'SENT') {
        updatedMetadata.sentAt = timestamp;
        updatedMetadata.sentBy = user.name;
        updatedMetadata.status = QualityStatus.SENT;
      } else if (type === 'DOCUMENTAL') {
        updatedMetadata.status = status;
        updatedMetadata.documentalFlags = status === QualityStatus.REJECTED ? selectedFlags : [];
        updatedMetadata.documentalObservations = observations;
        updatedMetadata.inspectedAt = timestamp;
        updatedMetadata.inspectedBy = user.name;
      } else {
        // Physical conference is independent
        updatedMetadata.physicalStatus = status;
        updatedMetadata.physicalFlags = status === QualityStatus.REJECTED ? selectedFlags : [];
        updatedMetadata.physicalObservations = observations;
        updatedMetadata.physicalInspectedAt = timestamp;
        updatedMetadata.physicalInspectedBy = user.name;
      }

      const { error } = await supabase.from('files').update({ metadata: updatedMetadata }).eq('id', currentFile.id);
      if (error) throw error;

      setCurrentFile(prev => prev ? ({ ...prev, metadata: updatedMetadata }) : null);
      setRejectMode('NONE');
      setObservations('');
      setSelectedFlags([]);
      showToast("Veredito registrado no fluxo SGQ.", "success");
    } catch (err) {
      showToast("Falha ao sincronizar veredito.", "error");
    } finally {
      setIsActioning(false);
    }
  };

  const isFullApproved = currentFile?.metadata?.status === QualityStatus.APPROVED && currentFile?.metadata?.physicalStatus === QualityStatus.APPROVED;

  const handleAddCustomFlag = () => {
    if (currentFlagInput.trim() && !selectedFlags.includes(currentFlagInput.trim())) {
      setSelectedFlags(prev => [...prev, currentFlagInput.trim()]);
      setCurrentFlagInput('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] bg-[#020617] flex flex-col animate-in fade-in duration-300 overflow-hidden font-sans">
      <header className="h-16 shrink-0 bg-[#081437]/95 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400"><FileText size={20} /></div>
          <div>
            <h2 className="text-white font-black text-xs truncate max-w-xs uppercase tracking-tight">{currentFile?.name}</h2>
            <p className="text-[9px] text-slate-500 uppercase font-black tracking-[3px]">Protocolo Técnico Aços Vital</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
            <div className="hidden sm:flex bg-white/5 px-4 py-2 rounded-full border border-white/10 items-center gap-3">
               <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Visualização Segura</span>
            </div>
            <button 
                onClick={(e) => {
                    e.preventDefault();
                    onClose();
                }} 
                className="p-2 text-slate-400 hover:text-white hover:bg-red-500/20 rounded-lg transition-all"
                aria-label="Fechar Visualizador"
            >
                <X size={20} />
            </button>
        </div>
      </header>

      <div className="flex-1 flex min-h-0 relative">
        <div className="flex-1 flex flex-col bg-[#0f172a] relative overflow-hidden">
          <div 
            ref={viewportRef}
            className="flex-1 overflow-auto custom-scrollbar bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:32px_32px]"
          >
            <div className="inline-flex min-w-full min-h-full items-start justify-center p-12">
              <div className="relative bg-white shadow-[0_40px_100px_rgba(0,0,0,0.6)] rounded-sm">
                {loading && <div className="absolute inset-0 bg-[#081437]/40 flex items-center justify-center z-50 backdrop-blur-sm"><Loader2 className="animate-spin text-blue-500" size={48} /></div>}
                <canvas ref={canvasRef} className="block pointer-events-none" />
                <canvas ref={annotationCanvasRef} className="absolute top-0 left-0 z-10 pointer-events-none" />
              </div>
            </div>
          </div>
          
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-[#081437]/90 backdrop-blur-2xl border border-white/10 p-3 rounded-full shadow-2xl z-[100]">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
                <button onClick={() => setPageNum(p => Math.max(1, p - 1))} className="text-slate-400 hover:text-white"><ChevronLeft size={16}/></button>
                <span className="text-[10px] font-black text-white min-w-[40px] text-center">{pageNum} / {numPages}</span>
                <button onClick={() => setPageNum(p => Math.min(numPages, p + 1))} className="text-slate-400 hover:text-white"><ChevronRightIcon size={16}/></button>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setZoom(z => Math.max(0.5, z - 0.2))} className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full"><ZoomOut size={16}/></button>
                <button onClick={() => setZoom(z => Math.min(3, z + 0.2))} className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full"><ZoomIn size={16}/></button>
              </div>
          </div>
        </div>

        {/* SIDEBAR DE AUDITORIA */}
        <aside className="w-[420px] shrink-0 bg-white flex flex-col shadow-[-10px_0_50px_rgba(0,0,0,0.1)] z-50">
          <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
            
            {isFullApproved ? (
              <section className="animate-in zoom-in-95 duration-700">
                <div className="bg-emerald-600 rounded-[2.5rem] p-8 text-white text-center shadow-2xl shadow-emerald-500/30 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12"><ShieldCheck size={120} /></div>
                   <div className="relative z-10 space-y-6">
                      <div className="w-20 h-20 bg-white/20 rounded-[2rem] flex items-center justify-center mx-auto border border-white/20 shadow-inner">
                         <FileCheck size={40} className="text-white" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-black uppercase tracking-tighter">Nota Fiscal Aprovada</h3>
                        <div className="px-4 py-2 bg-black/20 rounded-xl inline-block border border-white/10 font-mono text-sm">
                           NF: {currentFile?.metadata?.invoiceNumber || 'SINCRO...'}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 pt-4">
                         <div className="bg-white/10 p-3 rounded-2xl border border-white/10">
                            <p className="text-[8px] font-black uppercase opacity-60">Documental</p>
                            <p className="text-[10px] font-black uppercase">Aprovado</p>
                         </div>
                         <div className="bg-white/10 p-3 rounded-2xl border border-white/10">
                            <p className="text-[8px] font-black uppercase opacity-60">Física</p>
                            <p className="text-[10px] font-black uppercase">Aprovado</p>
                         </div>
                      </div>
                   </div>
                </div>
                <div className="mt-8 p-6 bg-slate-50 rounded-3xl border border-slate-100 text-center">
                    <p className="text-xs text-slate-500 font-medium italic">O material está liberado para processamento e estoque.</p>
                </div>
              </section>
            ) : (
              <>
                {/* STEP 1: ENVIO VITAL */}
                <section className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[3px] flex items-center gap-2">
                       <span className="w-6 h-6 bg-slate-900 text-white rounded-lg flex items-center justify-center text-[10px] tracking-normal">1</span>
                       Validação Analista
                    </h4>
                    {currentFile?.metadata?.sentAt && <span className="text-[9px] font-black text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded">Liberado</span>}
                  </div>

                  <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-4">
                    {currentFile?.metadata?.sentAt ? (
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-white rounded-2xl text-blue-600 shadow-sm border border-slate-200"><Clock size={20} /></div>
                        <div>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Enviado em</p>
                           <p className="text-xs font-bold text-slate-800">{new Date(currentFile.metadata.sentAt).toLocaleString()}</p>
                           <p className="text-[9px] text-slate-500 font-medium mt-1">Por: {currentFile.metadata.sentBy}</p>
                        </div>
                      </div>
                    ) : user?.role !== UserRole.CLIENT ? (
                      <button 
                        onClick={() => handleAction(QualityStatus.SENT, 'SENT')}
                        disabled={isActioning}
                        className="w-full py-4 bg-[#081437] hover:bg-slate-800 text-white rounded-2xl font-black text-[10px] uppercase tracking-[3px] shadow-xl shadow-slate-900/10 flex items-center justify-center gap-3 transition-all"
                      >
                         <Send size={16} /> Liberar para o Cliente
                      </button>
                    ) : (
                      <div className="text-center py-4 text-slate-400 text-[10px] font-bold uppercase italic tracking-widest">Aguardando liberação técnica...</div>
                    )}
                  </div>
                </section>

                {/* STEP 2: DOCUMENTAL */}
                <section className={`space-y-6 ${!currentFile?.metadata?.sentAt ? 'opacity-30 pointer-events-none' : ''}`}>
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[3px] flex items-center gap-2">
                     <span className="w-6 h-6 bg-slate-900 text-white rounded-lg flex items-center justify-center text-[10px] tracking-normal">2</span>
                     Conferência Documental
                  </h4>

                  <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-4">
                    {rejectMode === 'DOCUMENTAL' ? (
                       <AuditForm 
                          suggestions={SUGGESTED_DOCUMENTAL} 
                          selectedFlags={selectedFlags} 
                          onToggleFlag={(f: string) => setSelectedFlags(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f])}
                          onRemoveFlag={(f: string) => setSelectedFlags(prev => prev.filter(x => x !== f))}
                          onAddCustomFlag={handleAddCustomFlag}
                          flagInput={currentFlagInput}
                          onFlagInputChange={setCurrentFlagInput}
                          observations={observations}
                          onObsChange={setObservations}
                          onCancel={() => setRejectMode('NONE')}
                          onConfirm={() => handleAction(QualityStatus.REJECTED, 'DOCUMENTAL')}
                          isActioning={isActioning}
                       />
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                           <span className="text-[10px] font-black text-slate-400 uppercase">Status do Passo</span>
                           <FileStatusBadge status={currentFile?.metadata?.status} />
                        </div>
                        {user?.role === UserRole.CLIENT && currentFile?.metadata?.status === QualityStatus.SENT && (
                          <div className="grid grid-cols-2 gap-3">
                             <button onClick={() => handleAction(QualityStatus.APPROVED, 'DOCUMENTAL')} className="py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"><CheckCircle2 size={16}/> Aprovar</button>
                             <button onClick={() => setRejectMode('DOCUMENTAL')} className="py-4 bg-white border-2 border-red-100 text-red-600 rounded-2xl font-black text-[10px] uppercase hover:bg-red-50 transition-all flex items-center justify-center gap-2"><XCircle size={16}/> Rejeitar</button>
                          </div>
                        )}
                        {currentFile?.metadata?.documentalFlags && currentFile.metadata.documentalFlags.length > 0 && (
                           <div className="flex flex-wrap gap-1.5 px-2">
                              {currentFile.metadata.documentalFlags.map(f => (
                                 <span key={f} className="px-2 py-0.5 bg-red-100 text-red-700 text-[9px] font-black uppercase rounded border border-red-200">{f}</span>
                              ))}
                           </div>
                        )}
                        {currentFile?.metadata?.documentalObservations && (
                           <div className="p-4 bg-white rounded-2xl border border-slate-200">
                              <p className="text-[9px] font-black text-red-600 uppercase mb-2">Motivo da Não-Conformidade:</p>
                              <p className="text-xs text-slate-600 font-medium italic">"{currentFile.metadata.documentalObservations}"</p>
                           </div>
                        )}
                      </div>
                    )}
                  </div>
                </section>

                {/* STEP 3: FÍSICO */}
                {/* REMOVIDA A OPACIDADE/INABILITAÇÃO CONDICIONAL */}
                <section className={`space-y-6 ${!currentFile?.metadata?.sentAt ? 'opacity-30 pointer-events-none' : ''}`}>
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[3px] flex items-center gap-2">
                     <span className="w-6 h-6 bg-slate-900 text-white rounded-lg flex items-center justify-center text-[10px] tracking-normal">3</span>
                     Conferência Física
                  </h4>

                  <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-4">
                    {rejectMode === 'PHYSICAL' ? (
                       <AuditForm 
                          suggestions={SUGGESTED_PHYSICAL} 
                          selectedFlags={selectedFlags} 
                          onToggleFlag={(f: string) => setSelectedFlags(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f])}
                          onRemoveFlag={(f: string) => setSelectedFlags(prev => prev.filter(x => x !== f))}
                          onAddCustomFlag={handleAddCustomFlag}
                          flagInput={currentFlagInput}
                          onFlagInputChange={setCurrentFlagInput}
                          observations={observations}
                          onObsChange={setObservations}
                          onCancel={() => setRejectMode('NONE')}
                          onConfirm={() => handleAction(QualityStatus.REJECTED, 'PHYSICAL')}
                          isActioning={isActioning}
                       />
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                           <span className="text-[10px] font-black text-slate-400 uppercase">Status do Passo</span>
                           <FileStatusBadge status={currentFile?.metadata?.physicalStatus} />
                        </div>
                        {user?.role === UserRole.CLIENT && currentFile?.metadata?.sentAt && !currentFile?.metadata?.physicalStatus && (
                          <div className="grid grid-cols-2 gap-3">
                             <button onClick={() => handleAction(QualityStatus.APPROVED, 'PHYSICAL')} className="py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"><CheckCircle2 size={16}/> Aprovar</button>
                             <button onClick={() => setRejectMode('PHYSICAL')} className="py-4 bg-white border-2 border-red-100 text-red-600 rounded-2xl font-black text-[10px] uppercase hover:bg-red-50 transition-all flex items-center justify-center gap-2"><XCircle size={16}/> Rejeitar</button>
                          </div>
                        )}
                        {currentFile?.metadata?.physicalFlags && currentFile.metadata.physicalFlags.length > 0 && (
                           <div className="flex flex-wrap gap-1.5 px-2">
                              {currentFile.metadata.physicalFlags.map(f => (
                                 <span key={f} className="px-2 py-0.5 bg-red-100 text-red-700 text-[9px] font-black uppercase rounded border border-red-200">{f}</span>
                              ))}
                           </div>
                        )}
                        {currentFile?.metadata?.physicalObservations && (
                           <div className="p-4 bg-white rounded-2xl border border-slate-200">
                              <p className="text-[9px] font-black text-red-600 uppercase mb-2">Avaria Detectada:</p>
                              <p className="text-xs text-slate-600 font-medium italic">"{currentFile.metadata.physicalObservations}"</p>
                           </div>
                        )}
                      </div>
                    )}
                  </div>
                </section>
              </>
            )}
          </div>

          <footer className="p-8 border-t border-slate-100 bg-slate-50/50 space-y-2">
             <button onClick={() => {
                const composite = document.createElement('canvas');
                composite.width = canvasRef.current!.width; composite.height = canvasRef.current!.height;
                const ctx = composite.getContext('2d')!;
                ctx.drawImage(canvasRef.current!, 0, 0); ctx.drawImage(annotationCanvasRef.current!, 0, 0);
                const link = document.createElement('a'); link.download = `SGQ-VITAL-${currentFile?.metadata?.invoiceNumber}.png`;
                link.href = composite.toDataURL('image/png'); link.click();
             }} className="w-full py-4 bg-[#081437] text-white rounded-xl font-black text-[10px] uppercase tracking-[3px] hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg">
                <ImageDown size={18} /> Exportar Laudo PNG
             </button>
          </footer>
        </aside>
      </div>
    </div>
  );
};

const AuditForm = ({ suggestions, selectedFlags, onToggleFlag, onRemoveFlag, onAddCustomFlag, flagInput, onFlagInputChange, observations, onObsChange, onCancel, onConfirm, isActioning }: any) => (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
     <div className="space-y-3">
        <p className="text-[9px] font-black text-red-600 uppercase ml-1 tracking-widest">Descrever Não-Conformidade:</p>
        
        {/* Sistema de Tags Dinâmicas */}
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <input 
              type="text" 
              className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-4 focus:ring-red-500/10 transition-all font-bold text-slate-700"
              placeholder="Escreva um motivo..."
              value={flagInput}
              onChange={(e) => onFlagInputChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), onAddCustomFlag())}
            />
            <button 
              onClick={onAddCustomFlag}
              disabled={!flagInput.trim()}
              className="p-2.5 bg-slate-900 text-white rounded-xl hover:bg-black transition-all disabled:opacity-30"
            >
              <Plus size={18} />
            </button>
          </div>

          {selectedFlags.length > 0 && (
            <div className="flex flex-wrap gap-2 p-3 bg-white rounded-xl border border-slate-100 min-h-[50px]">
              {selectedFlags.map((f: string) => (
                <span key={f} className="flex items-center gap-2 px-2.5 py-1 bg-red-600 text-white rounded-lg text-[10px] font-black uppercase shadow-sm">
                  {f}
                  <button onClick={() => onRemoveFlag(f)} className="hover:text-red-200"><X size={12} /></button>
                </span>
              ))}
            </div>
          )}
        </div>
     </div>

     {/* Sugestões Rápidas */}
     <div className="space-y-2">
        <p className="text-[8px] font-black text-slate-400 uppercase ml-1 tracking-widest">Sugestões Rápidas:</p>
        <div className="flex flex-wrap gap-1.5">
           {suggestions.map((f: string) => (
             <button 
                key={f} 
                onClick={() => onToggleFlag(f)}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-bold border transition-all ${
                  selectedFlags.includes(f) ? 'bg-red-50 border-red-600 text-red-700' : 'bg-white border-slate-200 text-slate-400 hover:border-red-200'
                }`}
             >
                {f}
             </button>
           ))}
        </div>
     </div>

     <div className="space-y-2">
        <p className="text-[9px] font-black text-slate-400 uppercase ml-1 tracking-widest">Observações Detalhadas:</p>
        <textarea 
            className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-xs min-h-[80px] outline-none focus:ring-4 focus:ring-red-500/10 transition-all font-medium text-slate-700"
            placeholder="Detalhes técnicos adicionais..."
            value={observations}
            onChange={(e) => onObsChange(e.target.value)}
        />
     </div>

     <div className="flex gap-2">
        <button onClick={onCancel} className="flex-1 py-3 text-[10px] font-black uppercase text-slate-400 hover:text-slate-600">Voltar</button>
        <button 
            disabled={(selectedFlags.length === 0 && !observations.trim()) || isActioning}
            onClick={onConfirm} 
            className="flex-1 py-3 bg-red-600 text-white rounded-xl font-black text-[10px] uppercase shadow-lg shadow-red-500/20 disabled:opacity-50"
        >
            Confirmar Recusa
        </button>
     </div>
  </div>
);