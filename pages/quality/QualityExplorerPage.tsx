import React from 'react';
import { Layout } from '../../components/layout/MainLayout.tsx';
import { FolderTree, Info } from 'lucide-react';
import { FileExplorerView } from '../../components/features/quality/views/FileExplorerView.tsx';

const QualityExplorerPage: React.FC = () => {
  return (
    <Layout title="Explorador de Arquivos Vital">
      <div className="space-y-6 animate-in fade-in duration-700 h-[calc(100vh-180px)] flex flex-col">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 mb-4">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-xl">
                    <FolderTree size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Cloud Industrial</h1>
                    <p className="text-slate-500 text-sm font-medium">Navegue por toda a estrutura de certificados e documentação técnica.</p>
                </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl border border-blue-100">
                <Info size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Acesso de Auditoria Ativo</span>
            </div>
        </header>

        <div className="flex-1 min-h-0">
            <FileExplorerView orgId="global" />
        </div>
      </div>
    </Layout>
  );
};

export default QualityExplorerPage;