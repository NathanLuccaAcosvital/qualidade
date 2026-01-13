import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/authContext.tsx';
// Fix: Updated import path for 'types' module to explicitly include '/index'
import { UserRole } from '../types/index'; // Atualizado

interface RoleMiddlewareProps {
  allowedRoles: UserRole[];
}

export const RoleMiddleware: React.FC<RoleMiddlewareProps> = ({ allowedRoles }) => {
  const { user } = useAuth();
  const userRole = user?.role?.toUpperCase() as UserRole;

  if (!user || !allowedRoles.includes(userRole)) {
    if (userRole === UserRole.CLIENT) {
        return <Navigate to="/dashboard" replace />;
    }
    if (userRole === UserRole.QUALITY) {
        return <Navigate to="/quality" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};