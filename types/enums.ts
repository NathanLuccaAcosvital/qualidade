/**
 * ENUMS OFICIAIS - AÇOS VITAL (SGQ)
 * Reflete estritamente o esquema de banco de dados do Supabase.
 */

export enum UserRole {
  ADMIN = 'ADMIN',
  QUALITY = 'QUALITY',
  CLIENT = 'CLIENT'
}

export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  BLOCKED = 'BLOCKED',
  INACTIVE = 'INACTIVE'
}

export enum FileType {
  FOLDER = 'FOLDER',
  PDF = 'PDF',
  IMAGE = 'IMAGE',
  OTHER = 'OTHER'
}

export enum QualityStatus {
  APPROVED = 'APPROVED',
  PENDING = 'PENDING',
  SENT = 'SENT',
  REJECTED = 'REJECTED',
  TO_DELETE = 'TO_DELETE'
}

export enum SystemMode {
  ONLINE = 'ONLINE',
  MAINTENANCE = 'MAINTENANCE',
  SCHEDULED = 'SCHEDULED'
}

export enum MaintenanceStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED'
}

export enum TicketFlow {
  CLIENT_TO_QUALITY = 'CLIENT_TO_QUALITY',
  QUALITY_TO_ADMIN = 'QUALITY_TO_ADMIN',
  ADMIN_TO_DEV = 'ADMIN_TO_DEV'
}
