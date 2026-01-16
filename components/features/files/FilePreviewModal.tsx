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
  FileCheck,
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

type AnnotationType = 'pencil' | 'highlight' | 'hand' | 'eraser'; // Removidos 'rect', 'circle', 'arrow', 'text', 'stamp_ok', 'stamp_no' para simplificar o MVP
interface Point { x: number; y: number; }
interface Annotation {
  id: string;
  type: Exclude<AnnotationType, 'hand' | 'eraser'>; // Eraser not a type of annotation
  color: string;
  normalizedPoints?: Point[];
  normalizedStart?: Point;
  normalizedEnd?: Point;
  text?: string;
  page: number;
}

// Helpers para normalizar/desnormalizar coordenadas (movidos para fora para evitar recriação)
const normalize = (value: number, max: number) => value / max;
const denormalize = (value: number, max: number) => value * max;

// Helper para cálculo de distância para borracha (movido para fora)
const dist2 = (p1: Point, p2: Point) => (p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y);
const distToSegmentSquared = (p: Point, p1: Point, p2: Point) => {
  const l2 = dist2(p1, p2);
  if (l2 === 0) return dist2(p, p1);
  let t = ((p.x - p1.x) * (p2.x - p1.x) + (p.y - p1.y) * (p2.y - p1.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return dist2(p, { x: p1.x + t * (p2.x - p1.x), y: p1.y + t * (p2.y - p1.y) });
};


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
  
  // Estados de Anotação e Desenho
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [drawingTool, setDrawingTool] = useState<AnnotationType>('hand');
  const [tempAnnotation, setTempAnnotation] = useState<Annotation | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [annotationColor, setAnnotationColor] = useState('#EF4444'); // Cor padrão: vermelho
  const [annotationHistory, setAnnotationHistory] = useState<Annotation[][]>([[]]); // Histórico para Undo/Redo
  const [historyPointer, setHistoryPointer] = useState(0);


  // Estados do Fluxo de Auditoria
  const [rejectMode, setRejectMode] = useState<'NONE' | 'DOCUMENTAL' | 'PHYSICAL'>('NONE');
  const [observations, setObservations] = useState('');
  const [selectedFlags, setSelectedFlags] = useState<string[]>([]);
  const [currentFlagInput, setCurrentFlagInput] = useState('');
  const [physicalPhotos, setPhysicalPhotos] = useState<File[]>([]); // Novo estado para fotos físicas

  const SUGGESTED_DOCUMENTAL = ['Divergência de Lote', 'Norma Incorreta', 'Erro de Composição', 'Dados Ilegíveis'];
  const SUGGESTED_PHYSICAL = ['Avaria de Transporte', 'Sem Identificação', 'Material Oxidado', 'Dimensões Incorretas'];

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
      setPhysicalPhotos([]); // Limpa as fotos ao abrir o modal

      // Reseta o histórico de anotações
      setAnnotationHistory([[]]);
      setHistoryPointer(0);
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

  // Define a lógica principal de renderização do PDF
  const _renderPdfPageInternal = async () => {
    if (!isOpen || !pdfDoc || !canvasRef.current || !annotationCanvasRef.current) return;

    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: zoom });

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const annCanvas = annotationCanvasRef.current;
    annCanvas.width = viewport.width;
    annCanvas.height = viewport.height; // Corrigido de viewport.current.height

    await page.render({ canvasContext: ctx, viewport }).promise;
  };

  // Memoiza a função de renderização
  const renderPdfPage = useCallback(_renderPdfPageInternal, [
    pdfDoc,
    pageNum,
    zoom,
    isOpen,
    canvasRef, // Adicionado para completude, refs são estáveis
    annotationCanvasRef, // Adicionado para completude, refs são estáveis
  ]);

  // Efeito para acionar a renderização quando as dependências mudam
  useEffect(() => {
    if (pdfDoc) {
      renderPdfPage();
    }
  }, [pdfDoc, pageNum, zoom, renderPdfPage]);


  const drawAnnotations = useCallback(() => {
    const annCanvas = annotationCanvasRef.current;
    if (!annCanvas || !isOpen) return;
    const ctx = annCanvas.getContext('2d')!;
    const { width, height } = annCanvas;
    ctx.clearRect(0, 0, width, height);
    
    // Desenha anotações salvas na página atual
    annotations.filter(a => a.page === pageNum).forEach(ann => {
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

    // Desenha anotação temporária (em andamento)
    if (tempAnnotation && tempAnnotation.page === pageNum) {
      ctx.strokeStyle = tempAnnotation.color;
      ctx.lineWidth = tempAnnotation.type === 'highlight' ? 20 : 3;
      ctx.lineCap = 'round';
      ctx.globalAlpha = tempAnnotation.type === 'highlight' ? 0.35 : 1.0;

      if (tempAnnotation.normalizedPoints) {
          ctx.beginPath();
          tempAnnotation.normalizedPoints.forEach((p, i) => {
              const x = denormalize(p.x, width), y = denormalize(p.y, height);
              i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          });
          ctx.stroke();
      }
    }
    ctx.globalAlpha = 1.0; // Reseta alpha
  }, [annotations, tempAnnotation, pageNum, isOpen]);

  useEffect(() => { 
    drawAnnotations(); 
  }, [annotations, tempAnnotation, drawAnnotations, pageNum, zoom]); // Adicionado pageNum e zoom para redesenhar corretamente


  // Gerenciamento de histórico para Undo/Redo
  const pushToHistory = useCallback((currentAnns: Annotation[]) => {
    const newHistory = annotationHistory.slice(0, historyPointer + 1);
    setAnnotationHistory([...newHistory, currentAnns]);
    setHistoryPointer(newHistory.length);
  }, [annotationHistory, historyPointer]);

  const handleUndo = useCallback(() => {
    if (historyPointer > 0) {
      const newPointer = historyPointer - 1;
      setHistoryPointer(newPointer);
      setAnnotations(annotationHistory[newPointer]);
    }
  }, [annotationHistory, historyPointer]);

  const handleRedo = useCallback(() => {
    if (historyPointer < annotationHistory.length - 1) {
      const newPointer = historyPointer + 1;
      setHistoryPointer(newPointer);
      setAnnotations(annotationHistory[newPointer]);
    }
  }, [annotationHistory, historyPointer]);

  // Eventos de mouse para o canvas de anotações
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!annotationCanvasRef.current || drawingTool === 'hand') return;

    const canvas = annotationCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const normalizedX = normalize(x, canvas.width);
    const normalizedY = normalize(y, canvas.height);

    if (drawingTool === 'eraser') {
      const threshold = 15 / Math.max(canvas.width, canvas.height); // Limiar normalizado
      let closestAnnId: string | null = null;
      let minDistance = Infinity;

      annotations.filter(ann => ann.page === pageNum).forEach(ann => {
        if (ann.normalizedPoints) {
          for (let i = 0; i < ann.normalizedPoints.length - 1; i++) {
            const p1 = ann.normalizedPoints[i];
            const p2 = ann.normalizedPoints[i+1];
            const dist = distToSegmentSquared({ x: normalizedX, y: normalizedY }, p1, p2);
            if (dist < minDistance) {
              minDistance = dist;
              closestAnnId = ann.id;
            }
          }
        }
      });

      if (closestAnnId && minDistance < threshold * threshold) {
        const updatedAnns = annotations.filter(ann => ann.id !== closestAnnId);
        setAnnotations(updatedAnns);
        pushToHistory(updatedAnns);
      }
      return;
    }

    setIsDrawing(true);
    const newAnnotation: Annotation = {
      id: crypto.randomUUID(),
      type: drawingTool === 'pencil' ? 'pencil' : 'highlight',
      color: annotationColor,
      page: pageNum,
      normalizedPoints: [{ x: normalizedX, y: normalizedY }],
    };
    setTempAnnotation(newAnnotation);
  }, [annotations, drawingTool, annotationColor, pageNum, pushToHistory]);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !annotationCanvasRef.current) return;

    const canvas = annotationCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const normalizedX = normalize(x, canvas.width);
    const normalizedY = normalize(y, canvas.height);

    setTempAnnotation(prev => {
      if (!prev || !prev.normalizedPoints) return prev;
      return {
        ...prev,
        normalizedPoints: [...prev.normalizedPoints, { x: normalizedX, y: normalizedY }],
      };
    });
  }, [isDrawing]);

  const handleCanvasMouseUp = useCallback(() => {
    if (!isDrawing) return;

    setIsDrawing(false);
    if (tempAnnotation) {
      const newAnnotations = [...annotations, tempAnnotation];
      setAnnotations(newAnnotations);
      pushToHistory(newAnnotations);
      setTempAnnotation(null);
    }
  }, [isDrawing, tempAnnotation, annotations, pushToHistory]);


  // Funções de Pan (arrastar o PDF)
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [scrollStart, setScrollStart] = useState({ x: 0, y: 0 });

  const handleViewportMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (drawingTool !== 'hand' || !viewportRef.current) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX, y: e.clientY });
    setScrollStart({ x: viewportRef.current.scrollLeft, y: viewportRef.current.scrollTop });
    viewportRef.current.style.cursor = 'grabbing';
  }, [drawingTool]);

  const handleViewportMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPanning || !viewportRef.current) return;
    const dx = e.clientX - panStart.x;
    const dy = e.clientY - panStart.y;
    viewportRef.current.scrollLeft = scrollStart.x - dx;
    viewportRef.current.scrollTop = scrollStart.y - dy;
  }, [isPanning, panStart, scrollStart]);

  const handleViewportMouseUp = useCallback(() => {
    setIsPanning(false);
    if (viewportRef.current) {
      viewportRef.current.style.cursor = 'grab';
    }
  }, []);

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

        // Lógica de upload de fotos para evidência física
        if (physicalPhotos.length > 0 && currentFile.ownerId) {
          const uploadedPhotoUrls: string[] = [];
          for (const [index, photo] of physicalPhotos.entries()) {
            const filePath = `${currentFile.ownerId}/physical_evidence/${currentFile.id}/${Date.now()}_${index}_${photo.name}`;
            const uploadedPath = await fileService.uploadRaw(user, photo, photo.name, filePath);
            if (uploadedPath) {
              const { data: publicUrlData } = supabase.storage.from('certificates').getPublicUrl(uploadedPath);
              if (publicUrlData?.publicUrl) {
                uploadedPhotoUrls.push(publicUrlData.publicUrl);
              }
            }
          }
          updatedMetadata.physicalEvidenceUrls = [...(updatedMetadata.physicalEvidenceUrls || []), ...uploadedPhotoUrls];
        }
      }

      const { error } = await supabase.from('files').update({ metadata: updatedMetadata }).eq('id', currentFile.id);
      if (error) throw error;

      setCurrentFile(prev => prev ? ({ ...prev, metadata: updatedMetadata }) : null);
      setRejectMode('NONE');
      setObservations('');
      setSelectedFlags([]);
      setPhysicalPhotos([]); // Limpa as fotos após a ação
      showToast("Veredito registrado no fluxo SGQ.", "success");
    } catch (err) {
      console.error("Erro ao realizar ação:", err);
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

  const handlePhotoSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setPhysicalPhotos(prev => [...prev, ...Array.from(files)]);
    }
  };

  const removePhoto = (indexToRemove: number) => {
    setPhysicalPhotos(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  if (!isOpen) return null;

  const isDrawingToolActive = drawingTool === 'pencil' || drawingTool === 'highlight';

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
        <div 
          ref={viewportRef}
          className="flex-1 flex flex-col bg-[#0f172a] relative overflow-auto custom-scrollbar bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:32px_32px]"
          onMouseDown={handleViewportMouseDown}
          onMouseMove={handleViewportMouseMove}
          onMouseUp={handleViewportMouseUp}
          onMouseLeave={handleViewportMouseUp} // Stop panning if mouse leaves
          style={{ cursor: drawingTool === 'hand' && !isPanning ? 'grab' : drawingTool === 'hand' && isPanning ? 'grabbing' : 'default' }}
        >
          <div className="inline-flex min-w-full min-h-full items-start justify-center p-12">
            <div className="relative bg-white shadow-[0_40px_100px_rgba(0,0,0,0.6)] rounded-sm">
              {loading && <div className="absolute inset-0 bg-[#081437]/40 flex items-center justify-center z-50 backdrop-blur-sm"><Loader2 className="animate-spin text-blue-500" size={48} /></div>}
              <canvas ref={canvasRef} className="block pointer-events-none" />
              <canvas 
                ref={annotationCanvasRef} 
                className={`absolute top-0 left-0 z-10 ${drawingTool !== 'hand' ? 'pointer-events-auto' : 'pointer-events-none'}`} 
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp} // Finaliza o desenho se o mouse sair do canvas
                style={{ cursor: isDrawingToolActive ? 'crosshair' : drawingTool === 'eraser' ? 'cell' : 'default' }}
              />
            </div>
          </div>
        </div>
          
        {/* Barra de Ferramentas do Visualizador */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-[#081437]/90 backdrop-blur-2xl border border-white/10 p-3 rounded-full shadow-2xl z-[100]">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
              <button onClick={() => setPageNum(p => Math.max(1, p - 1))} className="text-slate-400 hover:text-white" aria-label="Página anterior"><ChevronLeft size={16}/></button>
              <span className="text-[10px] font-black text-white min-w-[40px] text-center">{pageNum} / {numPages}</span>
              <button onClick={() => setPageNum(p => Math.min(numPages, p + 1))} className="text-slate-400 hover:text-white" aria-label="Próxima página"><ChevronRightIcon size={16}/></button>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setZoom(z => Math.max(0.5, z - 0.2))} className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full" aria-label="Reduzir zoom"><ZoomOut size={16}/></button>
              <button onClick={() => setZoom(z => Math.min(3, z + 0.2))} className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full" aria-label="Aumentar zoom"><ZoomIn size={16}/></button>
            </div>
            
            {/* Divisor */}
            <div className="w-px h-6 bg-white/10 mx-1" />

            {/* Ferramentas de Desenho */}
            <div className="flex items-center gap-2">
              <button onClick={() => setDrawingTool('hand')} className={`p-2 rounded-full transition-all ${drawingTool === 'hand' ? 'bg-white text-blue-600' : 'text-slate-400 hover:text-white hover:bg-white/5'}`} title="Ferramenta Mão (Arrastar)" aria-label="Ferramenta Mão"><Hand size={16}/></button>
              <button onClick={() => setDrawingTool('pencil')} className={`p-2 rounded-full transition-all ${drawingTool === 'pencil' ? 'bg-white text-blue-600' : 'text-slate-400 hover:text-white hover:bg-white/5'}`} title="Lápis" aria-label="Ferramenta Lápis"><Pencil size={16}/></button>
              <button onClick={() => setDrawingTool('highlight')} className={`p-2 rounded-full transition-all ${drawingTool === 'highlight' ? 'bg-white text-blue-600' : 'text-slate-400 hover:text-white hover:bg-white/5'}`} title="Marcador" aria-label="Ferramenta Marcador"><Highlighter size={16}/></button>
              <button onClick={() => setDrawingTool('eraser')} className={`p-2 rounded-full transition-all ${drawingTool === 'eraser' ? 'bg-white text-blue-600' : 'text-slate-400 hover:text-white hover:bg-white/5'}`} title="Borracha" aria-label="Ferramenta Borracha"><Eraser size={16}/></button>
              
              {/* Seleção de Cor */}
              <input type="color" value={annotationColor} onChange={e => setAnnotationColor(e.target.value)} className="w-8 h-8 rounded-full border border-white/20 overflow-hidden cursor-pointer" title="Selecionar Cor" aria-label="Selecionar Cor" />
            </div>

            {/* Divisor */}
            <div className="w-px h-6 bg-white/10 mx-1" />

            {/* Undo / Redo */}
            <div className="flex items-center gap-2">
              <button onClick={handleUndo} disabled={historyPointer === 0} className={`p-2 rounded-full transition-all ${historyPointer === 0 ? 'text-slate-600 cursor-not-allowed' : 'text-slate-400 hover:text-white hover:bg-white/5'}`} title="Desfazer" aria-label="Desfazer"><Undo2 size={16}/></button>
              <button onClick={handleRedo} disabled={historyPointer === annotationHistory.length - 1} className={`p-2 rounded-full transition-all ${historyPointer === annotationHistory.length - 1 ? 'text-slate-600 cursor-not-allowed' : 'text-slate-400 hover:text-white hover:bg-white/5'}`} title="Refazer" aria-label="Refazer"><Redo2 size={16}/></button>
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
                        {user?.role === UserRole.CLIENT && currentFile?.metadata?.sentAt && (
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
                        {/* INPUT DE FOTOS */}
                        {user?.role === UserRole.CLIENT && currentFile?.metadata?.sentAt && (
                          <div className="space-y-2 py-2">
                              <p className="text-[9px] font-black text-slate-400 uppercase ml-1 tracking-widest">Anexar Evidências Visuais (Opcional):</p>
                              <input 
                                  type="file" 
                                  accept="image/*" 
                                  multiple 
                                  onChange={handlePhotoSelection}
                                  className="block w-full text-xs text-slate-500
                                           file:mr-4 file:py-2 file:px-4
                                           file:rounded-full file:border-0
                                           file:text-sm file:font-semibold
                                           file:bg-blue-50 file:text-blue-700
                                           hover:file:bg-blue-100"
                              />
                              {physicalPhotos.length > 0 && (
                                  <div className="flex flex-wrap gap-2 mt-3">
                                      {physicalPhotos.map((file, index) => (
                                          <div key={index} className="relative">
                                              <img src={URL.createObjectURL(file)} alt={`Evidência ${index + 1}`} className="w-20 h-20 object-cover rounded-lg border border-slate-200" />
                                              <button 
                                                  type="button"
                                                  onClick={() => removePhoto(index)}
                                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs"
                                              >
                                                  <X size={12} />
                                              </button>
                                          </div>
                                      ))}
                                  </div>
                              )}
                          </div>
                        )}
                        
                        {/* EXIBIR FOTOS JÁ EXISTENTES */}
                        {currentFile?.metadata?.physicalEvidenceUrls && currentFile.metadata.physicalEvidenceUrls.length > 0 && (
                           <div className="space-y-2 py-2">
                              <p className="text-[9px] font-black text-slate-400 uppercase ml-1 tracking-widest">Evidências Visuais Existentes:</p>
                              <div className="flex flex-wrap gap-2 mt-3">
                                {currentFile.metadata.physicalEvidenceUrls.map((url, index) => (
                                  <a key={index} href={url} target="_blank" rel="noopener noreferrer" className="relative block">
                                    <img src={url} alt={`Evidência Salva ${index + 1}`} className="w-20 h-20 object-cover rounded-lg border border-blue-200" />
                                    <span className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-tl-lg px-1 text-[8px] font-bold">Ver</span>
                                  </a>
                                ))}
                              </div>
                           </div>
                        )}

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