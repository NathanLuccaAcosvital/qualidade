import React from 'react';
import { useTranslation } from 'react-i18next';
import { FileNode } from '../../../types/index';
import { CheckCircle2, Hourglass, XCircle, Info, CalendarClock, UserCheck } from 'lucide-react';

interface FileStatusTimelineProps {
  file: FileNode;
}

export const FileStatusTimeline: React.FC<FileStatusTimelineProps> = ({ file }) => {
  const { t } = useTranslation();

  const statusHistory = [
    {
      step: 'UPLOADED',
      icon: CheckCircle2,
      label: 'common.uploaded',
      date: file.updatedAt,
      color: 'text-blue-500',
    },
    {
      step: 'PENDING',
      icon: Hourglass,
      label: 'files.groups.pending',
      date: undefined,
      color: 'text-orange-500',
      details: undefined,
    },
    {
      step: 'APPROVED',
      icon: CheckCircle2,
      label: 'files.groups.approved',
      date: file.metadata?.inspectedAt,
      color: 'text-emerald-500',
      details: file.metadata?.inspectedBy ? `${t('common.user')}: ${file.metadata.inspectedBy}` : undefined,
    },
    {
      step: 'REJECTED',
      icon: XCircle,
      label: 'files.groups.rejected',
      date: file.metadata?.inspectedAt,
      color: 'text-red-500',
      details: file.metadata?.rejectionReason ? `${t('quality.justification')}: ${file.metadata.rejectionReason}` : undefined,
    },
  ];

  const currentStatus = file.metadata?.status || 'PENDING';

  const determineStatusOrder = (step: string) => {
    if (step === 'UPLOADED') return 0;
    if (step === 'PENDING') return 1;
    if (step === 'APPROVED') return 2;
    if (step === 'REJECTED') return 2; // Both approved and rejected are final states
    return -1;
  };

  return (
    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-inner space-y-6" role="contentinfo" aria-label={t('dashboard.fileStatusTimeline')}>
      <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
        <CalendarClock size={20} className="text-blue-600" /> {t('dashboard.fileStatusTimeline')}
      </h3>
      <div className="relative pl-6">
        {statusHistory.map((statusItem, index) => {
          const isActive = (
            (statusItem.step === 'UPLOADED') ||
            (statusItem.step === 'PENDING' && determineStatusOrder(currentStatus) >= determineStatusOrder('PENDING')) ||
            (statusItem.step === 'APPROVED' && currentStatus === 'APPROVED') ||
            (statusItem.step === 'REJECTED' && currentStatus === 'REJECTED')
          );
          
          const isCompleted = (
            (statusItem.step === 'UPLOADED' && determineStatusOrder(currentStatus) >= determineStatusOrder('PENDING')) ||
            (statusItem.step === 'PENDING' && (currentStatus === 'APPROVED' || currentStatus === 'REJECTED')) ||
            (statusItem.step === 'APPROVED' && currentStatus === 'APPROVED') ||
            (statusItem.step === 'REJECTED' && currentStatus === 'REJECTED')
          );

          const isCurrent = (
            (statusItem.step === 'UPLOADED' && determineStatusOrder(currentStatus) === 0) || // Only uploaded, not yet pending
            (statusItem.step === 'PENDING' && currentStatus === 'PENDING') ||
            (statusItem.step === 'APPROVED' && currentStatus === 'APPROVED') ||
            (statusItem.step === 'REJECTED' && currentStatus === 'REJECTED')
          );

          const Icon = statusItem.icon;

          return (
            <div key={statusItem.step} className="flex items-start mb-8 last:mb-0 relative" role="listitem">
              {/* Vertical line */}
              {index < statusHistory.length - 1 && (
                <div className={`absolute left-2.5 top-6 h-full w-0.5 ${isCompleted ? 'bg-blue-300' : 'bg-slate-200'}`} aria-hidden="true"></div>
              )}
              {/* Dot / Icon */}
              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 relative z-10 ${isActive ? 'bg-blue-600' : 'bg-slate-300'}`}>
                {isCurrent && (
                  <span className="absolute inset-0 w-full h-full bg-blue-400 rounded-full animate-ping opacity-75" aria-hidden="true"></span>
                )}
                <Icon size={12} className="text-white" aria-hidden="true" />
              </div>
              {/* Content */}
              <div className={`ml-4 -mt-0.5 ${isActive ? 'text-slate-800' : 'text-slate-500'}`}>
                <p className={`font-bold text-sm ${isCurrent ? 'text-blue-700' : ''}`}>{t(statusItem.label)}</p>
                {statusItem.date && (
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <CalendarClock size={10} aria-hidden="true" />
                    {new Date(statusItem.date).toLocaleDateString()}
                  </p>
                )}
                {isCurrent && statusItem.details && (
                  <p className="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
                    <UserCheck size={10} aria-hidden="true" />
                    {statusItem.details}
                  </p>
                )}
                {isCurrent && currentStatus === 'REJECTED' && file.metadata?.rejectionReason && (
                  <p className="text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-100 mt-2">
                    "{file.metadata.rejectionReason}"
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
