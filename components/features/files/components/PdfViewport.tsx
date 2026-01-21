
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

const PDFJS_VERSION = '3.11.174';
if (typeof window !== 'undefined' && (window as any).pdfjsLib) {
  (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.js`;
}

interface PdfViewportProps {
  url: string | null;
  zoom: number;
  pageNum: number;
  onPdfLoad: (numPages: number) => void;
  onZoomChange?: (newZoom: number) => void;
  renderOverlay?: (width: number, height: number) => React.ReactNode;
  isHandToolActive?: boolean;
}

export const PdfViewport: React.FC<PdfViewportProps> = ({ 
  url, zoom, pageNum, onPdfLoad, onZoomChange, renderOverlay, isHandToolActive = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bufferCanvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));
  
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  // Estados para Movimentação Livre (Premium)
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, initialOffX: 0, initialOffY: 0 });

  const renderTaskRef = useRef<any>(null);

  const cleanup = useCallback(() => {
    if (renderTaskRef.current) {
      try { renderTaskRef.current.cancel(); } catch (e) {}
      renderTaskRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!url) return;
    const loadPdf = async () => {
      cleanup();
      setError(null);
      setIsRendering(true);
      try {
        const loadingTask = (window as any).pdfjsLib.getDocument({
          url,
          withCredentials: false,
          cMapUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/cmaps/`,
          cMapPacked: true,
        });
        const pdf = await loadingTask.promise;
        setPdfDoc(pdf);
        onPdfLoad(pdf.numPages);
        // Reset position on new document
        setOffset({ x: 0, y: 0 });
      } catch (err: any) {
        if (err.name !== 'AbortError') setError("Falha ao abrir laudo.");
      } finally {
        setIsRendering(false);
      }
    };
    loadPdf();
    return cleanup;
  }, [url, cleanup, onPdfLoad]);

  const renderPage = useCallback(async () => {
    if (!pdfDoc || !canvasRef.current) return;
    if (renderTaskRef.current) {
        try { renderTaskRef.current.cancel(); } catch(e) {}
    }
    setIsRendering(true);
    try {
      const page = await pdfDoc.getPage(pageNum);
      const outputScale = window.devicePixelRatio || 1;
      const viewport = page.getViewport({ scale: zoom });
      
      const canvas = canvasRef.current;
      const bufferCanvas = bufferCanvasRef.current;
      const context = canvas.getContext('2d', { alpha: false });
      const bufferContext = bufferCanvas.getContext('2d', { alpha: false });

      if (!context || !bufferContext) return;

      bufferCanvas.width = Math.floor(viewport.width * outputScale);
      bufferCanvas.height = Math.floor(viewport.height * outputScale);
      
      const renderContext = {
        canvasContext: bufferContext,
        viewport: viewport,
        transform: outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null
      };

      const renderTask = page.render(renderContext);
      renderTaskRef.current = renderTask;
      await renderTask.promise;

      canvas.width = bufferCanvas.width;
      canvas.height = bufferCanvas.height;
      context.drawImage(bufferCanvas, 0, 0);
      setDimensions({ width: viewport.width, height: viewport.height });
    } catch (err: any) {
      if (err.name !== 'RenderingCancelledException') console.error(err);
    } finally {
      setIsRendering(false);
    }
  }, [pdfDoc, pageNum, zoom]);

  useEffect(() => { renderPage(); }, [renderPage]);

  // LOGICA DE PANNING (Mãozinha Premium)
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isHandToolActive && e.button !== 1) return;
    
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      initialOffX: offset.x,
      initialOffY: offset.y
    };
    
    if (containerRef.current) {
      containerRef.current.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;

    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;

    setOffset({
      x: dragStart.current.initialOffX + dx,
      y: dragStart.current.initialOffY + dy
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      if (containerRef.current) {
        containerRef.current.releasePointerCapture(e.pointerId);
      }
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
        if (!onZoomChange) return;
        e.preventDefault();
        const direction = e.deltaY < 0 ? 1 : -1;
        onZoomChange(Math.max(0.1, Math.min(5, zoom + direction * 0.15)));
    } else {
        // Scroll natural converte em movimento de Offset Y se a mão estiver ativa
        if (isHandToolActive) {
            e.preventDefault();
            setOffset(prev => ({ ...prev, y: prev.y - e.deltaY }));
        }
    }
  };

  return (
    <div 
      ref={containerRef}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`flex-1 overflow-hidden bg-[#020617] relative flex justify-center items-center select-none touch-none ${
        isHandToolActive ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'
      }`}
    >
      {/* Background Decorativo Mesa de Luz */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_center,_#1e293b_0%,_transparent_70%)]" />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      {/* Container Flutuante do Documento */}
      <div 
        className="relative transition-transform duration-[400ms] ease-out flex-shrink-0"
        style={{ 
          width: dimensions.width || 'auto', 
          height: dimensions.height || 'auto', 
          transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
          transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
          pointerEvents: isHandToolActive ? 'none' : 'auto'
        }}
      >
        {/* Sombra Dinâmica Premium */}
        <div className={`absolute inset-0 bg-black/40 blur-[40px] rounded-sm -z-10 transition-opacity duration-500 ${dimensions.width ? 'opacity-100' : 'opacity-0'}`} 
             style={{ transform: 'translateY(20px) scale(0.98)' }} />
        
        <div className="bg-white shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_20px_50px_rgba(0,0,0,0.5)] rounded-sm overflow-hidden">
            <canvas ref={canvasRef} style={{ width: dimensions.width, height: dimensions.height, display: 'block' }} />
        </div>
        
        <div className={`absolute inset-0 z-10 ${isHandToolActive ? 'pointer-events-none' : 'pointer-events-auto'}`}>
          {dimensions.width > 0 && renderOverlay && renderOverlay(dimensions.width, dimensions.height)}
        </div>
        
        {isRendering && (
          <div className="absolute top-6 right-6 z-[60] bg-blue-600/90 backdrop-blur-md p-2 rounded-full shadow-2xl animate-pulse ring-4 ring-blue-500/20">
             <Loader2 size={16} className="animate-spin text-white" />
          </div>
        )}
      </div>

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 z-50 p-12 text-center animate-in fade-in">
            <AlertCircle size={56} className="text-red-500 mb-6 drop-shadow-[0_0_15px_rgba(239,68,68,0.4)]" />
            <h3 className="text-white text-lg font-black uppercase tracking-[4px] mb-2">Erro de Renderização</h3>
            <p className="text-slate-400 text-sm max-w-xs mx-auto mb-8">Não foi possível processar o ativo técnico.</p>
            <button onClick={() => window.location.reload()} className="flex items-center gap-3 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95">
               <RefreshCw size={14} /> Tentar Novamente
            </button>
        </div>
      )}
    </div>
  );
};
