
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/authContext.tsx';
import { UserRole } from '../types.ts';

interface RoleMiddlewareProps {
  allowedRoles: UserRole[];
}

export const RoleMiddleware: React.FC<RoleMiddlewareProps> = ({ allowedRoles }) => {
  const { user } = useAuth();
  const userRole = user?.role?.toUpperCase() as UserRole;

  if (!user || !allowedRoles.includes(userRole)) {
    // Smart Redirect Strategy based on Role - Case insensitive
    if (userRole === UserRole.CLIENT) {
        return <Navigate to="/dashboard" replace />;
    }
    if (userRole === UserRole.QUALITY) {
        return <Navigate to="/quality" replace />;
    }
    // Fallback for unauthorized access attempts
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
