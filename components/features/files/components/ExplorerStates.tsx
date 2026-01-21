import React from 'react';
import { Loader2, FileText, ShieldCheck } from 'lucide-react';

interface StateProps {
  message?: string;
  t?: any;
}

export const LoadingState: React.FC<StateProps> = ({ message = "Sincronizando..." }) => (
  <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4 min-h-[400px] animate-in fade-in duration-500">
    <div className="relative">
      <Loader2 size={40} className="animate-spin text-blue-500/60" />
      <div className="absolute inset-0 blur-xl bg-blue-500/20 rounded-full animate-pulse" />
      <ShieldCheck size={16} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600" />
    </div>
    <span className="text-[11px] font-black uppercase tracking-[5px] text-slate-500">{message}</span>
  </div>
);

export const EmptyState: React.FC<StateProps> = ({ t }) => (
  <div className="h-full flex flex-col items-center justify-center text-slate-300 py-20 min-h-[400px] text-center animate-in zoom-in-95 duration-500">
    <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 shadow-inner border border-slate-100">
        <FileText size={40} className="opacity-20 text-slate-400" />
    </div>
    <p className="font-black text-sm text-slate-500 uppercase tracking-widest">
        {t ? t('files.noResultsFound') : "Nenhum ativo localizado"}
    </p>
    <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-tight opacity-70">
        {t ? t('files.typeToSearch') : "Tente refinar sua busca no repositório."}
    </p>
  </div>
);