
import React, { useState, useMemo } from 'react';
import { Layout } from '../../../layout/MainLayout.tsx';
import { AuditWorkflow } from '../components/AuditWorkflow.tsx';
import { NewVersionUploadView, VersionHistoryView } from '../components/VersionViews.tsx';
import { ProcessingOverlay, QualityLoadingState } from '../components/ViewStates.tsx';
import { useFileInspection } from '../hooks/useFileInspection.ts';
import { 
  AlertCircle, Database, FileText, 
  Terminal, ClipboardList, Users, Clock, 
  Activity, GitBranch, History, ExternalLink,
  CalendarCheck, ArrowUpRight, UserCheck
} from 'lucide-react';
import { QualityStatus, UserRole, normalizeRole } from '../../../../types/index.ts';

type TabType = 'workflow' | 'new_version' | 'history';

export const FileInspection: React.FC = () => {
  const {
    inspectorFile, loadingFile, isProcessing,
    mainPreviewUrl, handleInspectAction, handleBackToClientFiles,
    // Fix: removed handleUploadEvidence which was not returned by useFileInspection
    handleUploadStepEvidence, handleCreateNewVersion, user, handleDownload
  } = useFileInspection();

  const [activeTab, setActiveTab] = useState<TabType>('workflow');

  const role = normalizeRole(user?.role);
  const isQuality = role === UserRole.QUALITY || role === UserRole.ADMIN;

  const auditMetrics = useMemo(() => {
    if (!inspectorFile?.metadata) return null;
    const sigs = inspectorFile.metadata.signatures || {};
    
    const clientSignature = 
      sigs.step2_documental || 
      sigs.step5_partner_verdict || 
      sigs.step6_consolidation_client;

    const allSigs = Object.values(sigs).filter(Boolean).sort((a: any, b: any) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return {
      startTime: sigs.step1_release?.timestamp,
      endTime: allSigs.length > 1 ? (allSigs[0] as any).timestamp : null,
      clientUser: clientSignature?.userName || 'Aguardando Acesso',
      vitalUser: sigs.step1_release?.userName || 'Pendente'
    };
  }, [inspectorFile]);

  if (loadingFile) {
    return <QualityLoadingState message="Sincronizando protocolos técnicos..." />;
  }

  if (!inspectorFile) {
    return (
      <Layout title="Erro de Carga">
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-6 h-full bg-slate-50" role="alert">
          <AlertCircle size={64} className="opacity-20 text-red-500" />
          <div className="text-center">
            <p className="font-black uppercase tracking-[4px] text-xs">Ativo não localizado</p>
            <p className="text-sm font-medium mt-2">O registro solicitado não foi identificado no Ledger industrial.</p>
          </div>
          <button onClick={handleBackToClientFiles} className="px-8 py-3 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 shadow-xl active:scale-95 transition-all">Voltar ao Portfólio</button>
        </div>
      </Layout>
    );
  }

  const theme = {
    headerBg: isQuality ? 'bg-[#132659]' : 'bg-slate-100',
    headerText: isQuality ? 'text-white' : 'text-slate-900',
    headerBorder: isQuality ? 'border-white/10' : 'border-slate-200',
    asideBg: isQuality ? 'bg-slate-50/50' : 'bg-white',
    accentColor: isQuality ? 'text-blue-400' : 'text-emerald-600',
    accentBg: isQuality ? 'bg-blue-500/10' : 'bg-emerald-500/10'
  };

  const calculateProgress = () => {
    const meta = inspectorFile.metadata;
    if (!meta) return 0;
    const sigs = meta.signatures || {};
    let completedSteps = 0;
    if (sigs.step1_release) completedSteps++;
    if (sigs.step2_documental) completedSteps++;
    if (sigs.step3_physical) completedSteps++;
    const isArbitrationNeeded = meta.documentalStatus === 'REJECTED' || meta.physicalStatus === 'REJECTED';
    const isStep4AutoCompleted = sigs.step2_documental && sigs.step3_physical && !isArbitrationNeeded;
    if (sigs.step4_arbitrage || isStep4AutoCompleted) completedSteps++;
    if (sigs.step5_partner_verdict) completedSteps++;
    if (sigs.step6_consolidation_client && sigs.step6_consolidation_quality) {
        completedSteps++;
        completedSteps++;
    }
    return Math.round((completedSteps / 7) * 100);
  };

  const formatDateTime = (iso: string | undefined | null) => {
    if (!iso) return 'Pendente';
    return new Date(iso).toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <Layout title={isQuality ? "Painel de Auditoria" : "Central de Conformidade"}>
      <div className={`flex-1 flex flex-col min-h-0 bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm animate-in fade-in duration-500`}>
        {isProcessing && <ProcessingOverlay message="Sincronizando Ledger Vital..." />}

        <header className={`px-10 py-6 ${theme.headerBg} ${theme.headerText} flex flex-col lg:flex-row lg:items-center justify-between gap-6 shrink-0 border-b ${theme.headerBorder}`}>
          <div className="flex items-center gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-xl ${theme.accentBg} ${theme.accentColor} shadow-inner`}>
                   {isQuality ? <Terminal size={24} /> : <ClipboardList size={24} />}
                </div>
                <h1 className="text-xl font-black uppercase tracking-tight">
                  {isQuality ? "Estação Técnica de Auditoria" : "Central de Qualidade Parceira"}
                </h1>
              </div>
              <div className="flex items-center gap-3">
                 <p className={`text-[10px] font-black uppercase tracking-widest opacity-60`}>
                   {isQuality ? `Protocolo SGQ • UUID: ${inspectorFile.id.split('-')[0].toUpperCase()}` : `Entidade: ${user?.organizationName}`}
                 </p>
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
             <div className={`${isQuality ? 'bg-white/5 border-white/10' : 'bg-slate-200/50 border-slate-300'} border-2 px-5 py-2.5 rounded-2xl flex items-center gap-4 shadow-sm`}>
                <FileText size={20} className={theme.accentColor} />
                <div className="min-w-0">
                  <p className={`text-[10px] font-black uppercase tracking-widest leading-none mb-1 ${isQuality ? 'text-slate-400' : 'text-slate-500'}`}>Ativo em Análise</p>
                  <p className={`text-xs font-black truncate max-w-[220px] uppercase tracking-tight ${isQuality ? 'text-white' : 'text-slate-800'}`}>{inspectorFile.name}</p>
                </div>
             </div>
             
             {mainPreviewUrl && (
                <button 
                  onClick={() => window.open(mainPreviewUrl!, '_blank')} 
                  className={`flex items-center gap-3 px-6 py-3 ${isQuality ? 'bg-blue-600 hover:bg-blue-500' : 'bg-[#132659] hover:bg-slate-800'} text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 group focus:ring-4 focus:ring-blue-500/30`}
                >
                  <ExternalLink size={14} className="group-hover:rotate-12 transition-transform" /> Visualizar Laudo Full
                </button>
             )}
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <aside className={`w-80 border-r border-slate-100 ${theme.asideBg} hidden lg:flex flex-col shrink-0 p-8 space-y-10 overflow-y-auto custom-scrollbar`}>
            
            <section className="space-y-6">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-[3px] flex items-center gap-2">
                    <Database size={16} className="text-blue-500" /> Rastreabilidade Ledger
                </h3>
                <div className="space-y-4 px-1">
                    <TechnicalInfo label="ID de Referência" value={inspectorFile.id.split('-')[0].toUpperCase()} />
                    <TechnicalInfo label="Versão do Ativo" value={`v${inspectorFile.versionNumber || 1}.0 FINAL`} />
                </div>
            </section>

            <section className="space-y-6">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-[3px] flex items-center gap-2">
                    <Users size={16} className="text-blue-500" /> Governança e Partes
                </h3>
                <div className="bg-white p-6 rounded-[2rem] border-2 border-slate-200 shadow-sm space-y-6">
                    <TechnicalInfo 
                      label="Empresa Parceira" 
                      value={inspectorFile.organizationName || user?.organizationName || 'N/A'} 
                    />
                    <TechnicalInfo 
                      label="Responsável Vital" 
                      value={auditMetrics?.vitalUser || 'Emissão Pendente'} 
                    />
                    <TechnicalInfo 
                      label="Usuário Cliente" 
                      value={auditMetrics?.clientUser || 'Aguardando Aceite'} 
                      icon={<UserCheck size={14} className="text-blue-500" />}
                    />
                </div>
            </section>

            <section className="space-y-6">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-[3px] flex items-center gap-2">
                    <Clock size={16} className="text-blue-500" /> Janela de Auditoria
                </h3>
                <div className="space-y-5 px-1">
                    <div className="flex items-start gap-4">
                        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shrink-0"><ArrowUpRight size={16} strokeWidth={3} /></div>
                        <TechnicalInfo 
                            label="Início do Ciclo" 
                            value={formatDateTime(auditMetrics?.startTime)} 
                        />
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl shrink-0"><CalendarCheck size={16} strokeWidth={2.5} /></div>
                        <TechnicalInfo 
                            label="Conclusão Técnica" 
                            value={formatDateTime(auditMetrics?.endTime)} 
                        />
                    </div>
                </div>
            </section>

            <div className="pt-6 border-t border-slate-100 opacity-50">
               <p className="text-[9px] font-black uppercase text-slate-400 tracking-[3px] text-center">Vital Cloud Protocol v4.2</p>
            </div>
          </aside>

          <main className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/20">
            <div className="max-w-4xl mx-auto p-12">
              
              <nav className="mb-10 flex items-center gap-1.5 bg-slate-200/50 p-1.5 rounded-[2rem] w-fit shadow-inner border border-slate-200/50" role="tablist">
                  <TabButton 
                    active={activeTab === 'workflow'} 
                    onClick={() => setActiveTab('workflow')} 
                    icon={Activity} 
                    label="Fluxo Operacional" 
                    role="tab"
                  />
                  {isQuality && (
                    <TabButton 
                        active={activeTab === 'new_version'} 
                        onClick={() => setActiveTab('new_version')} 
                        icon={GitBranch} 
                        label="Nova Versão" 
                        role="tab"
                    />
                  )}
                  <TabButton 
                    active={activeTab === 'history'} 
                    onClick={() => setActiveTab('history')} 
                    icon={History} 
                    label="Histórico Ledger" 
                    role="tab"
                  />
              </nav>

              <header className="mb-12 flex items-end justify-between border-b-2 border-slate-100 pb-6">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none">
                    {activeTab === 'workflow' && (isQuality ? "Fluxo Industrial de Auditoria" : "Conformidade e Aceite Técnico")}
                    {activeTab === 'new_version' && "Trabalhar Nova Versão"}
                    {activeTab === 'history' && "Versionamento Ledger"}
                  </h2>
                  <p className="text-xs font-bold text-slate-500 mt-2.5 uppercase tracking-widest">
                    {activeTab === 'workflow' && (isQuality ? "Controle rigoroso de vereditos industriais." : "Verificação e assinatura de certificados homologados.")}
                    {activeTab === 'new_version' && "Substituição e retificação de documentos técnicos."}
                    {activeTab === 'history' && "Rastreabilidade de versões anteriores e logs de modificação."}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-baseline justify-end gap-1.5">
                    <span className={`text-4xl font-black font-mono tracking-tighter ${isQuality ? 'text-blue-600' : 'text-emerald-600'}`}>
                      {calculateProgress()}
                    </span>
                    <span className="text-lg font-black text-slate-300">%</span>
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Conclusão das 7 Etapas</p>
                </div>
              </header>

              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                {activeTab === 'workflow' && (
                  <AuditWorkflow 
                    metadata={inspectorFile.metadata} 
                    userRole={user?.role as UserRole} 
                    userName={user?.name || ''}
                    userEmail={user?.email || ''}
                    fileId={inspectorFile.id}
                    onUpdate={async (updates) => {
                        await handleInspectAction(updates);
                    }}
                    onUploadStepEvidence={handleUploadStepEvidence}
                  />
                )}

                {activeTab === 'new_version' && isQuality && (
                  <NewVersionUploadView 
                    file={inspectorFile}
                    userRole={user?.role as UserRole}
                    onUpload={handleCreateNewVersion}
                    onDownload={handleDownload}
                  />
                )}

                {activeTab === 'history' && (
                  <VersionHistoryView 
                    file={inspectorFile}
                    userRole={user?.role as UserRole}
                    onUpload={async () => {}}
                    onDownload={handleDownload}
                  />
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </Layout>
  );
};

const TabButton = ({ active, onClick, icon: Icon, label, role }: any) => (
  <button 
    onClick={onClick}
    role={role}
    aria-selected={active}
    className={`flex items-center gap-3 px-6 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all
      ${active ? 'bg-white text-blue-600 shadow-md ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-900 hover:bg-white/40'}
    `}
  >
    <Icon size={14} strokeWidth={active ? 3 : 2} />
    {label}
  </button>
);

const TechnicalInfo = ({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) => (
  <div className="flex flex-col gap-1 overflow-hidden">
    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
        {label} {icon}
    </span>
    <span className="text-sm font-bold text-slate-800 uppercase tracking-tight truncate leading-snug">{value}</span>
  </div>
);
