
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/authContext.tsx';
import { UserRole, normalizeRole } from '../types/index.ts';

interface RoleMiddlewareProps {
  allowedRoles: UserRole[];
}

/**
 * Middleware de Autorização Baseada em Papéis (RBAC).
 * (S) Única responsabilidade: Validar se o papel do usuário permite acesso à rota.
 */
export const RoleMiddleware: React.FC<RoleMiddlewareProps> = ({ allowedRoles }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;

  const userRole = normalizeRole(user.role);
  const hasAccess = allowedRoles.includes(userRole);

  if (!hasAccess) {
    return <Navigate to={getSecureFallbackPath(userRole)} replace />;
  }

  return <Outlet />;
};

/**
 * Estratégia de fallback explícita para os perfis internos.
 */
const getSecureFallbackPath = (role: UserRole): string => {
  switch (role) {
    case UserRole.ADMIN:
      return '/admin/dashboard';
    case UserRole.QUALITY:
    default:
      return '/quality/dashboard';
  }
};
