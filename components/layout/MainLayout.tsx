import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext.tsx';
import { SidebarQuality } from './SidebarQuality.tsx';
import { SidebarAdmin } from './SidebarAdmin.tsx';
import { SidebarClient } from './SidebarClient.tsx';
import { Header } from './Header.tsx';
import { MobileNavigation } from './MobileNavigation.tsx';
import { CookieBanner } from '../common/CookieBanner.tsx';
import { MaintenanceBanner } from '../common/MaintenanceBanner.tsx';
import { useLayoutState } from './hooks/useLayoutState.ts';
import { useSystemSync } from './hooks/useSystemSync.ts';
import { UserRole, normalizeRole } from '../../types/index.ts';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
}

/**
 * MainLayout (Internal Viewport)
 * Orquestrador de sidebars e layout mestre focado em clareza visual.
 */
export const Layout: React.FC<LayoutProps> = ({ children, title }) => {
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

  const commonSidebarProps = {
    user,
    role,
    isCollapsed: layout.sidebarCollapsed,
    onToggle: layout.toggleSidebar,
    onLogout: logout,
    onNavigateToSettings: handleNavigateToSettingsPage,
  };

  return (
    <div className="flex h-screen bg-slate-50/40 overflow-hidden font-sans">
      <CookieBanner />

      {/* Seleção rigorosa de Sidebar por Role - Design Unificado Light */}
      {role === UserRole.ADMIN && <SidebarAdmin {...commonSidebarProps} />}
      {role === UserRole.QUALITY && <SidebarQuality {...commonSidebarProps} />}
      {role === UserRole.CLIENT && <SidebarClient {...commonSidebarProps} />}

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

        <main className="flex-1 flex flex-col min-h-0 bg-transparent p-4 md:p-8 relative overflow-y-auto custom-scrollbar">
          <div className="w-full max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-3 duration-700 flex flex-col">
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
      </div>
    </div>
  );
};