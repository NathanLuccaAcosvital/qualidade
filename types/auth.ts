
import { ID, ISO8601Date, CNPJ } from './common.ts';
import { UserRole, AccountStatus, SystemMode } from './enums.ts';

export type UserType = 'VITAL_REPRESENTATIVE' | 'CLIENT_INTERNAL';

export interface User {
  id: ID;
  name: string;
  email: string;
  role: UserRole;
  organizationId?: ID;
  organizationName?: string;
  status: AccountStatus;
  department?: string; // Usado para UserType
  lastLogin?: ISO8601Date;
  isPendingDeletion?: boolean; 
}

export interface InitialAppData {
  user: User | null;
  systemStatus: {
    mode: SystemMode;
    message?: string;
    scheduled_start?: string;
    scheduled_end?: string;
    updated_by?: string;
  } | null;
}

export interface ClientOrganization {
  id: ID;
  name: string;
  cnpj: CNPJ;
  status: AccountStatus;
  contractDate: ISO8601Date;
  pendingDocs?: number;
  complianceScore?: number;
  lastAnalysisDate?: ISO8601Date;
  qualityAnalystId?: ID;
  qualityAnalystName?: string;
  isPendingDeletion?: boolean;
}
