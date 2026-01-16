import React from 'react';
import { useAuth } from '../../context/authContext.tsx';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Lock } from 'lucide-react';
import { PartnerDashboardView } from '../../components/features/partner/views/PartnerDashboardView.tsx';

const ClientDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-1000">
      {/* Hero Privado do Parceiro */}
      <div className="bg-[#081437] rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl border border-white/5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#b23c0e]/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 space-y-6">
          <div className="flex flex-wrap items-center gap-4">
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/20 text-emerald-300">
                <ShieldCheck size={12} className="text-emerald-500" />
                <span className="text-[10px] font-black uppercase tracking-widest">Gateway B2B Ativo</span>
              </span>
              <span className="px-4 py-1 bg-[#b23c0e] rounded-full text-[9px] font-black uppercase tracking-[3px] border border-white/10 shadow-lg shadow-[#b23c0e]/20">{t('roles.CLIENT')}</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight">
            {t('common.welcome')}, <br/>
            <span className="text-white/60">{user?.name.split(' ')[0]}.</span>
          </h1>
          <div className="flex items-center gap-2 text-slate-400">
             <Lock size={14} />
             <p className="text-sm font-medium leading-relaxed">
               Seu portal exclusivo de conformidade industrial.
             </p>
          </div>
        </div>
      </div>

      <PartnerDashboardView />
    </div>
  );
};

export default ClientDashboard;