
import React, { Suspense, useMemo, useState, useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, RefreshCw, CheckCircle2 } from 'lucide-react';

import { AuthMiddleware } from './middlewares/AuthMiddleware.tsx';
import { RoleMiddleware } from './middlewares/RoleMiddleware.tsx';
import { MaintenanceMiddleware } from './middlewares/MaintenanceMiddleware.tsx';
import { useAuth } from './context/authContext.tsx';
import { UserRole, normalizeRole } from './types/index.ts';
import { ClientLayout } from './components/layout/ClientLayout.tsx'; // Importa ClientLayout

// Lazy loading das páginas
const ClientLoginPage = React.lazy(() => import('./pages/ClientLoginPage.tsx'));

const AdminDashboard = React.lazy(() => import('./pages/dashboards/AdminDashboard.tsx'));
const QualityDashboard = React.lazy(() => import('./pages/dashboards/QualityDashboard.tsx'));
const ClientPage = React.lazy(() => import('./pages/ClientPage.tsx'));
const QualityPage = React.lazy(() => import('./pages/QualityPage.tsx'));
const AdminPage = React.lazy(() => import('./pages/AdminPage.tsx'));
const ConfigPage = React.lazy(() => import('./pages/ConfigPage.tsx')); // Lazy load ConfigPage
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
    // Fix: Access isInitialSyncComplete and retryInitialSync from useAuth
    const { user, systemStatus, isLoading, error: authError, isInitialSyncComplete, retryInitialSync } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // Se o AuthContext está ativamente carregando ou realizando sua sincronização inicial,
    // exibe o loader. Esta é a verificação primária para "aguardando dados de auth/sistema".
    if (isLoading) {
        return <PageLoader message="Conectando ao sistema Vital" />;
    }

    // Neste ponto, isLoading é false, o que significa que o AuthContext terminou sua determinação inicial.

    // Se um erro crítico ocorreu durante a sincronização inicial, exibe a tela de retry.
    // Esta verificação é importante *após* o carregamento, quando isInitialSyncComplete deve ser true.
    if (isInitialSyncComplete && authError) {
        console.error("Erro no AuthContext após sincronização inicial:", authError);
        return <PageLoader message={`Ocorreu um problema ao iniciar: ${authError}.`} onRetry={retryInitialSync} />;
    }
    
    // Se há um usuário autenticado, mas, por alguma razão, o status do sistema ainda não está disponível,
    // continua exibindo o loader. (É um safety net, pois o systemStatus é buscado com o perfil do usuário).
    if (user && !systemStatus) {
        return <PageLoader message="Verificando a segurança do sistema" />;
    }

    // Se o usuário está autenticado:
    if (user) {
        // Se estiver na rota raiz ('/'), redireciona para o dashboard apropriado.
        if (location.pathname === '/') {
            const role = normalizeRole(user.role);
            const roleRoutes: Record<UserRole, string> = {
                [UserRole.ADMIN]: '/admin/dashboard',
                [UserRole.QUALITY]: '/quality/dashboard',
                [UserRole.CLIENT]: '/client/dashboard'
            };
            return <Navigate to={roleRoutes[role] || '/'} replace />;
        }
        // Se autenticado e não na rota raiz, permite que o router continue o mapeamento.
        // Isso é crucial para situações onde um usuário logado pode cair em `/login` ou um link direto.
        return null;
    }

    // Se não há usuário (não autenticado):
    // Se estiver na rota raiz ('/'), redireciona para a página de login.
    if (!user && location.pathname === '/') {
      return <Navigate to="/login" replace />;
    }

    // Se não autenticado e não na rota raiz, permite que o router continue o mapeamento.
    // Isso permite que a rota `/login` seja renderizada se o usuário já estiver lá.
    return null;
};

export const AppRoutes: React.FC = () => {
  const [searchParams] = useSearchParams();
  const activeView = searchParams.get('view') || 'home';
  const navigate = useNavigate();

  const handleClientViewChange = (view: string) => {
    navigate(`/client/dashboard?view=${view}`);
  };

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
                
                {/* Rotas Comuns/Gerais (Acessíveis a todos os roles autenticados para certas funcionalidades) */}
                <Route path="/settings" element={<ConfigPage />} /> {/* Nova rota para ConfigPage */}

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
                </Route>

                {/* Rotas de Cliente */}
                <Route element={<RoleMiddleware allowedRoles={[UserRole.CLIENT, UserRole.ADMIN]} />}>
                    {/* Wrap ClientPage with ClientLayout */}
                    <Route 
                      path="/client/dashboard" 
                      element={<ClientPage />} 
                    />
                </Route>
            </Route>
        </Route>

        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
};