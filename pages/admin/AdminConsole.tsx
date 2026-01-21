
import React, { Suspense } from 'react';
import { Layout } from '../../components/layout/MainLayout.tsx';
import { useAdminPage } from '../../components/features/admin/hooks/useAdminPage.ts';
import { useTranslation } from 'react-i18next';
import { Loader2, Users, Activity, Settings, Database, Terminal } from 'lucide-react';

const AdminUsers = React.lazy(() => import('../../components/features/admin/views/AdminUsers.tsx').then(m => ({ default: m.AdminUsers })));
const AdminLogs = React.lazy(() => import('../../components/features/admin/views/AdminLogs.tsx').then(m => ({ default: m.AdminLogs })));
const AdminSettings = React.lazy(() => import('../../components/features/admin/views/AdminSettings.tsx').then(m => ({ default: m.AdminSettings })));
const AdminBackup = React.lazy(() => import('../../components/features/admin/views/AdminBackup.tsx').then(m => ({ default: m.AdminBackup })));

const AdminConsole: React.FC = () => {
  const { t } = useTranslation();
  const { activeTab, isSaving, setIsSaving, systemStatus, setSystemStatus, changeTab } = useAdminPage();

  const tabs = [
    { id: 'users', label: t('admin.tabs.users'), icon: Users },
    { id: 'logs', label: t('admin.tabs.logs'), icon: Activity },
    { id: 'backup', label: "Cofre de Backup", icon: Database },
    { id: 'settings', label: t('admin.tabs.settings'), icon: Settings },
  ];

  return (
    <Layout title="Terminal de Gestão Master">
      <div className="flex flex-col gap-6 pb-20 relative h-full">
        
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-white text-slate-900 rounded-2xl shadow-sm border border-slate-200">
                    <Terminal size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Consola do Administrador</h1>
                    <p className="text-slate-500 text-sm font-medium">Orquestração de permissões e segurança de infraestrutura.</p>
                </div>
            </div>
        </header>

        <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={changeTab} />

        {isSaving && (
          <div className="fixed top-24 right-1/2 translate-x-1/2 z-[110] bg-slate-900 text-white px-6 py-2.5 rounded-full shadow-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest animate-in fade-in duration-300">
            <Loader2 size={14} className="animate-spin text-blue-400" /> Sincronizando...
          </div>
        )}

        <main className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Suspense fallback={<TabLoadingIndicator />}>
            {activeTab === 'users' && <AdminUsers setIsSaving={setIsSaving} isSaving={isSaving} />}
            {activeTab === 'logs' && <AdminLogs />}
            {activeTab === 'backup' && <AdminBackup />}
            {activeTab === 'settings' && systemStatus && (
              <AdminSettings 
                systemStatus={systemStatus} 
                setSystemStatus={setSystemStatus} 
                setIsSaving={setIsSaving} 
              />
            )}
          </Suspense>
        </main>
      </div>
    </Layout>
  );
};

const TabNavigation = ({ tabs, activeTab, onTabChange }: any) => (
  <nav className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm inline-flex w-full overflow-x-auto no-scrollbar sticky top-2 z-30 backdrop-blur-md bg-white/90">
    <div className="flex items-center gap-1 min-w-max w-full">
      {tabs.map((tab: any) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[2px] transition-all duration-300 ${isActive ? 'bg-[#081437] text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'}`}
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
  <div className="flex flex-col items-center justify-center h-96 text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
    <Loader2 className="animate-spin mb-4 text-blue-500" size={32} />
    <p className="text-[10px] font-black uppercase tracking-[4px]">Carregando Módulo...</p>
  </div>
);

export default AdminConsole;
