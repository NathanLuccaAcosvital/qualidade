
import React, { useState } from 'react';
import { X, Download, FileText, Tag, ShieldCheck, AlertCircle, Eye, Loader2, History } from 'lucide-react';
import { FileNode } from '../../../../types/index.ts';
import { QualityStatus } from '../../../../types/metallurgy.ts';
import { MetallurgicalDataDisplay } from './MetallurgicalDataDisplay.tsx';

interface InspectionSidebarProps {
  file: FileNode;
  isProcessing: boolean;
  onAction: (status: QualityStatus, reason?: string) => Promise<void>;
  onClose: () => void;
  onPreview: (file: FileNode) => void;
  onDownload: (file: FileNode) => void;
}

/**
 * InspectionSidebar (Facade Visual)
 * Agrega sub-componentes de inspeção técnica seguindo o SRP.
 */
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

/* --- Sub-componentes Especializados --- */

const SidebarHeader: React.FC<{ fileName: string; onClose: () => void }> = ({ fileName, onClose }) => (
  <header className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
    <div className="flex items-center gap-3 overflow-hidden">
      <div className="p-2 bg-blue-100 text-[var(--color-detail-blue)] rounded-lg shrink-0 shadow-sm"><FileText size={18} /></div>
      <p className="text-sm font-black text-slate-800 truncate">{fileName}</p>
    </div>
    <button 
        onClick={onClose} 
        className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-full transition-all"
        aria-label="Fechar Painel"
    >
        <X size={20}/>
    </button>
  </header>
);

const StatusMonitor: React.FC<{ status?: string }> = ({ status }) => {
    const isApproved = status === QualityStatus.APPROVED;
    return (
        <div className="bg-[var(--color-primary-dark-blue)] p-5 rounded-2xl text-white relative overflow-hidden shadow-lg">
            <div className="relative z-10">
                <span className="text-[9px] font-black uppercase tracking-widest opacity-50 block mb-2">Conformidade Global</span>
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full animate-pulse ${isApproved ? 'bg-emerald-500' : 'bg-orange-500'}`} />
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
                className="flex items-center justify-center gap-2 py-3.5 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/10 active:scale-95"
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
  <div className="space-y-4 p-4 bg-red-50 rounded-2xl border border-red-100 animate-in zoom-in-95">
    <label className="text-[10px] font-black text-red-700 uppercase tracking-widest block ml-1">Motivo da Não-Conformidade</label>
    <textarea 
      className="w-full p-4 bg-white border border-red-200 rounded-xl text-xs min-h-[120px] outline-none focus:ring-4 focus:ring-red-500/10 transition-all font-medium"
      placeholder="Descreva detalhadamente o desvio técnico..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      autoFocus
    />
    <div className="flex gap-2">
      <button 
        onClick={onCancel} 
        className="flex-1 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:bg-slate-200/50 rounded-lg py-2 transition-colors"
      >
        Cancelar
      </button>
      <button 
        onClick={onConfirm} 
        disabled={!value.trim()}
        className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all disabled:opacity-50 shadow-md shadow-red-600/20"
      >
        Confirmar
      </button>
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
    <button 
        onClick={onPreview} 
        className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-[var(--color-primary-dark-blue)] text-white rounded-xl text-[10px] font-black uppercase tracking-[3px] shadow-xl shadow-[var(--color-primary-dark-blue)]/20 hover:bg-slate-800 transition-all active:scale-95"
    >
        <Eye size={16} /> Ver Certificado
    </button>
    <button 
        onClick={onDownload} 
        className="p-3.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-[var(--color-detail-blue)] hover:border-blue-200 transition-all shadow-sm"
        title="Download PDF"
    >
        <Download size={20}/>
    </button>
  </footer>
);
