import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ShieldCheck, Loader2 } from 'lucide-react';

// --- Imports Estruturais ---
import { Layout as MainLayout } from './components/layout/MainLayout';
import { AuthMiddleware } from './middlewares/AuthMiddleware';
import { RoleMiddleware } from './middlewares/RoleMiddleware';
import { MaintenanceMiddleware } from './middlewares/MaintenanceMiddleware';
import { useAuth } from './context/authContext.tsx';
import { UserRole } from './types/index';

// --- Lazy Load Pages ---
const Login = React.lazy(() => import('./pages/Login'));
const SignUp = React.lazy(() => import('./pages/SignUp'));
// Fix: Ensure Dashboard is correctly imported as a default export, or adjust if it's named. Assuming default.
const Dashboard = React.lazy(() => import('./pages/Dashboard')); // View Cliente
// Fix: Updated lazy import for QualityPage to correctly handle its named export
const QualityPage = React.lazy(() => import('./pages/QualityPage').then(module => ({ default: module.QualityPage })));     // View Qualidade (Renomeado)
const AdminPage = React.lazy(() => import('./pages/AdminPage'));         // View Admin (Renomeado)
// Fix: Updated lazy import for FileInspection to correctly handle its named export
const FileInspection = React.lazy(() => import('./features/quality/views/FileInspection.tsx').then(module => ({ default: module.FileInspection }))); // NOVO: View de Inspeção de Arquivos
const NotFound = React.lazy(() => import('./pages/NotFound'));

const LOGO_URL = "https://wtydnzqianhahiiasows.supabase.co/storage/v1/object/public/public_assets/hero/logo.png";

// --- Internal Components ---

const LoadingScreen = ({ message = "Carregando Portal" }: { message?: string }) => (
  <div className="h-screen w-screen bg-slate-900 flex flex-col items-center justify-center text-white relative">
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 animate-pulse"></div>
        <img src={LOGO_URL} alt="Loading Logo" className="h-32 relative z-10 drop-shadow-2xl" />
      </div>
      <Loader2 size={32} className="animate-spin text-blue-400 mb-4" />
      <p className="text-[10px] font-black text-slate-500 tracking-[4px] uppercase animate-pulse">{message}</p>
  </div>
);

// Redireciona usuários logados para sua área correta ao tentar acessar Login/Signup
const PublicRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    const { user, isLoading } = useAuth();

    if (isLoading) return <LoadingScreen />;
    
    if (user) {
        // Redirecionamento Inteligente por Role
        // Fix: Added default tab/view for admin and quality redirects.
        switch (user.role) {
            case UserRole.ADMIN: return <Navigate to="/admin?tab=overview" replace />;
            case UserRole.QUALITY: return <Navigate to="/quality?view=overview" replace />;
            default: return <Navigate to="/dashboard" replace />; // Clientes (Role 3)
        }
    }

    return children;
};

// Redireciona a raiz "/" para a home correta do usuário
const RootRedirect = () => {
    const { user, isLoading } = useAuth();
    if (isLoading) return <LoadingScreen />;
    if (!user) return <Navigate to="/login" replace />;

    // Fix: Added default tab/view for admin and quality redirects.
    switch (user.role) {
        case UserRole.ADMIN: return <Navigate to="/admin?tab=overview" replace />;
        case UserRole.QUALITY: return <Navigate to="/quality?view=overview" replace />;
        default: return <Navigate to="/dashboard" replace />;
    }
};

// --- Main Routes Definition ---

export const AppRoutes: React.FC = () => {
  const { isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Rotas Públicas (Login/Signup) */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><SignUp /></PublicRoute>} />

        {/* Rotas Protegidas */}
        <Route element={<MaintenanceMiddleware />}> 
            <Route element={<AuthMiddleware />}>
                {/* Role 3: Cliente (Dashboard) */}
                <Route path="/dashboard" element={<Dashboard />} />
                
                {/* Role 2: Qualidade (Acesso também para Admin) */}
                <Route element={<RoleMiddleware allowedRoles={[UserRole.QUALITY, UserRole.ADMIN]} />}>
                    <Route path="/quality" element={<QualityPage />} />
                    {/* NOVO: Rota aninhada para inspeção de arquivos */}
                    <Route path="/quality/inspect/:fileId" element={<FileInspection />} />
                </Route>

                {/* Role 1: Admin (Exclusivo) - Rotas Aninhadas */}
                <Route element={<RoleMiddleware allowedRoles={[UserRole.ADMIN]} />}>
                    <Route path="/admin" element={<AdminPage />} /> {/* AdminPage is now the parent */}
                </Route>

                {/* Root Redirect Inteligente */}
                <Route path="/" element={<RootRedirect />} />
                
            </Route>
        </Route>

        {/* Rotas de Erro */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
};