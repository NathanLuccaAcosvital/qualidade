
import React from 'react';
import { X, Eye, Info } from 'lucide-react';
import { AuditLog } from '../../../../types/index.ts';

interface InvestigationModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: { targetLog: AuditLog | null };
  t: any;
}

export const InvestigationModal: React.FC<InvestigationModalProps> = ({ isOpen, onClose, data, t }) => {
  if (!isOpen || !data.targetLog) return null;
  const log = data.targetLog;

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 flex flex-col">
        <header className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 text-[var(--color-detail-blue)] rounded-2xl shadow-sm"><Eye size={22}/></div>
            <div>
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Investigação Técnica</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Log ID: {log.id.split('-')[0]}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-slate-200 rounded-full transition-colors text-slate-400"><X size={24}/></button>
        </header>
        
        <div className="p-8 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-2 gap-8">
            <LogInfo label="Operador" value={`${log.userName} (${log.userRole})`} />
            <LogInfo label="Ação Protocolada" value={log.action} />
            <LogInfo label="Recurso Alvo" value={log.target} />
            <LogInfo label="Estampa de Tempo" value={new Date(log.timestamp).toLocaleString()} />
          </div>

          <div className="p-5 bg-[var(--color-primary-dark-blue)] rounded-3xl relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-[var(--color-detail-blue)]"><Info size={40} /></div>
            <p className="text-[10px] font-black text-[var(--color-detail-blue)] uppercase tracking-[3px] mb-4">Payload de Auditoria</p>
            <pre className="text-[11px] text-slate-300 font-mono overflow-x-auto custom-scrollbar leading-relaxed">
              {JSON.stringify(log.metadata, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

const LogInfo = ({ label, value }: { label: string; value: string }) => (
  <div className="space-y-1.5">
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[3px]">{label}</p>
    <p className="text-sm font-bold text-slate-800 leading-tight">{value}</p>
  </div>
);
