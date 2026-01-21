
import React, { useState } from 'react';
import { Layout } from '../../components/layout/MainLayout.tsx';
import { AdminUsers } from '../../components/features/admin/views/AdminUsers.tsx';
import { UserCheck, Loader2, Info, ShieldCheck, UserPlus } from 'lucide-react';
import { UserRole } from '../../types/index.ts';

const QualityUserManagement: React.FC = () => {
  const [isSaving, setIsSaving] = useState(false);

  return (
    <Layout title="Gestão de Parceiros">
      <div className="flex flex-col h-[calc(100vh-120px)] -m-4 md:-m-8 overflow-hidden animate-in fade-in duration-700">
        {isSaving && (
          <div className="fixed top-24 right-1/2 translate-x-1/2 z-[110] bg-[#081437] text-white px-6 py-2.5 rounded-full shadow-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest animate-in fade-in duration-300">
            <Loader2 size={14} className="animate-spin text-blue-400" /> Sincronizando...
          </div>
        )}

        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100 shadow-sm">
                    <UserCheck size={20} />
                </div>
                <div>
                    <h1 className="text-base font-black text-slate-800 tracking-tight uppercase">Credenciais de Acesso Técnico</h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Controle de identidades do ecossistema Vital</p>
                </div>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100">
                <ShieldCheck size={14} />
                <span className="text-[9px] font-black uppercase tracking-wider">Apenas Perfis Parceiros</span>
            </div>
        </header>

        <div className="flex-1 min-h-0 bg-slate-50 p-6 overflow-y-auto custom-scrollbar">
            <AdminUsers setIsSaving={setIsSaving} restrictedToRole={UserRole.CLIENT} />
        </div>
      </div>
    </Layout>
  );
};

export default QualityUserManagement;
