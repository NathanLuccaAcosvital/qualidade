import React, { Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Loader2, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { AuthMiddleware } from './middlewares/AuthMiddleware.tsx';
import { RoleMiddleware } from './middlewares/RoleMiddleware.tsx';
import { MaintenanceMiddleware } from './middlewares/MaintenanceMiddleware.tsx';
import { useAuth } from './context/authContext.tsx';
import { UserRole, normalizeRole } from './types/index.ts';

// Lazy loading das páginas
const ClientLoginPage = React.lazy(() => import('./pages/ClientLoginPage.tsx'));

const AdminDashboard = React.lazy(() => import('./pages/dashboards/AdminDashboard.tsx'));
const AdminPage = React.lazy(() => import('./pages/AdminPage.tsx'));

const QualityDashboardPage = React.lazy(() => import('./pages/quality/QualityDashboardPage.tsx'));
const QualityPortfolioPage = React.lazy(() => import('./pages/quality/QualityPortfolioPage.tsx'));
const QualityAuditPage = React.lazy(() => import('./pages/quality/QualityAuditPage.tsx'));
const QualityUserManagementPage = React.lazy(() => import('./pages/quality/QualityUserManagementPage.tsx'));
const QualityExplorerPage = React.lazy(() => import('./pages/quality/QualityExplorerPage.tsx'));
const FileInspection = React.lazy(() => import('./components/features/quality/views/FileInspection.tsx').then(m => ({ default: m.FileInspection })));

const ClientPage = React.lazy(() => import('./pages/ClientPage.tsx'));
const ConfigPage = React.lazy(() => import('./pages/ConfigPage.tsx'));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage.tsx'));

const PageLoader = ({ message = "Carregando...", onRetry }: { message?: string; onRetry?: () => void }) => (
  <div className="h-screen w-screen bg-slate-50 flex flex-col items-center justify-center text-[#081437]">
      <div className="relative mb-8">
        <Loader2 size={48} className="animate-spin text-blue-500" />
        <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full animate-pulse" />
      </div>
      <p className="text-[10px] font-black text-slate-400 tracking-[6px] uppercase animate-pulse mb-4 text-center px-6">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="flex items-center gap-2 px-6 py-3 bg-[#081437] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-lg">
          <RefreshCw size={16} /> Tentar Novamente
        </button>
      )}
  </div>
);

const InitialAuthRedirect = () => {
    const { user, isLoading, error, isInitialSyncComplete, retryInitialSync } = useAuth();
    const location = useLocation();

    if (isLoading) return <PageLoader message="Sincronizando Identidade Vital" />;
    
    if (isInitialSyncComplete && error) {
      return <PageLoader message="Erro de Conexão com Gateway de Segurança" onRetry={retryInitialSync} />;
    }
    
    if (user) {
        const role = normalizeRole(user.role);
        const roleRoutes: Record<UserRole, string> = {
            [UserRole.ADMIN]: '/admin/dashboard',
            [UserRole.QUALITY]: '/quality/dashboard',
            [UserRole.CLIENT]: '/client/dashboard'
        };
        const target = roleRoutes[role] || '/404';
        return <Navigate to={target} replace />;
    }

    return <Navigate to="/login" replace />;
};

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<PageLoader message="Preparando Interface..." />}>
      <Routes>
        <Route path="/" element={<InitialAuthRedirect />} />
        <Route path="/login" element={<ClientLoginPage />} />

        <Route element={<MaintenanceMiddleware />}> 
            <Route element={<AuthMiddleware />}>
                <Route path="/settings" element={<ConfigPage />} /> 

                {/* ROTAS ADMIN */}
                <Route element={<RoleMiddleware allowedRoles={[UserRole.ADMIN]} />}>
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin" element={<AdminPage />} /> 
                </Route>

                {/* ROTAS QUALITY REMASTERIZADAS */}
                <Route element={<RoleMiddleware allowedRoles={[UserRole.QUALITY, UserRole.ADMIN]} />}>
                    <Route path="/quality/dashboard" element={<QualityDashboardPage />} />
                    <Route path="/quality/portfolio" element={<QualityPortfolioPage />} />
                    <Route path="/quality/users" element={<QualityUserManagementPage />} />
                    <Route path="/quality/explorer" element={<QualityExplorerPage />} />
                    <Route path="/quality/audit" element={<QualityAuditPage />} />
                    <Route path="/quality/inspection/:fileId" element={<FileInspection />} />
                </Route>

                {/* ROTAS CLIENT */}
                <Route element={<RoleMiddleware allowedRoles={[UserRole.CLIENT, UserRole.ADMIN]} />}>
                    <Route path="/client/dashboard" element={<ClientPage />} />
                </Route>
            </Route>
        </Route>

        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
};