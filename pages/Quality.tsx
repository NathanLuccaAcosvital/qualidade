
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Layout } from '../components/layout/MainLayout.tsx';
import { fileService, adminService, notificationService, userService } from '../lib/services/index.ts'; // Importa userService
import { FileNode, ClientOrganization, FileType, FileMetadata, BreadcrumbItem, UserRole, User, AuditLog } from '../types.ts'; // Importa User, AuditLog
import { useAuth } from '../context/authContext.tsx';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '../context/notificationContext.tsx'; // Importado
import { 
    X, FileUp, ArrowLeft, Download, ShieldAlert, Loader2, CheckCircle, XCircle, AlertTriangle, Info, Tag, FileText, ChevronRight, MessageSquare, Database, Search, UserPlus, Building2, FolderPlus, Activity, Eye
} from 'lucide-react';

// Sub-components
import { QualityOverviewCards } from '../components/features/quality/QualityOverviewCards.tsx';
import { ClientHub } from '../components/features/client/ClientHub.tsx';
import { FileExplorer, FileExplorerHandle } from '../components/features/files/FileExplorer.tsx';
import { FilePreviewModal } from '../components/features/files/FilePreviewModal.tsx';
import { QualityOverviewStats } from '../lib/services/interfaces.ts';
import { UserModal, ClientModal, CreateFolderModal } from '../components/features/admin/modals/AdminModals.tsx'; // NOVO: Importa UserModal, ClientModal, CreateFolderModal
import { AuditLogsTable } from '../components/features/admin/AuditLogsTable.tsx'; // Importa AuditLogsTable

const CLIENTS_PER_PAGE = 24;

