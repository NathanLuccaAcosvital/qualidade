import React from 'react';
import { Loader2 } from 'lucide-react';

export const PdfPreviewLoader: React.FC = () => (
  <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 animate-in fade-in duration-1000">
    <div className="relative">
      <Loader2 size={64} className="animate-spin text-blue-600" />
      <div className="absolute inset-0 blur-3xl bg-blue-600/20 rounded-full animate-pulse" />
    </div>
    <div className="text-center space-y-3">
      <p className="text-[11px] font-black uppercase tracking-[6px] text-slate-500 animate-pulse">Carregando Visualizador PDF...</p>
    </div>
  </div>
);