
import React from 'react';
import { Loader2, Activity, ShieldCheck, AlertCircle } from 'lucide-react';

/**
 * Overlay de processamento global (S)
 * Bloqueia a interface durante operações críticas de mutação de dados.
 */
// Fix: Added missing ProcessingOverlay export
export const ProcessingOverlay: React.FC<{ message: string }> = ({ message }) => (
  <div className="fixed inset-0 z-[200] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
    <div className="bg-white px-8 py-5 rounded-2xl shadow-2xl border border-slate-200 flex items-center gap-4">
      <Loader2 size={24} className="animate-spin text-[var(--color-detail-blue)]" />
      <span className="text-xs font-black uppercase tracking-[2px] text-slate-800">{message}</span>
    </div>
  </div>
);

export const QualityLoadingState: React.FC<{ message?: string }> = ({ message = "Sincronizando..." }) => (
  <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200 animate-pulse">
    <div className="relative mb-6">
      <Loader2 size={48} className="animate-spin text-[var(--color-detail-blue)]" />
      <ShieldCheck size={20} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[var(--color-primary-dark-blue)]" />
    </div>
    <p className="text-[10px] font-black uppercase tracking-[6px] text-slate-400">{message}</p>
  </div>
);

export const QualityEmptyState: React.FC<{ message: string; icon?: React.ElementType }> = ({ message, icon: Icon = Activity }) => (
  <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200 opacity-60">
    <Icon size={56} className="text-slate-300 mb-4" />
    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{message}</p>
  </div>
);

export const ErrorState: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-20 bg-red-50 rounded-[2.5rem] border border-red-100 text-red-500 gap-4">
    <AlertCircle size={48} />
    <p className="font-black text-xs uppercase tracking-widest">{message}</p>
  </div>
);
