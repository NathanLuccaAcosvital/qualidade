
import React, { Suspense, useState } from 'react';
import { Layout } from '../components/layout/MainLayout.tsx';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { UserRole } from '../types/index.ts';

const QualityOverview = React.lazy(() => import('../components/features/quality/views/QualityOverview.tsx').then(m => ({ default: m.QualityOverview })));
const QualityAuditLog = React.lazy(() => import('../components/features/quality/views/QualityAuditLog.tsx').then(m => ({ default: m.QualityAuditLog })));
const ClientList = React.lazy(() => import('../components/features/quality/views/ClientList.tsx').then(m => ({ default: m.ClientList })));
const AdminUsers = React.lazy(() => import('../components/features/admin/views/AdminUsers.tsx').then(m => ({ default: m.AdminUsers })));

const QualityPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const activeView = searchParams.get('view') || 'overview';
  const [isSaving, setIsSaving] = useState(false);

  const renderView = () => {
    switch (activeView) {
      case 'overview': return <QualityOverview />;
      case 'clients': return <ClientList onSelectClient={(client) => console.log('Selected client:', client)} />;
      case 'client-users': return <AdminUsers setIsSaving={setIsSaving} restrictedToRole={UserRole.CLIENT} />; 
      case 'audit-log': return <QualityAuditLog />;
      default: return <QualityOverview />;
    }
  };

  return (
    <Layout title={t('menu.qualityManagement')}>
      <div className="flex flex-col relative w-full gap-4 pb-20">
        {isSaving && (
          <div className="fixed top-24 right-1/2 translate-x-1/2 z-[110] bg-slate-900 text-white px-6 py-2.5 rounded-full shadow-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest animate-in fade-in duration-300">
            <Loader2 size={14} className="animate-spin text-blue-400" /> Sincronizando Carteira...
          </div>
        )}

        <main className="min-h-[calc(100vh-200px)] animate-in fade-in slide-in-from-bottom-2 duration-500">
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
