
import React from 'react';
import { Layout } from '../../components/layout/MainLayout.tsx';
import { QualityAuditLog } from '../../components/features/quality/views/QualityAuditLog.tsx';
import { History } from 'lucide-react';

const QualityAuditPage: React.FC = () => {
  return (
    <Layout title="Log de Vereditos">
      <div className="space-y-6 animate-in fade-in duration-500">
        <header className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-slate-800 text-white rounded-2xl shadow-xl">
                <History size={24} />
            </div>
            <div>
                <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Histórico de Inspeção</h1>
                <p className="text-slate-500 text-sm font-medium">Rastreabilidade forense de todas as aprovações e recusas emitidas.</p>
            </div>
        </header>
        <QualityAuditLog />
      </div>
    </Layout>
  );
};

export default QualityAuditPage;
