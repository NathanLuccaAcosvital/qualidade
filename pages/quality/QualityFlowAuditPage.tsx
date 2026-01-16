import React from 'react';
import { Layout } from '../../components/layout/MainLayout.tsx';
import { ScanEye, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
// Fix: Changed ' = ' to ' from ' in import statement
import { useTranslation } from 'react-i18next';
import { useQualityFlowAudit } from '../../components/features/quality/hooks/useQualityFlowAudit.ts';
import { PageLoader } from '../../components/common/PageLoader.tsx';
import { useNavigate } from 'react-router-dom';
import { QualityStatus } from '../../types/index.ts';
import { FileStatusBadge } from '../../components/features/files/components/FileStatusBadge.tsx';

const QualityFlowAuditPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pendingFiles, rejectedFiles, isLoading } = useQualityFlowAudit();

  if (isLoading) return <PageLoader message="Sincronizando Fluxo de Auditoria..." />;

  return (
    <Layout title="Fluxo de Auditoria">
      <div className="space-y-8 animate-in fade-in duration-700 pb-20">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-xl">
              <ScanEye size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Fluxo de Auditoria Técnica</h1>
              <p className="text-slate-500 text-sm font-medium tracking-tight italic">Monitore e atue sobre documentos aguardando veredito ou correção.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 shadow-sm shrink-0">
            <ShieldCheck size={20} />
            <span className="text-[10px] font-black uppercase tracking-widest">Estação de Auditoria Ativa</span>
          </div>
        </header>

        {/* SEÇÃO DE REJEIÇÕES (PASSO 3) */}
        <section className="space-y-6">
          <h3 className="text-[10px] font-black uppercase tracking-[3px] text-red-500 flex items-center gap-2">
            <AlertCircle size={14} /> Contestados pelo Cliente ({rejectedFiles.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rejectedFiles.map(file => (
              <div 
                key={file.id} 
                onClick={() => navigate(`/quality/inspection/${file.id}`)}
                className="bg-white p-6 rounded-3xl border-2 border-red-100 hover:border-red-500 transition-all group cursor-pointer relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 text-red-600"><ScanEye size={48} /></div>
                <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                        file.metadata?.status === QualityStatus.TO_DELETE ? 'bg-slate-900 text-white' : 'bg-red-600 text-white'
                    }`}>
                      {file.metadata?.status === QualityStatus.TO_DELETE ? 'Substituir (Apagar)' : 'Ajustar Laudo'}
                    </span>
                    <FileStatusBadge status={file.metadata?.status} />
                </div>
                <h4 className="text-sm font-black text-slate-800 mb-4 truncate">{file.name}</h4>
                <p className="text-[10px] text-slate-500 font-medium line-clamp-2 mb-4 italic">
                  "{file.metadata?.clientObservations || 'Sem observações detalhadas'}"
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Ação Necessária</span>
                  <ArrowRight size={14} className="text-red-500 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
            {rejectedFiles.length === 0 && (
              <div className="col-span-full py-8 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-400 italic">
                <ShieldCheck size={24} className="mb-2 opacity-20" />
                Nenhuma contestação pendente. Fluxo limpo.
              </div>
            )}
          </div>
        </section>

        {/* Backlog de Trabalho (PASSO 1) */}
        <section className="space-y-6">
          <h3 className="text-[10px] font-black uppercase tracking-[3px] text-slate-400">Novas Pendências ({pendingFiles.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingFiles.map(file => (
              <div 
                key={file.id} 
                onClick={() => navigate(`/quality/inspection/${file.id}`)}
                className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-blue-500/20 shadow-sm transition-all group cursor-pointer"
              >
                <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1">Aguardando Auditoria</p>
                <h4 className="text-sm font-black text-slate-800 mb-4">{file.name}</h4>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded-lg font-bold">{file.size}</span>
                  <div className="flex items-center gap-2 text-blue-600 font-bold text-[10px] uppercase tracking-widest">
                    Analisar <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
            {pendingFiles.length === 0 && (
              <div className="col-span-full py-8 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-400 italic">
                <ShieldCheck size={24} className="mb-2 opacity-20" />
                Nenhuma nova pendência para auditoria.
              </div>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default QualityFlowAuditPage;