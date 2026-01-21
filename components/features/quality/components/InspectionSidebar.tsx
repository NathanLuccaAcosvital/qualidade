import React, { useState } from 'react';
import { X, Download, FileText, Tag, ShieldCheck, AlertCircle, Eye, Loader2, History, MessageSquare, Clock } from 'lucide-react';
import { FileNode, QualityStatus } from '../../../../types/index.ts';
import { MetallurgicalDataDisplay } from './MetallurgicalDataDisplay.tsx';

interface InspectionSidebarProps {
  file: FileNode;
  isProcessing: boolean;
  onAction: (status: QualityStatus, reason?: string) => Promise<void>;
  onClose: () => void;
  onPreview: (file: FileNode) => void;
  onDownload: (file: FileNode) => void;
}

export const InspectionSidebar: React.FC<InspectionSidebarProps> = ({
  file,
  isProcessing,
  onAction,
  onClose,
  onPreview,
  onDownload
}) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const metadata = file.metadata;

  const handleApprove = () => onAction(QualityStatus.APPROVED);
  const handleReject = () => {
    if (!rejectionReason.trim()) return;
    onAction(QualityStatus.REJECTED, rejectionReason);
  };

  return (
    <aside className="w-96 bg-white border-l border-slate-200 shadow-2xl flex flex-col h-full z-20">
      <SidebarHeader fileName={file.name} onClose={onClose} />

      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        <StatusMonitor status={metadata?.status} />

        {/* ALERTA DE VISUALIZAÇÃO DO CLIENTE (PASSO 1) */}
        {metadata?.viewedAt && (
           <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-3">
              <Clock size={16} className="text-emerald-600" />
              <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-tight">
                Visualizado pelo cliente em {new Date(metadata.viewedAt).toLocaleDateString()}
              </p>
           </div>
        )}

        {/* EXIBIÇÃO DE FEEDBACK DO CLIENTE (PASSO 2 E 3) */}
        {/* Fix: Ensured clientObservations is available on SteelBatchMetadata type and added safety check */}
        {metadata?.clientObservations && (
          <div className="p-4 bg-orange-50 rounded-2xl border-2 border-orange-200 space-y-3 animate-pulse">
            <h5 className="text-[10px] font-black text-orange-700 uppercase tracking-widest flex items-center gap-2">
              <MessageSquare size={14} /> Contestação do Cliente
            </h5>
            <p className="text-xs text-orange-900 font-medium italic leading-relaxed">
              "{metadata?.clientObservations}"
            </p>
          </div>
        )}

        {!showRejectForm ? (
          <DecisionEngine 
            isProcessing={isProcessing} 
            status={metadata?.status} 
            onApprove={handleApprove}
            onRejectRequest={() => setShowRejectForm(true)}
          />
        ) : (
          <RejectionAuditForm 
            value={rejectionReason} 
            onChange={setRejectionReason} 
            onCancel={() => setShowRejectForm(false)}
            onConfirm={handleReject}
          />
        )}

        <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[3px] text-slate-400 flex items-center gap-2">
                <History size={14} /> Laudo Metalúrgico
            </h4>
            <MetallurgicalDataDisplay 
                chemical={metadata?.chemicalComposition} 
                mechanical={metadata?.mechanicalProperties} 
            />
        </div>

        <TraceabilityLog metadata={metadata} />
      </div>

      <SidebarFooter onPreview={() => onPreview(file)} onDownload={() => onDownload(file)} />
    </aside>
  );
};

const SidebarHeader: React.FC<{ fileName: string; onClose: () => void }> = ({ fileName, onClose }) => (
  <header className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
    <div className="flex items-center gap-3 overflow-hidden">
      <div className="p-2 bg-blue-100 text-[var(--color-detail-blue)] rounded-lg shrink-0 shadow-sm"><FileText size={18} /></div>
      <p className="text-sm font-black text-slate-800 truncate">{fileName}</p>
    </div>
    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-full transition-all"><X size={20}/></button>
  </header>
);

