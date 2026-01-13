
import React from 'react';
import { X, MessageSquare, AlertCircle, Clock, CheckCircle2, User, Building2, Tag, CalendarDays } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SupportTicket } from '../../../types.ts';

interface ClientTicketDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: SupportTicket | null;
}

export const ClientTicketDetailsModal: React.FC<ClientTicketDetailsModalProps> = ({ isOpen, onClose, ticket }) => {
  const { t } = useTranslation();
  
  if (!isOpen || !ticket) return null;

  const getStatusBadge = (status: SupportTicket['status']) => {
    switch (status) {
      case 'OPEN': return <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-100"><AlertCircle size={12} aria-hidden="true" /> {t('admin.tickets.status.OPEN')}</span>;
      case 'IN_PROGRESS': return <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100"><Clock size={12} aria-hidden="true" /> {t('admin.tickets.status.IN_PROGRESS')}</span>;
      case 'RESOLVED': return <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100"><CheckCircle2 size={12} aria-hidden="true" /> {t('admin.tickets.status.RESOLVED')}</span>;
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-in fade-in duration-200" role="dialog" aria-modal="true" aria-labelledby="ticket-details-title">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
                <MessageSquare className="text-blue-600" size={24} aria-hidden="true" />
            </div>
            <div>
                <h2 id="ticket-details-title" className="text-xl font-bold text-slate-800">{t('dashboard.ticket.details')} #{ticket.id.slice(-6)}</h2>
                <p className="text-sm text-slate-500">{ticket.subject}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all" aria-label={t('common.close')}>
            <X size={24} aria-hidden="true" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            
            {/* Ticket Info */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-inner">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('dashboard.ticket.updatedStatus')}</p>
                    {getStatusBadge(ticket.status)}
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-inner">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('dashboard.ticket.priority')}</p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        ticket.priority === 'CRITICAL' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}>{t(`admin.tickets.priority.${ticket.priority}`)}</span>
                </div>
            </div>

            {/* User & Client Info */}
            <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 text-slate-400">
                    <User size={14} aria-hidden="true" />
                    <span className="text-[10px] font-black uppercase tracking-[2px]">{t('dashboard.ticket.requester')}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 border border-slate-100 rounded-xl bg-white shadow-sm">
                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">{t('dashboard.ticket.user')}</p>
                        <p className="text-xs font-bold text-slate-800">{ticket.userName}</p>
                    </div>
                    <div className="p-3 border border-slate-100 rounded-xl bg-white shadow-sm">
                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">{t('dashboard.ticket.company')}</p>
                        <p className="text-xs font-bold text-blue-600">{ticket.clientName || t('common.na')}</p>
                    </div>
                </div>
            </div>

            {/* Description */}
            <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 text-slate-400">
                    <Tag size={14} aria-hidden="true" />
                    <span className="text-[10px] font-black uppercase tracking-[2px]">{t('dashboard.ticket.details')}</span>
                </div>
                <p className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-700 leading-relaxed min-h-[80px]">
                    {ticket.description}
                </p>
            </div>

            {/* Resolution Note (if available) */}
            {ticket.resolutionNote && (
                <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-2 text-slate-400">
                        <CheckCircle2 size={14} aria-hidden="true" />
                        <span className="text-[10px] font-black uppercase tracking-[2px]">{t('dashboard.ticket.resolutionNote')}</span>
                    </div>
                    <p className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-sm text-emerald-800 leading-relaxed min-h-[50px] italic">
                        "{ticket.resolutionNote}"
                    </p>
                </div>
            )}

            {/* History */}
            <div className="pt-2">
                <div className="flex items-center gap-2 text-slate-400 mb-3">
                    <CalendarDays size={14} aria-hidden="true" />
                    <span className="text-[10px] font-black uppercase tracking-[2px]">{t('dashboard.ticket.history')}</span>
                </div>
                <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex justify-between"><span>{t('dashboard.ticket.createdBy', { userName: ticket.userName })}</span><span className="font-mono">{ticket.createdAt}</span></div>
                    {ticket.updatedAt && <div className="flex justify-between"><span>{t('dashboard.lastUpdate')}</span><span className="font-mono">{ticket.updatedAt}</span></div>}
                </div>
            </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
            aria-label={t('common.close')}
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
};