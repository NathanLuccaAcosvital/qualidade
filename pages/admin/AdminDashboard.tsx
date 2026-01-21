import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/MainLayout.tsx';
import { useAuth } from '../../context/authContext.tsx';
import { useAdminPage } from '../../components/features/admin/hooks/useAdminPage.ts';
import { useTranslation } from 'react-i18next';
import { Loader2, Users, ShieldCheck, Activity, ArrowRight, ShieldAlert } from 'lucide-react';
import { AdminOverview } from '../../components/features/admin/views/AdminOverview.tsx';
import { normalizeRole, UserRole } from '../../types/index.ts';

/**
 * AdminDashboard Page
 * Responsável pela visualização de alto nível da infraestrutura e governança.
 */
const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { adminStats, isLoading, systemStatus } = useAdminPage();

  useEffect(() => {
    const role = normalizeRole(user?.role);
    if (user && role !== UserRole.ADMIN) {
      navigate('/quality/dashboard', { replace: true });
    }
  }, [user, navigate]);

  if (isLoading) return (
    <Layout title="Governança Master">
        <div className="flex h-96 flex-col items-center justify-center text-slate-400 gap-6">
            <Loader2 className="animate-spin text-blue-600" size={48} />
            <p className="text-[10px] font-black uppercase tracking-[6px] animate-pulse">Sincronizando Consola de Comando...</p>
        </div>
    </Layout>
  );

  return (
    <Layout title="Dashboard de Governança">
      <div className="space-y-8 pb-12 animate-in fade-in duration-700">
        <section className="bg-[#132659] rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl border border-white/5">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-blue-600 rounded-lg text-[9px] font-black uppercase tracking-[3px] shadow-lg shadow-blue-500/20">Root Engine</span>
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[4px]">{t('dashboard.status.monitoringActive')}</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none uppercase">
                        Governança,<br/>
                        <span className="text-white/40">{user?.name.split(' ')[0]}.</span>
                    </h1>
                </div>
                <div className="bg-white/5 backdrop-blur-2xl p-6 rounded-[2rem] border border-white/10 flex items-center gap-4">
                    <div className={`w-3.5 h-3.5 rounded-full ${systemStatus?.mode === 'ONLINE' ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-orange-500 animate-pulse shadow-orange-500/50'} shadow-lg`}></div>
                    <div>
                        <p className="text-[9px] font-black uppercase text-slate-500 tracking-[2px]">Gateway</p>
                        <p className="text-sm font-black text-white mt-1 uppercase tracking-widest">{systemStatus?.mode || 'SYNCING...'}</p>
                    </div>
                </div>
            </div>
        </section>

        <div className="space-y-4">
             <div className="flex items-center gap-4 ml-1">
                <div className="h-[2px] w-8 bg-blue-600 rounded-full"></div>
                <h3 className="text-[10px] font-black uppercase tracking-[5px] text-slate-400">Indicadores Críticos</h3>
            </div>
            <AdminOverview stats={adminStats} />
        </div>

        <section className="space-y-6">
            <div className="flex items-center gap-4 ml-1">
                <div className="h-[2px] w-8 bg-orange-600 rounded-full"></div>
                <h3 className="text-[10px] font-black uppercase tracking-[5px] text-slate-400">Atalhos Operacionais</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <QuickAction icon={Users} label="Gestão de Identidades" desc="Controle níveis de acesso de parceiros e analistas." path="/admin/console?tab=users" color="bg-blue-600" navigate={navigate} />
                <QuickAction icon={Activity} label="Auditoria Forense" desc="Rastreabilidade completa de todas as ações no sistema." path="/admin/console?tab=logs" color="bg-slate-900" navigate={navigate} />
                <QuickAction icon={ShieldCheck} label="Gateway de Segurança" desc="Controle de manutenção e firewall do portal." path="/admin/console?tab=settings" color="bg-emerald-600" navigate={navigate} />
            </div>
        </section>
      </div>
    </Layout>
  );
};

const QuickAction = ({ icon: Icon, label, desc, path, color, navigate }: any) => (
  <button onClick={() => navigate(path)} className="flex items-start gap-4 p-6 bg-white border border-slate-200 rounded-[2rem] hover:border-blue-600 hover:shadow-2xl transition-all text-left group">
    <div className={`p-4 rounded-2xl ${color} text-white shrink-0 group-hover:scale-110 transition-transform shadow-lg`}><Icon size={22} /></div>
    <div className="flex-1 min-w-0">
      <h4 className="font-black text-[#132659] text-sm uppercase tracking-wider">{label}</h4>
      <p className="text-[10px] text-slate-500 mt-1 leading-relaxed font-bold uppercase tracking-tight opacity-70">{desc}</p>
    </div>
    <ArrowRight size={18} className="text-slate-200 group-hover:text-blue-600 group-hover:translate-x-1 transition-all mt-1" />
  </button>
);

export default AdminDashboard;