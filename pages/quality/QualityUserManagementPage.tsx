import React, { useState } from 'react';
import { Layout } from '../../components/layout/MainLayout.tsx';
import { AdminUsers } from '../../components/features/admin/views/AdminUsers.tsx';
import { UserCheck, Loader2 } from 'lucide-react';
import { UserRole } from '../../types/index.ts';

const QualityUserManagementPage: React.FC = () => {
  const [isSaving, setIsSaving] = useState(false);

  return (
    <Layout title="Gestão de Usuários Parceiros">
      <div className="flex flex-col h-[calc(100vh-140px)] animate-in fade-in duration-700">
        {isSaving && (
          <div className="fixed top-24 right-1/2 translate-x-1/2 z-[110] bg-[#081437] text-white px-6 py-2.5 rounded-full shadow-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest animate-in fade-in duration-300">
            <Loader2 size={14} className="animate-spin text-blue-400" /> Sincronizando Registros...
          </div>
        )}

        <header className="flex items-center gap-4 mb-6 shrink-0">
            <div className="p-3 bg-[#081437] text-blue-400 rounded-2xl shadow-xl">
                <UserCheck size={24} />
            </div>
            <div>
                <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Diretório de Credenciais</h1>
                <p className="text-slate-500 text-sm font-medium">Gerencie o acesso dos representantes técnicos das empresas da sua carteira.</p>
            </div>
        </header>

        <div className="flex-1 min-h-0 flex flex-col">
            <AdminUsers setIsSaving={setIsSaving} restrictedToRole={UserRole.CLIENT} />
        </div>
      </div>
    </Layout>
  );
};

export default QualityUserManagementPage;