export enum UserRole {
  ADMIN = 'ADMIN',
  QUALITY = 'QUALITY',
  CLIENT = 'CLIENT'
}

export interface ClientOrganization {
  id: string;
  name: string;
  cnpj: string;
  status: 'ACTIVE' | 'INACTIVE';
  contractDate: string;
  pendingDocs?: number; 
  complianceScore?: number; 
  lastAnalysisDate?: string;
  qualityAnalystId?: string;
  qualityAnalystName?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organizationId?: string;
  organizationName?: string;
  status?: 'ACTIVE' | 'BLOCKED';
  department?: string;
  lastLogin?: string;
}