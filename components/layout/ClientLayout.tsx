
import React from 'react'; // Removido useState
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
// import { NotificationModal } from '../features/notifications/NotificationModal.tsx'; // Importa o modal - REMOVIDO

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

  // Removido o estado e handlers do modal de notificação
  // const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  // const handleOpenNotificationsModal = () => setIsNotificationsModalOpen(true);
  // const handleCloseNotificationsModal = () => setIsNotificationsModalOpen(false);

  const handleNavigateBack = () => {
    navigate(-1);
  };

  const handleNavigateToSettingsPage = () => {
    navigate('/settings');
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <CookieBanner />
      {/* Removido o NotificationModal */}
      {/* <NotificationModal 
        isOpen={isNotificationsModalOpen} 
        onClose={handleCloseNotificationsModal} 
      /> */}

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
          variant="blue"
          // onOpenNotificationsModal={handleOpenNotificationsModal} // Prop removida
        />

        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-8 custom-scrollbar relative flex flex-col pb-20">
          <div className="max-w-[1400px] w-full mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500 flex-1">
            {children}
          </div>

          <footer className="max-w-[1400px] w-full mx-auto mt-12 mb-4 px-4 py-10 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-[10px] md:text-[11px] lg:text-[12px] xl:text-[13px] font-black uppercase tracking-[4px] text-slate-500">{t('login.monitoring')}</span>
              </div>
              <div className="text-[10px] md:text-[11px] lg:text-[12px] xl:text-[13px] font-black uppercase tracking-[4px] text-slate-500">
                © 2026 {t('menu.brand').toUpperCase()}
              </div>
          </footer>
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
