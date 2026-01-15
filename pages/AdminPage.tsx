
import React, { Suspense, useRef, useEffect } from 'react';
import { Layout } from '../components/layout/MainLayout.tsx';
import { useAdminPage } from '../components/features/admin/hooks/useAdminPage.ts';
import { useTranslation } from 'react-i18next';
import { Loader2, Users, Activity, Settings, LayoutDashboard } from 'lucide-react';

const AdminOverview = React.lazy(() => import('../components/features/admin/views/AdminOverview.tsx').then(m => ({ default: m.AdminOverview })));
const AdminUsers = React.lazy(() => import('../components/features/admin/views/AdminUsers.tsx').then(m => ({ default: m.AdminUsers })));
const AdminLogs = React.lazy(() => import('../components/features/admin/views/AdminLogs.tsx').then(m => ({ default: m.AdminLogs })));
const AdminSettings = React.lazy(() => import('../components/features/admin/views/AdminSettings.tsx').then(m => ({ default: m.AdminSettings })));

const AdminPage: React.FC = () => {
  const { t } = useTranslation();
  const { activeTab, isLoading, isSaving, setIsSaving, adminStats, systemStatus, setSystemStatus, changeTab } = useAdminPage();
  const contentRef = useRef<HTMLDivElement>(null); // Ref para o container de conteúdo

  // Efeito para rolar para o topo quando a guia muda
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [activeTab]);

  const tabs = [
    { id: 'overview', label: t('admin.tabs.overview'), icon: LayoutDashboard },
    { id: 'users', label: t('admin.tabs.users'), icon: Users },
    { id: 'logs', label: t('admin.tabs.logs'), icon: Activity },
    { id: 'settings', label: t('admin.tabs.settings'), icon: Settings },
  ];

  return (
    <Layout title={t('menu.management')}>
      <div ref={contentRef} className="flex flex-col gap-6 pb-20 relative overflow-y-auto h-full"> {/* Adicionado ref e overflow-y-auto */}
        <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={changeTab} />

        {isSaving && (
          <div className="fixed top-24 right-1/2 translate-x-1/2 z-[110] bg-slate-900 text-white px-6 py-2.5 rounded-full shadow-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest animate-in fade-in duration-300">
            <Loader2 size={14} className="animate-spin text-blue-400" /> Sincronizando...
          </div>
        )}

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Suspense fallback={<TabLoadingIndicator />}>
            {activeTab === 'overview' && <AdminOverview stats={adminStats} />}
            {activeTab === 'users' && <AdminUsers setIsSaving={setIsSaving} />}
            {activeTab === 'logs' && <AdminLogs />}
            {activeTab === 'settings' && systemStatus && (
              <AdminSettings 
                systemStatus={systemStatus} 
                setSystemStatus={setSystemStatus} 
                setIsSaving={setIsSaving} 
              />
            )}
          </Suspense>
        </div>
      </div>
    </Layout>
  );
};

const TabNavigation = ({ tabs, activeTab, onTabChange }: any) => (
  <nav className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm inline-flex w-full overflow-x-auto no-scrollbar sticky top-20 z-30 backdrop-blur-md bg-white/90">
    <div className="flex items-center gap-1 min-w-max w-full">
      {tabs.map((tab: any) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${isActive ? 'bg-[#0f172a] text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}
          >
            <Icon size={16} className={isActive ? 'text-blue-400' : 'text-slate-400'} />
            {tab.label}
          </button>
        );
      })}
    </div>
  </nav>
);

const TabLoadingIndicator = () => (
  <div className="flex flex-col items-center justify-center h-96 text-slate-400">
    <Loader2 className="animate-spin mb-4 text-blue-500" size={32} />
    <p className="text-[10px] font-black uppercase tracking-[4px]">Carregando Módulo...</p>
  </div>
);

export default AdminPage;