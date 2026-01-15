import { ID, ISO8601Date, CNPJ } from './common.ts';
import { SystemStatus } from './system.ts'; // Importar SystemStatus

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

// Renomeado de InitialAppData para AuthContextState
export interface AuthContextState {
  user: User | null; 
  systemStatus: SystemStatus | null; // Usar o tipo importado
}

export interface ClientOrganization {
  id: ID;
  name: string;
  cnpj: CNPJ;
  status: AccountStatus;
  contractDate: ISO8601Date;
  
  // Quality Metadata (Interface Segregation)
  pendingDocs?: number;
  complianceScore?: number;
  lastAnalysisDate?: ISO8601Date;
  qualityAnalystId?: ID;
  qualityAnalystName?: string;
}

export interface User {
  id: ID;
  name: string;
  email: string;
  role: UserRole;
  organizationId?: ID;
  organizationName?: string;
  status: AccountStatus;
  department?: string;
  lastLogin?: ISO8601Date;
}