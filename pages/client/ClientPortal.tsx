import React, { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ClientLayout } from '../../components/layout/ClientLayout.tsx';
import { ClientDashboardView } from '../../components/features/client/views/ClientDashboardView.tsx';
import { ClientLibraryView } from '../../components/features/client/views/ClientLibraryView.tsx';
import { QualityPortfolioView } from '../../components/features/quality/views/QualityPortfolioView.tsx';
import { useAuth } from '../../context/authContext.tsx';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Lock } from 'lucide-react';

/**
 * ClientPortal Page (Orchestrator)
 * Gerencia a navegação interna e injeta as views corretas para o Parceiro.
 */
const ClientPortal: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { t } = useTranslation();
  const activeView = searchParams.get('view') || 'home';

  const handleViewChange = useCallback((viewId: string) => {
    setSearchParams(prev => {
      prev.set('view', viewId);
      // Limpa parâmetros de navegação profunda ao trocar de contexto principal
      if (viewId !== 'library') prev.delete('folderId');
      return prev;
    }, { replace: true });
  }, [setSearchParams]);

  const getPageTitle = () => {
    switch (activeView) {
      case 'home': return "Terminal do Parceiro";
      case 'library': return "Repositório de Ativos";
      case 'audit_flow': return "Gestão de Conformidade";
      default: return "Portal Vital";
    }
  };

  return (
    <ClientLayout 
      title={getPageTitle()} 
      activeView={activeView} 
      onViewChange={handleViewChange}
    >
      <div className="flex-1 flex flex-col p-4 md:p-6 overflow-hidden">
        {activeView === 'home' && (
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-8 pb-12">
             <section className="bg-[#081437] rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl border border-white/5 animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#b23c0e]/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10 space-y-6">
                    <div className="flex flex-wrap items-center gap-4">
                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/20 text-emerald-300">
                            <ShieldCheck size={12} className="text-emerald-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Gateway B2B Ativo</span>
                        </span>
                        <span className="px-4 py-1 bg-[#b23c0e] rounded-full text-[9px] font-black uppercase tracking-[3px] border border-white/10 shadow-lg shadow-[#b23c0e]/20">{t('roles.CLIENT')}</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight uppercase">
                        {t('common.welcome')}, <br/>
                        <span className="text-white/60">{user?.name.split(' ')[0]}.</span>
                    </h1>
                    <div className="flex items-center gap-2 text-slate-400">
                        <Lock size={14} />
                        <p className="text-sm font-medium leading-relaxed uppercase tracking-widest">Seu terminal exclusivo de certificação industrial.</p>
                    </div>
                </div>
             </section>
             <ClientDashboardView />
          </div>
        )}

        {activeView === 'library' && (
          <div className="flex-1 min-h-0 animate-in fade-in duration-500">
            <ClientLibraryView />
          </div>
        )}

        {activeView === 'audit_flow' && (
          <div className="flex-1 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="px-1">
              <header className="mb-8">
                 <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Monitoramento de Fluxo</h2>
                 <p className="text-slate-400 text-xs font-bold uppercase tracking-[2px] mt-1">Status de conferência física e documental em tempo real</p>
              </header>
              <QualityPortfolioView />
            </div>
          </div>
        )}
      </div>
    </ClientLayout>
  );
};

export default ClientPortal;