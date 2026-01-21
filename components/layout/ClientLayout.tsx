import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext.tsx';
import { Header } from './Header.tsx';
import { MobileNavigation } from './MobileNavigation.tsx';
import { CookieBanner } from '../common/CookieBanner.tsx';
import { MaintenanceBanner } from '../common/MaintenanceBanner.tsx';
import { useLayoutState } from './hooks/useLayoutState.ts';
import { useSystemSync } from './hooks/useSystemSync.ts';
import { UserRole, normalizeRole } from '../../types/index.ts';
import { ClientDock } from './ClientDock.tsx';
import { SidebarClient } from './SidebarClient.tsx'; 

interface ClientLayoutProps {
  children: React.ReactNode;
  title: string;
  activeView: string;
  onViewChange: (view: string) => void;
}

export const ClientLayout: React.FC<ClientLayoutProps> = ({ children, title, activeView, onViewChange }) => {
  const { user, logout, systemStatus: authSystemStatus } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const role = normalizeRole(user?.role);

  const layout = useLayoutState();
  const system = useSystemSync(user, authSystemStatus);

  const handleNavigateBack = () => {
    navigate(-1);
  };

  const handleNavigateToSettingsPage = () => {
    navigate('/settings');
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <CookieBanner />

      <SidebarClient 
        user={user} 
        role={role} 
        isCollapsed={layout.sidebarCollapsed} 
        onToggle={layout.toggleSidebar} 
        onLogout={logout}
        onNavigateToSettings={handleNavigateToSettingsPage}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <MaintenanceBanner status={system.status} isAdmin={role === UserRole.ADMIN} />
        
        <Header 
          title={title} 
          user={user} 
          role={role} 
          unreadCount={system.unreadCount} 
          onLogout={logout}
          onOpenMobileMenu={layout.openMobileMenu} 
          onNavigateBack={handleNavigateBack} 
        />

        <main className="flex-1 flex flex-col min-h-0 bg-slate-50 relative">
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {children}
          </div>
        </main>

        <MobileNavigation 
          user={user}
          userRole={role}
          isMenuOpen={layout.mobileMenuOpen}
          onCloseMenu={layout.closeMobileMenu}
          onLogout={logout}
          onNavigateToSettings={handleNavigateToSettingsPage} 
        />

        <ClientDock 
          activeView={activeView} 
          onViewChange={onViewChange}
        />
      </div>
    </div>
  );
};