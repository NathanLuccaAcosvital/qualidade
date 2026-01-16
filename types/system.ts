
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
  location: string;
  userAgent: string;
  device: string;
  metadata: Record<string, any>;
  requestId: string;
}

export interface AppNotification {
  id: string;
  userId?: string | null; // Pode ser null para notificações globais
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT'; // DB tem default, então sempre será um desses
  isRead: boolean; // DB tem default, então sempre será boolean
  timestamp: string; // DB tem default, então sempre será string
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
