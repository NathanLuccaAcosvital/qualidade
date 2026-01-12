
import React, { useState, useEffect, useMemo } from 'react';
import { Layout } from '../components/layout/MainLayout.tsx';
import { fileService, adminService, userService } from '../lib/services/index.ts';
import { UserRole, AuditLog, User, ClientOrganization, SupportTicket, NetworkPort, SystemStatus } from '../types.ts';
import { AdminStatsData } from '../lib/services/interfaces.ts';
import { useAuth } from '../context/authContext.tsx';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Building2, Search, UserPlus, X, Edit2, Trash2, Mail, ExternalLink, MessageSquare, Clock, CheckCircle2, AlertCircle, Loader2, Settings, ShieldCheck, Database, Server, RefreshCw
} from 'lucide-react';

// Sub-components
import { AdminStats } from '../components/features/admin/AdminStats.tsx';
import { AuditLogsTable } from '../components/features/admin/AuditLogsTable.tsx';
import { UserList } from '../components/features/admin/UserList.tsx';
import { UserModal, ClientModal } from '../components/features/admin/modals/AdminModals.tsx';

const Admin: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as any) || 'overview';

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [ports, setPorts] = useState<NetworkPort[]>([]);
  const [isInvestigationModalOpen, setIsInvestigationModalOpen] = useState(false);
  const [investigationData, setInvestigationData] = useState<{ targetLog: AuditLog | null; relatedLogs: AuditLog[]; riskScore: number; }>({ targetLog: null, relatedLogs: [], riskScore: 0 });

  const [usersList, setUsersList] = useState<User[]>([]);
  const [clientsList, setClientsList] = useState<ClientOrganization[]>([]);
  const [ticketsList, setTicketsList] = useState<SupportTicket[]>([]);
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
    clientId: '', 
    status: 'ACTIVE', 
    department: '' 
  });

  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientOrganization | null>(null);
  const [clientFormData, setClientFormData] = useState({ name: '', cnpj: '', contractDate: '', status: 'ACTIVE' });

  useEffect(() => { loadData(); }, [user, activeTab]);

  const loadData = async () => {
      setIsLoading(true);
      try {
          const [users, ticketData, clients, networkPorts, stats, sysStatus] = await Promise.all([
              userService.getUsers(), 
              adminService.getTickets(), 
              adminService.getClients(), 
              adminService.getPorts(),
              adminService.getAdminStats(),
              adminService.getSystemStatus()
          ]);
          
          setUsersList([...users]); 
          setTicketsList(ticketData); 
          setClientsList(clients.items);
          setPorts(networkPorts);
          setAdminStats(stats);
          setSystemStatus(sysStatus);
          
          if (user) {
              const auditLogs = await fileService.getAuditLogs(user);
              setLogs(auditLogs);
          }
      } catch (err) {
          console.error("Erro ao carregar dados administrativos:", err);
      } finally { setIsLoading(false); }
  };

  const filteredUsers = useMemo(() => {
      if (!usersList) return [];
      return usersList.filter(u => {
          const matchesSearch = (u.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || (u.email || "").toLowerCase().includes(searchTerm.toLowerCase());
          const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
          const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
          return matchesSearch && matchesRole && matchesStatus;
      });
  }, [usersList, searchTerm, roleFilter, statusFilter]);

  const filteredClients = useMemo(() => clientsList.filter(c => {
      const term = searchTerm.toLowerCase();
      return (c.name || "").toLowerCase().includes(term) || (c.cnpj || "").includes(term);
  }), [clientsList, searchTerm]);

  const filteredTickets = useMemo(() => ticketsList.filter(t => {
      const term = searchTerm.toLowerCase();
      return (t.subject || "").toLowerCase().includes(term) || (t.userName || "").toLowerCase().includes(term);
  }), [ticketsList, searchTerm]);

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
              await userService.signUp(formData.email, formData.password, formData.name, formData.clientId || undefined, formData.department);
          } else {
              const userPayload: User = { 
                  id: editingUser.id, name: formData.name, email: formData.email, role: formData.role as UserRole, 
                  clientId: (formData.role === UserRole.CLIENT && formData.clientId && formData.clientId !== 'Interno') ? formData.clientId : undefined, 
                  status: formData.status as any, department: formData.department, lastLogin: editingUser?.lastLogin || 'Nunca' 
              };
              await userService.saveUser(userPayload);
          }
          setIsUserModalOpen(false); setEditingUser(null); setSearchTerm('');
          setTimeout(() => { loadData(); setIsSaving(false); }, 800);
      } catch (err: any) {
          alert(`Erro ao salvar usuário: ${err.message}`);
          setIsSaving(false);
      }
  };

  const handleSaveClient = async (e: React.FormEvent) => {
      e.preventDefault(); if (!user) return;
      setIsSaving(true);
      try {
        const clientPayload: Partial<ClientOrganization> = { 
            id: editingClient?.id, name: clientFormData.name, cnpj: clientFormData.cnpj, contractDate: clientFormData.contractDate, status: clientFormData.status as any 
        };
        await adminService.saveClient(user, clientPayload);
        setIsClientModalOpen(false); setEditingClient(null); 
        setTimeout(() => { loadData(); setIsSaving(false); }, 500);
      } catch (err: any) {
        alert(`Erro ao salvar empresa: ${err.message}`);
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
        setFormData({ name: u.name, email: u.email, password: '', role: u.role, clientId: u.clientId || '', status: u.status || 'ACTIVE', department: u.department || '' }); 
      } else { 
        setFormData({ name: '', email: '', password: '', role: UserRole.CLIENT, clientId: '', status: 'ACTIVE', department: '' }); 
        setEditingUser(null); 
      }
      setIsUserModalOpen(true);
  };

  const openClientModal = (c?: ClientOrganization) => {
      if (c) { setEditingClient(c); setClientFormData({ name: c.name, cnpj: c.cnpj, contractDate: c.contractDate, status: c.status }); }
      else { setClientFormData({ name: '', cnpj: '', contractDate: new Date().toISOString().split('T')[0], status: 'ACTIVE' }); setEditingClient(null); }
      setIsClientModalOpen(true);
  };

  const handleUpdateMaintenance = async (mode: 'ONLINE' | 'MAINTENANCE') => {
      if (!user) return;
      setIsSaving(true);
      try {
          await adminService.updateSystemStatus(user, { mode });
          setSystemStatus(prev => ({ ...prev, mode }));
          alert(`Sistema agora em modo: ${mode}`);
      } catch (err) {
          alert("Falha ao atualizar status do sistema.");
      } finally {
          setIsSaving(false);
      }
  };

  return (
    <Layout title={t('menu.management')}>
      <div className="flex flex-col relative w-full gap-6">
          {(isSaving || isLoading) && activeTab !== 'overview' && (
              <div className="fixed top-4 right-1/2 translate-x-1/2 z-[110] bg-slate-900 text-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 text-xs font-bold animate-bounce">
                  <Loader2 size={14} className="animate-spin" /> Atualizando base de dados...
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
                  ticketsCount={adminStats.openTickets}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          </div>
                      </div>
                      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Database size={20} className="text-blue-600" /> Infraestrutura do Sistema</h3>
                          <div className="space-y-3 pt-2">
                             <div className="flex justify-between items-center text-sm border-b pb-2"><span className="text-slate-500">Banco de Dados</span><span className="font-mono text-emerald-600 font-bold">OPERACIONAL</span></div>
                             <div className="flex justify-between items-center text-sm border-b pb-2"><span className="text-slate-500">Storage (Certificados)</span><span className="font-mono text-emerald-600 font-bold">OPERACIONAL</span></div>
                             <div className="flex justify-between items-center text-sm pb-2"><span className="text-slate-500">Conexões Ativas</span><span className="font-mono font-bold">{adminStats?.dbConnections || 0}</span></div>
                             <button onClick={loadData} className="w-full mt-2 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-lg flex items-center justify-center gap-2 transition-all"><RefreshCw size={14} /> Sincronizar Agora</button>
                          </div>
                      </div>
                  </div>
              </div>
          )}

          {activeTab === 'logs' && <AuditLogsTable logs={filteredLogs} severityFilter={severityFilter} onSeverityChange={setSeverityFilter} onInvestigate={handleOpenInvestigation} />}
      </div>

      <UserModal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} onSave={handleSaveUser} editingUser={editingUser} formData={formData} setFormData={setFormData} clients={clientsList} />
      <ClientModal isOpen={isClientModalOpen} onClose={() => setIsClientModalOpen(false)} onSave={handleSaveClient} editingClient={editingClient} clientFormData={clientFormData} setClientFormData={setClientFormData} />
    </Layout>
  );
};

export default Admin;
