import React from 'react';
import { usePartnerDashboard } from '../../partner/hooks/usePartnerDashboard.ts';
import { ShieldCheck, FileText, Clock, FileWarning, ArrowRight, Loader2, ClipboardCheck, Info } from 'lucide-react';
import { FileStatusBadge } from '../../files/components/FileStatusBadge.tsx';
import { useSearchParams } from 'react-router-dom';

export const ClientDashboardView: React.FC = () => {
  const { stats, recentFiles, isLoading } = usePartnerDashboard();
  const [, setSearchParams] = useSearchParams();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
        <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
        <p className="text-[10px] font-black uppercase tracking-[4px] text-slate-400">Sincronizando Dados B2B...</p>
      </div>
    );
  }

  const totalPending = stats?.pendingValue || 0;
  const hasPending = totalPending > 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KPI: Pendências de Auditoria */}
        <div className={`p-6 rounded-[2.5rem] border shadow-xl flex flex-col justify-between transition-all relative overflow-hidden group ${
          hasPending ? 'bg-orange-600 border-orange-500 text-white' : 'bg-white border-slate-200'
        }`}>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${
                hasPending ? 'bg-white text-orange-600' : 'bg-[#132659] text-white'
              }`}>
                <ClipboardCheck size={24} />
              </div>
              <h3 className={`text-[10px] font-black uppercase tracking-[2px] ${hasPending ? 'text-white/70' : 'text-slate-400'}`}>Ações Pendentes</h3>
            </div>
            <div>
              <p className="text-5xl font-black tracking-tighter">{totalPending}</p>
              <p className={`text-[10px] font-bold uppercase mt-1 tracking-widest ${hasPending ? 'text-white/80' : 'text-orange-600'}`}>
                {hasPending ? 'Certificados para Conferência' : 'Tudo em conformidade'}
              </p>
            </div>
          </div>
          {hasPending && <FileWarning className="absolute -right-4 -bottom-4 opacity-10 rotate-12 pointer-events-none" size={120} />}
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col justify-between group relative overflow-hidden">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100 shadow-inner group-hover:scale-110 transition-transform">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-[2px] text-slate-400">Ativos Validados</h3>
          </div>
          <div>
            <p className="text-4xl font-black text-slate-800 tracking-tighter">{stats?.subValue || 0}</p>
            <p className="text-[10px] text-emerald-600 font-bold uppercase mt-1 tracking-widest">Protocolos em Conformidade</p>
          </div>
        </div>

        <div className="bg-[#132659] p-6 rounded-[2.5rem] text-white flex flex-col justify-between shadow-2xl relative overflow-hidden group">
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className="w-12 h-12 bg-white/10 text-blue-400 rounded-2xl flex items-center justify-center border border-white/5 shadow-lg group-hover:rotate-12 transition-transform">
              <Clock size={24} />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-[2px] text-slate-500">Última Auditoria</h3>
          </div>
          <div className="relative z-10">
            <p className="text-2xl font-black tracking-tight">
              {stats?.lastAnalysis ? new Date(stats.lastAnalysis).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '--/--/----'}
            </p>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-[3px]">Protocolo Vital SGQ</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
        <header className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />
             <h4 className="text-xs font-black text-slate-800 uppercase tracking-[3px]">Histórico de Ativos Recebidos</h4>
          </div>
          <button 
            onClick={() => setSearchParams({ view: 'library' })}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[9px] font-black text-slate-600 uppercase tracking-widest rounded-xl transition-all"
          >
            Acessar Biblioteca
          </button>
        </header>
        <div className="divide-y divide-slate-50">
          {recentFiles.map(file => (
            <div 
              key={file.id} 
              onClick={() => setSearchParams({ view: 'library', folderId: file.parentId || '' })}
              className="flex items-center justify-between p-6 hover:bg-blue-50/30 transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center border border-slate-100 group-hover:bg-blue-100 group-hover:text-blue-600 transition-all shadow-sm">
                  <FileText size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 leading-tight uppercase tracking-tight">{file.name}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[10px] text-slate-400 font-bold font-mono bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">{file.size}</span>
                    <FileStatusBadge status={file.metadata?.status} />
                  </div>
                </div>
              </div>
              <ArrowRight size={20} className="text-slate-200 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </div>
          ))}
          {recentFiles.length === 0 && (
            <div className="py-24 text-center text-slate-400 italic">
              <ShieldCheck size={48} className="mx-auto mb-4 opacity-10" />
              <p className="text-sm font-medium uppercase tracking-widest">Sem movimentações recentes no Vault.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
