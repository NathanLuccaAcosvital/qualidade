import React, { Suspense, useMemo } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

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

/**
 * Loader minimalista para transições de módulos
 */
const PageLoader = ({ message = "Carregando..." }: { message?: string }) => (
  <div className="h-screen w-screen bg-white flex flex-col items-center justify-center text-[#081437]">
      <Loader2 size={32} className="animate-spin text-blue-500 mb-6" />
      <p className="text-[10px] font-black text-slate-400 tracking-[6px] uppercase animate-pulse">{message}</p>
  </div>
);

/**
 * Componente de Decisão de Destino (Após Auth)
 */
const RootRedirect = () => {
    const { user, systemStatus, error: authError } = useAuth(); // Incluindo systemStatus e authError
    
    return useMemo(() => {
        if (authError) {
          console.error("Erro no AuthContext:", authError);
          // Podemos renderizar uma tela de erro específica aqui ou redirecionar para login com uma mensagem
          return <PageLoader message={`Houve um problema ao iniciar: ${authError}`} />;
        }

        if (!user) return <ClientLoginPage />; // Se não há usuário, mostra o login de cliente

        if (!systemStatus) return <PageLoader message="Verificando a segurança do sistema" />; // Aguarda o status do sistema

        const role = normalizeRole(user.role);
        const roleRoutes: Record<UserRole, string> = {
          [UserRole.ADMIN]: '/admin/dashboard',
          [UserRole.QUALITY]: '/quality/dashboard',
          [UserRole.CLIENT]: '/client/dashboard'
        };

        return <Navigate to={roleRoutes[role] || '/'} replace />;
    }, [user, systemStatus, authError]); // Dependências atualizadas
};

export const AppRoutes: React.FC = () => {
  const { user, isLoading, error: authError } = useAuth();
  
  // Durante o carregamento inicial da sessão, mostramos um estado neutro 
  if (isLoading) return <PageLoader message="Conectando ao sistema Vital" />;

  // Se houver um erro crítico no AuthContext após o carregamento, mostre-o
  if (authError) return <PageLoader message={`Ocorreu um erro grave: ${authError}`} />;


  return (
    <Suspense fallback={<PageLoader message="Finalizando carregamento" />}>
      <Routes>
        {/* A PRIMEIRA PÁGINA: Login do Cliente na Raiz */}
        <Route path="/" element={user ? <RootRedirect /> : <ClientLoginPage />} />
        
        {/* Compatibilidade de URL anterior */}
        <Route path="/login" element={<Navigate to="/" replace />} />

        {/* Middlewares de Segurança e Manutenção */}
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
                </Route>

                {/* Rotas de Cliente */}
                <Route element={<RoleMiddleware allowedRoles={[UserRole.CLIENT, UserRole.ADMIN]} />}>
                    <Route path="/client/dashboard" element={<ClientPage />} />
                </Route>
            </Route>
        </Route>

        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};