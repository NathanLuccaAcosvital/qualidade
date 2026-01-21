
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/authContext.tsx';
import { UserRole, normalizeRole } from '../types/index.ts';
import { RBAC } from '../lib/utils/rbac.ts';

interface RoleMiddlewareProps {
  allowedRoles: UserRole[];
}

/**
 * Middleware de Autorização (RBAC)
 * Garante que o usuário possua as credenciais necessárias antes de montar a página.
 */
export const RoleMiddleware: React.FC<RoleMiddlewareProps> = ({ allowedRoles }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return null;
  
  // Se não houver usuário, redireciona para o login público
  if (!user) return <Navigate to="/login" replace />;

  // Verifica se a role do usuário (ou sua herança) permite o acesso
  const hasAccess = RBAC.hasAccess(user, allowedRoles);

  if (!hasAccess) {
    const role = normalizeRole(user.role);
    console.warn(`[RBAC Guard] Bloqueio de segurança: Usuário ${user.email} tentou acessar rota restrita.`);
    
    // Fallback estratégico baseado na role
    return <Navigate to={getSecureFallbackPath(role)} replace />;
  }

  return <Outlet />;
};

const getSecureFallbackPath = (role: UserRole): string => {
  switch (role) {
    case UserRole.ADMIN: return '/admin/dashboard';
    case UserRole.QUALITY: return '/quality/dashboard';
    default: return '/client/portal';
  }
};
