
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Layout } from '../components/layout/MainLayout.tsx';
import { fileService, adminService, notificationService } from '../lib/services/index.ts';
import { MASTER_ORG_ID, FileNode, ClientOrganization, FileType, SupportTicket, FileMetadata, BreadcrumbItem, UserRole } from '../types.ts';
import { useAuth } from '../context/authContext.tsx';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '../context/notificationContext.tsx'; // Importado
import { 
    X, FileUp, ArrowLeft, Download, ShieldAlert, Loader2, CheckCircle, XCircle, AlertTriangle, Info, Tag, FileText, ChevronRight, MessageSquare, Database, Search
} from 'lucide-react';

// Sub-components
import { QualityOverviewCards } from '../components/features/quality/QualityOverviewCards.tsx';
import { ClientHub } from '../components/features/client/ClientHub.tsx';
import { QualityServiceDesk } from '../components/features/quality/QualityServiceDesk.tsx'; // NOVO: Importa o Service Desk
// Fix: Import FileExplorer and its handle type
import { FileExplorer, FileExplorerHandle } from '../components/features/files/FileExplorer.tsx';
// Fix: Import FilePreviewModal
import { FilePreviewModal } from '../components/features/files/FilePreviewModal.tsx';
import { QualityOverviewStats } from '../lib/services/interfaces.ts'; // Importado

const CLIENTS_PER_PAGE = 24;

