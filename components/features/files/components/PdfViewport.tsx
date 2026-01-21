
import React, { useRef, useEffect, useState, useCallback, useLayoutEffect } from 'react';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

// Importações do React-PDF-Viewer
import { Viewer, Worker, SpecialZoomLevel } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import { panModePlugin } from '@react-pdf-viewer/pan-mode';
import { toolbarPlugin } from '@react-pdf-viewer/toolbar';
import { zoomPlugin } from '@react-pdf-viewer/zoom';
import { pageNavigationPlugin } from '@react-pdf-viewer/page-navigation';


// Definindo o worker do PDF.js (necessário para react-pdf-viewer)
const PDFJS_VERSION = '3.11.174';
const workerUrl = `https://unpkg.com/pdfjs-dist@${PDFJS_VERSION}/build/pdf.worker.min.js`;

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
  const [numPages, setNumPages] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isDocumentLoading, setIsDocumentLoading] = useState(false);
  const [viewerScale, setViewerScale] = useState<number | SpecialZoomLevel>(zoom);

  // Plugins para o Viewer
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const panModePluginInstance = panModePlugin();
  const zoomPluginInstance = zoomPlugin();
  const pageNavigationPluginInstance = pageNavigationPlugin();
  const toolbarPluginInstance = toolbarPlugin();

  const { GoToNextPage, GoToPreviousPage } = pageNavigationPluginInstance;
  const { zoomIn, zoomOut, Zoom } = zoomPluginInstance;
  const { EnterPanMode, EnterTextSelectionMode } = panModePluginInstance;

  // Renderiza o PDF ou o Overlay de Loading/Erro
  const renderContent = useCallback(() => {
    if (error) {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 z-50 p-12 text-center animate-in fade-in">
          <AlertCircle size={56} className="text-red-500 mb-6 drop-shadow-[0_0_15px_rgba(239,68,68,0.4)]" />
          <h3 className="text-white text-lg font-black uppercase tracking-[4px] mb-2">Erro de Renderização</h3>
          <p className="text-slate-400 text-sm max-w-xs mx-auto mb-8">Não foi possível processar o ativo técnico.</p>
          <button onClick={() => window.location.reload()} className="flex items-center gap-3 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95">
            <RefreshCw size={14} /> Tentar Novamente
          </button>
        </div>
      );
    }

    if (!url || isDocumentLoading) {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 animate-in fade-in duration-1000">
          <div className="relative">
            <Loader2 size={64} className="animate-spin text-blue-600" />
            <div className="absolute inset-0 blur-3xl bg-blue-600/20 rounded-full animate-pulse" />
          </div>
          <div className="text-center space-y-3">
            <p className="text-[11px] font-black uppercase tracking-[6px] text-slate-500 animate-pulse">Sincronizando Viewport Industrial</p>
            {/* Ações de refresh podem ser adicionadas aqui se houver um mecanismo de re-tentativa */}
          </div>
        </div>
      );
    }
    
    return (
      <div className="absolute inset-0 z-0">
        <Worker workerUrl={workerUrl}>
          <Viewer
            fileUrl={url}
            defaultScale={viewerScale}
            pageLayout={{
                // Desabilitar layout de página se o panning estiver ativo para melhor controle com overlay
                // ou permitir que o Viewer determine o layout padrão
                // user. Não vamos usar o layout padrão do Viewer para ter controle total do container.
                transformPage: (page) => {
                    return page;
                }
            }}
            initialPage={pageNum - 1} // `initialPage` é 0-indexed
            onDocumentLoadSuccess={(e) => {
              const total = e.doc.numPages;
              setNumPages(total);
              onPdfLoad(total);
              setIsDocumentLoading(false);
            }}
            onDocumentLoadFail={(e) => {
              console.error("Failed to load PDF document", e);
              setError("Falha ao carregar o documento PDF.");
              setIsDocumentLoading(false);
            }}
            onPageChange={(e) => {
                // `react-pdf-viewer` cuida da navegação de página interna,
                // mas podemos sincronizar o estado externo se necessário.
            }}
            // Renderiza o overlay na camada acima do PDF
            renderPage={(props) => (
                <>
                    {props.canvasElement}
                    {props.annotationLayerElement}
                    {props.textLayerElement}
                    {renderOverlay && (
                        <div
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: props.page.width,
                                height: props.page.height,
                                zIndex: 10,
                                pointerEvents: isHandToolActive ? 'none' : 'auto', // Desativa eventos no overlay se a mãozinha estiver ativa
                            }}
                        >
                            {renderOverlay(props.page.width, props.page.height)}
                        </div>
                    )}
                </>
            )}
            plugins={[
                defaultLayoutPluginInstance,
                panModePluginInstance,
                zoomPluginInstance,
                pageNavigationPluginInstance,
                toolbarPluginInstance
            ]}
          />
        </Worker>
      </div>
    );
  }, [url, error, isDocumentLoading, viewerScale, pageNum, onPdfLoad, renderOverlay, isHandToolActive, defaultLayoutPluginInstance, panModePluginInstance, zoomPluginInstance, pageNavigationPluginInstance, toolbarPluginInstance]);


  // Efeito para sincronizar `zoom` e `pageNum` do componente pai
  useEffect(() => {
    setViewerScale(zoom === 1.0 ? SpecialZoomLevel.PageFit : zoom);
  }, [zoom]);

  // Efeito para gerenciar o modo de "mãozinha"
  useEffect(() => {
    if (isHandToolActive) {
      EnterPanMode();
    } else {
      EnterTextSelectionMode(); // Volta ao modo de seleção de texto (desativa panning)
    }
  }, [isHandToolActive, EnterPanMode, EnterTextSelectionMode]);

  return (
    <div 
      ref={containerRef}
      className={`flex-1 bg-[#020617] relative select-none ${
        isHandToolActive ? 'cursor-grab' : 'cursor-default'
      } overflow-hidden`} // Sempre hidden para o viewer gerenciar
    >
      {/* Background Decorativo Mesa de Luz */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_center,_#1e293b_0%,_transparent_70%)]" />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      <div className="relative w-full h-full">
        {renderContent()}
      </div>

      {/* Os controles de paginação e zoom do cabeçalho de FilePreviewPage (Pai)
          serão usados. Os controles padrão do Viewer serão desativados ou
          escondidos via CSS se o DefaultLayoutPlugin for usado completamente.
          Para este caso, estamos usando o Viewer diretamente, então só precisamos
          nos preocupar com o que renderizamos.
      */}
    </div>
  );
};