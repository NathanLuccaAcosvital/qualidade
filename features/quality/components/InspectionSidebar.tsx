import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileNode, FileType, FileMetadata } from '../../../types/index';
import {
  X, Download, CheckCircle, XCircle, AlertTriangle, Info, Tag, FileText, MessageSquare, Loader2, Hourglass
} from 'lucide-react';

interface InspectionSidebarProps {
  inspectorFile: FileNode;
  onInspectAction: (action: 'APPROVE' | 'REJECT', rejectionReason?: string) => Promise<void>;
  onDownload: (file: FileNode) => Promise<void>;
  onSetPreviewFile: (file: FileNode | null) => void;
  onSetInspectorFile: (file: FileNode | null) => void; // Used to navigate back or clear inspection
  onSetStatusToPending: (file: FileNode) => Promise<void>;
  isProcessing: boolean;
  rejectionReason: string; // NEW: Prop for rejection reason
  setRejectionReason: (reason: string) => void; // NEW: Prop setter for rejection reason
}

export const InspectionSidebar: React.FC<InspectionSidebarProps> = ({
  inspectorFile,
  onInspectAction,
  onDownload,
  onSetPreviewFile,
  onSetInspectorFile,
  onSetStatusToPending,
  isProcessing,
  rejectionReason, // NEW
  setRejectionReason, // NEW
}) => {
  const { t } = useTranslation();
  const [isRejecting, setIsRejecting] = useState(false); // Local UI state for showing/hiding rejection form

  const renderStatusBadge = (status?: string) => {
    if (!status) return (
      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-orange-50 text-orange-600 border border-orange-100 flex items-center gap-1.5 whitespace-nowrap" aria-label={t('files.pending')}>
        <Hourglass size={10} aria-hidden="true" /> {t('files.pending')}
      </span>
    );

    let displayStatusText: string;
    let bgColor: string;
    let textColor: string;
    let borderColor: string;
    let Icon: React.ElementType;
    let ariaLabel: string;

    switch (status) {
      case 'APPROVED':
        displayStatusText = t('files.groups.approved');
        bgColor = 'bg-emerald-50';
        textColor = 'text-emerald-600';
        borderColor = 'border-emerald-100';
        Icon = CheckCircle;
        ariaLabel = t('files.groups.approved');
        break;
      case 'PENDING':
        displayStatusText = t('files.groups.pending');
        bgColor = 'bg-orange-50';
        textColor = 'text-orange-600';
        borderColor = 'border-orange-100';
        Icon = Hourglass;
        ariaLabel = t('files.groups.pending');
        break;
      case 'REJECTED':
        displayStatusText = t('files.groups.rejected');
        bgColor = 'bg-red-50';
        textColor = 'text-red-600';
        borderColor = 'border-red-100';
        Icon = XCircle;
        ariaLabel = t('files.groups.rejected');
        break;
      default:
        displayStatusText = t('files.pending'); // Fallback
        bgColor = 'bg-orange-50';
        textColor = 'text-orange-600';
        borderColor = 'border-orange-100';
        Icon = Hourglass;
        ariaLabel = t('files.pending');
        break;
    }

    return (
      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${bgColor} ${textColor} ${borderColor} flex items-center gap-1.5 whitespace-nowrap`} aria-label={ariaLabel}>
        <Icon size={10} aria-hidden="true" /> {displayStatusText}
      </span>
    );
  };

  return (
    <div className="w-80 bg-white rounded-2xl border border-slate-200 shadow-xl flex flex-col animate-in slide-in-from-right-10 overflow-hidden" role="complementary" aria-labelledby="inspector-file-name">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div className="flex items-center gap-2 overflow-hidden">
          <FileText size={16} className="text-blue-500 shrink-0" aria-hidden="true" />
          <p id="inspector-file-name" className="text-sm font-bold truncate" title={inspectorFile.name}>{inspectorFile.name}</p>
        </div>
        <button onClick={() => onSetInspectorFile(null)} className="p-1 hover:bg-slate-200 rounded-lg text-slate-400 transition-colors" aria-label={t('common.close')}><X size={18} aria-hidden="true" /></button>
      </div>

      <div className="p-4 flex-1 space-y-6 overflow-y-auto custom-scrollbar">
        <div className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-inner">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">{t('quality.currentStatus')}</span>
            <div className="flex items-center gap-2">
              {renderStatusBadge(inspectorFile.metadata?.status)}
            </div>
          </div>

          <div className="space-y-3">
            {!isRejecting ? (
              <div className="grid grid-cols-2 gap-2">
                <button
                  disabled={isProcessing || inspectorFile.metadata?.status === 'APPROVED'}
                  onClick={() => onInspectAction('APPROVE')}
                  className="flex flex-col items-center justify-center p-3 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all disabled:opacity-30 shadow-sm"
                  aria-label={t('quality.approve')}
                >
                  <CheckCircle size={18} aria-hidden="true" className="mb-1" />
                  <span className="text-[10px] font-bold uppercase">{t('quality.approve')}</span>
                </button>
                <button
                  disabled={isProcessing || inspectorFile.metadata?.status === 'REJECTED'}
                  onClick={() => setIsRejecting(true)}
                  className="flex flex-col items-center justify-center p-3 rounded-xl border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition-all disabled:opacity-30 shadow-sm"
                  aria-label={t('quality.reject')}
                >
                  <XCircle size={18} aria-hidden="true" className="mb-1" />
                  <span className="text-[10px] font-bold uppercase">{t('quality.reject')}</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3 p-3 bg-red-50 rounded-xl border border-red-100 animate-in slide-in-from-top-2">
                <div className="flex items-center gap-2 text-red-700 font-bold text-xs uppercase mb-1">
                  <MessageSquare size={14} aria-hidden="true" /> {t('quality.justification')}
                </div>
                <textarea
                  className="w-full p-3 bg-white border border-red-200 rounded-lg text-xs h-24 resize-none focus:ring-2 focus:ring-red-500 outline-none"
                  placeholder={t('quality.rejectionReasonPlaceholder')}
                  value={rejectionReason} // Use prop
                  onChange={e => setRejectionReason(e.target.value)} // Use prop setter
                  aria-label={t('quality.rejectionReasonPlaceholder')}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsRejecting(false)}
                    className="flex-1 py-2 text-[10px] font-bold text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
                    aria-label={t('common.cancel')}
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    onClick={() => onInspectAction('REJECT', rejectionReason)}
                    className="flex-1 py-2 text-[10px] font-bold text-white bg-red-600 rounded-lg hover:bg-red-700"
                    aria-label={t('quality.confirmRejection')}
                  >
                    {t('quality.confirmRejection')}
                  </button>
                </div>
              </div>
            )}
            {inspectorFile.metadata?.status !== 'PENDING' && (
              <button
                onClick={() => onSetStatusToPending(inspectorFile)}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 transition-all disabled:opacity-30 shadow-sm mt-3"
                aria-label={t('quality.markAsPending')}
              >
                <Hourglass size={18} aria-hidden="true" className="mb-1" />
                <span className="text-[10px] font-bold uppercase">{t('quality.markAsPending')}</span>
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-slate-400">
            <Tag size={14} aria-hidden="true" />
            <span className="text-[10px] font-black uppercase tracking-[2px]">{t('quality.batchData')}</span>
          </div>
          <div className="grid grid-cols-1 gap-3">
            <div className="p-3 border border-slate-100 rounded-xl bg-white shadow-sm">
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">{t('quality.productLabel')}</p>
              <p className="text-xs font-bold text-slate-800">{inspectorFile.metadata?.productName || t('common.na')}</p>
            </div>
            <div className="p-3 border border-slate-100 rounded-xl bg-white shadow-sm">
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">{t('quality.batchLabel')}</p>
              <p className="text-xs font-mono font-black text-blue-600">{inspectorFile.metadata?.batchNumber || '-'}</p>
            </div>
            <div className="p-3 border border-slate-100 rounded-xl bg-white shadow-sm">
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">{t('quality.invoiceLabel')}</p>
              <p className="text-xs font-bold text-slate-800">{inspectorFile.metadata?.invoiceNumber || '-'}</p>
            </div>
          </div>
        </div>

        {inspectorFile.metadata?.inspectedAt && (
          <div className="pt-4 flex flex-col gap-1 border-t border-slate-50">
            <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">{t('quality.lastAnalysis')}</p>
            <p className="text-[10px] text-slate-500 italic flex items-center gap-1.5">
              <Info size={12} aria-hidden="true" className="text-blue-500" />
              {inspectorFile.metadata.inspectedBy} • {new Date(inspectorFile.metadata.inspectedAt).toLocaleString()}
            </p>
            {inspectorFile.metadata.rejectionReason && (
              <p className="mt-2 text-[10px] text-red-600 bg-red-50 p-2 rounded-lg border border-red-100 font-medium">
                " {inspectorFile.metadata.rejectionReason} "
              </p>
            )}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-2">
        <button onClick={() => onSetPreviewFile(inspectorFile)} className="flex-1 py-3 bg-slate-950 text-white rounded-xl text-xs font-bold shadow-lg hover:bg-slate-800 active:scale-95 transition-all uppercase tracking-widest" aria-label={t('quality.viewPDF')}>{t('quality.viewPDF')}</button>
        <button onClick={() => onDownload(inspectorFile)} className="p-3 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-blue-600 transition-all shadow-sm" aria-label={t('common.download')}><Download size={18} aria-hidden="true" /></button>
      </div>
    </div>
  );
};