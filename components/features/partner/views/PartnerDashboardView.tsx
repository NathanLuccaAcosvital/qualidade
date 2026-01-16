
import React from 'react';
import { usePartnerDashboard } from '../hooks/usePartnerDashboard.ts';
import { ShieldCheck, FileText, Clock, FileWarning, ArrowRight } from 'lucide-react';
import { PageLoader } from '../../../common/PageLoader.tsx';
import { FileStatusBadge } from '../../files/components/FileStatusBadge.tsx';
import { useSearchParams } from 'react-router-dom';

export const PartnerDashboardView: React.FC = () => {
  const { stats, recentFiles, isLoading } = usePartnerDashboard();
  const [, setSearchParams] = useSearchParams();

  if (isLoading || !stats) return <PageLoader message="Sincronizando Indicadores Vital..." />;

  const totalActions = stats.pendingValue || 0;
  const hasActions = totalActions > 0;
  const unviewedCount = stats.unviewedCount || 0;
  const rejectedCount = stats.rejectedCount || 0;

  const navigateToLibrary = (folderId: string | null) => {
    setSearchParams({ view: 'library', folderId: folderId || '' });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Grade de KPIs do Parceiro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100">
              <ShieldCheck size={20} />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-[2px] text-slate-400">Em Conformidade</h3>
          </div>
          <div>
            <p className="text-4xl font-black text-slate-800 tracking-tighter">{stats.subValue}</p>
            <p className="text-[10px] text-emerald-600 font-bold uppercase mt-1">Certificados Auditados</p>
          </div>
        </div>

        <div className={`p-6 rounded-[2rem] border shadow-sm flex flex-col justify-between transition-all ${
          hasActions ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
              hasActions ? 'bg-red-600 text-white border-red-700 animate-pulse shadow-lg shadow-red-200' : 'bg-slate-50 text-slate-400 border-slate-100'
            }`}>
              <FileWarning size={20} />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-[2px] text-slate-400">Ação Requerida</h3>
          </div>
          <div>
            <p className={`text-4xl font-black tracking-tighter ${hasActions ? 'text-red-600' : 'text-slate-800'}`}>
              {totalActions}
            </p>
            <div className="flex flex-col gap-0.5 mt-1">
                <p className={`text-[10px] font-bold uppercase ${hasActions ? 'text-red-500' : 'text-slate-400'}`}>
                  {hasActions ? 'Itens aguardando interação' : 'Nenhuma Pendência'}
                </p>
                {unviewedCount > 0 && (
                    <p className="text-[8px] font-black text-red-400 uppercase tracking-tighter">
                        • {unviewedCount} Documentos Novos p/ Conferir
                    </p>
                )}
                {rejectedCount > 0 && (
                    <p className="text-[8px] font-black text-red-400 uppercase tracking-tighter">
                        • {rejectedCount} Contestados p/ Reavaliar
                    </p>
                )}
            </div>
          </div>
        </div>

        <div className="bg-[#081437] p-6 rounded-[2rem] text-white flex flex-col justify-between shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Clock size={80} />
          </div>
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className="w-10 h-10 bg-white/10 text-blue-400 rounded-xl flex items-center justify-center border border-white/5">
              <Clock size={20} />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-[2px] text-slate-500">Sincronização</h3>
          </div>
          <div className="relative z-10">
            <p className="text-xl font-bold">{stats.lastAnalysis ? new Date(stats.lastAnalysis).toLocaleDateString() : '--/--/----'}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">Base de Dados em Tempo Real</p>
          </div>
        </div>
      </div>

      {/* CTA de Documentação Crítica */}
      {hasActions && (
        <div className="bg-gradient-to-r from-[#b23c0e] to-[#8a2f0b] p-8 rounded-[2.5rem] text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <span className="px-2 py-0.5 bg-white/20 rounded text-[9px] font-black uppercase tracking-widest">Urgente</span>
            </div>
            <h4 className="text-lg font-black uppercase tracking-tight">Pendências no Terminal B2B</h4>
            <p className="text-sm text-white/70 font-medium max-w-xl">
              Existem {totalActions} documentos que necessitam da sua validação ou conferência técnica para prosseguir com o fluxo de compliance.
            </p>
          </div>
          <button 
            onClick={() => setSearchParams({ view: 'library' })}
            className="px-8 py-4 bg-white text-[#b23c0e] rounded-2xl font-black text-xs uppercase tracking-[2px] shadow-xl hover:bg-slate-100 transition-all active:scale-95 flex items-center gap-3 shrink-0"
          >
            Acessar Biblioteca <ArrowRight size={18} />
          </button>
        </div>
      )}

      {/* Transmissões Recentes (Apenas Arquivos) */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
        <header className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-[3px]">Transmissões Recentes</h4>
          <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase tracking-widest">Últimos 5 Arquivos</span>
        </header>
        <div className="divide-y divide-slate-50">
          {recentFiles.map(file => (
            <div 
              key={file.id} 
              onClick={() => navigateToLibrary(file.parentId)}
              className="flex items-center justify-between p-6 hover:bg-slate-50 transition-all active:scale-[0.99] group cursor-pointer"
              role="button"
              aria-label={`Ver documento ${file.name} na biblioteca`}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-50 text-slate-400 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <FileText size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 leading-tight">{file.name}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] text-slate-400 font-mono tracking-tighter">{file.size}</span>
                    <FileStatusBadge status={file.metadata?.status} />
                    {file.metadata?.viewedAt ? (
                      <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 ml-2">Lido</span>
                    ) : (
                      <span className="text-[9px] font-black text-orange-600 uppercase tracking-widest bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100 ml-2 animate-pulse">Novo</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div 
                    className="p-3 bg-white border border-slate-200 text-slate-400 group-hover:text-blue-600 group-hover:border-blue-200 rounded-xl transition-all shadow-sm"
                >
                    <ArrowRight size={18} />
                </div>
              </div>
            </div>
          ))}
          {recentFiles.length === 0 && (
            <div className="py-20 text-center text-slate-400 italic text-sm">
              Nenhum certificado identificado nesta conta.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
