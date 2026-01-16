
import React from 'react';
import { Loader2 } from 'lucide-react';

interface PageLoaderProps {
  message?: string;
}

export const PageLoader: React.FC<PageLoaderProps> = ({ message = "Carregando..." }) => (
  <div className="h-screen w-full flex flex-col items-center justify-center bg-[#081437]">
    <div className="relative mb-6">
      <Loader2 size={48} className="animate-spin text-blue-500" />
      <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse" />
    </div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[4px]">{message}</p>
  </div>
);
