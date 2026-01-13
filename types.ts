

export enum UserRole {
  ADMIN = 'ADMIN',
  QUALITY = 'QUALITY',
  CLIENT = 'CLIENT'
}

// REMOVIDO: MASTER_ORG_ID, pois a Biblioteca Mestra foi removida.

export interface ClientOrganization {
  id: string;
  name: string;
  cnpj: string;
  status: 'ACTIVE' | 'INACTIVE';
  contractDate: string;
  pendingDocs?: number; 
  complianceScore?: number; 
  lastAnalysisDate?: string; // NOVO: Data da última análise de conformidade
  qualityAnalystId?: string; // NOVO: ID do analista de qualidade responsável
  qualityAnalystName?: string; // NOVO: Nome do analista de qualidade responsável
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organizationId?: string; // ALTERADO: Antigo clientId, agora armazena o ID da organização
  organizationName?: string; // NOVO: Nome da organização para exibição
  status?: 'ACTIVE' | 'BLOCKED';
  department?: string;
  lastLogin?: string;
}

export enum FileType {
  FOLDER = 'FOLDER',
  PDF = 'PDF',
  IMAGE = 'IMAGE',
  OTHER = 'OTHER'
}

export interface FileMetadata {
  batchNumber?: string; // Nº da Corrida ou Lote
  productName?: string; // Ex: Aço SAE 1045
  invoiceNumber?: string; // Nota Fiscal
  status?: 'APPROVED' | 'PENDING' | 'REJECTED';
  rejectionReason?: string; // Por que o documento foi recusado
  inspectedAt?: string;
  inspectedBy?: string;
}

export interface FileNode {
  id: string;
  parentId: string | null;
  name: string;
  type: FileType;
  size?: string;
  updatedAt: string;
  ownerId?: string;
  tags?: string[];
  metadata?: FileMetadata;
  isFavorite?: boolean;
}

export interface BreadcrumbItem {
  id: string;
  name: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  category: 'AUTH' | 'DATA' | 'SYSTEM' | 'SECURITY';
  target: string; 
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  status: 'SUCCESS' | 'FAILURE';
  ip: string;
  location: string;
  userAgent: string;
  device: string;
  metadata: Record<string, any>;
  requestId: string; // Adicionado requestId
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';
  isRead: boolean;
  timestamp: string;
  link?: string;
}

export interface MaintenanceEvent {
  id: string;
  title: string;
  scheduledDate: string;
  durationMinutes: number;
  description: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  createdBy: string;
}

export interface SystemStatus {
    mode: 'ONLINE' | 'MAINTENANCE' | 'SCHEDULED';
    message?: string;
    scheduledStart?: string;
    scheduledEnd?: string;
    updatedBy?: string;
}

export interface NetworkPort {
  port: number;
  service: string;
  protocol: 'TCP' | 'UDP';
  status: 'OPEN' | 'CLOSED' | 'FILTERED';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  exposedTo: 'PUBLIC' | 'INTERNAL' | 'VPN';
}

export interface FirewallRule {
  id: string;
  name: string;
  type: 'INBOUND' | 'OUTBOUND';
  protocol: 'TCP' | 'UDP' | 'ANY';
  port: string;
  source: string;
  action: 'ALLOW' | 'DENY';
  active: boolean;
  priority: number;
}

// Fix: Define LibraryFilters interface
export interface LibraryFilters {
  startDate?: string;
  endDate?: string;
  status: 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED';
  search: string;
}