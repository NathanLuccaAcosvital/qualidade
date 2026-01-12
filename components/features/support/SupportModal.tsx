
import React, { useState, useEffect } from 'react';
import { X, LifeBuoy, Plus, MessageSquare, CheckCircle2, Clock, AlertCircle, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../context/authContext.tsx';
// Fix: Import from services/index.ts to use the correctly typed and initialized service instances
import { adminService } from '../../../lib/services/index.ts';
import { SupportTicket } from '../../../types.ts';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  
  const [view, setView] = useState<'LIST' | 'NEW'>('LIST');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: '', description: '', priority: 'MEDIUM' as const });

  useEffect(() => {
      if (isOpen && user) {
          loadTickets();
          setView('LIST');
      }
  }, [isOpen, user]);

  const loadTickets = async () => {
      if (!user) return;
      setLoading(true);
      try {
          const data = await adminService.getUserTickets(user.id);
          // Sort: Active first, then by date
          const sorted = data.sort((a, b) => {
              if (a.status === 'RESOLVED' && b.status !== 'RESOLVED') return 1;
              if (a.status !== 'RESOLVED' && b.status === 'RESOLVED') return -1;
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });
          setTickets(sorted);
      } finally {
          setLoading(false);
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user) return;
      
      setLoading(true);
      await adminService.createTicket(user, newTicket);
      setNewTicket({ subject: '', description: '', priority: 'MEDIUM' });
      await loadTickets();
      setView('LIST');
      setLoading(false);
  };

  const getStatusIcon = (status: string) => {
      switch (status) {
          case 'RESOLVED': return <CheckCircle2 size={16} className="text-emerald-500" />;
          case 'IN_PROGRESS': return <Clock size={16} className="text-blue-500" />;
          default: return <AlertCircle size={16} className="text-orange-500" />;
      }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
                <LifeBuoy className="text-blue-600" size={24} />
            </div>
            <div>
                <h2 className="text-xl font-bold text-slate-800">{t('menu.support')}</h2>
                <p className="text-xs text-slate-500">Central de Ajuda</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
            
            {view === 'LIST' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Meus Chamados</h3>
                        <button 
                            onClick={() => setView('NEW')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-sm"
                        >
                            <Plus size={16} /> {t('admin.tickets.newTicket')}
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
                    ) : tickets.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
                            <MessageSquare size={48} className="mx-auto text-slate-300 mb-2" />
                            <p className="text-slate-500 font-medium">Nenhum chamado encontrado.</p>
                            <p className="text-xs text-slate-400">Precisa de ajuda? Abra um novo chamado.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {tickets.map(ticket => (
                                <div key={ticket.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-sm mb-1">{ticket.subject}</h4>
                                            <p className="text-xs text-slate-500 line-clamp-2">{ticket.description}</p>
                                        </div>
                                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                                            ticket.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                                            ticket.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                                            'bg-orange-50 text-orange-700 border-orange-100'
                                        }`}>
                                            {getStatusIcon(ticket.status)}
                                            {t(`admin.tickets.status.${ticket.status}`)}
                                        </div>
                                    </div>
                                    {ticket.resolutionNote && (
                                        <div className="mt-3 bg-slate-50 p-2 rounded border border-slate-100">
                                            <p className="text-[10px] font-bold text-slate-700">Resolução:</p>
                                            <p className="text-xs text-slate-600 italic">"{ticket.resolutionNote}"</p>
                                        </div>
                                    )}
                                    <div className="mt-3 pt-3 border-t border-slate-50 flex justify-between items-center text-xs text-slate-400">
                                        <span>ID: {ticket.id}</span>
                                        <span className="font-mono">{ticket.createdAt}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {view === 'NEW' && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-in slide-in-from-right-4">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">{t('admin.tickets.newTicket')}</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-700">{t('admin.tickets.subject')}</label>
                            <input 
                                required 
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                value={newTicket.subject} 
                                onChange={e => setNewTicket({...newTicket, subject: e.target.value})}
                                placeholder="Resumo do problema..."
                            />
                        </div>
                        
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-700">{t('common.priority')}</label>
                            <div className="flex gap-2">
                                {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((p) => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setNewTicket({...newTicket, priority: p as any})}
                                        className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                                            newTicket.priority === p 
                                            ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500' 
                                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                                        }`}
                                    >
                                        {t(`admin.tickets.priority.${p}`)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-700">{t('common.description')}</label>
                            <textarea 
                                required 
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm h-32 resize-none"
                                value={newTicket.description} 
                                onChange={e => setNewTicket({...newTicket, description: e.target.value})}
                                placeholder="Descreva detalhadamente sua solicitação..."
                            />
                        </div>

                        <div className="pt-2 flex gap-3">
                            <button 
                                type="button" 
                                onClick={() => setView('LIST')}
                                className="flex-1 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors border border-transparent"
                            >
                                {t('common.cancel')}
                            </button>
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="flex-[2] py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
                            >
                                {loading ? 'Enviando...' : <><Send size={18} /> Criar Chamado</>}
                            </button>
                        </div>
                    </form>
                </div>
            )}

        </div>
      </div>
    </div>
  );
};