const Quality: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeView = (searchParams.get('view') as any) || 'overview';
  const { showToast } = useToast(); // Hook useToast
  
  // Clientes State
  const [clients, setClients] = useState<ClientOrganization[]>([]);
  const [clientsPage, setClientsPage] = useState(1);
  const [hasMoreClients, setHasMoreClients] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const [clientStatus, setClientStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [totalClientsCount, setTotalClientsCount] = useState(0);

  const [selectedClient, setSelectedClient] = useState<ClientOrganization | null>(null);
  // const [inboxTickets, setInboxTickets] = useState<SupportTicket[]>([]); // Removido: Gerenciado pelo QualityServiceDesk
  // Atualizado para usar QualityOverviewStats
  const [stats, setStats] = useState<QualityOverviewStats>({ pendingDocs: 0, openQualityTickets: 0, totalActiveClients: 0 }); // Adicionado totalActiveClients
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [inspectorFile, setInspectorFile] = useState<FileNode | null>(null);
  const [previewFile, setPreviewFile] = useState<FileNode | null>(null);
  const fileExplorerRef = useRef<FileExplorerHandle>(null);

  // Inspection Sidebar State
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  // Upload State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadData, setUploadData] = useState<Partial<FileMetadata>>({
      status: 'PENDING',
      productName: '',
      batchNumber: '',
      invoiceNumber: ''
  });
  const [selectedFileBlob, setSelectedFileBlob] = useState<File | null>(null);

  useEffect(() => { 
      setSelectedClient(null); 
      setInspectorFile(null); 
      setBreadcrumbs([{id: 'root', name: 'Início'}]);
      setCurrentFolderId(null);
  }, [activeView]);

  // Carregamento de dados básicos (agora inclui totalActiveClients)
  useEffect(() => {
      const loadBaseData = async () => {
          if (user) {
              setIsLoading(true);
              try {
                  const [globalStats, qualityInbox, activeClientsRes] = await Promise.all([
                      fileService.getDashboardStats(user),
                      adminService.getQualityInbox(), // Carrega tickets da caixa de entrada da qualidade
                      adminService.getClients({status: 'ACTIVE'}, 1, 1) // Busca apenas a contagem total de clientes ativos
                  ]);
                  setStats({ 
                      // Mapeia os campos relevantes de globalStats para QualityOverviewStats
                      pendingDocs: globalStats.pendingValue || 0,
                      // Calcula openQualityTickets com base nos tickets não resolvidos
                      openQualityTickets: qualityInbox.filter(t => t.status !== 'RESOLVED').length,
                      totalActiveClients: activeClientsRes.total || 0 // Armazena a contagem total de clientes ativos
                  });
              } catch (err) {
                  console.error("Erro ao carregar dados de qualidade:", err);
                  showToast("Erro ao carregar dados de qualidade.", 'error');
              } finally {
                  setIsLoading(false);
              }
          }
      };
      loadBaseData();
  }, [user, refreshTrigger]);

  // Carregamento de Clientes (Reset ao mudar filtros)
  useEffect(() => {
      if (activeView !== 'clients') return;
      
      const loadFirstClients = async () => {
          setIsLoading(true);
          try {
              const res = await adminService.getClients({ search: clientSearch, status: clientStatus }, 1, CLIENTS_PER_PAGE);
              console.log("[Quality.tsx] loadFirstClients - Response:", res);
              setClients(res.items);
              setTotalClientsCount(res.total);
              setHasMoreClients(res.hasMore);
              setClientsPage(1);
          } catch (err: any) {
              console.error("[Quality.tsx] Erro ao carregar clientes na primeira vez:", err.message);
              showToast(`Erro ao carregar clientes: ${err.message}`, 'error');
              setClients([]); // Clear clients on error
              setTotalClientsCount(0);
              setHasMoreClients(false);
          } finally {
              setIsLoading(false);
          }
      };

      const timer = setTimeout(loadFirstClients, 300); // Debounce de busca
      return () => clearTimeout(timer);
  }, [activeView, clientSearch, clientStatus, refreshTrigger]);

  const handleLoadMoreClients = async () => {
      if (isLoadingMore || !hasMoreClients) return;
      
      setIsLoadingMore(true);
      try {
          const nextPage = clientsPage + 1;
          const res = await adminService.getClients({ search: clientSearch, status: clientStatus }, nextPage, CLIENTS_PER_PAGE);
          console.log("[Quality.tsx] handleLoadMoreClients - Response:", res);
          setClients(prev => [...prev, ...res.items]);
          setHasMoreClients(res.hasMore);
          setClientsPage(nextPage);
      } catch (err: any) {
          console.error("[Quality.tsx] Erro ao carregar mais clientes:", err.message);
          showToast(`Erro ao carregar mais clientes: ${err.message}`, 'error');
          setHasMoreClients(false); // Stop trying to load more if there's an error
      } finally {
          setIsLoadingMore(false);
      }
  };

  // Atualizar Breadcrumbs ao navegar
  useEffect(() => {
    const updateCrumbs = async () => {
        const crumbs = await fileService.getBreadcrumbs(currentFolderId);
        setBreadcrumbs(crumbs);
    };
    updateCrumbs();
  }, [currentFolderId]);

  const handleInspectAction = async (action: 'APPROVE' | 'REJECT') => {
      if (!inspectorFile || !user) return;
      if (action === 'REJECT' && !rejectionReason.trim()) {
          showToast("Por favor, informe o motivo da rejeição.", 'warning');
          return;
      }
      
      setIsProcessing(true);
      try {
          const updatedMetadata: FileMetadata = {
              ...inspectorFile.metadata,
              status: (action === 'APPROVE' ? 'APPROVED' : 'REJECTED') as 'APPROVED' | 'REJECTED',
              rejectionReason: action === 'REJECT' ? rejectionReason : undefined,
              inspectedAt: new Date().toISOString(),
              inspectedBy: user.name
          };

          await fileService.updateFile(user, inspectorFile.id, { metadata: updatedMetadata });
          
          if (inspectorFile.ownerId) {
              await notificationService.addNotification(
                  inspectorFile.ownerId, 
                  action === 'APPROVE' ? "Certificado Aprovado" : "Certificado Recusado",
                  `O documento ${inspectorFile.name} (Lote: ${inspectorFile.metadata?.batchNumber}) foi analisado.`,
                  action === 'APPROVE' ? 'SUCCESS' : 'ALERT',
                  '/dashboard?view=files'
              );
          }
          showToast(`Documento ${inspectorFile.name} ${action === 'APPROVE' ? 'aprovado' : 'recusado'} com sucesso!`, 'success');

          setInspectorFile({ ...inspectorFile, metadata: updatedMetadata });
          setRejectionReason('');
          setIsRejecting(false);
          setRefreshTrigger(prev => prev + 1);
      } catch (err) {
          showToast("Erro ao processar inspeção.", 'error');
      } finally {
          setIsProcessing(false);
      }
  };

  const handleUpload = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedFileBlob || !user || !selectedClient) return;

      setIsProcessing(true);
      try {
          await fileService.uploadFile(user, {
              name: selectedFileBlob.name,
              parentId: currentFolderId,
              metadata: uploadData as any,
              fileBlob: selectedFileBlob
          } as any, selectedClient.id);

          showToast("Arquivo enviado com sucesso!", 'success');
          setIsUploadModalOpen(false);
          setSelectedFileBlob(null);
          setUploadData({ status: 'PENDING', productName: '', batchNumber: '', invoiceNumber: '' });
          setRefreshTrigger(prev => prev + 1);
      } catch (err) {
          showToast("Erro no upload do arquivo.", 'error');
      } finally {
          setIsProcessing(false);
      }
  };

  const getTitleForView = (view: string) => {
    switch (view) {
        case 'overview': return 'Visão Geral';
        case 'clients': return 'Carteira B2B';
        case 'master': return 'Biblioteca Mestra';
        case 'tickets': return 'Service Desk'; // NOVO: Título para Service Desk
        default: return 'Documentos';
    }
  };

  return (
    <Layout title={getTitleForView(activeView)}>
        <FilePreviewModal file={previewFile} isOpen={!!previewFile} onClose={() => setPreviewFile(null)} />
        
        {isUploadModalOpen && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 flex flex-col">
                    <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <FileUp size={20} className="text-blue-600"/> Enviar Novo Certificado
                        </h3>
                        <button onClick={() => setIsUploadModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={20} /></button>
                    </div>
                    
                    <form onSubmit={handleUpload} className="p-6 space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Arquivo PDF/Imagem</label>
                            <input 
                                type="file" 
                                accept="application/pdf,image/*" 
                                required 
                                onChange={e => setSelectedFileBlob(e.target.files?.[0] || null)}
                                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" 
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">Produto</label>
                                <input 
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500" 
                                    placeholder="Ex: SAE 1045"
                                    value={uploadData.productName}
                                    onChange={e => setUploadData({...uploadData, productName: e.target.value})}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">Nº Corrida/Lote</label>
                                <input 
                                    required
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 font-mono" 
                                    placeholder="L-998"
                                    value={uploadData.batchNumber}
                                    onChange={e => setUploadData({...uploadData, batchNumber: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Nota Fiscal vinculada</label>
                            <input 
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500" 
                                placeholder="NF-000123"
                                value={uploadData.invoiceNumber}
                                onChange={e => setUploadData({...uploadData, invoiceNumber: e.target.value})}
                            />
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button type="button" onClick={() => setIsUploadModalOpen(false)} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-all">Cancelar</button>
                            <button 
                                type="submit" 
                                disabled={isProcessing}
                                className="flex-[2] py-3 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isProcessing ? <Loader2 className="animate-spin" size={18}/> : 'Realizar Upload'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        <div className="h-[calc(100vh-190px)] relative">
            {selectedClient ? (
                <div className="absolute inset-0 z-40 bg-slate-50 flex flex-col animate-in slide-in-from-right-4 duration-400">
                    <div className="flex flex-col mb-4 pb-4 border-b border-slate-200 shrink-0 gap-4">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setSelectedClient(null)} className="p-2.5 bg-white border border-slate-200 rounded-xl hover:text-blue-600 shadow-sm transition-all"><ArrowLeft size={20} /></button>
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 leading-none">{selectedClient.name}</h2>
                                <p className="text-[10px] text-slate-400 font-mono mt-1 tracking-widest uppercase">{selectedClient.cnpj}</p>
                            </div>
                            <div className="flex gap-2 ml-auto">
                                <button onClick={() => setIsUploadModalOpen(true)} className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-900/20 active:scale-95 transition-all"><FileUp size={16} /> Enviar Certificado</button>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-1.5 overflow-x-auto py-1 px-1">
                            {breadcrumbs.map((crumb, idx) => (
                                <React.Fragment key={crumb.id}>
                                    <button 
                                        onClick={() => setCurrentFolderId(crumb.id === 'root' ? null : crumb.id)}
                                        className={`text-[10px] font-bold uppercase tracking-wider whitespace-nowrap px-2 py-1 rounded-md transition-all ${
                                            idx === breadcrumbs.length - 1 ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                                        }`}
                                    >
                                        {crumb.name}
                                    </button>
                                    {idx < breadcrumbs.length - 1 && <ChevronRight size={10} className="text-slate-300 shrink-0" />}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                    
                    <div className="flex-1 flex gap-4 overflow-hidden">
                        <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                             {/* Fix: Use FileExplorer component */}
                             <FileExplorer 
                                ref={fileExplorerRef} 
                                currentFolderId={currentFolderId} 
                                onNavigate={setCurrentFolderId} 
                                allowUpload={false} 
                                onFileSelect={setInspectorFile} 
                                hideToolbar={false} 
                            />
                        </div>

                        {inspectorFile && inspectorFile.type !== FileType.FOLDER && (
                            <div className="w-80 bg-white rounded-2xl border border-slate-200 shadow-xl flex flex-col animate-in slide-in-from-right-10 overflow-hidden">
                                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <FileText size={16} className="text-blue-500 shrink-0"/>
                                        <p className="text-sm font-bold truncate" title={inspectorFile.name}>{inspectorFile.name}</p>
                                    </div>
                                    <button onClick={() => setInspectorFile(null)} className="p-1 hover:bg-slate-200 rounded-lg text-slate-400 transition-colors"><X size={18}/></button>
                                </div>
                                
                                <div className="p-4 flex-1 space-y-6 overflow-y-auto custom-scrollbar">
                                    <div className="space-y-4">
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-inner">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Estado Atual</span>
                                            <div className="flex items-center gap-2">
                                                <span className={`font-bold text-[10px] px-2.5 py-1 rounded-full border flex items-center gap-1.5 uppercase tracking-wider ${
                                                    inspectorFile.metadata?.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                                    inspectorFile.metadata?.status === 'REJECTED' ? 'bg-red-50 text-red-600 border-red-100' : 
                                                    'bg-orange-50 text-orange-600 border-orange-100'
                                                }`}>
                                                    {inspectorFile.metadata?.status === 'APPROVED' ? <CheckCircle size={12}/> : 
                                                     inspectorFile.metadata?.status === 'REJECTED' ? <XCircle size={12}/> : <AlertTriangle size={12}/>}
                                                    {inspectorFile.metadata?.status || 'PENDENTE'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            {!isRejecting ? (
                                                <div className="grid grid-cols-2 gap-2">
                                                    <button 
                                                        disabled={isProcessing || inspectorFile.metadata?.status === 'APPROVED'}
                                                        onClick={() => handleInspectAction('APPROVE')}
                                                        className="flex flex-col items-center justify-center p-3 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all disabled:opacity-30 shadow-sm"
                                                    >
                                                        <CheckCircle size={18} className="mb-1" />
                                                        <span className="text-[10px] font-bold uppercase">Aprovar</span>
                                                    </button>
                                                    <button 
                                                        disabled={isProcessing || inspectorFile.metadata?.status === 'REJECTED'}
                                                        onClick={() => setIsRejecting(true)}
                                                        className="flex flex-col items-center justify-center p-3 rounded-xl border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition-all disabled:opacity-30 shadow-sm"
                                                    >
                                                        <XCircle size={18} className="mb-1" />
                                                        <span className="text-[10px] font-bold uppercase">Recusar</span>
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="space-y-3 p-3 bg-red-50 rounded-xl border border-red-100 animate-in slide-in-from-top-2">
                                                    <div className="flex items-center gap-2 text-red-700 font-bold text-xs uppercase mb-1">
                                                        <MessageSquare size={14}/> Justificativa
                                                    </div>
                                                    <textarea 
                                                        className="w-full p-3 bg-white border border-red-200 rounded-lg text-xs h-24 resize-none focus:ring-2 focus:ring-red-500 outline-none"
                                                        placeholder="Descreva o motivo da não conformidade..."
                                                        value={rejectionReason}
                                                        onChange={e => setRejectionReason(e.target.value)}
                                                    />
                                                    <div className="flex gap-2">
                                                        <button 
                                                            onClick={() => setIsRejecting(false)} 
                                                            className="flex-1 py-2 text-[10px] font-bold text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
                                                        >
                                                            Cancelar
                                                        </button>
                                                        <button 
                                                            onClick={() => handleInspectAction('REJECT')}
                                                            className="flex-1 py-2 text-[10px] font-bold text-white bg-red-600 rounded-lg hover:bg-red-700"
                                                        >
                                                            Confirmar Recusa
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Tag size={14} />
                                            <span className="text-[10px] font-black uppercase tracking-[2px]">Dados do Lote</span>
                                        </div>
                                        <div className="grid grid-cols-1 gap-3">
                                            <div className="p-3 border border-slate-100 rounded-xl bg-white shadow-sm">
                                                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Produto</p>
                                                <p className="text-xs font-bold text-slate-800">{inspectorFile.metadata?.productName || 'N/A'}</p>
                                            </div>
                                            <div className="p-3 border border-slate-100 rounded-xl bg-white shadow-sm">
                                                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Nº Corrida</p>
                                                <p className="text-xs font-mono font-black text-blue-600">{inspectorFile.metadata?.batchNumber || '-'}</p>
                                            </div>
                                            <div className="p-3 border border-slate-100 rounded-xl bg-white shadow-sm">
                                                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Nota Fiscal</p>
                                                <p className="text-xs font-bold text-slate-800">{inspectorFile.metadata?.invoiceNumber || '-'}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {inspectorFile.metadata?.inspectedAt && (
                                        <div className="pt-4 flex flex-col gap-1 border-t border-slate-50">
                                            <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Última Análise</p>
                                            <p className="text-[10px] text-slate-500 italic flex items-center gap-1.5">
                                                <Info size={12} className="text-blue-500"/>
                                                {inspectorFile.metadata.inspectedBy} • {new Date(inspectorFile.metadata.inspectedAt).toLocaleString()}
                                            </p>
                                            {inspectorFile.metadata.rejectionReason && (
                                                <p className="mt-2 text-[10px] text-red-600 bg-red-50 p-2 rounded-lg border border-red-100 font-medium">
                                                    " {inspectorFile.metadata.rejectionReason} "
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-2">
                                    <button onClick={() => setPreviewFile(inspectorFile)} className="flex-1 py-3 bg-slate-950 text-white rounded-xl text-xs font-bold shadow-lg hover:bg-slate-800 active:scale-95 transition-all uppercase tracking-widest">Visualizar PDF</button>
                                    <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-blue-600 transition-all shadow-sm"><Download size={18}/></button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="h-full flex flex-col">
                    {activeView === 'overview' && (
                        <QualityOverviewCards 
                            totalClients={stats.totalActiveClients} 
                            totalPendingDocs={stats.pendingDocs} 
                            totalOpenTickets={stats.openQualityTickets} 
                            // totalInbox={stats.openQualityTickets} // REMOVIDO: Prop redundante
                            onChangeView={(v) => setSearchParams({view: v})} 
                        />
                    )}
                    {activeView === 'clients' && (
                        <ClientHub 
                            clients={clients} 
                            clientSearch={clientSearch} 
                            setClientSearch={setClientSearch} 
                            clientStatus={clientStatus}
                            setClientStatus={setClientStatus}
                            onSelectClient={setSelectedClient} 
                            isLoading={isLoading}
                            isLoadingMore={isLoadingMore}
                            hasMore={hasMoreClients}
                            onLoadMore={handleLoadMoreClients}
                        />
                    )}
                    {activeView === 'master' && (
                        <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col animate-in fade-in duration-500">
                            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-900 text-white rounded-lg"><Database size={20}/></div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Repositório Mestre Vital</h3>
                                        <p className="text-[10px] text-slate-400">Modelos de certificados e especificações técnicas globais.</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => setSearchParams({view: 'overview'})} className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all">Voltar</button>
                                </div>
                            </div>
                            <div className="flex-1 overflow-hidden">
                                {/* Fix: Use FileExplorer component */}
                                <FileExplorer 
                                    initialFolderId={null} 
                                    currentFolderId={currentFolderId} 
                                    onNavigate={setCurrentFolderId} 
                                    allowUpload={user?.role === UserRole.ADMIN} 
                                    hideToolbar={false} 
                                />
                            </div>
                        </div>
                    )}
                    {activeView === 'tickets' && ( // NOVO: Renderiza o QualityServiceDesk
                        <QualityServiceDesk refreshTrigger={refreshTrigger} onRefresh={() => setRefreshTrigger(prev => prev + 1)}/>
                    )}
                </div>
            )}
        </div>
    </Layout>
  );
};

export default Quality;