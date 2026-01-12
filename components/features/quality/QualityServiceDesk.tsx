import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Inbox, MessageSquare, Clock, CheckCircle2, AlertCircle, User, Building2, ExternalLink, Loader2, Filter } from 'lucide-react';
import { SupportTicket } from '../../../types.ts';
import { adminService } from '../../../lib/services/index.ts';
import { useAuth } from '../../../context/authContext.tsx';
import { TicketDetailsModal } from './TicketDetailsModal.tsx'; // Importa o novo modal

interface QualityServiceDeskProps {
  refreshTrigger: number;
  onRefresh: () => void;
}

export const QualityServiceDesk: React.FC<QualityServiceDeskProps> = ({ refreshTrigger, onRefresh }) => {
  const { user } = useAuth();
  const { t } = useTranslation();

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'>('ALL');

  const [isTicketDetailsModalOpen, setIsTicketDetailsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  const fetchTickets = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const fetchedTickets = await adminService.getQualityInbox({ search: searchTerm, status: statusFilter });
      // Sort by creation date, most recent first. Also, open/in-progress tickets first.
      const sortedTickets = fetchedTickets.sort((a, b) => {
        const statusOrder = { 'OPEN': 1, 'IN_PROGRESS': 2, 'RESOLVED': 3 };
        if (statusOrder[a.status] !== statusOrder[b.status]) {
            return statusOrder[a.status] - statusOrder[b.status];
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      setTickets(sortedTickets);
    } catch (err) {
      console.error("Erro ao carregar tickets da caixa de entrada da qualidade:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user, searchTerm, statusFilter]);

  useEffect(() => {
    const handler = setTimeout(() => {
        fetchTickets();
    }, 300); // Debounce search input
    return () => clearTimeout(handler);
  }, [fetchTickets, refreshTrigger]);

  const openTicketDetails = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setIsTicketDetailsModalOpen(true);
  };

  const handleTicketUpdated = () => {
    onRefresh(); // Notifica o componente pai (Quality.tsx) para atualizar os contadores se necessário
    fetchTickets(); // Recarrega a lista de tickets para refletir as mudanças
  };

  const getStatusBadge = (status: SupportTicket['status']) => {
    switch (status) {
      case 'OPEN': return <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100"><AlertCircle size={10} /> {t('admin.tickets.status.OPEN')}</span>;
      case 'IN_PROGRESS': return <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100"><Clock size={10} /> {t('admin.tickets.status.IN_PROGRESS')}</span>;
      case 'RESOLVED': return <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100"><CheckCircle2 size={10} /> {t('admin.tickets.status.RESOLVED')}</span>;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col h-full gap-4 animate-in fade-in duration-300">
      <TicketDetailsModal 
        isOpen={isTicketDetailsModalOpen} 
        onClose={() => setIsTicketDetailsModalOpen(false)} 
        ticket={selectedTicket} 
        onTicketUpdated={handleTicketUpdated}
      />

      <div className="bg-white p-4 rounded-2xl border shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por assunto, cliente ou usuário..." 
            className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm w-full outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter size={18} className="text-slate-400 shrink-0"/>
          <select 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value as any)}
            className="flex-1 md:flex-none px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="ALL">{t('common.all')}</option>
            <option value="OPEN">{t('admin.tickets.status.OPEN')}</option>
            <option value="IN_PROGRESS">{t('admin.tickets.status.IN_PROGRESS')}</option>
            <option value="RESOLVED">{t('admin.tickets.status.RESOLVED')}</option>
          </select>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto pb-10 custom-scrollbar">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 size={40} className="animate-spin text-blue-500" />
            <p className="mt-4 text-sm font-bold text-slate-400 uppercase tracking-widest">Carregando Service Desk...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
            <Inbox size={48} className="mb-4 opacity-20" />
            <p className="font-medium">Nenhum chamado pendente ou registrado.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">ID</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Assunto</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Cliente</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Prioridade</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Criado em</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.map(ticketItem => (
                  <tr 
                    key={ticketItem.id} 
                    onClick={() => openTicketDetails(ticketItem)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4 text-xs font-mono text-slate-400">#{ticketItem.id.slice(-6)}</td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800 text-sm">{ticketItem.subject}</p>
                      <p className="text-xs text-slate-500 line-clamp-1">{ticketItem.description}</p>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Building2 size={16} className="text-blue-500"/>
                            <span className="font-semibold">{ticketItem.clientName}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${ticketItem.priority === 'CRITICAL' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                            {t(`admin.tickets.priority.${ticketItem.priority}`)}
                        </span>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(ticketItem.status)}</td>
                    <td className="px-6 py-4 text-xs text-slate-500">{ticketItem.createdAt}</td>
                    <td className="px-6 py-4 text-right">
                      <ExternalLink size={18} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all inline" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};