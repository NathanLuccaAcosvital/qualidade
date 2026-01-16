import React from 'react';
import { CheckCircle2, Clock, AlertCircle, Trash2, LucideIcon } from 'lucide-react';
import { QualityStatus } from '../../../../types/enums.ts';

interface StatusConfig {
  icon: LucideIcon;
  color: string;
  label: string;
}

const STATUS_MAP: Record<string, StatusConfig> = {
  [QualityStatus.APPROVED]: { icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-50 border-emerald-100', label: 'Aprovado' },
  [QualityStatus.REJECTED]: { icon: AlertCircle, color: 'text-red-500 bg-red-50 border-red-100', label: 'Rejeitado' },
  [QualityStatus.PENDING]: { icon: Clock, color: 'text-orange-500 bg-orange-50 border-orange-100', label: 'Pendente' },
  [QualityStatus.TO_DELETE]: { icon: Trash2, color: 'text-slate-500 bg-slate-100 border-slate-200', label: 'Apagar' },
};

export const FileStatusBadge: React.FC<{ status?: string }> = ({ status }) => {
  const config = STATUS_MAP[status || ''] || STATUS_MAP[QualityStatus.PENDING];
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-1.5 px-2 py-0.5 border rounded-full text-[9px] font-black uppercase shadow-sm ${config.color}`}>
      <Icon size={12} />
      {config.label}
    </div>
  );
};