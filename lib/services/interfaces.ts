import { 
  User, UserRole, FileNode, FileType, AuditLog, LibraryFilters, 
  ClientOrganization, SupportTicket, SystemStatus, NetworkPort, 
  FirewallRule, MaintenanceEvent, AppNotification 
} from '../../types.ts';

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  hasMore: boolean;
}

export interface AdminStatsData {
  totalUsers: number;
  activeUsers: number;
  activeClients: number;
  openTickets: number;
  logsLast24h: number;
  systemHealthStatus: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  cpuUsage: number;
  memoryUsage: number;
  dbConnections: number;
  dbMaxConnections: number;
}

export interface IUserService {
  authenticate: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, fullName: string, organizationId?: string, department?: string) => Promise<void>;
  getCurrentUser: () => Promise<User | null>;
  logout: () => Promise<void>;
  getUsers: () => Promise<User[]>;
  getUsersByRole: (role: UserRole) => Promise<User[]>; // Adicionado
  saveUser: (user: User, initialPassword?: string) => Promise<void>;
  changePassword: (userId: string, current: string, newPass: string) => Promise<boolean>;
  deleteUser: (userId: string) => Promise<void>;
  blockUserById: (adminUser: User, targetUserId: string, reason: string) => Promise<void>;
  getUserStats: () => Promise<{ total: number; active: number; clients: number }>;
  generateRandomPassword: () => string;
}

export interface IFileService {
  getFiles: (user: User, folderId: string | null, page?: number, pageSize?: number) => Promise<PaginatedResponse<FileNode>>;
  getFilesByOwner: (ownerId: string) => Promise<FileNode[]>;
  getMasterLibraryFiles: () => Promise<FileNode[]>;
  importFilesFromMaster: (user: User, fileIds: string[], targetFolderId: string, targetOwnerId: string) => Promise<void>;
  getRecentFiles: (user: User, limit?: number) => Promise<FileNode[]>;
  getLibraryFiles: (user: User, filters: LibraryFilters, page?: number, pageSize?: number) => Promise<PaginatedResponse<FileNode>>;
  getDashboardStats: (user: User) => Promise<any>;
  createFolder: (user: User, parentId: string | null, name: string, ownerId?: string) => Promise<FileNode | null>;
  uploadFile: (user: User, fileData: Partial<FileNode>, ownerId: string) => Promise<FileNode>;
  updateFile: (user: User, fileId: string, updates: Partial<FileNode>) => Promise<void>;
  deleteFile: (user: User, fileId: string) => Promise<void>;
  searchFiles: (user: User, query: string, page?: number, pageSize?: number) => Promise<PaginatedResponse<FileNode>>;
  getBreadcrumbs: (folderId: string | null) => Promise<{ id: string; name: string }[]>;
  toggleFavorite: (user: User, fileId: string) => Promise<boolean>;
  getFavorites: (user: User) => Promise<FileNode[]>;
  getFileSignedUrl: (user: User, fileId: string) => Promise<string>;
  logAction: (user: User, action: string, target: string, severity?: AuditLog['severity']) => Promise<void>;
  getAuditLogs: (user: User) => Promise<AuditLog[]>;
}

export interface IAdminService {
  getSystemStatus: () => Promise<SystemStatus>;
  updateSystemStatus: (user: User, newStatus: Partial<SystemStatus>) => Promise<SystemStatus>;
  subscribeToSystemStatus: (listener: (status: SystemStatus) => void) => () => void;
  getAdminStats: () => Promise<AdminStatsData>;
  getClients: (filters?: { search?: string; status?: string }, page?: number, pageSize?: number) => Promise<PaginatedResponse<ClientOrganization>>;
  saveClient: (user: User, clientData: Partial<ClientOrganization>) => Promise<ClientOrganization>;
  deleteClient: (user: User, clientId: string) => Promise<void>;
  getTickets: () => Promise<SupportTicket[]>;
  getMyTickets: (user: User, filters?: { status?: 'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' }) => Promise<SupportTicket[]>;
  getUserTickets: (userId: string) => Promise<SupportTicket[]>;
  getQualityInbox: (filters?: { search?: string; status?: string }) => Promise<SupportTicket[]>; // Adicionado filters
  getAdminInbox: () => Promise<SupportTicket[]>;
  createTicket: (user: User, ticket: Partial<SupportTicket>) => Promise<SupportTicket>;
  resolveTicket: (user: User, ticketId: string, status: SupportTicket['status'], resolutionNote?: string) => Promise<void>;
  updateTicketStatus: (user: User, ticketId: string, status: SupportTicket['status'], resolutionNote?: string) => Promise<void>; // Adicionado resolutionNote
  escalateTicketToAdmin: (user: User, ticketId: string, note?: string) => Promise<void>; // Adicionado
  getFirewallRules: () => Promise<FirewallRule[]>;
  getPorts: () => Promise<NetworkPort[]>;
  getMaintenanceEvents: () => Promise<MaintenanceEvent[]>;
  scheduleMaintenance: (user: User, event: Partial<MaintenanceEvent>) => Promise<MaintenanceEvent>;
  cancelMaintenance: (user: User, eventId: string) => Promise<void>;
  requestInfrastructureSupport: (user: User, data: any) => Promise<string>;
}

export interface INotificationService {
  subscribeToNotifications: (listener: () => void) => () => void;
  getNotifications: (user: User) => Promise<AppNotification[]>;
  getUnreadCount: (user: User) => Promise<number>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: (user: User) => Promise<void>;
  addNotification: (targetUserId: string, title: string, message: string, type: AppNotification['type'], link?: string) => Promise<void>;
}