const Quality: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeView = (searchParams.get('view') as any) || 'overview';
  const { showToast } = useToast();
  
  // Clientes State
  const [clients, setClients] = useState<ClientOrganization[]>([]);
  const [clientsPage, setClientsPage] = useState(1);
  const [hasMoreClients, setHasMoreClients] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const [clientStatus, setClientStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [totalClientsCount, setTotalClientsCount] = useState(0);

  const [selectedClient, setSelectedClient] = useState<ClientOrganization | null>(null);
  const [stats, setStats] = useState<QualityOverviewStats>({ pendingDocs: 0, totalActiveClients: 0 });
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [inspectorFile, setInspectorFile] = useState<FileNode | null>(null);
  const [previewFile, setPreviewFile] = useState<FileNode | null>(null);
  const fileExplorerRef = useRef<FileExplorerHandle>(null);

  const [fileExplorerRefreshKey, setFileExplorerRefreshKey] = useState(0);

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

  // NOVO: Estados para gerenciamento de Usuários (CLIENT)
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userFormData, setUserFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    role: UserRole.CLIENT, // Sempre CLIENT para esta view
    organizationId: '',
    department: '',
    status: 'ACTIVE',
  });

  // NOVO: Estados para gerenciamento de Clientes (Empresas)
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientOrganization | null>(null);
  const [clientFormData, setClientFormData] = useState({ 
    name: '', 
    cnpj: '', 
    contractDate: '', 
    status: 'ACTIVE',
    qualityAnalystId: '',
  });
  const [qualityAnalysts, setQualityAnalysts] = useState<User[]>([]); // Lista de analistas para o ClientModal

  // NOVO: Estados para criar pasta
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // NOVO: Estados para Logs de Auditoria da Qualidade
  const [qualityAuditLogs, setQualityAuditLogs] = useState<AuditLog[]>([]);
  const [loadingAuditLogs, setLoadingAuditLogs] = useState(false);
  const [auditLogSearch, setAuditLogSearch] = useState('');
  const [auditLogSeverityFilter, setAuditLogSeverityFilter] = useState<'ALL' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL'>('ALL');
  const [isAuditLogInvestigationModalOpen, setIsAuditLogInvestigationModalOpen] = useState(false);
  const [auditLogInvestigationData, setAuditLogInvestigationData] = useState<{ targetLog: AuditLog | null; relatedLogs: AuditLog[]; riskScore: number; }>({ targetLog: null, relatedLogs: [], riskScore: 0 });


  useEffect(() => { 
      setSelectedClient(null); 
      setInspectorFile(null); 
      setCurrentFolderId(null);
  }, [activeView, t]);

  // Carregamento de dados básicos (KPIs e status do sistema)
  useEffect(() => {
      const loadBaseData = async () => {
          if (user) {
              setIsLoading(true);
              try {
                  const [globalStats, activeClientsRes, qAnalysts] = await Promise.all([ // NOVO: Busca analistas
                      fileService.getDashboardStats(user),
                      adminService.getClients({status: 'ACTIVE'}, 1, CLIENTS_PER_PAGE),
                      userService.getUsersByRole(UserRole.QUALITY), // Busca analistas de qualidade
                  ]);
                  setStats({ 
                      pendingDocs: globalStats.pendingValue || 0,
                      totalActiveClients: activeClientsRes.total || 0
                  });
                  setQualityAnalysts(qAnalysts); // Define os analistas
              } catch (err) {
                  console.error("Erro ao carregar dados de qualidade:", err);
                  showToast(t('quality.errorLoadingQualityData'), 'error');
              } finally {
                  setIsLoading(false);
              }
          }
      };
      loadBaseData();
  }, [user, refreshTrigger, showToast, t]);

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
              showToast(t('quality.errorLoadingClients', { message: err.message }), 'error');
              setClients([]);
              setTotalClientsCount(0);
              setHasMoreClients(false);
          } finally {
              setIsLoading(false);
          }
      };

      const timer = setTimeout(loadFirstClients, 300);
      return () => clearTimeout(timer);
  }, [activeView, clientSearch, clientStatus, refreshTrigger, showToast, t]);

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
          showToast(t('quality.errorLoadingMoreClients', { message: err.message }), 'error');
          setHasMoreClients(false);
      } finally {
          setIsLoadingMore(false);
      }
  };

  // Carregamento de Logs de Auditoria da Qualidade
  useEffect(() => {
    if (activeView !== 'audit-log' || !user) return;

    const loadQualityLogs = async () => {
        setLoadingAuditLogs(true);
        try {
            const logs = await fileService.getQualityAuditLogs(user, { 
                search: auditLogSearch, 
                severity: auditLogSeverityFilter 
            });
            setQualityAuditLogs(logs);
        } catch (err: any) {
            console.error("Erro ao carregar logs de auditoria da qualidade:", err.message);
            showToast(t('common.errorLoadingLogs', { message: err.message }), 'error'); // Usar uma chave genérica
            setQualityAuditLogs([]);
        } finally {
            setLoadingAuditLogs(false);
        }
    };

    const timer = setTimeout(loadQualityLogs, 300); // Debounce search/filter
    return () => clearTimeout(timer);
  }, [activeView, user, auditLogSearch, auditLogSeverityFilter, refreshTrigger, showToast, t]);

  // Atualizar Breadcrumbs ao navegar
  useEffect(() => {
    const updateCrumbs = async () => {
        const crumbs = await fileService.getBreadcrumbs(currentFolderId);
        setBreadcrumbs(crumbs.map(c => ({...c, name: c.id === 'root' ? t('common.home') : c.name})));
    };
    updateCrumbs();
  }, [currentFolderId, t]);

  const handleInspectAction = async (action: 'APPROVE' | 'REJECT') => {
      if (!inspectorFile || !user) return;
      if (action === 'REJECT' && !rejectionReason.trim()) {
          showToast(t('quality.reasonRequired'), 'warning');
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
                  action === 'APPROVE' ? t('quality.documentApprovedTitle') : t('quality.documentRejectedTitle'),
                  t('quality.documentInspectedMessage', { fileName: inspectorFile.name, batchNumber: inspectorFile.metadata?.batchNumber }),
                  action === 'APPROVE' ? 'SUCCESS' : 'ALERT',
                  '/dashboard?view=files'
              );
          }
          showToast(t(`quality.document${action === 'APPROVE' ? 'Approved' : 'Rejected'}Success`, { fileName: inspectorFile.name }), 'success');
          
          await fileService.logAction(user, `FILE_INSPECT_${action}`, inspectorFile.name, 'DATA', 
                                     action === 'APPROVE' ? 'INFO' : 'WARNING', 'SUCCESS', 
                                     { fileId: inspectorFile.id, oldStatus: inspectorFile.metadata?.status, newStatus: updatedMetadata.status, rejectionReason: updatedMetadata.rejectionReason });

          setInspectorFile({ ...inspectorFile, metadata: updatedMetadata });
          setRejectionReason('');
          setIsRejecting(false);
          setRefreshTrigger(prev => prev + 1);
          setFileExplorerRefreshKey(prev => prev + 1);
      } catch (err: any) {
          showToast(t('quality.errorProcessingInspection'), 'error');
          await fileService.logAction(user, `FILE_INSPECT_${action}`, inspectorFile?.name || 'Unknown', 'DATA', 
                                     'ERROR', 'FAILURE', { fileId: inspectorFile?.id, reason: err.message });
      } finally {
          setIsProcessing(false);
      }
  };

  // NOVO: Função para deletar um arquivo (apenas pastas para Quality)
  const handleDeleteFile = async (file: FileNode) => {
    if (!user) return;
    // ANALISTAS DE QUALIDADE SÓ PODEM DELETAR PASTAS, NÃO ARQUIVOS INDIVIDUAIS
    if (file.type !== FileType.FOLDER) {
        showToast("Permissão negada: Analistas de Qualidade não podem excluir arquivos, apenas pastas.", 'error');
        return;
    }
    if (!window.confirm(t('files.confirmDelete', { fileName: file.name }))) return;

    setIsProcessing(true);
    try {
      await fileService.deleteFile(user, file.id); // Este serviço já contém a lógica de permissão
      showToast(t('files.fileDeletedSuccess', { fileName: file.name }), 'success');
      setRefreshTrigger(prev => prev + 1);
      setFileExplorerRefreshKey(prev => prev + 1); 
      setInspectorFile(null);
    } catch (err: any) {
      console.error("Erro ao deletar arquivo/pasta:", err);
      showToast(t('files.errorDeletingFile'), 'error');
      await fileService.logAction(user, 'FILE_DELETE', file.name, 'DATA', 'ERROR', 'FAILURE', { fileId: file.id, reason: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  // NOVO: Função para mudar o status de um arquivo para PENDING
  const handleSetFileStatusToPending = async (file: FileNode) => {
    if (!user) return;
    if (file.metadata?.status === 'PENDING') {
      showToast(t('quality.alreadyPending'), 'info');
      return;
    }
    if (!window.confirm(t('quality.confirmSetPending', { fileName: file.name }))) return;

    setIsProcessing(true);
    try {
      const updatedMetadata: FileMetadata = {
        ...file.metadata,
        status: 'PENDING',
        rejectionReason: undefined,
        inspectedAt: new Date().toISOString(),
        inspectedBy: user.name
      };
      await fileService.updateFile(user, file.id, { metadata: updatedMetadata });
      showToast(t('quality.fileSetPendingSuccess', { fileName: file.name }), 'success');
      
      await fileService.logAction(user, 'FILE_STATUS_TO_PENDING', file.name, 'DATA', 'INFO', 'SUCCESS', 
                                 { fileId: file.id, oldStatus: file.metadata?.status, newStatus: 'PENDING' });

      setRefreshTrigger(prev => prev + 1);
      setFileExplorerRefreshKey(prev => prev + 1);
      setInspectorFile(null);
    } catch (err: any) {
      console.error("Erro ao mudar status para pendente:", err);
      showToast(t('quality.errorSettingPending'), 'error');
      await fileService.logAction(user, 'FILE_STATUS_TO_PENDING', file.name, 'DATA', 'ERROR', 'FAILURE', 
                                 { fileId: file.id, reason: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedFileBlob || !user) return;

      let targetOwnerId: string;
      if (selectedClient) {
          targetOwnerId = selectedClient.id;
      } else {
          showToast(t('quality.selectClient'), 'error');
          return;
      }

      setIsProcessing(true);
      try {
          await fileService.uploadFile(user, {
              name: selectedFileBlob.name,
              parentId: currentFolderId, 
              metadata: uploadData as any,
              fileBlob: selectedFileBlob
          } as any, targetOwnerId);

          showToast(t('quality.documentUploadedSuccess'), 'success');
          setIsUploadModalOpen(false);
          setSelectedFileBlob(null);
          setUploadData({ status: 'PENDING', productName: '', batchNumber: '', invoiceNumber: '' });
          setRefreshTrigger(prev => prev + 1);
          setFileExplorerRefreshKey(prev => prev + 1);
      } catch (err: any) { 
          console.error("Erro no upload do arquivo:", err);
          const errorMessage = err.message || t('quality.errorUploadingFile', { message: 'Erro desconhecido' });
          showToast(t('quality.errorUploadingFile', { message: errorMessage }), 'error');
      } finally {
          setIsProcessing(false);
      }
  };

  const openUploadModalForClient = () => {
      setIsUploadModalOpen(true);
      setUploadData({ status: 'PENDING', productName: '', batchNumber: '', invoiceNumber: '' });
      setSelectedFileBlob(null);
  };

  // NOVO: Funções para gerenciar usuários (CLIENT)
  const openUserModal = (u?: User) => {
    if (u) { 
      setEditingUser(u); 
      setUserFormData({ name: u.name, email: u.email, password: '', role: u.role, organizationId: u.organizationId || '', status: u.status || 'ACTIVE', department: u.department || '' });
    } else { 
      // Ao criar, o role é sempre CLIENT e a organizationId é a do cliente selecionado
      setUserFormData({ 
        name: '', 
        email: '', 
        password: '', 
        role: UserRole.CLIENT, 
        organizationId: selectedClient?.id || '', // Preenche automaticamente se um cliente está selecionado
        status: 'ACTIVE', 
        department: '' 
      });
      setEditingUser(null); 
    }
    setIsUserModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
        if (!editingUser) {
            // Certifica-se que o usuário é cliente e tem organização vinculada
            if (!userFormData.organizationId && selectedClient) {
                userFormData.organizationId = selectedClient.id;
            }
            if (!userFormData.organizationId) {
                showToast("É necessário vincular o usuário a uma organização.", 'error');
                setIsProcessing(false);
                return;
            }
            await userService.signUp(userFormData.email, userFormData.password, userFormData.name, userFormData.organizationId, userFormData.department);
            showToast("Usuário cliente criado com sucesso!", 'success');
        } else {
            const userPayload: User = { 
                id: editingUser.id, name: userFormData.name, email: userFormData.email, role: userFormData.role as UserRole, 
                organizationId: (userFormData.role === UserRole.CLIENT && userFormData.organizationId) ? userFormData.organizationId : undefined,
                status: userFormData.status as any, department: userFormData.department, lastLogin: editingUser?.lastLogin || 'Nunca' 
            };
            await userService.saveUser(userPayload);
            showToast("Usuário cliente atualizado com sucesso!", 'success');
        }
        setIsUserModalOpen(false); setEditingUser(null);
        setRefreshTrigger(prev => prev + 1); // Recarrega dados, incluindo clientes/usuários
        setIsProcessing(false);
    } catch (err: any) {
        showToast(`Erro ao salvar usuário cliente: ${err.message}`, 'error');
        setIsProcessing(false);
    }
  };

  // NOVO: Funções para gerenciar clientes (Empresas)
  const openClientModal = (c?: ClientOrganization) => {
      if (c) { 
          setEditingClient(c); 
          setClientFormData({ 
              name: c.name, 
              cnpj: c.cnpj, 
              contractDate: c.contractDate, 
              status: c.status,
              qualityAnalystId: c.qualityAnalystId || '',
          }); 
      } else { 
          setClientFormData({ 
              name: '', 
              cnpj: '', 
              contractDate: new Date().toISOString().split('T')[0], 
              status: 'ACTIVE',
              qualityAnalystId: user?.id || '', // Sugere o próprio analista de qualidade logado
          }); 
          setEditingClient(null); 
      }
      setIsClientModalOpen(true);
  };

  const handleSaveClient = async (e: React.FormEvent, confirmEmail: string, confirmPassword: string) => {
      e.preventDefault(); 
      if (!user) return;

      setIsProcessing(true);
      try {
        // 1. Verificar credenciais de segurança
        if (confirmEmail.toLowerCase() !== user.email.toLowerCase()) {
            showToast(t('quality.emailMismatchError'), 'error');
            setIsProcessing(false);
            return;
        }

        const authResult = await userService.authenticate(confirmEmail, confirmPassword);
        if (!authResult.success) {
            showToast(t('quality.invalidConfirmationCredentials'), 'error');
            setIsProcessing(false);
            return;
        }

        // 2. Se a verificação de segurança passar, prosseguir com o salvamento da empresa
        const selectedAnalyst = qualityAnalysts.find(qa => qa.id === clientFormData.qualityAnalystId);
        const clientPayload: Partial<ClientOrganization> = { 
            id: editingClient?.id, 
            name: clientFormData.name, 
            cnpj: clientFormData.cnpj, 
            contractDate: clientFormData.contractDate, 
            status: clientFormData.status as any,
            qualityAnalystId: clientFormData.qualityAnalystId,
            qualityAnalystName: selectedAnalyst?.name,
        };
        await adminService.saveClient(user, clientPayload);
        showToast("Empresa salva com sucesso!", 'success');
        setIsClientModalOpen(false); setEditingClient(null); 
        setRefreshTrigger(prev => prev + 1);
        setIsProcessing(false);
      } catch (err: any) {
        showToast(`Erro ao salvar empresa: ${err.message}`, 'error');
        setIsProcessing(false);
      }
  };

  // NOVO: Função para criar uma pasta
  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newFolderName.trim() || !selectedClient?.id) return;

    setIsProcessing(true);
    try {
        await fileService.createFolder(user, currentFolderId, newFolderName.trim(), selectedClient.id);
        showToast(t('quality.folderCreatedSuccess', { folderName: newFolderName }), 'success');
        setIsCreateFolderModalOpen(false);
        setNewFolderName('');
        setFileExplorerRefreshKey(prev => prev + 1); // Força o refresh do FileExplorer
    } catch (err: any) {
        showToast(t('quality.errorCreatingFolder', { message: err.message }), 'error');
    } finally {
        setIsProcessing(false);
    }
  };

  // NOVO: Função para abrir o modal de investigação de log
  const handleOpenQualityAuditLogInvestigation = (log: AuditLog) => {
      const related = qualityAuditLogs.filter(l => (l.ip === log.ip && l.ip !== '10.0.0.1') || (l.userId === log.userId && l.userId !== 'unknown')).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setAuditLogInvestigationData({ targetLog: log, relatedLogs: related, riskScore: log.severity === 'CRITICAL' ? 85 : 20 });
      setIsAuditLogInvestigationModalOpen(true);
  };

  const getTitleForView = (view: string) => {
    switch (view) {
        case 'overview': return t('quality.overview');
        case 'clients': return t('quality.b2bPortfolio');
        case 'audit-log': return t('quality.myAuditLog'); // NOVO
        default: return t('menu.documents');
    }
  };

  return (
    <Layout title={getTitleForView(activeView)}>
        <FilePreviewModal file={previewFile} isOpen={!!previewFile} onClose={() => setPreviewFile(null)} />
        
        {isUploadModalOpen && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300" role="dialog" aria-modal="true" aria-labelledby="upload-modal-title">
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 flex flex-col">
                    <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h3 id="upload-modal-title" className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <FileUp size={20} className="text-blue-600" aria-hidden="true"/> {t('quality.sendNewCertificate')}
                        </h3>
                        <button onClick={() => setIsUploadModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors" aria-label={t('common.close')}><X size={20} aria-hidden="true"/></button>
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
                                    onChange={e => setUploadData({...uploadData, productName: e.target.value})}
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
                                    onChange={e => setUploadData({...uploadData, batchNumber: e.target.value})}
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
                                onChange={e => setUploadData({...uploadData, invoiceNumber: e.target.value})}
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
                                {isProcessing ? <Loader2 className="animate-spin" size={18} aria-hidden="true"/> : t('quality.uploadFile')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* NOVO: Modal de Criação de Usuário (CLIENT) */}
        <UserModal 
            isOpen={isUserModalOpen} 
            onClose={() => setIsUserModalOpen(false)} 
            onSave={handleSaveUser} 
            editingUser={editingUser} 
            formData={userFormData} 
            setFormData={setUserFormData} 
            organizations={clients} // Passa a lista de clientes para vincular
        />

        {/* NOVO: Modal de Criação/Edição de Cliente (Empresa) */}
        <ClientModal 
            isOpen={isClientModalOpen} 
            onClose={() => setIsClientModalOpen(false)} 
            onSave={handleSaveClient} 
            editingClient={editingClient} 
            clientFormData={clientFormData} 
            setClientFormData={setClientFormData} 
            qualityAnalysts={qualityAnalysts} 
            onDelete={undefined} // Analistas de qualidade NÃO podem excluir empresas
        />

        {/* NOVO: Modal de Criação de Pasta */}
        <CreateFolderModal
            isOpen={isCreateFolderModalOpen}
            onClose={() => setIsCreateFolderModalOpen(false)}
            onSave={handleCreateFolder}
            isSaving={isProcessing}
            folderName={newFolderName}
            setFolderName={setNewFolderName}
        />

        {/* NOVO: Modal de Investigação de Log de Auditoria (reaproveitando do Admin) */}
        {/* Implementar modal de investigação aqui se necessário, ou usar um pop-up simples */}
        {isAuditLogInvestigationModalOpen && auditLogInvestigationData.targetLog && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300" role="dialog" aria-modal="true" aria-labelledby="audit-log-investigation-title">
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 flex flex-col">
                    <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h3 id="audit-log-investigation-title" className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <Eye size={20} className="text-blue-600" aria-hidden="true"/> Detalhes do Log
                        </h3>
                        <button onClick={() => setIsAuditLogInvestigationModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors" aria-label={t('common.close')}><X size={20} aria-hidden="true"/></button>
                    </div>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-500 uppercase">Usuário:</p>
                            <p className="font-semibold text-slate-800">{auditLogInvestigationData.targetLog.userName} ({auditLogInvestigationData.targetLog.userRole})</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-500 uppercase">Ação:</p>
                            <p className="font-semibold text-slate-800">{auditLogInvestigationData.targetLog.action}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-500 uppercase">Alvo:</p>
                            <p className="font-semibold text-slate-800">{auditLogInvestigationData.targetLog.target}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-500 uppercase">Severidade:</p>
                            <p className={`font-semibold ${auditLogInvestigationData.targetLog.severity === 'CRITICAL' ? 'text-red-600' : 'text-slate-800'}`}>
                                {auditLogInvestigationData.targetLog.severity}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-500 uppercase">Metadados:</p>
                            <pre className="bg-slate-50 p-3 rounded-lg text-xs overflow-x-auto border border-slate-200">
                                {JSON.stringify(auditLogInvestigationData.targetLog.metadata, null, 2)}
                            </pre>
                        </div>
                        {auditLogInvestigationData.relatedLogs.length > 1 && ( // +1 because targetLog is included
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-slate-500 uppercase">Atividades Relacionadas ({auditLogInvestigationData.relatedLogs.length - 1}):</p>
                                <ul className="list-disc pl-5 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                                    {auditLogInvestigationData.relatedLogs.filter(log => log.id !== auditLogInvestigationData.targetLog?.id).map(log => (
                                        <li key={log.id}>
                                            <span className="font-medium">{log.userName}</span>: {log.action} em <span className="font-mono">{log.target}</span> em {new Date(log.timestamp).toLocaleString()}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}

        <div className="h-[calc(100vh-190px)] relative">
            {selectedClient ? (
                <div className="absolute inset-0 z-40 bg-slate-50 flex flex-col animate-in slide-in-from-right-4 duration-400">
                    <div className="flex flex-col mb-4 pb-4 border-b border-slate-200 shrink-0 gap-4">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setSelectedClient(null)} className="p-2.5 bg-white border border-slate-200 rounded-xl hover:text-blue-600 shadow-sm transition-all" aria-label={t('common.back')}><ArrowLeft size={20} aria-hidden="true" /></button>
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 leading-none">{selectedClient.name}</h2>
                                <p className="text-[10px] text-slate-400 font-mono mt-1 tracking-widest uppercase">{selectedClient.cnpj}</p>
                            </div>
                            <div className="flex gap-2 ml-auto">
                                {/* NOVO: Botão Criar Pasta */}
                                <button 
                                    onClick={() => setIsCreateFolderModalOpen(true)}
                                    className="bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-slate-900/20 active:scale-95 transition-all"
                                    aria-label={t('quality.createFolder')}
                                >
                                    <FolderPlus size={16} aria-hidden="true" /> {t('quality.createFolder')}
                                </button>
                                <button 
                                    onClick={() => openUploadModalForClient()}
                                    className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-900/20 active:scale-95 transition-all"
                                    aria-label={t('quality.sendNewCertificate')}
                                >
                                    <FileUp size={16} aria-hidden="true" /> {t('quality.sendNewCertificate')}
                                </button>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-1.5 overflow-x-auto py-1 px-1" role="navigation" aria-label={t('files.breadcrumbs')}>
                            {breadcrumbs.map((crumb, idx) => (
                                <React.Fragment key={crumb.id}>
                                    <button 
                                        onClick={() => setCurrentFolderId(crumb.id === 'root' ? null : crumb.id)}
                                        className={`text-[10px] font-bold uppercase tracking-wider whitespace-nowrap px-2 py-1 rounded-md transition-all ${
                                            idx === breadcrumbs.length - 1 ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                                        }`}
                                        aria-label={crumb.name}
                                    >
                                        {crumb.name}
                                    </button>
                                    {idx < breadcrumbs.length - 1 && <ChevronRight size={10} className="text-slate-300 shrink-0" aria-hidden="true" />}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                    
                    <div className="flex-1 flex gap-4 overflow-hidden">
                        <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                             <FileExplorer 
                                ref={fileExplorerRef} 
                                currentFolderId={currentFolderId} 
                                onNavigate={setCurrentFolderId} 
                                allowUpload={false}
                                onFileSelect={setInspectorFile} 
                                hideToolbar={false} 
                                refreshKey={fileExplorerRefreshKey} 
                                onDeleteFile={handleDeleteFile} // Analistas de qualidade podem excluir pastas
                                onSetStatusToPending={handleSetFileStatusToPending} 
                                onCreateFolder={() => setIsCreateFolderModalOpen(true)}
                                // onEdit={...} // Se houver edição de metadados de arquivo, passaria aqui
                            />
                        </div>

                        {inspectorFile && inspectorFile.type !== FileType.FOLDER && (
                            <div className="w-80 bg-white rounded-2xl border border-slate-200 shadow-xl flex flex-col animate-in slide-in-from-right-10 overflow-hidden" role="complementary" aria-labelledby="inspector-file-name">
                                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <FileText size={16} className="text-blue-500 shrink-0" aria-hidden="true"/>
                                        <p id="inspector-file-name" className="text-sm font-bold truncate" title={inspectorFile.name}>{inspectorFile.name}</p>
                                    </div>
                                    <button onClick={() => setInspectorFile(null)} className="p-1 hover:bg-slate-200 rounded-lg text-slate-400 transition-colors" aria-label={t('common.close')}><X size={18} aria-hidden="true"/></button>
                                </div>
                                
                                <div className="p-4 flex-1 space-y-6 overflow-y-auto custom-scrollbar">
                                    <div className="space-y-4">
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-inner">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">{t('quality.currentStatus')}</span>
                                            <div className="flex items-center gap-2">
                                                <span className={`font-bold text-[10px] px-2.5 py-1 rounded-full border flex items-center gap-1.5 uppercase tracking-wider ${
                                                    inspectorFile.metadata?.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                                    inspectorFile.metadata?.status === 'REJECTED' ? 'bg-red-50 text-red-600 border-red-100' : 
                                                    'bg-orange-50 text-orange-600 border-orange-100'
                                                }`} aria-label={inspectorFile.metadata?.status ? t(`files.groups.${inspectorFile.metadata.status.toLowerCase()}`) : t('files.pending')}>
                                                    {inspectorFile.metadata?.status === 'APPROVED' ? <CheckCircle size={12} aria-hidden="true"/> : 
                                                     inspectorFile.metadata?.status === 'REJECTED' ? <XCircle size={12} aria-hidden="true"/> : <AlertTriangle size={12} aria-hidden="true"/>}
                                                    {inspectorFile.metadata?.status ? t(`files.groups.${inspectorFile.metadata.status.toLowerCase()}`) : t('files.pending')}
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
                                                        aria-label={t('quality.approve')}
                                                    >
                                                        <CheckCircle size={18} aria-hidden="true" className="mb-1" />
                                                        <span className="text-[10px] font-bold uppercase">{t('quality.approve')}</span>
                                                    </button>
                                                    <button 
                                                        disabled={isProcessing || inspectorFile.metadata?.status === 'REJECTED'}
                                                        onClick={() => setIsRejecting(true)}
                                                        className="flex flex-col items-center justify-center p-3 rounded-xl border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition-all disabled:opacity-30 shadow-sm"
                                                        aria-label={t('quality.reject')}
                                                    >
                                                        <XCircle size={18} aria-hidden="true" className="mb-1" />
                                                        <span className="text-[10px] font-bold uppercase">{t('quality.reject')}</span>
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="space-y-3 p-3 bg-red-50 rounded-xl border border-red-100 animate-in slide-in-from-top-2">
                                                    <div className="flex items-center gap-2 text-red-700 font-bold text-xs uppercase mb-1">
                                                        <MessageSquare size={14} aria-hidden="true"/> {t('quality.justification')}
                                                    </div>
                                                    <textarea 
                                                        className="w-full p-3 bg-white border border-red-200 rounded-lg text-xs h-24 resize-none focus:ring-2 focus:ring-red-500 outline-none"
                                                        placeholder={t('quality.rejectionReasonPlaceholder')}
                                                        value={rejectionReason}
                                                        onChange={e => setRejectionReason(e.target.value)}
                                                        aria-label={t('quality.rejectionReasonPlaceholder')}
                                                    />
                                                    <div className="flex gap-2">
                                                        <button 
                                                            onClick={() => setIsRejecting(false)} 
                                                            className="flex-1 py-2 text-[10px] font-bold text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
                                                            aria-label={t('common.cancel')}
                                                        >
                                                            {t('common.cancel')}
                                                        </button>
                                                        <button 
                                                            onClick={() => handleInspectAction('REJECT')}
                                                            className="flex-1 py-2 text-[10px] font-bold text-white bg-red-600 rounded-lg hover:bg-red-700"
                                                            aria-label={t('quality.confirmRejection')}
                                                        >
                                                            {t('quality.confirmRejection')}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Tag size={14} aria-hidden="true" />
                                            <span className="text-[10px] font-black uppercase tracking-[2px]">{t('quality.batchData')}</span>
                                        </div>
                                        <div className="grid grid-cols-1 gap-3">
                                            <div className="p-3 border border-slate-100 rounded-xl bg-white shadow-sm">
                                                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">{t('quality.productLabel')}</p>
                                                <p className="text-xs font-bold text-slate-800">{inspectorFile.metadata?.productName || t('common.na')}</p>
                                            </div>
                                            <div className="p-3 border border-slate-100 rounded-xl bg-white shadow-sm">
                                                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">{t('quality.batchLabel')}</p>
                                                <p className="text-xs font-mono font-black text-blue-600">{inspectorFile.metadata?.batchNumber || '-'}</p>
                                            </div>
                                            <div className="p-3 border border-slate-100 rounded-xl bg-white shadow-sm">
                                                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">{t('quality.invoiceLabel')}</p>
                                                <p className="text-xs font-bold text-slate-800">{inspectorFile.metadata?.invoiceNumber || '-'}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {inspectorFile.metadata?.inspectedAt && (
                                        <div className="pt-4 flex flex-col gap-1 border-t border-slate-50">
                                            <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">{t('quality.lastAnalysis')}</p>
                                            <p className="text-[10px] text-slate-500 italic flex items-center gap-1.5">
                                                <Info size={12} aria-hidden="true" className="text-blue-500"/>
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
                                    <button onClick={() => setPreviewFile(inspectorFile)} className="flex-1 py-3 bg-slate-950 text-white rounded-xl text-xs font-bold shadow-lg hover:bg-slate-800 active:scale-95 transition-all uppercase tracking-widest" aria-label={t('quality.viewPDF')}>{t('quality.viewPDF')}</button>
                                    <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-blue-600 transition-all shadow-sm" aria-label={t('common.download')}><Download size={18} aria-hidden="true"/></button>
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
                            onChangeView={(v) => setSearchParams({view: v})} 
                        />
                    )}
                    {activeView === 'clients' && (
                        <>
                           {/* NOVO: Barra de Ações para Clientes e Usuários */}
                           <div className="bg-white p-4 rounded-2xl border shadow-sm flex flex-col xl:flex-row justify-between items-center gap-4 mb-4">
                               <div className="relative w-full max-w-xl">
                                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" />
                                   <input 
                                       type="text" 
                                       placeholder={t('quality.searchClient')} 
                                       className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm w-full outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" 
                                       value={clientSearch} 
                                       onChange={e => setClientSearch(e.target.value)} 
                                       aria-label={t('quality.searchClient')}
                                   />
                               </div>
                               <div className="flex items-center gap-3 w-full xl:w-auto justify-end">
                                   <button 
                                       onClick={() => openUserModal()}
                                       className="bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-slate-900/20 active:scale-95 transition-all"
                                       aria-label={t('quality.newClientUser')}
                                   >
                                       <UserPlus size={16} aria-hidden="true" /> {t('quality.newClientUser')}
                                   </button>
                                   <button 
                                       onClick={() => openClientModal()}
                                       className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-900/20 active:scale-95 transition-all"
                                       aria-label={t('quality.newCompany')}
                                   >
                                       <Building2 size={16} aria-hidden="true" /> {t('quality.newCompany')}
                                   </button>
                               </div>
                           </div>
                           <ClientHub 
                                clients={clients} 
                                clientSearch={clientSearch} 
                                setClientSearch={setClientSearch} 
                                clientStatus={clientStatus}
                                setClientStatus={setClientStatus}
                                onSelectClient={openClientModal} // Abre o modal de edição ao selecionar
                                isLoading={isLoading}
                                isLoadingMore={isLoadingMore}
                                hasMore={hasMoreClients}
                                onLoadMore={handleLoadMoreClients}
                           />
                        </>
                    )}
                    {activeView === 'audit-log' && ( // NOVO: Renderização da seção de Logs de Auditoria
                        <div className="flex flex-col h-full gap-4 animate-in fade-in duration-300" role="main" aria-label={t('quality.myAuditLog')}>
                            <div className="bg-white p-4 rounded-2xl border shadow-sm flex flex-col xl:flex-row justify-between items-center gap-4">
                                <div className="relative w-full max-w-xl">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" />
                                    <input 
                                        type="text" 
                                        placeholder={t('quality.allActivities')} // Nova chave
                                        className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm w-full outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" 
                                        value={auditLogSearch} 
                                        onChange={e => setAuditLogSearch(e.target.value)} 
                                        aria-label={t('quality.allActivities')}
                                    />
                                </div>
                                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl" role="group" aria-label={t('admin.logs.filterBySeverity')}>
                                    {(['ALL', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'] as const).map(severity => (
                                        <button
                                            key={severity}
                                            onClick={() => setAuditLogSeverityFilter(severity)}
                                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                                                auditLogSeverityFilter === severity 
                                                ? 'bg-white text-slate-900 shadow-sm' 
                                                : 'text-slate-500 hover:text-slate-700'
                                            }`}
                                            aria-pressed={auditLogSeverityFilter === severity}
                                            aria-label={severity === 'ALL' ? t('admin.logs.allSeverities') : t(`admin.logs.severity.${severity}`)}
                                        >
                                            {severity === 'ALL' ? t('admin.logs.allSeverities') : t(`admin.logs.severity.${severity}`)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {loadingAuditLogs ? (
                                <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-slate-200" role="status">
                                    <Loader2 size={40} className="animate-spin text-blue-500" aria-hidden="true" />
                                    <p className="mt-4 text-sm font-bold text-slate-400 uppercase tracking-widest">{t('common.loading')}</p>
                                </div>
                            ) : qualityAuditLogs.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-dashed border-slate-200" role="status">
                                    <Activity size={48} className="mb-4 opacity-20 text-slate-400" aria-hidden="true" />
                                    <p className="font-medium text-slate-600">{t('quality.noQualityLogsFound')}</p>
                                </div>
                            ) : (
                                <AuditLogsTable 
                                    logs={qualityAuditLogs} 
                                    severityFilter={auditLogSeverityFilter} 
                                    onSeverityChange={setAuditLogSeverityFilter} 
                                    onInvestigate={handleOpenQualityAuditLogInvestigation} 
                                />
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    </Layout>
  );
};

export default Quality;