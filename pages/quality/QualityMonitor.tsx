
import React from 'react';
import { Layout } from '../../components/layout/MainLayout.tsx';
import { QualityPortfolioView } from '../../components/features/quality/views/QualityPortfolioView.tsx';
import { ClipboardList, ShieldCheck } from 'lucide-react';

const QualityMonitor: React.FC = () => {
  return (
    <Layout title="Monitoria da Carteira">
      <div className="flex flex-col h-full animate-in fade-in duration-500">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 shrink-0">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white text-[#b23c0e] rounded-2xl shadow-sm border border-slate-200">
                  <ClipboardList size={24} />
              </div>
              <div>
                  <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Fluxo de Auditoria</h1>
                  <p className="text-slate-500 text-sm font-medium tracking-tight">Monitoramento em tempo real de contestações e pendências críticas.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl shadow-sm shrink-0">
               <ShieldCheck size={20} className="text-emerald-500" />
               <span className="text-[10px] font-black uppercase tracking-[2px]">Core Vital Ativo</span>
            </div>
        </header>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
            <QualityPortfolioView />
        </div>
      </div>
    </Layout>
  );
};

export default QualityMonitor;
