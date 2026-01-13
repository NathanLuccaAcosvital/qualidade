import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/MainLayout.tsx';
import { FileExplorer } from '../components/features/files/FileExplorer.tsx';
import { useAuth } from '../context/authContext.tsx';
import { fileService, adminService } from '../lib/services/index.ts';
import { DashboardStatsData } from '../lib/services/interfaces.ts';
import { FileNode, LibraryFilters, SystemStatus, FileType } from '../types.ts';
import { useTranslation } from 'react-i18next';
import { 
    Search, ArrowRight, CheckCircle2, Plus, Clock, 
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
  // NOVO: Estado para termo de busca da biblioteca (passado para FileExplorer)
  const [dashboardSearchTerm, setDashboardSearchTerm] = useState('');
  // NOVO: Estado para filtro de status da biblioteca (passado para FileExplorer)
  const [dashboardFilterStatus, setDashboardFilterStatus] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL'); // Adicionado 'REJECTED'

  const [stats, setStats] = useState<DashboardStatsData>({ 
      mainValue: 0, subValue: 0, pendingValue: 0, 
      status: 'REGULAR', mainLabel: '', subLabel: '', activeClients: 0 
  });
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({ mode: 'ONLINE' });

  const [viewFiles, setViewFiles] = useState<FileNode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // REMOVIDO: filters não é mais usado diretamente aqui para carregar dados, 
  // mas o dashboardSearchTerm e dashboardFilterStatus controlam a FileExplorer da view 'files'.

  // Função para buscar dados globais do dashboard (KPIs e status do sistema)
  const fetchDashboardStats = useCallback(async () => {
      if (!user) return;
      try {
          const data = await fileService.getDashboardStats(user);
          const sysData = await adminService.getSystemStatus();
          setStats(data);
          setSystemStatus(sysData);
      } catch (err) {
          console.error("Erro ao carregar dados do dashboard:", err);
      }
  }, [user]);

  // Função para buscar arquivos de views específicas (Favoritos e Recentes)
  const fetchSpecificViewFiles = useCallback(async () => {
      if (!user) return;

      // Somente busca para as views de favoritos ou recentes
      if (currentView !== 'favorites' && currentView !== 'recent') {
          setViewFiles([]); // Limpa dados de view anterior se não for relevante
          return;
      }

      setIsLoading(true);
      try {
          let results: FileNode[] = [];
          if (currentView === 'favorites') {
              results = await fileService.getFavorites(user);
          } else if (currentView === 'recent') {
              results = await fileService.getRecentFiles(user, 50); 
          }
          setViewFiles(results || []);
      } catch (err) {
          console.error(`Erro ao carregar dados para a visão ${currentView}:`, err);
      } finally {
          setIsLoading(false);
      }
  }, [user, currentView]); // Depende apenas de user e currentView

  // Efeitos para cada função de busca
  useEffect(() => {
      fetchDashboardStats();
  }, [fetchDashboardStats]);

  useEffect(() => {
      fetchSpecificViewFiles();
  }, [fetchSpecificViewFiles]);

  const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return t('common.goodMorning');
      if (hour < 18) return t('common.goodAfternoon');
      return t('common.goodEvening');
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
            role="button"
            aria-label={`${label}: ${value} ${subtext}`}
          >
              <div className={`absolute top-0 right-0 p-4 transform scale-150 -translate-y-1/2 translate-x-1/3 ${colors.icon}`}><Icon size={100} /></div>
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
      return (
        <Layout title={t('menu.dashboard')}>
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8 pb-12">
              <div className="grid grid-cols-1 gap-6">
                  <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-center min-h-[320px]">
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
                                    onKeyDown={(e) => { 
                                        if (e.key === 'Enter' && quickSearch) { 
                                            setDashboardSearchTerm(quickSearch); // Define o termo de busca para a biblioteca
                                            navigate('/dashboard?view=files'); 
                                        } 
                                    }}
                                    aria-label={t('dashboard.searchPlaceholder')}
                                />
                                <button 
                                  onClick={() => { 
                                      setDashboardSearchTerm(quickSearch); // Define o termo de busca para a biblioteca
                                      navigate('/dashboard?view=files'); 
                                  }} 
                                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-md"
                                  aria-label={t('common.search')}
                                >
                                  <ArrowRight size={16} aria-hidden="true" />
                                </button>
                            </div>
                        </div>
                  </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4" role="region" aria-label={t('menu.dashboard')}>
                  <KpiCard icon={FileText} label={t('dashboard.kpi.libraryLabel')} value={stats.subValue} subtext={t('dashboard.kpi.activeDocsSubtext')} color="blue" onClick={() => navigate('/dashboard?view=files')} />
                  <KpiCard icon={Clock} label={t('dashboard.kpi.pendingLabel')} value={stats.pendingValue} subtext={t('dashboard.kpi.awaitingSubtext')} color="orange" onClick={() => navigate('/dashboard?view=files&status=PENDING')} />
              </div>

              <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2" aria-label={t('dashboard.libraryHeader')}>
                      <FileCheck size={20} className="text-blue-500" aria-hidden="true" /> {t('dashboard.libraryHeader')}
                    </h3>
                    <button 
                      onClick={() => navigate('/dashboard?view=files')} 
                      className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
                      aria-label={t('dashboard.exploreAll')}
                    >
                      {t('dashboard.exploreAll')} <ChevronRight size={14} aria-hidden="true" />
                    </button>
                  </div>
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-[500px] flex flex-col" role="region" aria-label={t('dashboard.libraryHeader')}>
                    {/* FileExplorer para a visualização geral de documentos no home, não afetado pela busca rápida */}
                    <FileExplorer allowUpload={false} hideToolbar={false} />
                  </div>
              </div>
          </div>
        </Layout>
      );
  }

  // NOVO RENDER: FILES VIEW (Biblioteca)
  if (currentView === 'files') {
      return (
          <Layout title={t('menu.library')}>
              <div className="flex flex-col h-full gap-6 animate-in fade-in duration-500" role="region" aria-label={t('menu.library')}>
                  {/* Barra de Busca e Filtro customizada para a view 'files' */}
                  <div className="bg-white p-4 rounded-2xl border shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                      <div className="relative group w-full md:w-auto flex-1 max-w-xl">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} aria-hidden="true" />
                          <input
                              type="text"
                              placeholder={t('dashboard.searchPlaceholder')}
                              className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm w-full outline-none focus:ring-2 focus:ring-blue-500/20"
                              value={dashboardSearchTerm}
                              onChange={e => setDashboardSearchTerm(e.target.value)}
                              aria-label={t('dashboard.searchPlaceholder')}
                          />
                      </div>
                      {/* Filtro por Status para a Biblioteca */}
                      <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl" role="group" aria-label={t('common.filterByStatus')}>
                          {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map(status => (
                              <button
                                  key={status}
                                  onClick={() => setDashboardFilterStatus(status)}
                                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                                      dashboardFilterStatus === status 
                                      ? 'bg-white text-slate-900 shadow-sm' 
                                      : 'text-slate-500 hover:text-slate-700'
                                  }`}
                                  aria-pressed={dashboardFilterStatus === status}
                                  aria-label={status === 'ALL' ? t('common.all') : t(`files.groups.${status.toLowerCase()}`)}
                              >
                                  {status === 'ALL' ? t('common.all') : t(`files.groups.${status.toLowerCase()}`)}
                              </button>
                          ))}
                      </div>
                  </div>

                  <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden h-[calc(100vh-280px)]">
                      {/* FileExplorer para a visualização 'files', recebendo search e filtros externos */}
                      <FileExplorer
                          allowUpload={false}
                          hideToolbar={true} // Oculta a toolbar interna do FileExplorer
                          externalSearchQuery={dashboardSearchTerm} // Passa o termo de busca
                          filterStatus={dashboardFilterStatus} // Passa o filtro de status
                          // onRefresh não é necessário aqui, pois a mudança de props já dispara a busca
                      />
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
    <Layout title={viewTitle}>
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
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4" role="status">
                      <Loader2 size={40} className="animate-spin text-blue-500" aria-hidden="true"/>
                      <p className="font-bold text-xs uppercase tracking-widest">{t('common.loading')}</p>
                    </div>
                ) : (viewFiles.length === 0 && isFlatView) ? ( // Check for empty externalFiles in flat view
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4 bg-white rounded-b-2xl" role="status">
                        <EmptyViewIcon size={48} className="mb-3 opacity-20" aria-hidden="true"/>
                        <p className="font-medium">{t('dashboard.emptyFlatView.message')}</p>
                        <p className="text-xs text-slate-400">{emptySubtext}</p>
                    </div>
                ) : (
                    <FileExplorer 
                        allowUpload={false} 
                        externalFiles={viewFiles} 
                        flatMode={true} 
                        onRefresh={fetchSpecificViewFiles} // Usa a função específica para refresh
                        hideToolbar={currentView === 'recent' || currentView === 'favorites'} 
                    />
                )}
            </div>
        </div>
    </Layout>
  );
};

export default Dashboard;