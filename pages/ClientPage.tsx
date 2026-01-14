
import React, { Suspense } from 'react';
import { Layout } from '../components/layout/MainLayout.tsx';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Loader2, 
  LayoutDashboard, 
  Library, 
  Star, 
  ShieldCheck,
  Search,
  FileText
} from 'lucide-react';

// Lazy loading dos componentes de visão do cliente
const ClientDashboard = React.lazy(() => import('./dashboards/ClientDashboard.tsx'));
const FileExplorer = React.lazy(() => import('../components/features/files/FileExplorer.tsx').then(m => ({ default: m.FileExplorer })));

const ClientPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeView = searchParams.get('view') || 'home';

  const VIEWS = [
    { id: 'home', label: t('menu.dashboard'), icon: LayoutDashboard },
    { id: 'files', label: t('menu.library'), icon: Library },
    { id: 'favorites', label: t('menu.favorites'), icon: Star },
  ];

  const renderView = () => {
    switch (activeView) {
      case 'home':
        return <ClientDashboard />;
      case 'files':
        return (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
             <FileExplorer />
          </div>
        );
      case 'favorites':
        return (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
             <header className="p-8 border-b border-slate-100">
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
                    <Star className="text-amber-400" size={24} />
                    {t('menu.favorites')}
                </h3>
                <p className="text-slate-400 text-sm font-medium mt-1">Seus certificados marcados para acesso rápido.</p>
             </header>
             <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-300 italic">
                <FileText size={48} className="opacity-10 mb-4" />
                <p className="font-medium text-sm">Funcionalidade de favoritos em sincronização...</p>
             </div>
          </div>
        );
      default:
        return <ClientDashboard />;
    }
  };

  return (
    <Layout title={t('menu.portalName')}>
      <div className="flex flex-col relative w-full gap-6 pb-20">
        
        {/* Navegação Superior por Abas - Estilo Industrial Premium */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-20 z-40">
            <nav className="bg-white/80 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200 inline-flex shadow-sm">
                {VIEWS.map((view) => {
                    const isActive = activeView === view.id;
                    return (
                        <button
                            key={view.id}
                            onClick={() => setSearchParams({ view: view.id })}
                            className={`
                                flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-300
                                ${isActive 
                                    ? 'bg-[#081437] text-white shadow-lg shadow-slate-900/20 translate-y-[-1px]' 
                                    : 'text-slate-500 hover:text-[#081437] hover:bg-slate-50'}
                            `}
                        >
                            <view.icon size={14} className={isActive ? 'text-blue-400' : 'text-slate-400'} />
                            {view.label}
                        </button>
                    );
                })}
            </nav>

            <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase bg-white/80 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="relative">
                    <ShieldCheck size={16} className="text-emerald-500" />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-ping opacity-75"></span>
                </div>
                Portal de Dados Seguro
            </div>
        </header>

        {/* Container Principal de Conteúdo */}
        <main className="min-h-[calc(100vh-280px)] animate-in fade-in slide-in-from-bottom-3 duration-700">
            <Suspense fallback={<ClientViewLoader />}>
                {renderView()}
            </Suspense>
        </main>
      </div>
    </Layout>
  );
};

const ClientViewLoader = () => (
  <div className="flex flex-col items-center justify-center h-96 bg-white rounded-[3rem] border border-dashed border-slate-200">
    <div className="relative mb-6">
      <Loader2 size={56} className="animate-spin text-blue-500" />
      <ShieldCheck size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#081437]" />
    </div>
    <p className="font-black text-[10px] uppercase tracking-[6px] text-slate-400 animate-pulse">Autenticando Camadas...</p>
  </div>
);

export default ClientPage;
