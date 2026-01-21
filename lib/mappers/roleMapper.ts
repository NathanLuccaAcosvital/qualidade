
import { UserRole } from '../../types/enums.ts';

/**
 * Normaliza as roles vindas do Supabase Auth/DB para o Enum da aplicação.
 * Refatorado para garantir que ADMIN e QUALITY tenham precedência absoluta.
 */
export const normalizeRole = (role: unknown): UserRole => {
  if (!role) return UserRole.CLIENT;
  
  // Se já for um valor do Enum, retorna ele mesmo
  if (Object.values(UserRole).includes(role as UserRole)) {
    return role as UserRole;
  }

  const normalized = String(role).trim().toUpperCase();
  
  const map: Record<string, UserRole> = {
    'ADMIN': UserRole.ADMIN,
    'ADMINISTRADOR': UserRole.ADMIN,
    'ROOT': UserRole.ADMIN,
    'QUALITY': UserRole.QUALITY,
    'QUALIDADE': UserRole.QUALITY,
    'ANALYST': UserRole.QUALITY,
    'CLIENT': UserRole.CLIENT,
    'CLIENTE': UserRole.CLIENT,
    'PARTNER': UserRole.CLIENT,
    'USER': UserRole.CLIENT
  };

  const detectedRole = map[normalized];
  
  if (!detectedRole) {
    console.warn(`[RBAC] Papel não identificado: ${normalized}. Aplicando nível de segurança CLIENT.`);
    return UserRole.CLIENT;
  }

  return detectedRole;
};
