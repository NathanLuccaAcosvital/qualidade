import React, { Suspense, useState } from 'react';
// Fix: Corrected relative path for Layout import
import { Layout } from '../../components/layout/MainLayout.tsx';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
// Fix: Corrected relative path for UserRole import
import { UserRole } from '../../types/index.ts';

// Fix: Corrected relative paths for lazy imports and added type casting to resolve prop inference issues with React.lazy
const QualityOverview = React.lazy(() => import('../../components/features/quality/views/QualityOverview.tsx').then(m => ({ default: m.QualityOverview }))) as any;
const QualityAuditLog = React.lazy(() => import('../../components/features/quality/views/QualityAuditLog.tsx').then(m => ({ default: m.QualityAuditLog }))) as any;
const ClientList = React.lazy(() => import('../../components/features/quality/views/ClientList.tsx').then(m => ({ default: m.ClientList }))) as any;
const AdminUsers = React.lazy(() => import('../../components/features/admin/views/AdminUsers.tsx').then(m => ({ default: m.AdminUsers }))) as any;
const QualityFeedbackMonitor = React.lazy(() => import('../../components/features/quality/views/QualityFeedbackMonitor.tsx').then(m => ({ default: m.QualityFeedbackMonitor }))) as any;

const QualityPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeView = searchParams.get('view') || 'overview';
  const [isSaving, setIsSaving] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Visão Geral' },
    { id: 'clients', label: 'Portfolio' },
    { id: 'feedback', label: 'Contestações' },
    { id: 'client-users', label: 'Credenciais' },
    { id: 'audit-log', label: 'Logs' },
  ];

  const renderView = () => {
    switch (activeView) {
      case 'overview': return <QualityOverview />;
      case 'clients': return <ClientList onSelectClient={(client: any) => setSearchParams({ view: 'portfolio', orgId: client.id })} />;
      case 'feedback': return <QualityFeedbackMonitor />;
      case 'client-users': return <AdminUsers setIsSaving={setIsSaving} restrictedToRole={UserRole.CLIENT} />; 
      case 'audit-log': return <QualityAuditLog />;
      default: return <QualityOverview />;
    }
  };

  return (
    <Layout title={t('menu.qualityManagement')}>
      <div className="flex flex-col relative w-full gap-6 pb-20">
        
        <nav className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm inline-flex w-full overflow-x-auto no-scrollbar backdrop-blur-md bg-white/90">
          <div className="flex items-center gap-1 min-w-max w-full">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSearchParams({ view: tab.id })}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeView === tab.id ? 'bg-[#081437] text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        {isSaving && (
          <div className="fixed top-24 right-1/2 translate-x-1/2 z-[110] bg-slate-900 text-white px-6 py-2.5 rounded-full shadow-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest animate-in fade-in duration-300">
            <Loader2 size={14} className="animate-spin text-blue-400" /> Sincronizando Carteira...
          </div>
        )}

        <main className="min-h-[calc(100vh-250px)] animate-in fade-in slide-in-from-bottom-2 duration-500">
            <Suspense fallback={<ViewFallback />}>
                {renderView()}
            </Suspense>
        </main>
      </div>
    </Layout>
  );
};

const ViewFallback = () => (
  <div className="flex flex-col items-center justify-center h-96 bg-white rounded-[2rem] border border-dashed border-slate-200">
    <Loader2 className="animate-spin mb-4 text-blue-500" size={32} />
    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 animate-pulse">Sincronizando Módulo...</p>
  </div>
);

export default QualityPage;
