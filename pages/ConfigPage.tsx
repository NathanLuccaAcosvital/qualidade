
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout } from '../components/layout/MainLayout.tsx';
import { ChangePasswordModal } from '../components/features/auth/ChangePasswordModal.tsx'; // Importado
import { PrivacyModal } from '../components/common/PrivacyModal.tsx'; // Importado
import { Lock, ShieldCheck, Settings as SettingsIcon } from 'lucide-react';

const ConfigPage: React.FC = () => {
  const { t } = useTranslation();
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  return (
    <Layout title={t('menu.settings')}>
      <ChangePasswordModal 
        isOpen={isChangePasswordModalOpen} 
        onClose={() => setIsChangePasswordModalOpen(false)} 
      />
      <PrivacyModal 
        isOpen={isPrivacyModalOpen} 
        onClose={() => setIsPrivacyModalOpen(false)} 
      />

      <div className="space-y-8 pb-12 animate-in fade-in duration-700">
        <header className="space-y-2">
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter flex items-center gap-3">
            <SettingsIcon size={28} className="text-blue-500" /> {t('menu.settings')}
          </h1>
          <p className="text-slate-500 text-sm font-medium">Gerencie suas preferências e segurança do portal.</p>
        </header>

        <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6 animate-in slide-in-from-bottom-2 duration-500">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Ajustes de Segurança</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button 
              onClick={() => setIsChangePasswordModalOpen(true)}
              className="group bg-slate-50 p-6 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-all text-left flex items-center gap-4 shadow-sm"
            >
              <div className="p-3 bg-white border border-slate-100 rounded-xl text-blue-600 group-hover:shadow-md transition-shadow">
                <Lock size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 group-hover:text-blue-700">Alterar Senha</p>
                <p className="text-xs text-slate-500 mt-1">Mantenha sua conta segura.</p>
              </div>
            </button>

            <button 
              onClick={() => setIsPrivacyModalOpen(true)}
              className="group bg-slate-50 p-6 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50 transition-all text-left flex items-center gap-4 shadow-sm"
            >
              <div className="p-3 bg-white border border-slate-100 rounded-xl text-emerald-600 group-hover:shadow-md transition-shadow">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 group-hover:text-emerald-700">Política de Privacidade</p>
                <p className="text-xs text-slate-500 mt-1">Conheça o uso dos seus dados.</p>
              </div>
            </button>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default ConfigPage;