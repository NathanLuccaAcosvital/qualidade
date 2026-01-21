
import { User, UserRole } from '../../types/index.ts';
import { normalizeRole } from '../mappers/roleMapper.ts';

/**
 * RBAC Engine - Aços Vital
 * Centraliza a autorização baseada na hierarquia Staff -> Partner.
 */
export const RBAC = {
  isStaff: (user: User | null): boolean => {
    if (!user) return false;
    const role = normalizeRole(user.role);
    return role === UserRole.ADMIN || role === UserRole.QUALITY;
  },

  isAdmin: (user: User | null): boolean => {
    if (!user) return false;
    return normalizeRole(user.role) === UserRole.ADMIN;
  },

  /**
   * Validador de acesso universal.
   * Regra Master: ADMIN tem acesso a TUDO.
   */
  hasAccess: (user: User | null, allowedRoles: UserRole[]): boolean => {
    if (!user) return false;
    const userRole = normalizeRole(user.role);
    
    // 1. ADMIN é o superusuário (God Mode)
    if (userRole === UserRole.ADMIN) return true;

    // 2. QUALITY tem herança sobre rotas de QUALITY (e sub-rotas)
    // Se a rota permite QUALITY, o usuário QUALITY entra.
    if (userRole === UserRole.QUALITY && allowedRoles.includes(UserRole.QUALITY)) return true;

    // 3. Validação direta para CLIENT
    return allowedRoles.includes(userRole);
  }
};
