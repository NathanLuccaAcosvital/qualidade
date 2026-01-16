
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout } from '../components/layout/MainLayout.tsx';
import { ChangePasswordModal } from '../components/features/auth/ChangePasswordModal.tsx';
import { PrivacyModal } from '../components/common/PrivacyModal.tsx';
import { Lock, ShieldCheck, Settings as SettingsIcon, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/authContext.tsx';
import { ClientLayout } from '../components/layout/ClientLayout.tsx';
import { UserRole, normalizeRole } from '../types/index.ts';

const ConfigPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const userRole = normalizeRole(user?.role);
  const isClient = userRole === UserRole.CLIENT;

  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  const LayoutComponent = isClient ? ClientLayout : Layout;

  const clientLayoutProps = isClient ? {
    activeView: "settings",
    onViewChange: () => {},
  } : {};

  return (
    <LayoutComponent title={t('menu.settings')} {...clientLayoutProps}>
      <ChangePasswordModal 
        isOpen={isChangePasswordModalOpen} 
        onClose={() => setIsChangePasswordModalOpen(false)} 
      />
      <PrivacyModal 
        isOpen={isPrivacyModalOpen} 
        onClose={() => setIsPrivacyModalOpen(false)} 
      />

      <div className="space-y-12 pb-20 animate-in fade-in duration-1000 max-w-4xl mx-auto font-sans">
        <header className="space-y-4">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-white text-[var(--color-detail-blue)] rounded-3xl flex items-center justify-center shadow-xl border border-slate-100 group">
              <SettingsIcon size={28} className="group-hover:rotate-90 transition-transform duration-700" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                {t('menu.settings')}
              </h1>
              <p className="text-slate-600 text-sm font-medium mt-1">
                Gerencie suas diretrizes de acesso e verifique os protocolos de segurança do seu terminal técnico.
              </p>
            </div>
          </div>
        </header>

        <section className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="h-[2px] w-8 bg-[#b23c0e] rounded-full" />
            <h2 className="text-xs font-bold text-slate-600 uppercase tracking-[4px]">Segurança e Governança</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <SettingsCard 
              icon={Lock}
              title={t('changePassword.title')}
              desc="Atualize seu segredo de autenticação periodicamente para manter a integridade da conta."
              actionLabel={t('changePassword.submit')}
              onClick={() => setIsChangePasswordModalOpen(true)}
              color="text-blue-600"
            />

            <SettingsCard 
              icon={ShieldCheck}
              title={t('privacy.title')}
              desc="Consulte como seus dados técnicos e registros de auditoria são processados no portal."
              actionLabel={t('privacy.viewPolicy')}
              onClick={() => setIsPrivacyModalOpen(true)}
              color="text-emerald-600"
            />
          </div>
        </section>

        {/* Informações da Conta Soft - Card Refinado com Alto Contraste */}
        <div className="bg-white border border-slate-200 p-10 rounded-[3rem] shadow-sm flex flex-col md:flex-row items-center justify-between gap-10 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-8">
                <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-[#b23c0e] to-[#8a2f0b] flex items-center justify-center text-white text-2xl font-bold shadow-2xl shadow-[#b23c0e]/20">
                  {user?.name?.charAt(0)}
                </div>
                <div className="space-y-1">
                   <h3 className="text-xl font-bold text-slate-900 leading-none">{user?.name}</h3>
                   <p className="text-sm font-semibold text-slate-700 uppercase tracking-wider opacity-90">{user?.email}</p>
                </div>
            </div>
            <div className="px-6 py-2.5 bg-slate-50 rounded-2xl border border-slate-200 text-[11px] font-bold uppercase tracking-widest text-slate-700 shadow-inner">
               Identificador: <span className="font-mono text-[#b23c0e]">{user?.id?.split('-')[0].toUpperCase()}</span>
            </div>
        </div>
      </div>
    </LayoutComponent>
  );
};

const SettingsCard = ({ icon: Icon, title, desc, actionLabel, onClick, color }: any) => (
  <button 
    onClick={onClick}
    className="group bg-white p-8 rounded-[2.5rem] border border-slate-200 hover:border-[#b23c0e]/40 hover:shadow-2xl transition-all text-left flex flex-col justify-between h-full relative overflow-hidden"
  >
    <div className="space-y-5">
      <div className={`w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform shadow-inner`}>
        <Icon size={26} />
      </div>
      <div>
        <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#b23c0e] transition-colors">{title}</h3>
        <p className="text-sm text-slate-600 font-medium mt-2 leading-relaxed">{desc}</p>
      </div>
    </div>
    
    <div className="mt-10 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[2px] text-slate-700 group-hover:text-[#b23c0e] transition-colors pt-6 border-t border-slate-100 w-full">
      {actionLabel} <ChevronRight size={16} className="group-hover:translate-x-2 transition-transform" />
    </div>
  </button>
);

export default ConfigPage;
