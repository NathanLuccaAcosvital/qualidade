
import React, { useState, useEffect, useMemo } from 'react';
import { Layout } from '../components/layout/MainLayout.tsx';
import { fileService, adminService, userService } from '../lib/services/index.ts';
// Fix: Import NetworkPort from types.ts
import { UserRole, AuditLog, User, ClientOrganization, SystemStatus, NetworkPort, MaintenanceEvent } from '../types.ts';
import { AdminStatsData } from '../lib/services/interfaces.ts';
import { useAuth } from '../context/authContext.tsx';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useToast } from '../context/notificationContext.tsx'; // Importado
import { 
  Building2, Search, UserPlus, X, Edit2, Trash2, Mail, ExternalLink, Clock, CheckCircle2, AlertCircle, Loader2, Settings, ShieldCheck, Server, RefreshCw, UserCheck, CalendarClock
} from 'lucide-react';

// Sub-components
import { AdminStats } from '../components/features/admin/AdminStats.tsx';
import { AuditLogsTable } from '../components/features/admin/AuditLogsTable.tsx';
import { UserList } from '../components/features/admin/UserList.tsx';
import { UserModal, ClientModal, ScheduleMaintenanceModal } from '../components/features/admin/modals/AdminModals.tsx'; // NOVO: Importa ScheduleMaintenanceModal

