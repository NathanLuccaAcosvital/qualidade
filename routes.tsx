import React, { Suspense, useMemo, useState, useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Loader2, RefreshCw, CheckCircle2 } from 'lucide-react';

import { AuthMiddleware } from './middlewares/AuthMiddleware.tsx';
import { RoleMiddleware } from './middlewares/RoleMiddleware.tsx';
import { MaintenanceMiddleware } from './middlewares/MaintenanceMiddleware.tsx';
import { useAuth } from './context/authContext.tsx';
import { UserRole, normalizeRole } from './types/index.ts';

// Lazy loading das páginas
const ClientLoginPage = React.lazy(() => import('./pages/ClientLoginPage.tsx'));

const AdminDashboard = React.lazy(() => import('./pages/dashboards/AdminDashboard.tsx'));
const QualityDashboard = React.lazy(() => import('./pages/dashboards/QualityDashboard.tsx'));
const ClientPage = React.lazy(() => import('./pages/ClientPage.tsx'));
const QualityPage = React.lazy(() => import('./pages/QualityPage.tsx'));
const AdminPage = React.lazy(() => import('./pages/AdminPage.tsx'));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage.tsx'));
const FileInspection = React.lazy(() => import('./components/features/quality/views/FileInspection.tsx').then(m => ({ default: m.FileInspection })));

/**
 * Loader minimalista para transições de módulos, agora com opção de retry.
 */
const PageLoader = ({ message = "Carregando...", onRetry }: { message?: string; onRetry?: () => void }) => (
  <div className="h-screen w-screen bg-white flex flex-col items-center justify-center text-[#081437]">
      <Loader2 size={32} className="animate-spin text-blue-500 mb-6" />
      <p className="text-[10px] font-black text-slate-400 tracking-[6px] uppercase animate-pulse mb-4">{message}</p>
      {onRetry && (
        <button 
          onClick={onRetry} 
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-lg"
        >
          <RefreshCw size={16} /> Tentar Novamente
        </button>
      )}
  </div>
);

/**
 * Componente que lida com a lógica inicial de autenticação, carregamento, erros e redirecionamentos.
 * Este componente AGORA apenas lida com o estado global da aplicação na rota `/` e durante
 * a sincronização inicial do AuthContext. Redirecionamentos pós-login da tela `/login`
 * são responsabilidade do `ClientLoginPage` para centralizar a animação.
 */
const InitialAuthRedirect = () => {
    const { user, systemStatus, isLoading, error: authError, isInitialSyncComplete, retryInitialSync } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // 1. Carregamento inicial do AuthContext (antes de saber se está logado ou não)
    if (!isInitialSyncComplete && isLoading) {
        return <PageLoader message="Conectando ao sistema Vital" />;
    }

    // 2. Erro crítico na sincronização inicial do AuthContext
    if (isInitialSyncComplete && authError) {
        console.error("Erro no AuthContext após sincronização inicial:", authError);
        return <PageLoader message={`Ocorreu um problema ao iniciar: ${authError}.`} onRetry={retryInitialSync} />;
    }
    
    // 3. Se há um usuário, mas o status do sistema ainda não foi carregado (pode ser raro após sync inicial)
    if (user && !systemStatus) {
        return <PageLoader message="Verificando a segurança do sistema" />;
    }

    // 4. Se o usuário está autenticado e na rota raiz ('/'), redireciona para o dashboard correto
    if (user && location.pathname === '/') {
        const role = normalizeRole(user.role);
        const roleRoutes: Record<UserRole, string> = {
            [UserRole.ADMIN]: '/admin/dashboard',
            [UserRole.QUALITY]: '/quality/dashboard',
            [UserRole.CLIENT]: '/client/dashboard'
        };
        return <Navigate to={roleRoutes[role] || '/'} replace />;
    }

    // 5. Se não há usuário e na rota raiz ('/'), redireciona para a página de login
    if (!user && location.pathname === '/') {
      return <Navigate to="/login" replace />;
    }

    // 6. Caso contrário (usuário logado em rota privada ou não logado em /login),
    // retorna null para permitir que o React Router continue a correspondência das rotas.
    // O ClientLoginPage agora lida com sua própria animação e redirecionamento.
    return null;
};

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<PageLoader message="Finalizando carregamento" />}>
      <Routes>
        {/*
          Ponto de entrada primário para a lógica de autenticação/redirecionamento da rota raiz.
          Este componente lida com o carregamento inicial, erros e redirecionamentos de '/'.
          Ele retorna `null` para rotas não-raiz, permitindo que a correspondência continue.
        */}
        <Route path="/" element={<InitialAuthRedirect />} />
        
        {/*
          Mapeamento direto para /login. O ClientLoginPage agora incorpora a lógica
          de animação e redirecionamento pós-login.
        */}
        <Route path="/login" element={<ClientLoginPage />} />

        {/* Middlewares de Segurança e Manutenção que se aplicam a rotas autenticadas */}
        <Route element={<MaintenanceMiddleware />}> 
            <Route element={<AuthMiddleware />}>
                
                {/* Rotas Administrativas */}
                <Route element={<RoleMiddleware allowedRoles={[UserRole.ADMIN]} />}>
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin" element={<AdminPage />} /> 
                </Route>

                {/* Rotas Qualidade */}
                <Route element={<RoleMiddleware allowedRoles={[UserRole.QUALITY, UserRole.ADMIN]} />}>
                    <Route path="/quality/dashboard" element={<QualityDashboard />} />
                    <Route path="/quality" element={<QualityPage />} />
                    <Route path="/quality/files/:fileId" element={<FileInspection />} /> {/* Rota adicionada */}
                </RoleMiddleware>

                {/* Rotas de Cliente */}
                <Route element={<RoleMiddleware allowedRoles={[UserRole.CLIENT, UserRole.ADMIN]} />}>
                    <Route path="/client/dashboard" element={<ClientPage />} />
                </RoleMiddleware>
            </Route>
        </Route>

        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
};