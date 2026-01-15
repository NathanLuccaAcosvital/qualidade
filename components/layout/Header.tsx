
import React, { useState } from 'react'; // Adicionado useState
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, ArrowLeft } from 'lucide-react'; 
import { User, UserRole } from '../../types/index.ts';
import { LanguageSelector } from '../features/auth/login/LanguageSelector.tsx'; 
import { NotificationsDropdown } from '../features/notifications/NotificationsDropdown.tsx'; // Importa o novo componente

const LOGO_URL = "https://wtydnzqianhahiiasows.supabase.co/storage/v1/object/public/public_assets/hero/logo.png";

interface HeaderProps {
  title: string;
  user: User | null;
  role: UserRole;
  unreadCount: number;
  onLogout: () => void;
  onOpenMobileMenu: () => void; 
  onNavigateBack: () => void; 
  variant?: 'white' | 'blue';
  // onOpenNotificationsModal: () => void; // Prop removida
}

export const Header: React.FC<HeaderProps> = ({ 
  title, user, role, unreadCount, onLogout, onOpenMobileMenu, 
  onNavigateBack, variant = 'white' // onOpenNotificationsModal removida
}) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [isNotificationsDropdownOpen, setIsNotificationsDropdownOpen] = useState(false); // Estado para o dropdown
  const toggleNotificationsDropdown = () => setIsNotificationsDropdownOpen(prev => !prev);

  const isDashboard = ['/admin/dashboard', '/quality/dashboard', '/client/dashboard'].includes(location.pathname.split('?')[0]);

  const desktopHeaderBgClass = variant === 'blue' ? 'bg-[var(--color-primary-dark-blue)] text-white' : 'bg-white';
  const desktopTitleClass = variant === 'blue' ? 'text-white' : 'text-slate-800';
  const desktopSubtitleClass = variant === 'blue' ? 'text-slate-400' : 'text-slate-400';
  const desktopRoleClass = variant === 'blue' ? 'text-[var(--color-detail-blue)]' : 'text-blue-600';
  const desktopPipeClass = variant === 'blue' ? 'opacity-30' : 'opacity-30';
  const desktopOrgClass = variant === 'blue' ? 'text-slate-300' : 'text-slate-400';
  const desktopNotificationClass = variant === 'blue' ? 'text-slate-300 hover:text-[var(--color-detail-blue)]' : 'text-slate-400 hover:text-blue-600';

  return (
    <>
      {/* Desktop Header */}
      <header className={`hidden md:flex h-20 ${desktopHeaderBgClass} border-b ${variant === 'blue' ? 'border-slate-800' : 'border-slate-200'} items-center justify-between px-8 shrink-0 z-50`}>
        <div className="flex items-center gap-4">
          <div>
            <h2 className={`text-xl font-bold ${desktopTitleClass} tracking-tight`}>{title}</h2>
            <div className={`flex items-center gap-2 text-[10px] ${desktopSubtitleClass} font-medium uppercase tracking-widest mt-0.5`}>
              <span className={`${desktopRoleClass} font-black`}>{t(`roles.${role}`)}</span>
              <span className={desktopPipeClass}>|</span>
              <span className={`truncate max-w-[200px] ${desktopOrgClass}`}>{user?.organizationName}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 relative"> {/* Adicionado relative aqui para posicionamento do dropdown */}
          <LanguageSelector inHeader={true} /> 
          <NotificationTrigger 
            count={unreadCount} 
            className={desktopNotificationClass} 
            onClick={toggleNotificationsDropdown} // Usa o handler local
            aria-expanded={isNotificationsDropdownOpen}
          />
          <NotificationsDropdown 
            isOpen={isNotificationsDropdownOpen} 
            onClose={() => setIsNotificationsDropdownOpen(false)} 
          />
        </div>
      </header>

      {/* Mobile Header */}
      <header className="md:hidden h-16 bg-[var(--color-primary-dark-blue)] text-white flex items-center justify-between px-4 z-40 shrink-0 shadow-lg">
        {!isDashboard && location.pathname !== '/login' ? ( 
          <button 
            onClick={onNavigateBack} 
            className="p-2 text-slate-300 hover:text-white transition-colors"
            aria-label={t('common.back')}
          >
            <ArrowLeft size={24} />
          </button>
        ) : (
          <img src={LOGO_URL} alt="Aços Vital" className="h-10" />
        )}

        <div className="flex items-center gap-2 relative"> {/* Adicionado relative aqui para posicionamento do dropdown */}
            <NotificationTrigger 
              count={unreadCount} 
              className="text-slate-300 hover:text-white" 
              onClick={toggleNotificationsDropdown} // Usa o handler local
              aria-expanded={isNotificationsDropdownOpen}
            />
            <NotificationsDropdown 
              isOpen={isNotificationsDropdownOpen} 
              onClose={() => setIsNotificationsDropdownOpen(false)} 
            />
            <button 
              onClick={onOpenMobileMenu} 
              className="p-2 text-slate-300 hover:text-white transition-colors"
              title={t('menu.settings')}
              aria-label={t('menu.settings')}
            >
              <Settings size={24} /> 
            </button>
        </div>
      </header>
    </>
  );
};

import { Settings } from 'lucide-react'; 

const NotificationTrigger = ({ count, className, onClick, "aria-expanded": ariaExpanded }: { count: number, className: string, onClick: () => void, "aria-expanded"?: boolean }) => (
  <button 
    onClick={onClick} 
    className={`p-2 relative transition-colors ${className}`}
    aria-label="Minhas Notificações"
    id="notifications-menu-button"
    aria-haspopup="true"
    aria-expanded={ariaExpanded}
  >
    <Bell size={20} />
    {count > 0 && (
      <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[8px] font-black rounded-full border-2 border-white flex items-center justify-center animate-in zoom-in">
        {count > 9 ? '9+' : count}
      </span>
    )}
  </button>
);
