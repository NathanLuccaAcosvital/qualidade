
import React, { useRef, useState } from 'react';
import { 
  History, FileUp, Clock, CheckCircle2, AlertCircle, 
  ArrowRight, Download, FileText, User, ShieldCheck, 
  PlusCircle, Database, ChevronDown, ChevronUp, Eye,
  Lock, Key, Truck, Gavel, UserCheck, Award
} from 'lucide-react';
import { FileNode, SteelBatchMetadata, UserRole } from '../../../../types/index.ts';

interface VersionSubViewProps {
  file: FileNode;
  userRole: UserRole;
  onUpload: (file: File) => Promise<void>;
  onDownload: (file: FileNode) => void;
  onDownloadPath?: (path: string) => void;
}

/**
 * ABA: GESTÃO DE NOVA VERSÃO
 */
export const NewVersionUploadView: React.FC<VersionSubViewProps> = ({ file, userRole, onUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
  };

  const handleUploadClick = () => {
    if (selectedFile) onUpload(selectedFile);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-blue-50 border-2 border-blue-100 p-8 rounded-[2.5rem] flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shrink-0">
              <PlusCircle size={32} />
          </div>
          <div>
              <h3 className="text-xl font-black text-blue-900 uppercase tracking-tight">Estação de Versionamento</h3>
              <p className="text-sm font-medium text-blue-700 opacity-80">
                  Utilize esta área para enviar uma correção ou atualização deste certificado. <br/>
                  A versão atual (<span className="font-bold">v{file.versionNumber || 1}.0</span>) será arquivada no histórico.
              </p>
          </div>
      </div>

      <div 
        onDragOver={(e) => { e.preventDefault(); setIsHovering(true); }}
        onDragLeave={() => setIsHovering(false)}
        onDrop={(e) => { e.preventDefault(); setIsHovering(false); if(e.dataTransfer.files[0]) setSelectedFile(e.dataTransfer.files[0]); }}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-4 border-dashed rounded-[3rem] p-16 flex flex-col items-center justify-center transition-all cursor-pointer group
          ${isHovering ? 'border-blue-500 bg-blue-50 scale-[0.99]' : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50'}
        `}
      >
        <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" onChange={handleFileChange} />
        
        {selectedFile ? (
            <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-emerald-500 text-white rounded-3xl flex items-center justify-center mx-auto shadow-xl">
                    <CheckCircle2 size={40} />
                </div>
                <div>
                    <p className="text-lg font-black text-slate-800 uppercase tracking-tight">{selectedFile.name}</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Pronto para Upload</p>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleUploadClick(); }}
                  className="px-10 py-4 bg-[#132659] text-white rounded-2xl font-black text-xs uppercase tracking-[3px] shadow-2xl hover:bg-blue-900 transition-all active:scale-95"
                >
                  Efetivar Nova Versão
                </button>
            </div>
        ) : (
            <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <FileUp size={40} />
                </div>
                <div>
                    <p className="text-base font-black text-slate-600 uppercase tracking-widest">Arraste o novo documento aqui</p>
                    <p className="text-xs font-medium text-slate-400 mt-2">ou clique para explorar arquivos do seu computador</p>
                </div>
            </div>
        )}
      </div>

      <div className="bg-amber-50 border border-amber-200 p-6 rounded-3xl flex items-start gap-4">
          <AlertCircle className="text-amber-600 shrink-0" size={24} />
          <p className="text-xs text-amber-900 font-medium leading-relaxed">
              <b>Nota de Governança:</b> O envio de uma nova versão reinicia o fluxo de auditoria a partir do passo 2 (Conferência de Dados). Todas as assinaturas anteriores serão invalidadas para este novo ativo.
          </p>
      </div>
    </div>
  );
};

/**
 * ABA: HISTÓRICO LEDGER
 */
export const VersionHistoryView: React.FC<VersionSubViewProps> = ({ file, onDownload }) => {
  const [expandedVersion, setExpandedVersion] = useState<number | null>(null);
  const history = file.metadata?.versionHistory || [];
  
  const toggleAnalysis = (version: number) => {
    setExpandedVersion(expandedVersion === version ? null : version);
  };

  const handleDownloadHistorical = (storagePath: string, version: number) => {
    // Cria um objeto temporário simulando um FileNode para o serviço de download
    onDownload({
      ...file,
      storagePath,
      versionNumber: version,
      name: `${file.name} (v${version}.0)`
    });
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg">
              <History size={24} />
          </div>
          <div>
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Rastreabilidade Ledger</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Registro imutável de alterações do ativo</p>
          </div>
      </header>

      <div className="relative pl-10 space-y-8 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-1 before:bg-slate-100">
          
          {/* Versão Atual */}
          <div className="relative group">
              <div className="absolute -left-[35px] top-0 w-8 h-8 rounded-full border-4 border-white bg-blue-600 shadow-md z-10 flex items-center justify-center text-white">
                  <ShieldCheck size={14} />
              </div>
              <div className="bg-white border-2 border-blue-100 rounded-[2rem] p-6 shadow-sm group-hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-4">
                      <div className="space-y-1">
                          <span className="px-2 py-0.5 bg-blue-600 text-white text-[8px] font-black uppercase rounded">Versão Atual</span>
                          <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight mt-2">v{file.versionNumber || 1}.0 Ativo</h4>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 font-bold bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                        {new Date(file.updatedAt).toLocaleString()}
                      </span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => toggleAnalysis(file.versionNumber || 1)}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-900 transition-all"
                    >
                      {expandedVersion === (file.versionNumber || 1) ? <ChevronUp size={14}/> : <Eye size={14}/>}
                      {expandedVersion === (file.versionNumber || 1) ? "Fechar Resumo" : "Analisar Protocolo"}
                    </button>
                    <button 
                      onClick={() => onDownload(file)}
                      className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                      title="Download da Versão Atual"
                    >
                      <Download size={16} />
                    </button>
                  </div>

                  {expandedVersion === (file.versionNumber || 1) && (
                    <div className="mt-6 pt-6 border-t border-slate-100 animate-in slide-in-from-top-4 duration-300">
                      <VersionAnalysisSummary metadata={file.metadata} />
                    </div>
                  )}
              </div>
          </div>

          {/* Versões Anteriores */}
          {history.length > 0 ? history.map((v, idx) => (
              <div key={idx} className="relative group">
                   <div className="absolute -left-[31px] top-0 w-6 h-6 rounded-full border-4 border-white bg-slate-300 shadow-sm z-10" />
                   <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-6 opacity-80 group-hover:opacity-100 transition-all">
                        <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-white rounded-xl text-slate-400 shadow-sm"><FileText size={18}/></div>
                                <div>
                                    <p className="text-xs font-black text-slate-700 uppercase tracking-widest">Versão Arquivada v{v.version}.0</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 flex items-center gap-2">
                                        <Clock size={10} /> {new Date(v.createdAt).toLocaleDateString()} por {v.createdBy}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => toggleAnalysis(v.version)}
                                  className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:border-blue-300 hover:text-blue-600 transition-all"
                                >
                                  {expandedVersion === v.version ? "Esconder" : "Analisar"}
                                </button>
                                <button 
                                  onClick={() => handleDownloadHistorical(v.storagePath, v.version)}
                                  className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-blue-600 rounded-xl transition-all"
                                  title={`Baixar Versão ${v.version}.0`}
                                >
                                    <Download size={14} />
                                </button>
                            </div>
                        </div>

                        {expandedVersion === v.version && (
                          <div className="mt-4 pt-4 border-t border-slate-200 animate-in slide-in-from-top-2">
                            <VersionAnalysisSummary isHistorical />
                          </div>
                        )}
                   </div>
              </div>
          )) : (
              <div className="py-20 text-center text-slate-300">
                  <Database size={48} className="mx-auto mb-4 opacity-10" />
                  <p className="text-sm font-black uppercase tracking-widest">Sem versões históricas</p>
                  <p className="text-[10px] font-bold mt-1 uppercase">Este é o ativo original (Gênese).</p>
              </div>
          )}
      </div>
    </div>
  );
};

/**
 * Componente de Resumo de Protocolo (Somente Leitura)
 */
const VersionAnalysisSummary: React.FC<{ metadata?: SteelBatchMetadata, isHistorical?: boolean }> = ({ metadata, isHistorical }) => {
  const steps = [
    { id: 1, label: "Liberação Vital", icon: Key, sig: metadata?.signatures?.step1_release },
    { id: 2, label: "Conferência Dados", icon: FileText, sig: metadata?.signatures?.step2_documental, note: metadata?.documentalNotes },
    { id: 3, label: "Vistoria de Carga", icon: Truck, sig: metadata?.signatures?.step3_physical, note: metadata?.physicalNotes },
    { id: 4, label: "Arbitragem", icon: Gavel, sig: metadata?.signatures?.step4_arbitrage, note: metadata?.arbitrationNotes },
    { id: 5, label: "Veredito Parceiro", icon: UserCheck, sig: metadata?.signatures?.step5_partner_verdict },
    { id: 6, label: "Consolidação", icon: Lock, sig: metadata?.signatures?.step6_consolidation_quality },
    { id: 7, label: "Certificação", icon: Award, sig: metadata?.signatures?.step7_certification },
  ];

  return (
    <div className={`rounded-2xl p-6 ${isHistorical ? 'bg-white/40 border border-slate-200' : 'bg-slate-50 border border-slate-100'}`}>
      <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] mb-6">Resumo de Estágios do Protocolo</h5>
      
      <div className="space-y-4">
        {steps.map(step => (
          <div key={step.id} className="flex items-start gap-4 group">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${
              step.sig ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-100 border-slate-200 text-slate-400 opacity-40'
            }`}>
              <step.icon size={16} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className={`text-[11px] font-black uppercase tracking-tight ${step.sig ? 'text-slate-800' : 'text-slate-400'}`}>
                  {step.label}
                </p>
                {step.sig ? (
                  <span className="text-[9px] font-bold text-emerald-600 uppercase bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">Finalizado</span>
                ) : (
                  <span className="text-[9px] font-bold text-slate-300 uppercase">Pendente</span>
                )}
              </div>
              
              {step.sig && (
                <div className="mt-1 flex items-center gap-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                  <span className="flex items-center gap-1"><User size={10}/> {step.sig.userName}</span>
                  <span className="opacity-30">|</span>
                  <span className="flex items-center gap-1"><Clock size={10}/> {new Date(step.sig.timestamp).toLocaleDateString()}</span>
                </div>
              )}

              {step.note && (
                <p className="mt-2 text-[10px] text-slate-600 font-medium italic border-l-2 border-slate-200 pl-3 leading-relaxed">
                  "{step.note}"
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {isHistorical && (
        <div className="mt-6 p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center gap-3">
          <AlertCircle size={16} className="text-blue-500 shrink-0" />
          <p className="text-[9px] text-blue-700 font-medium leading-tight">
            Estes dados representam o estado do protocolo no momento do arquivamento desta versão. Para visualizar o documento físico desta versão, utilize o botão de Download acima.
          </p>
        </div>
      )}
    </div>
  );
};