const StatusMonitor: React.FC<{ status?: string }> = ({ status }) => {
    const isApproved = status === QualityStatus.APPROVED;
    const isRejected = status === QualityStatus.REJECTED;
    const isToDelete = status === QualityStatus.TO_DELETE;

    return (
        <div className={`p-5 rounded-2xl text-white relative overflow-hidden shadow-lg ${
            isApproved ? 'bg-emerald-600' : isRejected ? 'bg-red-600' : isToDelete ? 'bg-slate-700' : 'bg-[var(--color-primary-dark-blue)]'
        }`}>
            <div className="relative z-10">
                <span className="text-[9px] font-black uppercase tracking-widest opacity-50 block mb-2">Protocolo de Conformidade</span>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider">{status ?? 'PENDING'}</span>
                </div>
            </div>
            <div className="absolute top-0 right-0 p-4 opacity-10"><ShieldCheck size={48} /></div>
        </div>
    );
};

const DecisionEngine: React.FC<{ isProcessing: boolean; status?: string; onApprove: () => void; onRejectRequest: () => void }> = ({ 
    isProcessing, status, onApprove, onRejectRequest 
}) => {
    const isApproved = status === QualityStatus.APPROVED;
    return (
        <div className="grid grid-cols-2 gap-3">
            <button 
                disabled={isProcessing || isApproved}
                onClick={onApprove}
                className="flex items-center justify-center gap-2 py-3.5 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all disabled:opacity-50 active:scale-95"
            >
                {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <><ShieldCheck size={16} /> Aprovar</>}
            </button>
            <button 
                disabled={isProcessing}
                onClick={onRejectRequest}
                className="flex items-center justify-center gap-2 py-3.5 bg-red-50 text-red-600 border border-red-100 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-100 transition-all active:scale-95"
            >
                <AlertCircle size={16} /> Recusar
            </button>
        </div>
    );
};

const RejectionAuditForm: React.FC<{ value: string; onChange: (v: string) => void; onCancel: () => void; onConfirm: () => void }> = ({ 
    value, onChange, onCancel, onConfirm 
}) => (
  <div className="space-y-4 p-4 bg-red-50 rounded-2xl border border-red-100">
    <label className="text-[10px] font-black text-red-700 uppercase tracking-widest block ml-1">Observação de Não-Conformidade</label>
    <textarea 
      className="w-full p-4 bg-white border border-red-200 rounded-xl text-xs min-h-[100px] outline-none focus:ring-4 focus:ring-red-500/10 transition-all font-medium"
      placeholder="Justifique a rejeição deste certificado..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      autoFocus
    />
    <div className="flex gap-2">
      <button onClick={onCancel} className="flex-1 text-[10px] font-black text-slate-500 uppercase py-2">Cancelar</button>
      <button onClick={onConfirm} disabled={!value.trim()} className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-black text-[10px] uppercase tracking-widest shadow-md">Confirmar</button>
    </div>
  </div>
);

const TraceabilityLog: React.FC<{ metadata: any }> = ({ metadata }) => (
  <section className="space-y-4 pt-4 border-t border-slate-100">
    <div className="flex items-center gap-2 text-slate-400">
      <Tag size={14} />
      <span className="text-[10px] font-black uppercase tracking-[2px]">Rastreabilidade Industrial</span>
    </div>
    <div className="grid grid-cols-2 gap-4">
       <div className="space-y-1">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Lote / Corrida</p>
          <p className="text-xs font-bold text-slate-700 font-mono">{metadata?.batchNumber || 'N/A'}</p>
       </div>
       <div className="space-y-1">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Classe Mat. </p>
          <p className="text-xs font-bold text-slate-700">{metadata?.grade || 'N/A'}</p>
       </div>
    </div>
  </section>
);

const SidebarFooter: React.FC<{ onPreview: () => void; onDownload: () => void }> = ({ onPreview, onDownload }) => (
  <footer className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-2">
    <button onClick={onPreview} className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-[var(--color-primary-dark-blue)] text-white rounded-xl text-[10px] font-black uppercase tracking-[3px] hover:bg-slate-800 transition-all active:scale-95">
        <Eye size={16} /> Ver PDF
    </button>
    <button onClick={onDownload} className="p-3.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-blue-600 transition-all"><Download size={20}/></button>
  </footer>
);