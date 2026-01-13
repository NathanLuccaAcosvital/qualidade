import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/MainLayout.tsx';
import { FileExplorer } from '../components/features/files/FileExplorer.tsx';
import { FilePreviewModal } from '../components/features/files/FilePreviewModal.tsx'; // Import FilePreviewModal
import { useAuth } from '../context/authContext.tsx';
import { fileService, adminService } from '../lib/services/index.ts';
import { DashboardStatsData } from '../lib/services/interfaces.ts'; // Mantido, pois são interfaces específicas dos serviços
import { FileNode, LibraryFilters, SystemStatus, FileType, FileMetadata } from '../types/index'; // Atualizado
import { useTranslation } from 'react-i18next';
// Fix: Import useToast and X icon
import { useToast } from '../context/notificationContext.tsx';
import {
    Search, ArrowRight, CheckCircle2, Plus, Clock,
    FileText, ChevronRight, CalendarDays, FileCheck, Server, AlertTriangle,
    CalendarClock, Star, History, Inbox, ExternalLink, Filter, AlertCircle, Loader2, FileUp, X
} from 'lucide-react';

// Shared Modals (can be moved to a client-specific modals file if more grow)
// The Upload modal UI is generic, but its logic should be tied to the client's dashboard behavior.
// We'll define a local UploadModal for Dashboard for now.

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  // Fix: Use the useToast hook
  const { showToast } = useToast();

  const queryParams = new URLSearchParams(location.search);
  const currentView = queryParams.get('view') || 'home';

  const [quickSearch, setQuickSearch] = useState('');
  const [dashboardSearchTerm, setDashboardSearchTerm] = useState('');
  const [dashboardFilterStatus, setDashboardFilterStatus] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');

  const [stats, setStats] = useState<DashboardStatsData>({
      mainValue: 0, subValue: 0, pendingValue: 0,
      status: 'REGULAR', mainLabel: '', subLabel: '', activeClients: 0
  });
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({ mode: 'ONLINE' });
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // For upload/other actions
  const [refreshFileExplorerKey, setRefreshFileExplorerKey] = useState(0); // To force FileExplorer refresh

  // --- Upload Modal State (for Client Dashboard) ---
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadData, setUploadData] = useState<Partial<FileMetadata>>({
      status: 'PENDING', // Client uploads are initially PENDING
      productName: '',
      batchNumber: '',
      invoiceNumber: ''
  });
  const [selectedFileBlob, setSelectedFileBlob] = useState<File | null>(null);
  const [previewFile, setPreviewFile] = useState<FileNode | null>(null); // For FilePreviewModal

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

  const fetchSpecificViewFiles = useCallback(async () => {
      if (!user) return;

      if (currentView !== 'favorites' && currentView !== 'recent') {
          return; // No need to fetch here if not these views
      }

      setIsLoading(true);
      try {
          let results: FileNode[] = [];
          if (currentView === 'favorites') {
              results = await fileService.getFavorites(user);
          } else if (currentView === 'recent') {
              results = await fileService.getRecentFiles(user, 50);
          }
          // The FileExplorer component will handle its own internal state,
          // so we don't need a `viewFiles` state here directly.
          // We trigger a refresh of FileExplorer instead.
          setRefreshFileExplorerKey(prev => prev + 1);
      } catch (err) {
          console.error(`Erro ao carregar dados para a visão ${currentView}:`, err);
      } finally {
          setIsLoading(false);
      }
  }, [user, currentView]);

  useEffect(() => {
      fetchDashboardStats();
  }, [fetchDashboardStats]);

  useEffect(() => {
      fetchSpecificViewFiles();
  }, [fetchSpecificViewFiles]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFileBlob || !user || !user.organizationId) return;

    setIsProcessing(true);
    try {
      await fileService.uploadFile(user, {
        name: selectedFileBlob.name,
        parentId: null, // Client uploads to root of their organization's accessible files
        metadata: uploadData as any,
        fileBlob: selectedFileBlob
      } as any, user.organizationId); // Owner is the client's organization

      showToast(t('quality.documentUploadedSuccess'), 'success');
      setIsUploadModalOpen(false);
      setSelectedFileBlob(null);
      setUploadData({ status: 'PENDING', productName: '', batchNumber: '', invoiceNumber: '' });
      setRefreshFileExplorerKey(prev => prev + 1); // Refresh FileExplorer
      fetchDashboardStats(); // Refresh dashboard stats to update pending count
    } catch (err: any) {
      console.error("Erro no upload do arquivo:", err);
      const errorMessage = err.message || t('quality.errorUploadingFile', { message: 'Erro desconhecido' });
      showToast(t('quality.errorUploadingFile', { message: errorMessage }), 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const openUploadModal = () => {
    setIsUploadModalOpen(true);
    setUploadData({ status: 'PENDING', productName: '', batchNumber: '', invoiceNumber: '' });
    setSelectedFileBlob(null);
  };

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
                                            setDashboardSearchTerm(quickSearch);
                                            navigate('/dashboard?view=files');
                                        }
                                    }}
                                    aria-label={t('dashboard.searchPlaceholder')}
                                />
                                <button
                                  onClick={() => {
                                      setDashboardSearchTerm(quickSearch);
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
                    <FileExplorer allowUpload={false} hideToolbar={false} />
                  </div>
              </div>
          </div>
        </Layout>
      );
  }

  if (currentView === 'files') {
      return (
          <Layout title={t('menu.library')}>
              <FilePreviewModal file={previewFile} isOpen={!!previewFile} onClose={() => setPreviewFile(null)} />

              {isProcessing && (
                <div className="fixed top-4 right-1/2 translate-x-1/2 z-[110] bg-slate-900 text-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 text-xs font-bold animate-bounce">
                  <Loader2 size={14} className="animate-spin" /> {t('common.updatingDatabase')}
                </div>
              )}

              {/* Upload Modal (for Client Dashboard) */}
              {isUploadModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300" role="dialog" aria-modal="true" aria-labelledby="upload-modal-title">
                  <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 flex flex-col">
                    <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <h3 id="upload-modal-title" className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <FileUp size={20} className="text-blue-600" aria-hidden="true" /> {t('quality.sendNewCertificate')}
                      </h3>
                      <button onClick={() => setIsUploadModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors" aria-label={t('common.close')}><X size={20} aria-hidden="true" /></button>
                    </div>

                    <form onSubmit={handleUpload} className="p-6 space-y-4">
                      <div className="space-y-1">
                        <label htmlFor="upload-file" className="text-xs font-bold text-slate-500 uppercase">{t('quality.pdfImageFile')}</label>
                        <input
                          id="upload-file"
                          type="file"
                          accept="application/pdf,image/*"
                          required
                          onChange={e => setSelectedFileBlob(e.target.files?.[0] || null)}
                          className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                          aria-label={t('quality.pdfImageFile')}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label htmlFor="upload-product" className="text-xs font-bold text-slate-500 uppercase">{t('quality.product')}</label>
                          <input
                            id="upload-product"
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={t('quality.productPlaceholder')}
                            value={uploadData.productName}
                            onChange={e => setUploadData({ ...uploadData, productName: e.target.value })}
                            aria-label={t('quality.product')}
                          />
                        </div>
                        <div className="space-y-1">
                          <label htmlFor="upload-batch" className="text-xs font-bold text-slate-500 uppercase">{t('quality.batchNumber')}</label>
                          <input
                            id="upload-batch"
                            required
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                            placeholder="L-998"
                            value={uploadData.batchNumber}
                            onChange={e => setUploadData({ ...uploadData, batchNumber: e.target.value })}
                            aria-label={t('quality.batchNumber')}
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label htmlFor="upload-invoice" className="text-xs font-bold text-slate-500 uppercase">{t('quality.invoiceNumber')}</label>
                        <input
                          id="upload-invoice"
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="NF-000123"
                          value={uploadData.invoiceNumber}
                          onChange={e => setUploadData({ ...uploadData, invoiceNumber: e.target.value })}
                          aria-label={t('quality.invoiceNumber')}
                        />
                      </div>

                      <div className="pt-4 flex gap-3">
                        <button type="button" onClick={() => setIsUploadModalOpen(false)} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-all" aria-label={t('common.cancel')}>{t('common.cancel')}</button>
                        <button
                          type="submit"
                          disabled={isProcessing}
                          className="flex-[2] py-3 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center gap-2"
                          aria-label={t('quality.uploadFile')}
                        >
                          {isProcessing ? <Loader2 className="animate-spin" size={18} aria-hidden="true" /> : t('quality.uploadFile')}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              <div className="flex flex-col h-full gap-6 animate-in fade-in duration-500" role="region" aria-label={t('menu.library')}>
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
                      <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                        <button
                            onClick={openUploadModal}
                            className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-900/20 active:scale-95 transition-all"
                            aria-label={t('quality.sendNewCertificate')}
                        >
                            <FileUp size={16} aria-hidden="true" /> {t('common.upload')}
                        </button>
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
                  </div>

                  <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden h-[calc(100vh-280px)]">
                      <FileExplorer
                          allowUpload={true} // Allow uploads from client dashboard
                          hideToolbar={true}
                          externalSearchQuery={dashboardSearchTerm}
                          filterStatus={dashboardFilterStatus}
                          onRefresh={() => { fetchDashboardStats(); setRefreshFileExplorerKey(prev => prev + 1); }}
                          onUploadClick={openUploadModal} // Trigger local upload modal
                          onFileSelect={setPreviewFile} // Show file in preview modal
                          refreshKey={refreshFileExplorerKey} // Pass refresh key
                      />
                  </div>
              </div>
          </Layout>
      );
  }

  const isFlatView = currentView === 'favorites' || currentView === 'recent';
  const viewTitle = currentView === 'favorites' ? t('dashboard.favoritesTitle') : t('dashboard.recentTitle');
  const ViewIcon = currentView === 'favorites' ? Star : History;
  const EmptyViewIcon = currentView === 'favorites' ? Star : History;
  const emptySubtext = currentView === 'favorites' ? t('dashboard.emptyFlatView.subtextFavorites') : t('dashboard.emptyFlatView.subtextRecent');


  return (
    <Layout title={viewTitle}>
        <FilePreviewModal file={previewFile} isOpen={!!previewFile} onClose={() => setPreviewFile(null)} /> {/* Ensure Preview Modal is available */}

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
                ) : ( (currentView === 'favorites' || currentView === 'recent') && (
                    <FileExplorer
                        allowUpload={false}
                        externalFiles={[]} // Pass an empty array; files are filtered by status and search terms within FE.
                        flatMode={true}
                        onRefresh={fetchSpecificViewFiles}
                        hideToolbar={true}
                        externalSearchQuery={dashboardSearchTerm} // Pass external search query
                        filterStatus={dashboardFilterStatus} // Pass external filter status
                        onFileSelect={setPreviewFile} // Show file in preview modal
                        refreshKey={refreshFileExplorerKey} // Pass refresh key
                    />
                ))}
            </div>
        </div>
    </Layout>
  );
};