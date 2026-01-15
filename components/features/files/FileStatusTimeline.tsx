
import React, { useMemo } from 'react';
import { CheckCircle2, Clock, XCircle, User, Calendar, Info, LucideIcon } from 'lucide-react';
import { FileNode } from '../../../types/index.ts';
import { useTranslation } from 'react-i18next';

interface FileStatusTimelineProps {
  file: FileNode;
}

interface TimelineEvent {
  id: string;
  title: string;
  date: string | null;
  user: string | null;
  icon: LucideIcon;
  color: string;
  bg: string;
  note?: string;
}

/**
 * Timeline de Ciclo de Vida do Certificado (SRP)
 * Representação visual da jornada de conformidade do documento.
 */
export const FileStatusTimeline: React.FC<FileStatusTimelineProps> = ({ file }) => {
  const { t } = useTranslation();
  
  // Memoização da estratégia de construção de eventos (Performance & Clean Code)
  const timelineEvents = useMemo(() => buildTimelineEvents(file, t), [file, t]);

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-2 text-slate-400">
        <Calendar size={14} />
        <h4 className="text-[10px] font-black uppercase tracking-[3px]">{t('dashboard.fileStatusTimeline')}</h4>
      </header>

      <div className="relative pl-8 space-y-8 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-px before:bg-slate-200">
        {timelineEvents.map((event) => (
          <TimelineItem key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
};

/* --- Helpers e Sub-componentes (Clean Code) --- */

const buildTimelineEvents = (file: FileNode, t: any): TimelineEvent[] => {
  const events: TimelineEvent[] = [];

  // 1. Evento de Upload (Origem)
  events.push({
    id: 'upload',
    title: t('common.uploaded'),
    date: file.updatedAt,
    user: t('common.na'),
    icon: Clock,
    color: 'text-[var(--color-detail-blue)]',
    bg: 'bg-blue-50'
  });

  // 2. Evento de Auditoria Técnica
  if (file.metadata?.inspectedAt) {
    const isApproved = file.metadata.status === 'APPROVED';
    events.push({
      id: 'inspection',
      title: isApproved ? t('files.groups.approved') : t('files.groups.rejected'),
      date: file.metadata.inspectedAt,
      user: file.metadata.inspectedBy || 'Analista Técnico',
      icon: isApproved ? CheckCircle2 : XCircle,
      color: isApproved ? 'text-emerald-500' : 'text-red-500',
      bg: isApproved ? 'bg-emerald-50' : 'bg-red-50',
      note: file.metadata.rejectionReason
    });
  } else {
    // 3. Estado Pendente de Avaliação
    events.push({
      id: 'pending',
      title: t('files.pending'),
      date: null,
      user: null,
      icon: Info,
      color: 'text-orange-500',
      bg: 'bg-orange-50'
    });
  }

  return events;
};

const TimelineItem: React.FC<{ event: TimelineEvent }> = ({ event }) => {
    const Icon = event.icon;
    return (
        <div className="relative group animate-in slide-in-from-left-4 duration-500">
            {/* Indicador de Status */}
            <div className={`absolute -left-[33px] top-0 w-8 h-8 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10 transition-all group-hover:scale-110 group-hover:rotate-6 ${event.bg} ${event.color}`}>
                <Icon size={14} />
            </div>

            {/* Cartão de Detalhe */}
            <div className="bg-white rounded-2xl border border-slate-100 p-4 hover:shadow-md transition-all group-hover:border-slate-200">
                <div className="flex justify-between items-start mb-1 gap-4">
                    <p className={`text-xs font-black uppercase tracking-wider ${event.color}`}>{event.title}</p>
                    {event.date && (
                        <span className="text-[9px] font-mono text-slate-400 shrink-0">
                            {new Date(event.date).toLocaleString()}
                        </span>
                    )}
                </div>
                
                {event.user && (
                    <p className="text-[10px] text-slate-500 flex items-center gap-1.5 font-bold uppercase tracking-widest mt-1">
                        <User size={10} className="text-slate-300" /> {event.user}
                    </p>
                )}

                {event.note && (
                    <div className="mt-3 p-3 bg-red-50/50 rounded-xl border border-red-100 text-[10px] text-red-700 italic leading-relaxed shadow-inner">
                        "{event.note}"
                    </div>
                )}
            </div>
        </div>
    );
};
