import React from 'react';
import { useQualityPortfolio } from '../hooks/useQualityPortfolio.ts';
import { 
  ArrowRight, AlertCircle, MessageSquare, ShieldCheck, 
  Clock, Send, CheckCircle2, FileText, Activity
} from 'lucide-react';
import { QualityLoadingState } from '../components/ViewStates.tsx';
import { useNavigate } from 'react-router-dom';
import { QualityStatus, UserRole, normalizeRole, FileNode } from '../../../../types/index.ts';
import { useAuth } from '../../../../context/authContext.tsx';

export const QualityPortfolioView: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { pendingFiles, sentFiles, rejectedFiles, approvedFiles, isLoading } = useQualityPortfolio();
  
  const role = normalizeRole(user?.role);
  const isClient = role === UserRole.CLIENT;

  if (isLoading) return <QualityLoadingState message="Sincronizando Backlog Técnico..." />;

  const isEmpty = pendingFiles.length === 0 && sentFiles.length === 0 && 
                  rejectedFiles.length === 0 && approvedFiles.length === 0;

  if (isEmpty) {
    return (
        <div className="py-24 bg-white border border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center text-center px-10 animate-in fade-in zoom-in-95 duration-700 shadow-sm">
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full animate-pulse" />
                <div className="w-24 h-24 bg-emerald-50 border-2 border-emerald-100 rounded-3xl flex items-center justify-center relative z-10 shadow-inner">
                    <ShieldCheck size={48} className="text-emerald-500" />
                </div>
            </div>
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-[4px]">Tudo em conformidade</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 max-w-xs leading-relaxed">
              Seu fluxo de trabalho está limpo. <br/>Não há certificados pendentes de ação.
            </p>
        </div>
    );
  }

  return (
    <div className="space-y-16 animate-in fade-in duration-700 pb-20">
      
      {/* 1. CONTESTAÇÕES E DIVERGÊNCIAS (CRÍTICO) */}
      {rejectedFiles.length > 0 && (
        <section className="space-y-6">
            <header className="flex items-center justify-between border-b border-red-100 pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-50 text-red-600 rounded-lg flex items-center justify-center shadow-sm">
                        <AlertCircle size={18} />
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-[3px] text-red-600">
                        {isClient ? "Ações de Retificação Requeridas" : `Contestações Ativas (${rejectedFiles.length})`}
                    </h3>
                </div>
                <span className="text-[9px] font-black bg-red-600 text-white px-3 py-1 rounded-full uppercase tracking-widest animate-pulse">Prioridade Máxima</span>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rejectedFiles.map(file => (
                <FileWorkflowCard 
                    key={file.id} 
                    file={file} 
                    variant="critical"
                    onClick={() => navigate(isClient ? `/preview/${file.id}?mode=audit` : `/quality/inspection/${file.id}`)}
                />
            ))}
            </div>
        </section>
      )}

      {/* 2. PENDÊNCIAS DE TRIAGEM (AGUARDANDO ABERTURA) */}
      {pendingFiles.length > 0 && (
        <section className="space-y-6">
            <header className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-8 h-8 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center shadow-sm">
                    <Clock size={18} />
                </div>
                <h3 className="text-xs font-black uppercase tracking-[3px] text-slate-500">
                    {isClient ? "Novos Recebimentos (Ação Vital)" : `Aguardando Triagem Técnica (${pendingFiles.length})`}
                </h3>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {pendingFiles.map(file => (
                <FileWorkflowCard 
                    key={file.id} 
                    file={file} 
                    variant="pending"
                    onClick={() => navigate(isClient ? `/preview/${file.id}?mode=audit` : `/quality/inspection/${file.id}`)}
                />
            ))}
            </div>
        </section>
      )}

      {/* 3. EM CONFERÊNCIA (AGUARDANDO PARCEIRO) */}
      {sentFiles.length > 0 && (
        <section className="space-y-6">
            <header className="flex items-center gap-3 border-b border-blue-100 pb-4">
                <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                    <Send size={18} />
                </div>
                <h3 className="text-xs font-black uppercase tracking-[3px] text-blue-600">
                    {isClient ? `Meus Certificados em Análise (${sentFiles.length})` : "Em Conferência com Parceiro"}
                </h3>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sentFiles.map(file => (
                <FileWorkflowCard 
                    key={file.id} 
                    file={file} 
                    variant="active"
                    onClick={() => navigate(isClient ? `/preview/${file.id}?mode=audit` : `/quality/inspection/${file.id}`)}
                />
            ))}
            </div>
        </section>
      )}

      {/* 4. FINALIZADOS (HISTÓRICO) */}
      {approvedFiles.length > 0 && (
        <section className="space-y-6">
            <header className="flex items-center gap-3 border-b border-emerald-100 pb-4 opacity-70">
                <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center shadow-sm">
                    <CheckCircle2 size={18} />
                </div>
                <h3 className="text-xs font-black uppercase tracking-[3px] text-emerald-700">Ativos Homologados / Concluídos</h3>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {approvedFiles.map(file => (
                <FileWorkflowCard 
                    key={file.id} 
                    file={file} 
                    variant="success"
                    onClick={() => navigate(`/preview/${file.id}`)}
                />
            ))}
            </div>
        </section>
      )}
    </div>
  );
};

interface CardProps {
    file: FileNode;
    variant: 'critical' | 'pending' | 'active' | 'success';
    onClick: () => void;
}

const FileWorkflowCard: React.FC<CardProps> = ({ file, variant, onClick }) => {
    const styles = {
        critical: 'border-red-100 hover:border-red-500 shadow-red-500/5 hover:shadow-red-500/10',
        pending: 'border-slate-200 hover:border-amber-400 shadow-slate-900/5',
        active: 'border-blue-100 hover:border-blue-500 shadow-blue-500/5',
        success: 'border-emerald-100 hover:border-emerald-500 opacity-80 hover:opacity-100'
    };

    const statusIcons = {
        critical: <AlertCircle size={14} className="text-red-500" />,
        pending: <Clock size={14} className="text-amber-500" />,
        active: <Send size={14} className="text-blue-500" />,
        success: <ShieldCheck size={14} className="text-emerald-500" />
    };

    return (
        <div 
            onClick={onClick}
            className={`bg-white p-6 rounded-[2rem] border-2 transition-all group cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[180px] ${styles[variant]}`}
        >
            <div className="relative z-10 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-inner">
                        <FileText size={20} />
                    </div>
                    {statusIcons[variant]}
                </div>
                
                <h4 className="text-[13px] font-black text-slate-800 uppercase leading-tight truncate mb-2">{file.name}</h4>
                
                {file.metadata?.clientObservations && variant === 'critical' && (
                    <p className="text-[10px] text-slate-400 font-medium italic line-clamp-2 leading-relaxed">
                        "{file.metadata.clientObservations}"
                    </p>
                )}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest group-hover:text-slate-900 transition-colors">Ver Detalhes</span>
                <ArrowRight size={14} className="text-slate-300 group-hover:translate-x-1 transition-all" />
            </div>
        </div>
    );
};