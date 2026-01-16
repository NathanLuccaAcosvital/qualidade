
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { fileService, adminService } from '../../../../lib/services/index.ts';
import { supabase } from '../../../../lib/supabaseClient.ts';
import { useAuth } from '../../../../context/authContext.tsx';
import { useToast } from '../../../../context/notificationContext.tsx';
import { QualityLoadingState, ErrorState } from '../components/ViewStates.tsx';
import { QualityOverviewCards } from '../components/QualityOverviewCards.tsx';
import { ShieldCheck, Info, ArrowRight, AlertTriangle, Trash2 } from 'lucide-react';
import { QualityStatus } from '../../../../types/enums.ts';

export const QualityOverview: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [, setSearchParams] = useSearchParams();

  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBaseData = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const [globalStats, activeClientsRes, rejectedRes, toDeleteRes] = await Promise.all([
          fileService.getDashboardStats(user),
          adminService.getClients({ status: 'ACTIVE' }, 1, 1),
          supabase.from('files').select('*', { count: 'exact', head: true }).eq('metadata->>status', QualityStatus.REJECTED),
          supabase.from('files').select('*', { count: 'exact', head: true }).eq('metadata->>status', QualityStatus.TO_DELETE)
        ]);
        
        setStats({
          pendingDocs: globalStats.pendingValue || 0,
          totalActiveClients: activeClientsRes.total || 0,
          rejectedByClient: rejectedRes.count || 0,
          trashCount: toDeleteRes.count || 0
        });
      } catch (err) {
        setError(t('quality.errorLoadingQualityData'));
        showToast(t('quality.errorLoadingQualityData'), 'error');
      } finally {
        setIsLoading(false);
      }
    };
    loadBaseData();
  }, [user, showToast, t]);

  if (isLoading) return <QualityLoadingState message="Sincronizando Indicadores..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <QualityOverviewCards
        totalClients={stats?.totalActiveClients || 0}
        totalPendingDocs={stats?.pendingDocs || 0}
        onChangeView={(v) => setSearchParams({ view: v })}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Alerta de Rejeição de Fluxo */}
        <div className="lg:col-span-2 bg-[#081437] rounded-[2rem] p-10 text-white relative overflow-hidden shadow-xl border border-white/5">
          <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
               <span className="px-3 py-1 bg-[#b23c0e] rounded-lg text-[9px] font-bold uppercase tracking-[0.2em] shadow-lg">Ação do Analista</span>
               <div className="h-1 w-1 rounded-full bg-orange-400"></div>
               <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Feedback Pendente</span>
            </div>
            <h2 className="text-4xl font-bold tracking-tight leading-tight max-w-xl">
              Contestações:<br/>
              <span className="text-[#b23c0e]">{stats?.rejectedByClient || 0} Certificados</span> aguardam correção imediata.
            </h2>
            <p className="text-slate-400 max-w-sm text-sm font-medium leading-relaxed">
              O cliente identificou divergências nos laudos. Substitua os arquivos e aguarde a nova validação.
            </p>
            <button 
              onClick={() => setSearchParams({ view: 'portfolio' })}
              className="mt-4 flex items-center gap-3 bg-[#b23c0e] hover:bg-[#8a2f0b] text-white px-8 py-3.5 rounded-xl text-[10px] font-bold uppercase tracking-widest active:scale-95 group transition-all"
            >
              Acessar Carteira <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Módulo de Lixo Digital (Passo 4) */}
        <div className="bg-white rounded-[2rem] border border-slate-200 p-8 flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="space-y-6 relative z-10">
            <header className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center">
                <Trash2 size={24} />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-tight">Resíduos Digitais</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Aguardando Exclusão</p>
              </div>
            </header>
            
            <div className="py-4">
                <p className="text-5xl font-black text-slate-800 tracking-tighter">{stats?.trashCount || 0}</p>
                <p className="text-[11px] text-slate-500 font-medium mt-2 leading-relaxed">
                    Documentos marcados como <b>"APAGAR"</b> pelo cliente após substituição.
                </p>
            </div>

            <button 
                onClick={() => setSearchParams({ view: 'explorer' })}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-3"
            >
                <Trash2 size={16} className="text-red-500" /> Limpar Cloud
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
