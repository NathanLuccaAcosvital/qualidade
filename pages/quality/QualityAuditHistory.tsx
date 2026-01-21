
import React from 'react';
import { Layout } from '../../components/layout/MainLayout.tsx';
import { QualityAuditLog } from '../../components/features/quality/views/QualityAuditLog.tsx';
import { History, ShieldCheck, Database } from 'lucide-react';

const QualityAuditHistory: React.FC = () => {
  return (
    <Layout title="Logs de Auditoria B2B">
      <div className="flex flex-col h-[calc(100vh-120px)] -m-4 md:-m-8 overflow-hidden animate-in fade-in duration-700">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-50 text-slate-700 rounded-xl flex items-center justify-center border border-slate-200 shadow-sm">
                    <History size={20} />
                </div>
                <div>
                    <h1 className="text-base font-black text-slate-800 tracking-tight uppercase">Histórico Técnico do Ledger</h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rastreabilidade forense de vereditos e laudos</p>
                </div>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
                <Database size={14} />
                <span className="text-[9px] font-black uppercase tracking-wider">Protocolo SGQ Inviolável</span>
            </div>
        </header>

        <div className="flex-1 min-h-0 bg-slate-50 p-6 overflow-y-auto custom-scrollbar">
            <QualityAuditLog />
        </div>
      </div>
    </Layout>
  );
};

export default QualityAuditHistory;
