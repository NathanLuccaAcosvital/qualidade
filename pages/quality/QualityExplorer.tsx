
import React from 'react';
import { Layout } from '../../components/layout/MainLayout.tsx';
import { FolderTree, Database, ShieldCheck } from 'lucide-react';
import { FileExplorerView } from '../../components/features/quality/views/FileExplorerView.tsx';

const QualityExplorer: React.FC = () => {
  return (
    <Layout title="Cloud Industrial Aços Vital">
      <div className="flex flex-col h-[calc(100vh-120px)] -m-4 md:-m-8 overflow-hidden animate-in fade-in duration-700">
        {/* Sub-Header Integrado (System Style) */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100 shadow-sm">
                    <FolderTree size={20} />
                </div>
                <div>
                    <h1 className="text-base font-black text-slate-800 tracking-tight uppercase">Repositório Global de Ativos</h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Navegação na infraestrutura Vital Cloud v4.0</p>
                </div>
            </div>
            
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100">
                    <ShieldCheck size={14} />
                    <span className="text-[9px] font-black uppercase tracking-wider">Acesso Master Ativo</span>
                </div>
            </div>
        </header>

        {/* Área Principal do Explorador (Preenchimento Total) */}
        <div className="flex-1 min-h-0 relative">
            <FileExplorerView orgId="global" />
        </div>
      </div>
    </Layout>
  );
};

export default QualityExplorer;
