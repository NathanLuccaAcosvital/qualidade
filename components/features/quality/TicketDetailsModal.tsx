import React, { useState, useEffect } from 'react';
import { X, MessageSquare, AlertCircle, Clock, CheckCircle2, User, Building2, Tag, CalendarDays, Send, ShieldAlert, AlertTriangle, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SupportTicket, UserRole } from '../../../types.ts';
import { adminService } from '../../../lib/services/index.ts';
import { useAuth } from '../../../context/authContext.tsx';
import { useToast } from '../../../context/notificationContext.tsx'; // Importado

interface TicketDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: SupportTicket | null;
  onTicketUpdated: () => void; // Callback para notificar a lista pai de uma atualização
}

export const TicketDetailsModal: React.FC<TicketDetailsModalProps> = ({ isOpen, onClose, ticket, onTicketUpdated }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { showToast } = useToast(); // Hook useToast
  
  const [currentStatus, setCurrentStatus] = useState<SupportTicket['status']>(ticket?.status || 'OPEN');
  const [resolutionNote, setResolutionNote] = useState(ticket?.resolutionNote || '');
  const [escalationReason, setEscalationReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (ticket) {
      setCurrentStatus(ticket.status);
      setResolutionNote(ticket.resolutionNote || '');
      setEscalationReason('');
    }
  }, [ticket]);

  if (!isOpen || !ticket) return null;

  const handleUpdateStatus = async (status: SupportTicket['status']) => {
    if (!user) return;
    if (status === 'RESOLVED' && !resolutionNote.trim()) {
      showToast("É necessário adicionar uma nota de resolução para fechar o chamado.", 'warning');
      return;
    }

    setIsProcessing(true);
    try {
      console.log('Atualizando ticket:', ticket.id, 'para status:', status, 'com nota:', resolutionNote);
      await adminService.updateTicketStatus(user, ticket.id, status, resolutionNote);
      onTicketUpdated(); // Notifica o componente pai
      onClose();
      showToast("Status do chamado atualizado com sucesso!", 'success');
    } catch (err: any) {
      showToast(`Erro ao atualizar status: ${err.message}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEscalate = async () => {
    if (!user) return;
    if (!escalationReason.trim()) {
        showToast("Por favor, forneça um motivo para o escalonamento.", 'warning');
        return;
    }

    setIsProcessing(true);
    try {
        console.log('Escalonando ticket:', ticket.id, 'motivo:', escalationReason);
        await adminService.escalateTicketToAdmin(user, ticket.id, escalationReason);
        onTicketUpdated(); // Notifica o componente pai
        onClose();
        showToast("Chamado escalado para administração com sucesso!", 'success');
    } catch (err: any) {
        showToast(`Erro ao escalar chamado: ${err.message}`, 'error');
    } finally {
        setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: SupportTicket['status']) => {
    switch (status) {
      case 'OPEN': return <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-100"><AlertCircle size={12} /> {t('admin.tickets.status.OPEN')}</span>;
      case 'IN_PROGRESS': return <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100"><Clock size={12} /> {t('admin.tickets.status.IN_PROGRESS')}</span>;
      case 'RESOLVED': return <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100"><CheckCircle2 size={12} /> {t('admin.tickets.status.RESOLVED')}</span>;
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
                <MessageSquare className="text-blue-600" size={24} />
            </div>
            <div>
                <h2 className="text-xl font-bold text-slate-800">Chamado #{ticket.id.slice(-6)}</h2>
                <p className="text-sm text-slate-500">{ticket.subject}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            
            {/* Ticket Info */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-inner">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status Atual</p>
                    {getStatusBadge(currentStatus)}
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-inner">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Prioridade</p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        ticket.priority === 'CRITICAL' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}>{ticket.priority}</span>
                </div>
            </div>

            {/* User & Client Info */}
            <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 text-slate-400">
                    <User size={14} />
                    <span className="text-[10px] font-black uppercase tracking-[2px]">Solicitante</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 border border-slate-100 rounded-xl bg-white shadow-sm">
                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Usuário</p>
                        <p className="text-xs font-bold text-slate-800">{ticket.userName}</p>
                    </div>
                    <div className="p-3 border border-slate-100 rounded-xl bg-white shadow-sm">
                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Empresa</p>
                        <p className="text-xs font-bold text-blue-600">{ticket.clientName || 'N/A'}</p>
                    </div>
                </div>
            </div>

            {/* Description */}
            <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 text-slate-400">
                    <Tag size={14} />
                    <span className="text-[10px] font-black uppercase tracking-[2px]">Detalhes do Chamado</span>
                </div>
                <p className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-700 leading-relaxed min-h-[80px]">
                    {ticket.description}
                </p>
            </div>

            {/* History */}
            <div className="pt-2">
                <div className="flex items-center gap-2 text-slate-400 mb-3">
                    <CalendarDays size={14} />
                    <span className="text-[10px] font-black uppercase tracking-[2px]">Histórico</span>
                </div>
                <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex justify-between"><span>Criado por {ticket.userName}</span><span className="font-mono">{ticket.createdAt}</span></div>
                    {ticket.updatedAt && <div className="flex justify-between"><span>Última atualização</span><span className="font-mono">{ticket.updatedAt}</span></div>}
                </div>
            </div>

            {/* Resolution/Status Update */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="space-y-1">
                    <label className="text-sm font-bold text-slate-700">Atualizar Status</label>
                    <select 
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-semibold"
                        value={currentStatus}
                        onChange={e => setCurrentStatus(e.target.value as SupportTicket['status'])}
                        disabled={isProcessing}
                    >
                        <option value="OPEN">{t('admin.tickets.status.OPEN')}</option>
                        <option value="IN_PROGRESS">{t('admin.tickets.status.IN_PROGRESS')}</option>
                        <option value="RESOLVED">{t('admin.tickets.status.RESOLVED')}</option>
                    </select>
                </div>
                {currentStatus === 'RESOLVED' && (
                    <div className="space-y-1 animate-in fade-in slide-in-from-top-2">
                        <label className="text-sm font-bold text-slate-700">Nota de Resolução {t('common.required')}</label>
                        <textarea 
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm h-24 resize-none"
                            placeholder="Descreva a solução aplicada ao chamado..."
                            value={resolutionNote}
                            onChange={e => setResolutionNote(e.target.value)}
                            required
                            disabled={isProcessing}
                        />
                    </div>
                )}
            </div>

            {/* Escalation to Admin */}
            {ticket.flow === 'CLIENT_TO_QUALITY' && user?.role === UserRole.QUALITY && (
                 <div className="bg-red-50 p-4 rounded-xl border border-red-100 space-y-3 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-3 text-red-700 font-bold">
                        <ShieldAlert size={18} /> Escalonar para Administração
                    </div>
                    <p className="text-xs text-red-600 leading-relaxed">Se o chamado exige intervenção administrativa ou técnica de nível 3, você pode escalá-lo. Um motivo é obrigatório.</p>
                    <textarea 
                        className="w-full px-4 py-2.5 bg-white border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm h-20 resize-none"
                        placeholder="Motivo do escalonamento para Admin..."
                        value={escalationReason}
                        onChange={e => setEscalationReason(e.target.value)}
                        disabled={isProcessing}
                    />
                    <button 
                        onClick={handleEscalate} 
                        disabled={isProcessing || !escalationReason.trim()}
                        className="w-full py-2.5 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <><AlertTriangle size={16} /> Escalar Chamado</>}
                    </button>
                 </div>
            )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors"
            disabled={isProcessing}
          >
            {t('common.cancel')}
          </button>
          <button 
            type="submit" 
            onClick={() => handleUpdateStatus(currentStatus)}
            className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50 flex items-center justify-center gap-2"
            disabled={isProcessing || (currentStatus === 'RESOLVED' && !resolutionNote.trim())}
          >
            {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <><CheckCircle2 size={16} /> Salvar Alterações</>}
          </button>
        </div>
      </div>
    </div>
  );
};