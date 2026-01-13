
import { 
  User, UserRole, FileNode, FileType, AuditLog, LibraryFilters, 
  ClientOrganization, SystemStatus, NetworkPort, 
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
  logsLast24h: number;
  systemHealthStatus: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  cpuUsage: number;
  memoryUsage: number;
  dbConnections: number;
  dbMaxConnections: number;
}

// NOVO: Interface para as estatísticas do Dashboard do Cliente
export interface DashboardStatsData {
  mainValue: number;
  subValue: number;
  pendingValue: number;
  status: 'REGULAR' | 'PENDING';
  mainLabel: string;
  subLabel: string;
  activeClients?: number;
}

// NOVO: Interface para as estatísticas da Visão Geral da Qualidade
export interface QualityOverviewStats {
  pendingDocs: number;
  totalActiveClients: number;
}

export interface IUserService {
  authenticate: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, fullName: string, organizationId?: string, department?: string) => Promise<void>; // ALTERADO: clientId para organizationId
  getCurrentUser: () => Promise<User | null>;
  logout: () => Promise<void>;
  getUsers: () => Promise<User[]>;
  getUsersByRole: (role: UserRole) => Promise<User[]>; // Adicionado
  saveUser: (user: User, initialPassword?: string) => Promise<void>; // ALTERADO: user: User agora tem organizationId
  changePassword: (userId: string, current: string, newPass: string) => Promise<boolean>;
  deleteUser: (userId: string) => Promise<void>;
  blockUserById: (adminUser: User, targetUserId: string, reason: string) => Promise<void>;
  getUserStats: () => Promise<{ total: number; active: number; clients: number }>;
  generateRandomPassword: () => string;
}

export interface IFileService {
  getFiles: (user: User, folderId: string | null, page?: number, pageSize?: number) => Promise<PaginatedResponse<FileNode>>;
  getFilesByOwner: (ownerId: string) => Promise<FileNode[]>;
  // REMOVIDO: getMasterLibraryFiles: () => Promise<FileNode[]>;
  // REMOVIDO: importFilesFromMaster: (user: User, fileIds: string[], targetFolderId: string, targetOwnerId: string) => Promise<void>;
  getRecentFiles: (user: User, limit?: number) => Promise<FileNode[]>;
  getLibraryFiles: (user: User, filters: LibraryFilters, page?: number, pageSize?: number) => Promise<PaginatedResponse<FileNode>>;
  getDashboardStats: (user: User) => Promise<DashboardStatsData>; // Atualizado para usar a nova interface
  createFolder: (user: User, parentId: string | null, name: string, ownerId?: string) => Promise<FileNode | null>;
  uploadFile: (user: User, fileData: Partial<FileNode> & { fileBlob?: Blob }, ownerId: string) => Promise<FileNode>;
  updateFile: (user: User, fileId: string, updates: Partial<FileNode>) => Promise<void>;
  deleteFile: (user: User, fileId: string) => Promise<void>;
  searchFiles: (user: User, query: string, page?: number, pageSize?: number) => Promise<PaginatedResponse<FileNode>>;
  getBreadcrumbs: (folderId: string | null) => Promise<{ id: string; name: string }[]>;
  toggleFavorite: (user: User, fileId: string) => Promise<boolean>;
  getFavorites: (user: User) => Promise<FileNode[]>;
  getFileSignedUrl: (user: User, fileId: string) => Promise<string>;
  // Fix: Updated logAction signature to match the implementation in supabaseFileService.ts
  logAction: (
    user: User | null,
    action: string,
    target: string,
    category: AuditLog['category'],
    severity?: AuditLog['severity'],
    status?: AuditLog['status'],
    metadata?: Record<string, any>
  ) => Promise<void>;
  getAuditLogs: (user: User) => Promise<AuditLog[]>;
  getQualityAuditLogs: (user: User, filters?: { search?: string; severity?: AuditLog['severity'] | 'ALL' }) => Promise<AuditLog[]>; // NOVO
}

export interface IAdminService {
  getSystemStatus: () => Promise<SystemStatus>;
  updateSystemStatus: (user: User, newStatus: Partial<SystemStatus>) => Promise<SystemStatus>;
  subscribeToSystemStatus: (listener: (status: SystemStatus) => void) => () => void;
  getAdminStats: () => Promise<AdminStatsData>;
  getClients: (filters?: { search?: string; status?: string }, page?: number, pageSize?: number) => Promise<PaginatedResponse<ClientOrganization>>;
  saveClient: (user: User, clientData: Partial<ClientOrganization> & { qualityAnalystId?: string; qualityAnalystName?: string }) => Promise<ClientOrganization>;
  deleteClient: (user: User, clientId: string) => Promise<void>;
  getFirewallRules: () => Promise<FirewallRule[]>;
  getPorts: () => Promise<NetworkPort[]>;
  getMaintenanceEvents: () => Promise<MaintenanceEvent[]>;
  scheduleMaintenance: (user: User, event: Partial<MaintenanceEvent>) => Promise<MaintenanceEvent>;
  cancelMaintenance: (user: User, eventId: string) => Promise<void>;
}

export interface INotificationService {
  subscribeToNotifications: (listener: () => void) => () => void;
  getNotifications: (user: User) => Promise<AppNotification[]>;
  getUnreadCount: (user: User) => Promise<number>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: (user: User) => Promise<void>;
  addNotification: (targetUserId: string, title: string, message: string, type: AppNotification['type'], link?: string) => Promise<void>;
}