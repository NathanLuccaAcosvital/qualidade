
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Check, Key, Activity, FileText, ArrowRight, ShieldCheck, 
  Truck, Gavel, UserCheck, Lock, Award, Mail, AlertTriangle, XCircle,
  MessageSquare, Eye, User, Plus, X, Clock, Camera, Image as ImageIcon,
  Loader2
} from 'lucide-react';
import { SteelBatchMetadata, QualityStatus, UserRole, AuditSignature } from '../../../../types/index.ts';
import { useToast } from '../../../../context/notificationContext.tsx';
import { fileService } from '../../../../lib/services/index.ts';

interface AuditWorkflowProps {
  metadata: SteelBatchMetadata | undefined;
  userRole: UserRole;
  userName: string;
  userEmail: string;
  fileId: string;
  onUpdate: (updatedMetadata: Partial<SteelBatchMetadata>) => Promise<void>;
  onUploadStepEvidence?: (file: File, step: 'documental' | 'physical') => Promise<void>;
}

export const AuditWorkflow: React.FC<AuditWorkflowProps> = ({ 
    metadata, userRole, userName, userEmail, fileId, onUpdate, onUploadStepEvidence 
}) => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [isSyncing, setIsSyncing] = useState(false);
  const [arbitrationText, setArbitrationText] = useState('');
  
  const [docNotes, setDocNotes] = useState(metadata?.documentalNotes || '');
  const [docFlags, setDocFlags] = useState<string[]>(metadata?.documentalFlags || []);
  const [newDocFlag, setNewDocFlag] = useState('');

  const [physNotes, setPhysNotes] = useState(metadata?.physicalNotes || '');
  const [physFlags, setPhysFlags] = useState<string[]>(metadata?.physicalFlags || []);
  const [newPhysFlag, setNewPhysFlag] = useState('');

  const isQuality = userRole === UserRole.QUALITY || userRole === UserRole.ADMIN;
  const isClient = userRole === UserRole.CLIENT;

  const sigs = metadata?.signatures || {};
  const s1 = !!sigs.step1_release;
  const s2 = !!sigs.step2_documental;
  const s3 = !!sigs.step3_physical;
  const s4 = !!sigs.step4_arbitrage;
  const s5 = !!sigs.step5_partner_verdict;
  const s6_c = !!sigs.step6_consolidation_client;
  const s6_q = !!sigs.step6_consolidation_quality;
  const s6 = s6_c && s6_q; 

  const isArbitrationNeeded = metadata?.documentalStatus === 'REJECTED' || metadata?.physicalStatus === 'REJECTED';
  const isStep4AutoCompleted = s2 && s3 && !isArbitrationNeeded;
  const isStep4Done = s4 || isStep4AutoCompleted;

  const createSignature = (action: string): AuditSignature => ({
    userId: userName.replace(/\s+/g, '_').toLowerCase(),
    userName: userName,
    userEmail: userEmail,
    userRole: userRole,
    timestamp: new Date().toISOString(),
    action: action
  });

  const handleAction = async (stepKey: keyof SteelBatchMetadata['signatures'], updates: any) => {
    setIsSyncing(true);
    try {
      const newSigs = { ...sigs, [stepKey]: createSignature(`SIGN_${stepKey.toUpperCase()}`) };
      await onUpdate({ ...updates, signatures: newSigs as any });
      showToast(`Protocolo assinado com sucesso.`, "success");
    } catch (e) { 
      showToast("Erro na sincronização técnica.", "error"); 
    } finally { 
      setIsSyncing(false); 
    }
  };

  const handleNavigateToPreview = () => {
      const mode = (!s2 && isClient) ? '?mode=audit' : '?notes=true';
      navigate(`/preview/${fileId}${mode}`);
  };

  const addFlag = (type: 'doc' | 'phys') => {
    const val = type === 'doc' ? newDocFlag : newPhysFlag;
    if (!val.trim()) return;
    
    if (type === 'doc') {
      setDocFlags([...docFlags, val.trim()]);
      setNewDocFlag('');
    } else {
      setPhysFlags([...physFlags, val.trim()]);
      setNewPhysFlag('');
    }
  };

  const removeFlag = (type: 'doc' | 'phys', index: number) => {
    if (type === 'doc') setDocFlags(docFlags.filter((_, i) => i !== index));
    else setPhysFlags(physFlags.filter((_, i) => i !== index));
  };

  const isRejected = metadata?.status === QualityStatus.REJECTED;
  const clientRep = sigs.step5_partner_verdict || sigs.step6_consolidation_client || sigs.step2_documental;

  return (
    <div className="space-y-10 pb-24" role="list" aria-label="Fluxo de Auditoria Técnica">
        
        {/* 1. LIBERAÇÃO VITAL (SGQ) */}
        <StepCard 
          step={1} title="1. Liberação Vital (SGQ)" 
          completed={s1} active={!s1} 
          signature={sigs.step1_release} icon={Key}
        >
          {isQuality && !s1 && (
            <button 
                onClick={() => handleAction('step1_release', { status: QualityStatus.SENT })} 
                className="w-full py-4 bg-[#132659] text-white rounded-2xl font-black text-xs uppercase tracking-[3px] shadow-xl hover:bg-blue-900 transition-all flex items-center justify-center gap-3 focus:ring-4 focus:ring-blue-500/20"
            >
              {isSyncing ? <Activity className="animate-spin" size={18}/> : "Autorizar Fluxo Industrial"}
            </button>
          )}
        </StepCard>

        {/* 2. CONFERÊNCIA DE DADOS */}
        <StepCard 
          step={2} title="2. Conferência de Dados" 
          completed={s2} active={s1 && !s2} 
          signature={sigs.step2_documental} icon={FileText}
        >
            <div className="space-y-6">
                <button 
                    disabled={!s1}
                    onClick={handleNavigateToPreview} 
                    className={`w-full py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${
                        s1 ? 'bg-blue-50 text-blue-700 border-2 border-blue-200 hover:bg-blue-100 shadow-sm' : 'bg-slate-50 text-slate-400 border border-slate-200 opacity-50 cursor-not-allowed'
                    }`}
                >
                    {s2 ? <><Eye size={18} /> Visualizar Notas (Leitura)</> : <><FileText size={18} /> Estação de Anotação Técnica</>}
                </button>

                {((isClient && s1 && !s2) || (s2)) && (
                    <div className="space-y-6 p-6 bg-slate-50 rounded-2xl border-2 border-slate-200 shadow-inner">
                        <div className="space-y-3">
                            <label className="text-xs font-black text-slate-600 uppercase tracking-widest ml-1">Anexar Documentação Digitalizada</label>
                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed mb-3">
                                Utilize este campo se imprimiu o documento para anotar à mão ou se possui um comprovante adicional de divergência.
                            </p>
                            <EvidenceUploadArea 
                              step="documental" 
                              photos={metadata?.documentalPhotos} 
                              disabled={s2 || !isClient}
                              onUpload={onUploadStepEvidence}
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-black text-slate-600 uppercase tracking-widest ml-1">Flags de Auditoria</label>
                            <div className="flex flex-wrap gap-2">
                                {(s2 ? (metadata?.documentalFlags || []) : docFlags).map((flag, idx) => (
                                    <span key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-white border-2 border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 shadow-sm">
                                        {flag}
                                        {isClient && !s2 && (
                                          <button onClick={() => removeFlag('doc', idx)} className="text-red-500 hover:text-red-700 p-0.5" aria-label={`Remover flag ${flag}`}>
                                            <X size={14} strokeWidth={3} />
                                          </button>
                                        )}
                                    </span>
                                ))}
                                {isClient && !s2 && (
                                    <div className="flex gap-2 w-full mt-2">
                                        <input 
                                            type="text" 
                                            placeholder="Adicionar marcador (ex: Data Inválida)..." 
                                            className="flex-1 px-4 py-2.5 rounded-xl border-2 border-slate-200 text-sm outline-none focus:border-blue-500 bg-white"
                                            value={newDocFlag}
                                            onChange={e => setNewDocFlag(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFlag('doc'))}
                                        />
                                        <button 
                                          onClick={() => addFlag('doc')} 
                                          className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-md active:scale-95 transition-all"
                                        >
                                          <Plus size={18} strokeWidth={3} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-black text-slate-600 uppercase tracking-widest ml-1">Relatório de Divergências</label>
                            <textarea 
                                readOnly={s2 || !isClient}
                                value={s2 ? (metadata?.documentalNotes || '') : docNotes}
                                onChange={e => setDocNotes(e.target.value)}
                                className="w-full p-4 bg-white border-2 border-slate-200 rounded-xl text-sm min-h-[100px] outline-none focus:ring-4 focus:ring-blue-500/10 font-medium leading-relaxed"
                                placeholder="Descreva formalmente as observações técnicas sobre este documento..."
                            />
                        </div>
                    </div>
                )}

                {isClient && s1 && !s2 && (
                    <button 
                        onClick={() => handleAction('step2_documental', { documentalStatus: 'APPROVED', documentalNotes: docNotes, documentalFlags: docFlags })}
                        className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                        <Check size={18} strokeWidth={3} /> Assinar Validação de Dados
                    </button>
                )}
            </div>
        </StepCard>

        {/* 3. VISTORIA DE CARGA */}
        <StepCard 
          step={3} title="3. Vistoria de Carga" 
          completed={s3} active={s1 && !s3} 
          signature={sigs.step3_physical} icon={Truck}
        >
            <div className="space-y-6">
                {((isClient && s1 && !s3) || (s3)) && (
                    <div className="space-y-6 p-6 bg-slate-50 rounded-2xl border-2 border-slate-200 shadow-inner">
                        
                        <div className="space-y-3">
                            <label className="text-xs font-black text-slate-600 uppercase tracking-widest ml-1">Galeria de Campo (Fotos/Documentos)</label>
                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed mb-3">
                                Anexe aqui fotos da carga recebida, lacres ou documentos que acompanharam o transporte (Danfe, Romaneio).
                            </p>
                            <EvidenceUploadArea 
                                step="physical" 
                                photos={metadata?.physicalPhotos} 
                                disabled={s3 || !isClient}
                                onUpload={onUploadStepEvidence}
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-black text-slate-600 uppercase tracking-widest ml-1">Estado Físico (Flags de Recebimento)</label>
                            <div className="flex flex-wrap gap-2">
                                {(s3 ? (metadata?.physicalFlags || []) : physFlags).map((flag, idx) => (
                                    <span key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-white border-2 border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 shadow-sm">
                                        {flag}
                                        {isClient && !s3 && (
                                          <button onClick={() => removeFlag('phys', idx)} className="text-red-500 hover:text-red-700 p-0.5" aria-label={`Remover flag ${flag}`}>
                                            <X size={14} strokeWidth={3} />
                                          </button>
                                        )}
                                    </span>
                                ))}
                                {isClient && !s3 && (
                                    <div className="flex gap-2 w-full mt-2">
                                        <input 
                                            type="text" 
                                            placeholder="Ex: Embalagem Avariada..." 
                                            className="flex-1 px-4 py-2.5 rounded-xl border-2 border-slate-200 text-sm outline-none focus:border-blue-500 bg-white"
                                            value={newPhysFlag}
                                            onChange={e => setNewPhysFlag(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFlag('phys'))}
                                        />
                                        <button 
                                          onClick={() => addFlag('phys')} 
                                          className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-md transition-all"
                                        >
                                          <Plus size={18} strokeWidth={3} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-black text-slate-600 uppercase tracking-widest ml-1">Observações de Campo</label>
                            <textarea 
                                readOnly={s3 || !isClient}
                                value={s3 ? (metadata?.physicalNotes || '') : physNotes}
                                onChange={e => setPhysNotes(e.target.value)}
                                className="w-full p-4 bg-white border-2 border-slate-200 rounded-xl text-sm min-h-[100px] outline-none focus:ring-4 focus:ring-blue-500/10 font-medium leading-relaxed"
                                placeholder="Relate as condições de recepção do material no local..."
                            />
                        </div>
                    </div>
                )}

                {isClient && s1 && !s3 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button 
                            onClick={() => handleAction('step3_physical', { physicalStatus: 'APPROVED', physicalNotes: physNotes, physicalFlags: physFlags })}
                            className="py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-3"
                        >
                            <Check size={18} strokeWidth={3} /> Aprovar Carga
                        </button>
                        <button 
                            onClick={() => handleAction('step3_physical', { physicalStatus: 'REJECTED', physicalNotes: physNotes, physicalFlags: physFlags })}
                            className="py-4 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-red-700 transition-all flex items-center justify-center gap-3"
                        >
                            <XCircle size={18} /> Rejeitar Carga
                        </button>
                    </div>
                )}
            </div>
        </StepCard>

        {/* 4. ARBITRAGEM TÉCNICA */}
        <StepCard 
          step={4} title="4. Arbitragem Técnica" 
          completed={isStep4Done} active={s2 && s3 && isArbitrationNeeded && !s4} 
          signature={sigs.step4_arbitrage} icon={Gavel}
        >
            <div className="space-y-6">
                {isStep4AutoCompleted && !s4 && (
                    <div className="p-5 bg-emerald-50 rounded-2xl border-2 border-emerald-200 flex items-center gap-4 shadow-sm" role="status">
                        <ShieldCheck size={24} className="text-emerald-600" />
                        <p className="text-xs font-black text-emerald-900 uppercase tracking-tight leading-relaxed">Conformidade Plena Detectada: <br/><span className="font-medium normal-case text-emerald-700 opacity-80">Sem divergências impeditivas. Arbitragem concluída automaticamente.</span></p>
                    </div>
                )}
                {isQuality && isArbitrationNeeded && !s4 && (
                    <div className="space-y-4">
                        <textarea 
                            className="w-full p-5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm min-h-[120px] outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-medium leading-relaxed"
                            placeholder="Descreva a mediação técnica final para este lote..."
                            value={arbitrationText}
                            onChange={(e) => setArbitrationText(e.target.value)}
                        />
                        <button 
                            disabled={!arbitrationText.trim() || isSyncing}
                            onClick={() => handleAction('step4_arbitrage', { arbitrationNotes: arbitrationText })}
                            className="w-full py-4 bg-[#132659] text-white rounded-2xl font-black text-xs uppercase tracking-[3px] shadow-xl hover:bg-blue-900 transition-all flex items-center justify-center gap-3"
                        >
                            {isSyncing ? <Activity className="animate-spin" size={18}/> : <><Lock size={18} /> Assinar Arbitragem Técnica</>}
                        </button>
                    </div>
                )}
                {s4 && metadata?.arbitrationNotes && (
                    <div className="p-6 bg-blue-50 rounded-2xl border-2 border-blue-100 space-y-3 shadow-inner">
                        <p className="text-xs font-black text-blue-500 uppercase tracking-widest flex items-center gap-2">
                          <MessageSquare size={16} /> Nota de Mediação Vital:
                        </p>
                        <p className="text-sm text-blue-900 font-medium italic leading-relaxed">"{metadata.arbitrationNotes}"</p>
                    </div>
                )}
            </div>
        </StepCard>

        {/* 5. VEREDITO DO PARCEIRO */}
        <StepCard 
          step={5} title="5. Veredito do Parceiro" 
          completed={s5} active={isStep4Done && !s5} 
          signature={sigs.step5_partner_verdict} icon={UserCheck}
        >
            <div className="space-y-6">
                {isClient && isStep4Done && !s5 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button onClick={() => handleAction('step5_partner_verdict', { status: QualityStatus.APPROVED })} className="py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-emerald-700 transition-all active:scale-95">Aceitar Lote</button>
                        <button onClick={() => handleAction('step5_partner_verdict', { status: QualityStatus.REJECTED })} className="py-4 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-red-700 transition-all active:scale-95">Rejeitar Lote</button>
                    </div>
                )}
                {s5 && (
                    <div className={`p-6 rounded-2xl border-2 flex items-center gap-5 shadow-sm ${metadata?.status === QualityStatus.APPROVED ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 border-4 ${metadata?.status === QualityStatus.APPROVED ? 'bg-white border-emerald-500 text-emerald-600' : 'bg-white border-red-500 text-red-600'}`}>
                            {metadata?.status === QualityStatus.APPROVED ? <Check size={28} strokeWidth={4} /> : <XCircle size={28} strokeWidth={3} />}
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-tight opacity-60">Status de Aceite do Cliente:</p>
                            <p className="text-lg font-black uppercase tracking-widest">{metadata?.status === QualityStatus.APPROVED ? 'Lote Homologado' : 'Lote Recusado'}</p>
                        </div>
                    </div>
                )}
            </div>
        </StepCard>

        {/* 6. CONSOLIDAÇÃO DIGITAL */}
        <StepCard step={6} title="6. Consolidação Digital" completed={s6} active={s5 && !s6} icon={Lock}>
            <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <StatusSlot label="Representante Parceiro" signed={s6_c} signature={sigs.step6_consolidation_client} />
                    <StatusSlot label="Analista Qualidade" signed={s6_q} signature={sigs.step6_consolidation_quality} />
                </div>
                {s5 && !s6 && (
                    <div className="pt-2">
                        {isClient && !s6_c && <button onClick={() => handleAction('step6_consolidation_client', {})} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-black transition-all">Assinar Selo Digital (Cliente)</button>}
                        {isQuality && !s6_q && <button onClick={() => handleAction('step6_consolidation_quality', {})} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-black transition-all">Assinar Selo Digital (Analista)</button>}
                    </div>
                )}
            </div>
        </StepCard>

        {/* 7. PROTOCOLO VITAL CERTIFICADO */}
        <StepCard step={7} title="7. Protocolo Vital Certificado" completed={s6} active={s6} icon={Award}>
            {s6 && (
                <div className="animate-in fade-in zoom-in-95 duration-1000">
                    {!isRejected ? (
                        <div className="flex items-center gap-6 p-8 bg-emerald-600 text-white rounded-[2rem] shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform"><Award size={120} /></div>
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0 border border-white/30">
                                <ShieldCheck size={40} className="text-white animate-bounce" />
                            </div>
                            <div className="relative z-10">
                                <h4 className="text-lg font-black uppercase tracking-tight leading-none">Certificação Vital SGQ</h4>
                                <p className="text-xs font-bold text-white/80 mt-1.5 uppercase tracking-widest">Ativo homologado para uso industrial seguro.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex items-center gap-5 p-6 bg-red-50 rounded-2xl border-2 border-red-200">
                                <AlertTriangle size={32} className="text-red-600 shrink-0" />
                                <div className="flex-1">
                                    <h4 className="text-sm font-black text-red-900 uppercase tracking-tight">Transmissão Bloqueada</h4>
                                    <p className="text-xs text-red-700 font-medium leading-relaxed mt-1">
                                        {isQuality 
                                            ? "Lote rejeitado pelo parceiro. O workflow exige mediação técnica externa." 
                                            : "Divergência técnica crítica detectada. Aguarde contato da Qualidade Aços Vital."}
                                    </p>
                                </div>
                            </div>

                            {isQuality && clientRep && (
                                <div className="p-6 bg-white border-2 border-slate-200 rounded-[2rem] space-y-4 shadow-sm">
                                    <header className="flex items-center gap-2 text-slate-50">
                                        <User size={16} />
                                        <span className="text-[11px] font-black uppercase tracking-widest">Contato do Parceiro (Representante)</span>
                                    </header>
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="min-w-0">
                                            <p className="text-sm font-black text-slate-900 uppercase truncate leading-none">{clientRep.userName}</p>
                                            <p className="text-xs text-blue-600 font-bold truncate lowercase mt-1 opacity-70">{clientRep.userEmail}</p>
                                        </div>
                                        <a 
                                          href={`mailto:${clientRep.userEmail}`} 
                                          className="p-3.5 bg-slate-100 border-2 border-slate-200 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all shadow-sm"
                                        >
                                          <Mail size={18} strokeWidth={2.5} />
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </StepCard>
    </div>
  );
};

/* --- COMPONENTES AUXILIARES --- */

/**
 * Área de Upload de Evidências Visual com Galeria
 */
const EvidenceUploadArea: React.FC<{ 
    step: 'documental' | 'physical', 
    photos?: string[], 
    disabled: boolean,
    onUpload?: (file: File, step: 'documental' | 'physical') => Promise<void>
}> = ({ step, photos = [], disabled, onUpload }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !onUpload) return;
        setIsUploading(true);
        try {
            await onUpload(file, step);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
                {photos.map((path, i) => (
                    <ThumbnailItem key={i} path={path} />
                ))}
                
                {!disabled && (
                    <button 
                        onClick={() => inputRef.current?.click()}
                        disabled={isUploading}
                        className="w-20 h-20 bg-white border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-all shadow-sm group"
                    >
                        <input type="file" ref={inputRef} className="hidden" accept="image/*" onChange={handleFile} />
                        {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Camera size={20} className="group-hover:scale-110 transition-transform" />}
                        <span className="text-[7px] font-black uppercase mt-1">Anexar</span>
                    </button>
                )}

                {photos.length === 0 && disabled && (
                    <div className="w-full py-4 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-300 grayscale opacity-50">
                        <ImageIcon size={24} />
                        <span className="text-[8px] font-black uppercase mt-1">Sem Imagens Anexadas</span>
                    </div>
                )}
            </div>
        </div>
    );
};

const ThumbnailItem: React.FC<{ path: string }> = ({ path }) => {
    const [signedUrl, setSignedUrl] = useState<string | null>(null);

    useEffect(() => {
        fileService.getSignedUrl(path).then(setSignedUrl);
    }, [path]);

    if (!signedUrl) return <div className="w-20 h-20 bg-slate-100 animate-pulse rounded-xl" />;

    return (
        <a 
            href={signedUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-20 h-20 rounded-xl border-2 border-white shadow-md overflow-hidden hover:scale-105 hover:rotate-2 transition-all block ring-2 ring-transparent hover:ring-blue-400"
        >
            <img src={signedUrl} alt="Evidência" className="w-full h-full object-cover" />
        </a>
    );
};

const StatusSlot = ({ label, signed, signature }: any) => (
    <div className={`p-5 rounded-2xl border-2 transition-all ${signed ? 'bg-emerald-50 border-emerald-200 shadow-sm' : 'bg-slate-50 border-slate-200 opacity-60'}`}>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">{label}</p>
        {signed ? (
            <div className="flex items-center gap-2 text-emerald-700">
                <Check size={18} strokeWidth={4} />
                <span className="text-xs font-black uppercase tracking-tight">Assinado</span>
            </div>
        ) : (
            <div className="flex items-center gap-2 text-slate-400">
                <Clock size={16} />
                <span className="text-xs font-bold uppercase tracking-tight">Aguardando...</span>
            </div>
        )}
        {signature && (
          <div className="mt-3 pt-3 border-t border-emerald-100/50">
            <p className="text-[10px] font-bold text-slate-600 truncate">{signature.userName}</p>
          </div>
        )}
    </div>
);

const StepCard = ({ title, active, completed, signature, children, icon: Icon, step }: any) => {
    const statusColor = completed ? 'bg-emerald-600' : active ? 'bg-[#132659]' : 'bg-slate-200';
    const borderClass = active ? 'border-[#132659]' : completed ? 'border-emerald-100' : 'border-slate-100';
    
    return (
        <div 
          className={`p-8 rounded-[3rem] border-2 transition-all duration-700 relative ${
            active 
              ? 'bg-white shadow-2xl border-opacity-40 scale-[1.02] ring-8 ring-blue-500/5' 
              : completed ? 'bg-white border-opacity-100 opacity-100' : 'bg-slate-100 border-opacity-0 opacity-40 grayscale pointer-events-none'
          } ${borderClass}`}
        >
            <div className="flex items-start gap-8">
                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center shrink-0 border-4 border-white shadow-xl transition-all duration-500 ${statusColor} text-white`}>
                    {completed ? <Check size={32} strokeWidth={4} /> : <Icon size={28} />}
                </div>
                <div className="flex-1 space-y-6 min-w-0">
                    <header className="flex justify-between items-start">
                        <div className="space-y-1">
                            <h3 className={`text-xl font-black uppercase tracking-tight ${active ? 'text-[#132659]' : completed ? 'text-slate-800' : 'text-slate-400'}`}>
                              {title}
                            </h3>
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest shadow-sm ${
                                completed ? 'bg-emerald-100 text-emerald-700' : active ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-500'
                              }`}>
                                {completed ? 'Protocolo Validado' : active ? 'Fase em Análise' : 'Aguardando Liberação'}
                              </span>
                            </div>
                        </div>
                        {completed && <ShieldCheck size={24} className="text-emerald-500 drop-shadow-sm" />}
                    </header>
                    
                    {children && (
                      <div className="animate-in fade-in slide-in-from-top-3 duration-700" role="group">
                        {children}
                      </div>
                    )}

                    {signature && (
                        <div className="mt-6 p-6 bg-slate-50 rounded-[2rem] border-2 border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-inner">
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[3px] mb-2">Assinatura Digital Auditada:</p>
                                <div className="space-y-0.5">
                                  <p className="text-sm font-black text-slate-900 uppercase tracking-tight truncate">{signature.userName}</p>
                                  <p className="text-[11px] text-blue-700 font-bold underline opacity-80 lowercase truncate">{signature.userEmail}</p>
                                </div>
                            </div>
                            <div className="text-left sm:text-right shrink-0 bg-white/60 px-4 py-2 rounded-2xl border border-slate-200/50">
                                <p className="text-[11px] font-black text-slate-700 font-mono">{new Date(signature.timestamp).toLocaleDateString('pt-BR')}</p>
                                <p className="text-[11px] font-black text-slate-400 font-mono mt-0.5">{new Date(signature.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} (SP)</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