const Admin: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as any) || 'overview';
  const { showToast } = useToast(); // Hook useToast

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [ports, setPorts] = useState<NetworkPort[]>([]); // Keep this, it's for system info
  const [isInvestigationModalOpen, setIsInvestigationModalOpen] = useState(false);
  const [investigationData, setInvestigationData] = useState<{ targetLog: AuditLog | null; relatedLogs: AuditLog[]; riskScore: number; }>({ targetLog: null, relatedLogs: [], riskScore: 0 });

  const [usersList, setUsersList] = useState<User[]>([]);
  const [clientsList, setClientsList] = useState<ClientOrganization[]>([]);
  const [qualityAnalysts, setQualityAnalysts] = useState<User[]>([]); // NOVO: Estado para analistas de qualidade
  const [adminStats, setAdminStats] = useState<AdminStatsData | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({ mode: 'ONLINE' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'BLOCKED' | 'INACTIVE'>('ALL');
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL'>('ALL');

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    role: UserRole.CLIENT, 
    organizationId: '', // ALTERADO: clientId para organizationId
    department: '',
    status: 'ACTIVE', // NOVO: Adiciona campo de status
  });

  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientOrganization | null>(null);
  const [clientFormData, setClientFormData] = useState({ 
    name: '', 
    cnpj: '', 
    contractDate: '', 
    status: 'ACTIVE',
    qualityAnalystId: '', // NOVO: Campo para o ID do analista responsável
  });

  // NOVO: Estado para o modal de agendamento de manutenção
  const [isScheduleMaintenanceModalOpen, setIsScheduleMaintenanceModalOpen] = useState(false);

  useEffect(() => { loadData(); }, [user, activeTab]);

  const loadData = async () => {
      setIsLoading(true);
      console.log("[Admin.tsx] Loading admin data...");
      try {
          const [users, clients, networkPorts, stats, sysStatus, qAnalysts] = await Promise.all([ 
              userService.getUsers(), 
              adminService.getClients(), 
              adminService.getPorts(),
              adminService.getAdminStats(),
              adminService.getSystemStatus(),
              userService.getUsersByRole(UserRole.QUALITY), 
          ]);
          
          console.log("[Admin.tsx] userService.getUsers() result:", users);
          console.log("[Admin.tsx] adminService.getClients() result:", clients);
          console.log("[Admin.tsx] userService.getUsersByRole(QUALITY) result:", qAnalysts);
          
          setUsersList(users); // Usa users diretamente, sem spread desnecessário
          setClientsList(clients.items);
          setPorts(networkPorts);
          setAdminStats(stats);
          setSystemStatus(sysStatus);
          setQualityAnalysts(qAnalysts); 
          
          if (user) {
              const auditLogs = await fileService.getAuditLogs(user);
              setLogs(auditLogs);
              console.log("[Admin.tsx] fileService.getAuditLogs() result:", auditLogs);
          }
      } catch (err: any) { // Captura o erro para logar detalhes
          console.error("[Admin.tsx] Erro ao carregar dados administrativos:", err.message); // ALTERADO: logar err.message
          showToast(`Erro ao carregar dados administrativos: ${err.message}`, 'error'); // Exibe a mensagem de erro
      } finally { setIsLoading(false); }
  };

  const filteredUsers = useMemo(() => {
      if (!usersList) return [];
      return usersList.filter(u => {
          const matchesSearch = (u.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || (u.email || "").toLowerCase().includes(searchTerm.toLowerCase()) || (u.organizationName || "").toLowerCase().includes(searchTerm.toLowerCase()); // ALTERADO: Inclui organizationName na busca
          const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
          const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
          return matchesSearch && matchesRole && matchesStatus;
      });
  }, [usersList, searchTerm, roleFilter, statusFilter]);

  const filteredClients = useMemo(() => clientsList.filter(c => {
      const term = searchTerm.toLowerCase();
      // Inclui o nome do analista na busca
      return (c.name || "").toLowerCase().includes(term) || 
             (c.cnpj || "").includes(term) || 
             (c.qualityAnalystName || "").toLowerCase().includes(term); 
  }), [clientsList, searchTerm]);

  const filteredLogs = useMemo(() => logs.filter(l => {
      const matchesSearch = l.userName.toLowerCase().includes(searchTerm.toLowerCase()) || l.action.toLowerCase().includes(searchTerm.toLowerCase()) || l.target.toLowerCase().includes(searchTerm.toLowerCase()) || l.ip.includes(searchTerm);
      const matchesSeverity = severityFilter === 'ALL' || l.severity === severityFilter;
      return matchesSearch && matchesSeverity;
  }), [logs, searchTerm, severityFilter]);

  const handleSaveUser = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSaving(true);
      try {
          if (!editingUser) {
              await userService.signUp(formData.email, formData.password, formData.name, formData.organizationId || undefined, formData.department); // ALTERADO: formData.clientId para formData.organizationId
              showToast("Usuário criado com sucesso!", 'success');
          } else {
              const userPayload: User = { 
                  id: editingUser.id, name: formData.name, email: formData.email, role: formData.role as UserRole, 
                  organizationId: (formData.role === UserRole.CLIENT && formData.organizationId) ? formData.organizationId : undefined, // ALTERADO: clientId para organizationId
                  status: formData.status as any, department: formData.department, lastLogin: editingUser?.lastLogin || 'Nunca' 
              };
              await userService.saveUser(userPayload);
              showToast("Usuário atualizado com sucesso!", 'success');
          }
          setIsUserModalOpen(false); setEditingUser(null); setSearchTerm('');
          loadData(); // Recarrega os dados imediatamente
          setIsSaving(false);
      } catch (err: any) {
          showToast(`Erro ao salvar usuário: ${err.message}`, 'error');
          setIsSaving(false);
      }
  };

  const handleSaveClient = async (e: React.FormEvent) => {
      e.preventDefault(); if (!user) return;
      setIsSaving(true);
      try {
        const selectedAnalyst = qualityAnalysts.find(qa => qa.id === clientFormData.qualityAnalystId);
        const clientPayload: Partial<ClientOrganization> = { 
            id: editingClient?.id, 
            name: clientFormData.name, 
            cnpj: clientFormData.cnpj, 
            contractDate: clientFormData.contractDate, 
            status: clientFormData.status as any,
            qualityAnalystId: clientFormData.qualityAnalystId, // NOVO: Atribui o ID do analista
            qualityAnalystName: selectedAnalyst?.name, // NOVO: Atribui o nome do analista para o frontend
        };
        await adminService.saveClient(user, clientPayload);
        showToast("Empresa salva com sucesso!", 'success');
        setIsClientModalOpen(false); setEditingClient(null); 
        loadData(); // Recarrega os dados imediatamente
        setIsSaving(false);
      } catch (err: any) {
        showToast(`Erro ao salvar empresa: ${err.message}`, 'error');
        setIsSaving(false);
      }
  };

  const handleOpenInvestigation = (log: AuditLog) => {
      const related = logs.filter(l => (l.ip === log.ip && l.ip !== '10.0.0.1') || (l.userId === log.userId && l.userId !== 'unknown')).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setInvestigationData({ targetLog: log, relatedLogs: related, riskScore: log.severity === 'CRITICAL' ? 85 : 20 });
      setIsInvestigationModalOpen(true);
  };

  const openUserModal = (u?: User) => {
      if (u) { 
        setEditingUser(u); 
        setFormData({ name: u.name, email: u.email, password: '', role: u.role, organizationId: u.organizationId || '', status: u.status || 'ACTIVE', department: u.department || '' }); // ALTERADO: Inclui status
      } else { 
        setFormData({ name: '', email: '', password: '', role: UserRole.CLIENT, organizationId: '', status: 'ACTIVE', department: '' }); // ALTERADO: clientId para organizationId, inclui status
        setEditingUser(null); 
      }
      setIsUserModalOpen(true);
  };

  const openClientModal = (c?: ClientOrganization) => {
      if (c) { 
          setEditingClient(c); 
          setClientFormData({ 
              name: c.name, 
              cnpj: c.cnpj, 
              contractDate: c.contractDate, 
              status: c.status,
              qualityAnalystId: c.qualityAnalystId || '', // NOVO: Carrega o ID do analista
          }); 
      } else { 
          setClientFormData({ 
              name: '', 
              cnpj: '', 
              contractDate: new Date().toISOString().split('T')[0], 
              status: 'ACTIVE',
              qualityAnalystId: '', // NOVO: Vazio por padrão para novo cliente
          }); 
          setEditingClient(null); 
      }
      setIsClientModalOpen(true);
  };

  const handleUpdateMaintenance = async (mode: 'ONLINE' | 'MAINTENANCE') => {
      if (!user) return;
      setIsSaving(true);
      try {
          await adminService.updateSystemStatus(user, { mode });
          setSystemStatus(prev => ({ ...prev, mode }));
          showToast(`Sistema agora em modo: ${mode === 'ONLINE' ? 'Online' : 'Manutenção'}`, 'success');
      } catch (err) {
          showToast("Falha ao atualizar status do sistema.", 'error');
      } finally {
          setIsSaving(false);
      }
  };

  // NOVO: Função para agendar manutenção
  const handleScheduleMaintenance = async (eventData: Partial<MaintenanceEvent> & { scheduledTime: string }) => {
    if (!user) return;
    setIsSaving(true);
    try {
        const [year, month, day] = eventData.scheduledDate?.split('-') || [];
        const [hours, minutes] = eventData.scheduledTime?.split(':') || [];
        
        // Cria um objeto Date para o início da manutenção
        const scheduledStart = new Date(
            parseInt(year), 
            parseInt(month) - 1, 
            parseInt(day), 
            parseInt(hours), 
            parseInt(minutes)
        );
        
        // Calcula o fim da manutenção
        const scheduledEnd = new Date(scheduledStart.getTime() + (eventData.durationMinutes || 0) * 60 * 1000);

        const newMaintenanceEvent: Partial<MaintenanceEvent> = {
            title: eventData.title,
            scheduledDate: scheduledStart.toISOString(), // Usar ISO string para persistência
            durationMinutes: eventData.durationMinutes,
            description: eventData.description,
            status: 'SCHEDULED' // Sempre agendado inicialmente
        };

        await adminService.scheduleMaintenance(user, newMaintenanceEvent);
        
        // Atualiza o status global do sistema para refletir a manutenção agendada
        await adminService.updateSystemStatus(user, {
            mode: 'SCHEDULED',
            message: eventData.description, // Usar a descrição do evento como mensagem do sistema
            scheduledStart: scheduledStart.toISOString(),
            scheduledEnd: scheduledEnd.toISOString()
        });

        showToast(t('maintenanceSchedule.scheduledSuccess', { title: eventData.title }), 'success');
        setIsScheduleMaintenanceModalOpen(false);
        loadData(); // Recarrega os dados para pegar o novo status do sistema
    } catch (err: any) {
        showToast(t('maintenanceSchedule.scheduledError', { message: err.message }), 'error');
    } finally {
        setIsSaving(false);
    }
  };


  return (
    <Layout title={t('menu.management')}>
      <div className="flex flex-col relative w-full gap-6">
          {(isSaving || isLoading) && activeTab !== 'overview' && (
              <div className="fixed top-4 right-1/2 translate-x-1/2 z-[110] bg-slate-900 text-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 text-xs font-bold animate-bounce">
                  <Loader2 size={14} className="animate-spin" /> {t('common.updatingDatabase')}
              </div>
          )}

          {activeTab !== 'overview' && activeTab !== 'settings' && (
             <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-100 p-4 flex flex-col sm:flex-row justify-between items-center gap-4 rounded-xl shadow-sm">
                 <div className="relative group w-full sm:w-auto flex-1 max-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                    <input type="text" placeholder={t('common.search')} className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm w-full outline-none focus:ring-2 focus:ring-blue-500/20" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                 </div>
                 <div className="flex gap-2 w-full sm:w-auto justify-end">
                     {activeTab === 'users' && <button onClick={() => openUserModal()} className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all active:scale-95"><UserPlus size={16} /> {t('admin.users.newAccess')}</button>}
                     {activeTab === 'clients' && <button onClick={() => openClientModal()} className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all active:scale-95"><Building2 size={16} /> Nova Empresa</button>}
                 </div>
             </div>
          )}

          {activeTab === 'overview' && adminStats && (
              <AdminStats 
                  usersCount={adminStats.totalUsers} 
                  activeUsersCount={adminStats.activeUsers}
                  clientsCount={adminStats.activeClients}
                  logsCount={adminStats.logsLast24h}
              />
          )}

          {activeTab === 'users' && <UserList users={filteredUsers} onEdit={openUserModal} />}

          {activeTab === 'clients' && (
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden animate-in fade-in duration-300">
                  <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                          <tr>
                              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Empresa</th>
                              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">CNPJ</th>
                              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Analista Qual.</th> {/* NOVO */}
                              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Início Contrato</th>
                              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Status</th>
                              <th className="px-6 py-4 text-right"></th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                          {filteredClients.map(c => (
                              <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                                  <td className="px-6 py-4 flex items-center gap-3"><Building2 size={16} className="text-blue-500"/><p className="font-semibold text-slate-900 text-sm">{c.name}</p></td>
                                  <td className="px-6 py-4 text-sm text-slate-500 font-mono">{c.cnpj}</td>
                                  <td className="px-6 py-4 text-sm text-slate-700 flex items-center gap-2"> {/* NOVO */}
                                    <UserCheck size={14} className="text-emerald-500" />
                                    {c.qualityAnalystName || t('common.na')}
                                  </td>
                                  <td className="px-6 py-4 text-sm text-slate-500">{c.contractDate}</td>
                                  <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${c.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>{c.status}</span></td>
                                  <td className="px-6 py-4 text-right"><button onClick={() => openClientModal(c)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><Edit2 size={16} /></button></td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          )}

          {activeTab === 'settings' && (
              <div className="space-y-6 animate-in fade-in duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-6"> {/* Alterado para md:grid-cols-1 */}
                      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Server size={20} className="text-blue-600" /> Controle de Disponibilidade</h3>
                          <p className="text-sm text-slate-500">Altere o estado global do portal para manutenções programadas ou críticas.</p>
                          <div className="pt-4 flex flex-col gap-3">
                              <button 
                                onClick={() => handleUpdateMaintenance('ONLINE')}
                                disabled={systemStatus.mode === 'ONLINE'}
                                className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${systemStatus.mode === 'ONLINE' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                              >
                                  <ShieldCheck size={18} /> Sistema Online
                              </button>
                              <button 
                                onClick={() => handleUpdateMaintenance('MAINTENANCE')}
                                disabled={systemStatus.mode === 'MAINTENANCE'}
                                className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${systemStatus.mode === 'MAINTENANCE' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600'}`}
                              >
                                  <Settings size={18} /> Entrar em Manutenção
                              </button>
                              {/* NOVO: Botão para agendar manutenção */}
                              <button 
                                onClick={() => setIsScheduleMaintenanceModalOpen(true)}
                                className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-200"
                              >
                                  <CalendarClock size={18} /> Agendar Manutenção
                              </button>
                          </div>
                      </div>
                  </div>
              </div>
          )}

          {activeTab === 'logs' && <AuditLogsTable logs={filteredLogs} severityFilter={severityFilter} onSeverityChange={setSeverityFilter} onInvestigate={handleOpenInvestigation} />}
      </div>

      <UserModal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} onSave={handleSaveUser} editingUser={editingUser} formData={formData} setFormData={setFormData} organizations={clientsList} /> {/* ALTERADO: clients para organizations */}
      <ClientModal 
        isOpen={isClientModalOpen} 
        onClose={() => setIsClientModalOpen(false)} 
        onSave={handleSaveClient} 
        editingClient={editingClient} 
        clientFormData={clientFormData} 
        setClientFormData={setClientFormData} 
        qualityAnalysts={qualityAnalysts} 
      />
      {/* NOVO: Modal de Agendamento de Manutenção */}
      <ScheduleMaintenanceModal 
        isOpen={isScheduleMaintenanceModalOpen}
        onClose={() => setIsScheduleMaintenanceModalOpen(false)}
        onSave={handleScheduleMaintenance}
        isSaving={isSaving}
      />
    </Layout>
  );
};

export default Admin;