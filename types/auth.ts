
import { ID, ISO8601Date, CNPJ } from './common.ts';

// Added CLIENT to the UserRole enum
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
