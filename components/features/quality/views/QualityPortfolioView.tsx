import React from 'react';
import { useQualityPortfolio } from '../hooks/useQualityPortfolio.ts';
import { Building2, ClipboardCheck, ArrowRight, ChevronRight, AlertCircle, MessageSquare, Trash2, ShieldCheck } from 'lucide-react';
import { PageLoader } from '../../../common/PageLoader.tsx';
import { useNavigate } from 'react-router-dom';
// Fix: Removed QualityStatus import as it's not needed here anymore

export const QualityPortfolioView: React.FC = () => {
  const navigate = useNavigate();
  const { clients, isLoading } = useQualityPortfolio(); // Simplificado para pegar apenas clients

  if (isLoading) return <PageLoader message="Sincronizando Carteira de Auditoria..." />;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex items-center gap-4">
        <div className="h-10 w-2 bg-[#b23c0e] rounded-full" />
        <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Monitor de Carteira</h2>
      </div>

      <div className="space-y-6">
        <h3 className="text-[10px] font-black uppercase tracking-[3px] text-slate-400">Portfólio Industrial</h3>
        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-4 shadow-sm divide-y divide-slate-50">
          {clients.map(client => (
            <div 
              key={client.id} 
              onClick={() => navigate(`/quality/portfolio?orgId=${client.id}`)}
              className="p-4 flex items-center gap-4 hover:bg-slate-50 rounded-2xl transition-colors cursor-pointer group"
            >
              <div className="w-10 h-10 bg-[#081437] text-white rounded-xl flex items-center justify-center font-black shadow-lg">
                {client.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">{client.name}</p>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{client.cnpj}</p>
              </div>
              <ChevronRight size={16} className="text-slate-200 group-hover:text-blue-500 transition-colors" />
            </div>
          ))}
          {clients.length === 0 && (
            <div className="py-8 text-center text-slate-400 italic text-sm">
                Nenhuma empresa cliente encontrada na sua carteira.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};