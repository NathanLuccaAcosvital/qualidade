
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/MainLayout.tsx';
import { FileExplorer } from '../components/features/files/FileExplorer.tsx';
import { SupportModal } from '../components/features/support/SupportModal.tsx'; // Agora focado em criar novo ticket
import { ClientTicketDetailsModal } from '../components/features/support/ClientTicketDetailsModal.tsx'; // NOVO: Modal de detalhes do ticket para cliente
import { useAuth } from '../context/authContext.tsx';
import { fileService, adminService } from '../lib/services/index.ts';
import { DashboardStatsData } from '../lib/services/interfaces.ts'; // Importado
import { FileNode, LibraryFilters, SupportTicket, SystemStatus, FileType } from '../types.ts'; // Adicionado FileType
import { useTranslation } from 'react-i18next';
import { 
    Search, ArrowRight, CheckCircle2, LifeBuoy, Plus, Clock, MessageSquare, 
    FileText, ChevronRight, CalendarDays, FileCheck, Server, AlertTriangle, 
    CalendarClock, Star, History, Inbox, ExternalLink, Filter, AlertCircle, Loader2
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const queryParams = new URLSearchParams(location.search);
  const currentView = queryParams.get('view') || 'home'; 

  const [quickSearch, setQuickSearch] = useState('');
  // Atualizado para usar DashboardStatsData
  const [stats, setStats] = useState<DashboardStatsData>({ 
      mainValue: 0, subValue: 0, pendingValue: 0, 
      status: 'REGULAR', mainLabel: '', subLabel: '', activeClients: 0 
  });
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({ mode: 'ONLINE' });

  const [viewFiles, setViewFiles] = useState<FileNode[]>([]);
  const [clientTickets, setClientTickets] = useState<SupportTicket[]>([]); 
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<LibraryFilters>({
      startDate: '',
      endDate: '',
      status: 'ALL',
      search: ''
  });
  const [ticketStatusFilter, setTicketStatusFilter] = useState<'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'>('ALL');

  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isClientTicketDetailsModalOpen, setIsClientTicketDetailsModalOpen] = useState(false); // NOVO
  const [selectedClientTicket, setSelectedClientTicket] = useState<SupportTicket | null>(null); // NOVO

  const fetchData = useCallback(async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
          const data = await fileService.getDashboardStats(user);
          const sysData = await adminService.getSystemStatus();
          setStats(data);
          setSystemStatus(sysData);

          if (currentView === 'home') {
              const tickets = await adminService.getMyTickets(user, { status: 'OPEN' }); // Only open for quick count
              setClientTickets((tickets || []).slice(0, 3));
          } else if (currentView === 'files') {
              // Deixa o FileExplorer interno lidar com a busca paginada
          } else if (currentView === 'favorites') {
              const results = await fileService.getFavorites(user);
              setViewFiles(results || []);
          } else if (currentView === 'recent') {
              const results = await fileService.getRecentFiles(user, 50); 
              setViewFiles(results || []);
          } else if (currentView === 'tickets') {
              const results = await adminService.getMyTickets(user, { status: ticketStatusFilter });
              if (results) {
                // Sort by status (OPEN, IN_PROGRESS, RESOLVED) then by creation date (desc)
                results.sort((a, b) => {
                    const statusOrder = { 'OPEN': 1, 'IN_PROGRESS': 2, 'RESOLVED': 3 };
                    if (statusOrder[a.status] !== statusOrder[b.status]) {
                        return statusOrder[a.status] - statusOrder[b.status];
                    }
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                });
                setClientTickets(results);
              }
          }
      } catch (err) {
          console.error("Erro ao carregar dados do dashboard:", err);
      } finally {
          setIsLoading(false);
      }
  }, [user, currentView, filters, ticketStatusFilter]); // Adiciona ticketStatusFilter à lista de dependências

  useEffect(() => {
      fetchData();
  }, [fetchData]);

  const handleSupportClose = () => {
      setIsSupportModalOpen(false);
      if (currentView === 'tickets') fetchData(); 
  };

  // NOVO: Função para abrir o modal de detalhes do ticket para o cliente
  const openClientTicketDetails = (ticket: SupportTicket) => {
    setSelectedClientTicket(ticket);
    setIsClientTicketDetailsModalOpen(true);
  };

  const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return t('common.goodMorning'); // Use translated 'Bom dia' (or 'Hello' for EN)
      if (hour < 18) return t('common.goodAfternoon'); // Use translated 'Boa tarde'
      return t('common.goodEvening'); // Use translated 'Boa noite'
  };

  const KpiCard = ({ icon: Icon, label, value, subtext, color, onClick }: any) => {
      const getKpiColors = (c: string) => {
          switch(c) {
              case 'blue': return { bg: 'bg-blue-50', text: 'text-blue-600', icon: 'text-blue-600/10' };
              case 'orange': return { bg: 'bg-orange-50', text: 'text-orange-600', icon: 'text-orange-600/10' };
              case 'indigo': return { bg: 'bg-indigo-50', text: 'text-indigo-600', icon: 'text-indigo-600/10' };
              default: return { bg: 'bg-slate-50', text: 'text-slate-600', icon: 'text-slate-600/10' };
          }
      };
      const colors = getKpiColors(color);
      return (
          <div 
            onClick={onClick} 
            className="relative overflow-hidden bg-white p-5 rounded-2xl border border-slate-100 shadow-sm cursor-pointer group transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            role="button" // A11y: Indicate it's a clickable element
            aria-label={`${label}: ${value} ${subtext}`} // A11y: Provide a descriptive label
          >
              <div className={`absolute top-0 right-0 p-4 transform scale-150 -translate-y-2 translate-x-1/3 ${colors.icon}`}><Icon size={100} /></div>
              <div className="relative z-10">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm ${colors.bg} ${colors.text}`}><Icon size={24} /></div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
                  <h3 className="text-2xl font-bold text-slate-800 tracking-tight">{value}</h3>
                  {subtext && <p className={`text-[10px] font-bold mt-2 inline-block px-2 py-0.5 rounded-full uppercase ${colors.bg} ${colors.text}`}>{subtext}</p>}
              </div>
          </div>
      );
  };

  // RENDER: HOME VIEW
  if (currentView === 'home') {
      const openTicketCount = clientTickets.filter(t => t.status !== 'RESOLVED').length;
      return (
        <Layout title={t('menu.dashboard')}>
          <SupportModal isOpen={isSupportModalOpen} onClose={handleSupportClose} />
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8 pb-12">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-8 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-center min-h-[320px]">
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full blur-3xl opacity-60 -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                        <div className="relative z-10 max-w-2xl">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="px-3 py-1 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-lg" aria-label={t('menu.portalName')}>{t('menu.portalNameShort')}</span>
                                <span className="text-xs font-medium text-slate-400 flex items-center gap-1"><CalendarDays size={12} aria-hidden="true" /> {new Date().toLocaleDateString()}</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-2">{getGreeting()}, {user?.name.split(' ')[0] || t('common.user')}.</h1>
                            <p className="text-slate-500 text-sm md:text-base max-w-lg mb-8">{t('dashboard.heroDescription')}</p>
                            <div className="relative group max-w-lg">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" aria-hidden="true" />
                                <input
                                    type="text"
                                    className="block w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm font-medium"
                                    placeholder={t('dashboard.searchPlaceholder')}
                                    value={quickSearch}
                                    onChange={(e) => setQuickSearch(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter' && quickSearch) { setFilters(prev => ({ ...prev, search: quickSearch })); navigate('/dashboard?view=files'); } }}
                                    aria-label={t('dashboard.searchPlaceholder')} // A11y: Label for search input
                                />
                                <button 
                                  onClick={() => { setFilters(prev => ({ ...prev, search: quickSearch })); navigate('/dashboard?view=files'); }} 
                                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-md"
                                  aria-label={t('common.search')} // A11y: Label for search button
                                >
                                  <ArrowRight size={16} aria-hidden="true" />
                                </button>
                            </div>
                        </div>
                  </div>
                  <div className="lg:col-span-4 flex flex-col gap-6">
                      <div className={`flex-1 rounded-3xl p-6 text-white relative overflow-hidden group shadow-xl ${systemStatus.mode === 'SCHEDULED' ? 'bg-gradient-to-br from-orange-600 to-orange-500' : 'bg-gradient-to-br from-slate-800 to-slate-900'}`}>
                          <div className="absolute top-0 right-0 p-6 opacity-10">{systemStatus.mode === 'SCHEDULED' ? <AlertTriangle size={120} aria-hidden="true" /> : <Server size={120} aria-hidden="true" />}</div>
                          <div className="relative z-10 flex flex-col h-full justify-between">
                              <div>
                                  <p className="text-xs font-bold text-white/60 uppercase tracking-wider mb-1">{t('menu.system')} {t('common.status')}</p>
                                  <h3 className="text-2xl font-bold flex items-center gap-2">{systemStatus.mode === 'SCHEDULED' ? t('dashboard.status.scheduled') : t('dashboard.status.normal')}</h3>
                              </div>
                              {systemStatus.mode === 'SCHEDULED' ? (
                                   <div className="bg-white/15 rounded-xl p-4 backdrop-blur-sm border border-white/10 mt-4">
                                       <div className="flex items-center gap-2 mb-2 text-white"><CalendarClock size={18} aria-hidden="true" /><span className="font-bold text-sm">{new Date(systemStatus.scheduledStart!).toLocaleDateString()}</span></div>
                                       <p className="text-xs text-white/90 leading-relaxed font-medium">{systemStatus.message || t('dashboard.status.scheduledDefaultMessage')}</p>
                                   </div>
                              ) : (
                                   <div className="mt-6 space-y-4"><div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-950/30 w-fit px-3 py-1.5 rounded-full border border-emerald-500/20"><CheckCircle2 size={14} aria-hidden="true" /> {t('dashboard.status.monitoringActive')}</div></div>
                              )}
                          </div>
                      </div>
                      <button 
                        onClick={() => setIsSupportModalOpen(true)} 
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-1 shadow-lg group hover:shadow-blue-500/20 transition-all active:scale-[0.98]"
                        aria-label={t('menu.support')} // A11y: Label for support button
                      >
                          <div className="bg-white rounded-[20px] p-4 flex items-center justify-between h-full group-hover:bg-blue-50/50 transition-colors">
                              <div className="flex items-center gap-4">
                                  <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform"><LifeBuoy size={24} aria-hidden="true" /></div>
                                  <div className="text-left"><span className="block font-bold text-slate-800">{t('menu.support')}</span><span className="text-xs text-slate-500">{t('menu.portalName')}</span></div>
                              </div>
                              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all"><Plus size={18} aria-hidden="true" /></div>
                          </div>
                      </button>
                  </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4" role="region" aria-label={t('menu.dashboard')}>
                  <KpiCard icon={FileText} label={t('dashboard.kpi.libraryLabel')} value={stats.subValue} subtext={t('dashboard.kpi.activeDocsSubtext')} color="blue" onClick={() => navigate('/dashboard?view=files')} />
                  <KpiCard icon={Clock} label={t('dashboard.kpi.pendingLabel')} value={stats.pendingValue} subtext={t('dashboard.kpi.awaitingSubtext')} color="orange" onClick={() => navigate('/dashboard?view=files&status=PENDING')} />
                  <KpiCard icon={MessageSquare} label={t('dashboard.kpi.ticketsLabel')} value={openTicketCount} subtext={t('dashboard.kpi.openTicketsSubtext')} color="indigo" onClick={() => navigate('/dashboard?view=tickets')} />
              </div>
              <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2" aria-label={t('dashboard.libraryHeader')}>
                      <FileCheck size={20} className="text-blue-500" aria-hidden="true" /> {t('dashboard.libraryHeader')}
                    </h3>
                    <button 
                      onClick={() => navigate('/dashboard?view=files')} 
                      className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
                      aria-label={t('dashboard.exploreAll')} // A11y: Label for "Explore All" button
                    >
                      {t('dashboard.exploreAll')} <ChevronRight size={14} aria-hidden="true" />
                    </button>
                  </div>
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-[500px] flex flex-col" role="region" aria-label={t('dashboard.libraryHeader')}>
                    <FileExplorer allowUpload={false} hideToolbar={false} />
                  </div>
              </div>
          </div>
        </Layout>
      );
  }

  // RENDER: TICKETS (SERVICE DESK VIEW)
  if (currentView === 'tickets') {
      return (
          <Layout title={t('dashboard.supportCenter')}>
              <SupportModal isOpen={isSupportModalOpen} onClose={handleSupportClose} />
              {/* NOVO: Renderiza o modal de detalhes do ticket para o cliente */}
              <ClientTicketDetailsModal
                isOpen={isClientTicketDetailsModalOpen}
                onClose={() => setIsClientTicketDetailsModalOpen(false)}
                ticket={selectedClientTicket}
              />
              <div className="space-y-6 animate-in fade-in duration-500" role="region" aria-label={t('dashboard.myTickets')}>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <div>
                          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2" aria-label={t('dashboard.myTickets')}><Inbox size={22} className="text-blue-600" aria-hidden="true" /> {t('dashboard.myTickets')}</h2>
                          <p className="text-sm text-slate-500">{t('dashboard.ticketsHeader')}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <Filter size={18} className="text-slate-400 shrink-0" aria-hidden="true"/>
                            <select 
                                value={ticketStatusFilter} 
                                onChange={e => setTicketStatusFilter(e.target.value as any)}
                                className="flex-1 md:flex-none px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                                aria-label={t('common.filterByStatus')} // A11y: Label for status filter
                            >
                                <option value="ALL">{t('common.all')}</option>
                                <option value="OPEN">{t('admin.tickets.status.OPEN')}</option>
                                <option value="IN_PROGRESS">{t('admin.tickets.status.IN_PROGRESS')}</option>
                                <option value="RESOLVED">{t('admin.tickets.status.RESOLVED')}</option>
                            </select>
                        </div>
                        <button 
                          onClick={() => setIsSupportModalOpen(true)} 
                          className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                          aria-label={t('dashboard.openNewTicket')} // A11y: Label for "New Ticket" button
                        >
                          <Plus size={18} aria-hidden="true" /> {t('dashboard.openNewTicket')}
                        </button>
                      </div>
                  </div>
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                                  <tr>
                                      <th className="px-6 py-4 text-xs font-bold uppercase">{t('dashboard.ticket.id')}</th>
                                      <th className="px-6 py-4 text-xs font-bold uppercase">{t('dashboard.ticket.subject')}</th>
                                      <th className="px-6 py-4 text-xs font-bold uppercase text-center">{t('dashboard.ticket.priority')}</th>
                                      <th className="px-6 py-4 text-xs font-bold uppercase">{t('dashboard.ticket.status')}</th>
                                      <th className="px-6 py-4 text-xs font-bold uppercase">{t('dashboard.ticket.createdAt')}</th>
                                      <th className="px-6 py-4 text-right"></th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                  {clientTickets.map(t => (
                                      <tr 
                                        key={t.id} 
                                        className="hover:bg-slate-50 transition-colors group cursor-pointer"
                                        onClick={() => openClientTicketDetails(t)} // NOVO: Abre o modal de detalhes do ticket
                                        aria-label={`${t('dashboard.ticket.subject')}: ${t.subject}, ${t('dashboard.ticket.status')}: ${t('admin.tickets.status.' + t.status)}`} // A11y: Label for each ticket row
                                      >
                                          <td className="px-6 py-4 text-xs font-mono text-slate-400" role="cell" data-label={t('dashboard.ticket.id')}>#{t.id.slice(-4)}</td>
                                          <td className="px-6 py-4" role="cell" data-label={t('dashboard.ticket.subject')}><p className="font-bold text-slate-800 text-sm">{t.subject}</p><p className="text-xs text-slate-500 line-clamp-1">{t.description}</p></td>
                                          <td className="px-6 py-4" role="cell" data-label={t('dashboard.ticket.priority')}>
                                              <div className="flex justify-center">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${t.priority === 'CRITICAL' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>{t(`admin.tickets.priority.${t.priority}`)}</span>
                                              </div>
                                          </td>
                                          <td className="px-6 py-4" role="cell" data-label={t('dashboard.ticket.status')}>
                                              <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase ${t.status === 'RESOLVED' ? 'text-emerald-600' : t.status === 'IN_PROGRESS' ? 'text-blue-600' : 'text-orange-600'}`}>
                                                  <span className={`w-1.5 h-1.5 rounded-full ${t.status === 'RESOLVED' ? 'bg-emerald-500' : t.status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-orange-500 animate-pulse'}`} aria-hidden="true" />
                                                  {t(`admin.tickets.status.${t.status}`)}
                                              </span>
                                          </td>
                                          <td className="px-6 py-4 text-xs text-slate-500" role="cell" data-label={t('dashboard.ticket.createdAt')}>{t.createdAt}</td>
                                          <td className="px-6 py-4 text-right">
                                            <button className="p-2 text-slate-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-all" aria-label={t('common.expand')}><ExternalLink size={16} aria-hidden="true"/></button>
                                          </td>
                                      </tr>
                                  ))}
                                  {clientTickets.length === 0 && (
                                      <tr><td colSpan={6} className="px-6 py-20 text-center"><div className="flex flex-col items-center text-slate-400"><Inbox size={48} className="mb-3 opacity-20" aria-hidden="true"/><p className="font-medium">{t('dashboard.noTicketsRegistered')}</p></div></td></tr>
                                  )}
                              </tbody>
                          </table>
                      </div>
                  </div>
              </div>
          </Layout>
      );
  }

  // RENDER: FAVORITES & RECENT (FLAT FILE VIEW)
  const isFlatView = currentView === 'favorites' || currentView === 'recent';
  const viewTitle = currentView === 'favorites' ? t('dashboard.favoritesTitle') : t('dashboard.recentTitle');
  const ViewIcon = currentView === 'favorites' ? Star : History;
  const EmptyViewIcon = currentView === 'favorites' ? Star : History; // Icon for empty state
  const emptySubtext = currentView === 'favorites' ? t('dashboard.emptyFlatView.subtextFavorites') : t('dashboard.emptyFlatView.subtextRecent');


  return (
    <Layout title={viewTitle}> {/* Use viewTitle here */}
        <SupportModal isOpen={isSupportModalOpen} onClose={handleSupportClose} />
        <div className="flex flex-col h-full gap-6 animate-in fade-in duration-500" role="region" aria-label={viewTitle}>
            {isFlatView && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${currentView === 'favorites' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                      <ViewIcon size={24} aria-hidden="true"/>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">{viewTitle}</h2>
                        <p className="text-sm text-slate-500">
                          {emptySubtext}
                        </p>
                    </div>
                </div>
            )}
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden h-[calc(100vh-280px)]">
                {isLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4">
                      <Loader2 size={40} className="animate-spin text-blue-500" aria-hidden="true"/>
                      <p className="font-bold text-xs uppercase tracking-widest">{t('common.loading')}</p>
                    </div>
                ) : (viewFiles.length === 0 && isFlatView) ? ( // Check for empty externalFiles in flat view
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4 bg-white rounded-b-2xl">
                        <EmptyViewIcon size={48} className="mb-3 opacity-20" aria-hidden="true"/>
                        <p className="font-medium">{t('dashboard.emptyFlatView.message')}</p>
                        <p className="text-xs text-slate-400">{emptySubtext}</p>
                    </div>
                ) : (
                    <FileExplorer 
                        allowUpload={false} 
                        externalFiles={viewFiles} 
                        flatMode={true} 
                        onRefresh={fetchData}
                        hideToolbar={currentView === 'recent' || currentView === 'favorites'} 
                    />
                )}
            </div>
        </div>
    </Layout>
  );
};

export default Dashboard;