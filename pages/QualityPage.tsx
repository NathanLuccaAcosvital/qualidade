
import React, { Suspense, useRef, useEffect } from 'react';
import { Layout } from '../components/layout/MainLayout.tsx';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2, BarChart3, History, ShieldCheck } from 'lucide-react';

const QualityOverview = React.lazy(() => import('../components/features/quality/views/QualityOverview.tsx').then(m => ({ default: m.QualityOverview })));
const QualityAuditLog = React.lazy(() => import('../components/features/quality/views/QualityAuditLog.tsx').then(m => ({ default: m.QualityAuditLog })));

const QualityPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeView = searchParams.get('view') || 'overview';
  const mainContentRef = useRef<HTMLElement>(null); // Ref para o elemento main

  // Efeito para rolar para o topo quando a view muda
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = 0;
    }
  }, [activeView]);

  const VIEWS = [
    { id: 'overview', label: t('quality.overview'), icon: BarChart3 },
    { id: 'audit-log', label: t('quality.myAuditLog'), icon: History },
  ];

  const renderView = () => {
    switch (activeView) {
      case 'overview': return <QualityOverview />;
      case 'audit-log': return <QualityAuditLog />;
      default: return <QualityOverview />;
    }
  };

  return (
    <Layout title={t('menu.qualityManagement')}>
      <div className="flex flex-col relative w-full gap-6 pb-20">
        
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <nav className="bg-slate-100 p-1.5 rounded-2xl border border-slate-200 inline-flex shadow-inner">
                {VIEWS.map((view) => (
                    <button
                        key={view.id}
                        onClick={() => setSearchParams({ view: view.id })}
                        className={`
                            flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all
                            ${activeView === view.id 
                                ? 'bg-white text-blue-600 shadow-md translate-y-[-1px]' 
                                : 'text-slate-500 hover:text-slate-800'}
                        `}
                    >
                        <view.icon size={14} />
                        {view.label}
                    </button>
                ))}
            </nav>

            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase bg-white px-4 py-2 rounded-xl border border-slate-200">
                <ShieldCheck size={14} className="text-emerald-500" />
                Monitoramento Industrial Ativo
            </div>
        </header>

        <main ref={mainContentRef} className="min-h-[calc(100vh-250px)] animate-in fade-in slide-in-from-bottom-2 duration-500 overflow-y-auto"> {/* Adicionado ref e overflow-y-auto */}
            <Suspense fallback={<ViewFallback t={t} />}>
                {renderView()}
            </Suspense>
        </main>
      </div>
    </Layout>
  );
};

const ViewFallback = ({ t }: any) => (
  <div className="flex flex-col items-center justify-center h-96 text-slate-400">
    <Loader2 className="animate-spin mb-4 text-blue-500" size={32} />
    <p className="text-[10px] font-black uppercase tracking-[4px]">{t('common.loading')}</p>
  </div>
);

export default QualityPage;