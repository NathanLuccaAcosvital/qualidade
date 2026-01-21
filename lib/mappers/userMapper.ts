import { User, UserRole, AccountStatus } from '../../types/index.ts';
import { normalizeRole } from './roleMapper.ts';

/**
 * USER MAPPER - AÇOS VITAL
 * Transforma profiles do banco em instâncias da entidade User.
 */
export const toDomainUser = (row: any, sessionUser?: any): User | null => {
  if (!row && sessionUser) {
    return {
      id: sessionUser.id,
      name: sessionUser.user_metadata?.full_name || 'Usuário Vital',
      email: sessionUser.email || '',
      role: normalizeRole(sessionUser.user_metadata?.role),
      organizationId: sessionUser.user_metadata?.organization_id,
      organizationName: 'Aços Vital (Sync...)',
      status: AccountStatus.ACTIVE,
      department: sessionUser.user_metadata?.user_type || 'CLIENT_INTERNAL',
      isPendingDeletion: false
    };
  }

  if (!row) return null;

  const orgData = Array.isArray(row.organizations) ? row.organizations[0] : row.organizations;
  
  return {
    id: row.id,
    name: row.full_name || 'Operador',
    email: row.email || '',
    role: normalizeRole(row.role),
    organizationId: row.organization_id || undefined,
    organizationName: orgData?.name || 'Aços Vital (Sede)',
    status: (row.status as AccountStatus) || AccountStatus.ACTIVE,
    department: row.department || 'CLIENT_INTERNAL',
    lastLogin: row.last_login || undefined,
    isPendingDeletion: row.department === 'PENDING_DELETION'
  };
};