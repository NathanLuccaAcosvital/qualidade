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
  ip: string | null;
  location?: string;
  userAgent?: string;
  metadata: Record<string, any>;
  requestId: string;
}

export interface FileAccessRecord {
  id: string;
  fileId: string;
  fileName: string;
  userId: string;
  userName: string;
  accessType: 'VIEW' | 'DOWNLOAD' | 'ANNOTATE';
  timestamp: string;
  ip: string;
  userAgent: string;
}

export interface AppNotification {
  id: string;
  userId?: string | null;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';
  isRead: boolean;
  timestamp: string;
  link?: string;
}

export interface SystemStatus {
    mode: 'ONLINE' | 'MAINTENANCE' | 'SCHEDULED';
    message?: string;
    scheduledStart?: string;
    scheduledEnd?: string;
    updatedBy?: string;
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