
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../../../lib/services/index.ts';
import { supabase } from '../../../../lib/supabaseClient.ts';
import { useAuth } from '../../../../context/authContext.tsx';
import { useToast } from '../../../../context/notificationContext.tsx';
import { QualityLoadingState } from '../components/ViewStates.tsx';
import { QualityOverviewCards } from '../components/QualityOverviewCards.tsx';
import { ArrowRight, FileWarning, History } from 'lucide-react';
import { QualityStatus } from '../../../../types/enums.ts';

export const QualityOverview: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      if (!user) return;
      try {
        // Busca multicritério para dados reais em tempo real
        const [activeClientsRes, pendingRes, rejectedRes, totalRes, approvedRes] = await Promise.all([
          adminService.getClients({ status: 'ACTIVE' }, 1, 1),
          supabase.from('files').select('*', { count: 'exact', head: true }).eq('metadata->>status', QualityStatus.PENDING).neq('type', 'FOLDER'),
          supabase.from('files').select('*', { count: 'exact', head: true }).eq('metadata->>status', QualityStatus.REJECTED).neq('type', 'FOLDER'),
          supabase.from('files').select('*', { count: 'exact', head: true }).neq('type', 'FOLDER'),
          supabase.from('files').select('*', { count: 'exact', head: true }).eq('metadata->>status', QualityStatus.APPROVED).neq('type', 'FOLDER')
        ]);
        
        const totalFiles = totalRes.count || 0;
        const approvedFiles = approvedRes.count || 0;
        const complianceRate = totalFiles > 0 ? ((approvedFiles / totalFiles) * 100).toFixed(1) : "100";

        setStats({
          totalActiveClients: activeClientsRes.total || 0,
          pendingDocs: pendingRes.count || 0,
          rejectedByClient: rejectedRes.count || 0,
          complianceRate: complianceRate,
          totalFiles: totalFiles
        });
      } catch (err) {
        showToast("Erro ao sincronizar indicadores reais.", 'error');
      } finally {
        setIsLoading(false);
      }
    };
    loadStats();
  }, [user]);

  if (isLoading) return <QualityLoadingState message="Sincronizando Central de Comando..." />;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* KPIs Dinâmicos com Navegação Direta para Páginas */}
      <QualityOverviewCards
        totalClients={stats?.totalActiveClients || 0}
        totalPendingDocs={stats?.pendingDocs || 0}
        complianceRate={stats?.complianceRate || "0"}
        totalRejected={stats?.rejectedByClient || 0}
        onNavigate={(path) => navigate(path)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-[#132659] rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl border border-white/5 group">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-600/20 transition-all" />
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="space-y-4">
               <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-blue-600 rounded-lg text-[9px] font-black uppercase tracking-[3px]">Protocolo de Saída</span>
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
               </div>
               <h2 className="text-4xl font-black tracking-tighter leading-tight">
                 Emissão de<br/>
                 <span className="text-blue-400">Laudos Técnicos.</span>
               </h2>
               <p className="text-slate-400 max-w-sm text-sm font-medium leading-relaxed">
                 Inicie o fluxo de auditoria selecionando um cliente para envio de novos certificados.
               </p>
            </div>

            <button 
              onClick={() => navigate('/quality/portfolio')}
              className="bg-white text-[#132659] px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[3px] shadow-xl hover:bg-blue-50 transition-all active:scale-95 flex items-center gap-3"
            >
              Acessar Carteira
            </button>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border-2 border-red-100 p-8 flex flex-col justify-between shadow-sm group hover:border-red-500 transition-all">
          <div className="space-y-4">
             <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                <FileWarning size={28} />
             </div>
             <div>
                <h4 className="font-black text-slate-800 uppercase tracking-tight text-lg">Contestações</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Feedback Crítico</p>
             </div>
             <p className="text-4xl font-black text-red-600 tracking-tighter">{stats?.rejectedByClient || 0}</p>
             <p className="text-xs text-slate-500 font-medium leading-relaxed italic">
               Certificados recusados que exigem retificação ou mediação imediata no fluxo.
             </p>
          </div>
          
          <button 
            onClick={() => navigate('/quality/monitor')}
            className="w-full mt-6 py-4 bg-red-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-700 transition-all shadow-lg"
          >
            Ver Alertas <ArrowRight size={14} />
          </button>
        </div>
      </div>

      <section className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
         <header className="px-8 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-3 text-slate-400">
               <History size={16} />
               <h3 className="text-[10px] font-black uppercase tracking-[3px]">Rastreabilidade do Ledger</h3>
            </div>
            <button onClick={() => navigate('/quality/audit')} className="text-[9px] font-black text-blue-600 uppercase tracking-widest hover:underline">Ver Log Completo</button>
         </header>
         <div className="p-12 text-center text-slate-400 italic text-sm">
            Total de {stats?.totalFiles || 0} ativos processados no cluster Vital Cloud.
         </div>
      </section>
    </div>
  );
};
