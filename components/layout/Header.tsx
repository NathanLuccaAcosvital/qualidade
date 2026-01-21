
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { Bell, ArrowLeft } from 'lucide-react'; 
import { User, UserRole } from '../../types/index.ts';
import { LanguageSelector } from '../features/auth/login/LanguageSelector.tsx'; 
import { NotificationsDropdown } from '../features/notifications/NotificationsDropdown.tsx';
import { useNotifications } from '../features/notifications/hooks/useNotifications.ts';

interface HeaderProps {
  title: string;
  user: User | null;
  role: UserRole;
  unreadCount: number; // Mantido por compatibilidade, mas o hook local agora tem precedência
  onLogout: () => void;
  onOpenMobileMenu: () => void; 
  onNavigateBack: () => void; 
}

const LOGO_URL = "https://wtydnzqianhahiiasows.supabase.co/storage/v1/object/public/public_assets/hero/logo.png";
const CORPORATE_BLUE_FILTER = "brightness(0) saturate(100%) invert(8%) sepia(35%) saturate(5833%) hue-rotate(222deg) brightness(95%) contrast(106%)";

export const Header: React.FC<HeaderProps> = ({ 
  title, user, role, onOpenMobileMenu, onNavigateBack
}) => {
  const { t } = useTranslation();
  const location = useLocation();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { unreadCount } = useNotifications(); // Sincronia perfeita

  const isDashboard = ['/admin/dashboard', '/quality/dashboard', '/client/portal'].includes(location.pathname.split('?')[0]);

  return (
    <>
      <header className="hidden md:flex h-20 bg-white border-b border-slate-200 items-center justify-between px-8 shrink-0 z-50">
        <div className="flex items-center gap-6">
          <div className="space-y-0.5">
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h2>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              <span className="text-blue-600">{t(`roles.${role}`)}</span>
              <span className="opacity-30">|</span>
              <span className="text-slate-500 font-medium">{user?.organizationName}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <LanguageSelector />
          
          <div className="relative">
            <NotificationTrigger 
              count={unreadCount} 
              active={isNotificationsOpen}
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            />
            <NotificationsDropdown 
              isOpen={isNotificationsOpen} 
              onClose={() => setIsNotificationsOpen(false)} 
            />
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="md:hidden h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-40 shrink-0">
        {!isDashboard ? ( 
          <button onClick={onNavigateBack} className="p-2 text-slate-600"><ArrowLeft size={20} /></button>
        ) : (
          <img src={LOGO_URL} alt="Aços Vital" className="h-8" style={{ filter: CORPORATE_BLUE_FILTER }} />
        )}

        <div className="flex items-center gap-1 relative">
            <NotificationTrigger count={unreadCount} active={isNotificationsOpen} onClick={() => setIsNotificationsOpen(true)} />
            <NotificationsDropdown isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
        </div>
      </header>
    </>
  );
};

const NotificationTrigger = ({ count, active, onClick }: any) => (
  <button 
    onClick={onClick} 
    className={`p-2.5 rounded-xl transition-all relative group overflow-visible ${
        active ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
    }`}
  >
    <Bell size={20} strokeWidth={active ? 3 : 2.5} className={count > 0 && !active ? 'animate-swing' : ''} />
    {count > 0 && (
      <span className={`absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-[9px] font-black rounded-full border-2 border-white transition-all
        ${active ? 'bg-white text-blue-600 scale-110' : 'bg-red-500 text-white animate-bounce'}
      `}>
        {count > 9 ? '9+' : count}
      </span>
    )}
    
    <style>{`
        @keyframes swing {
            0%, 100% { transform: rotate(0); }
            20% { transform: rotate(15deg); }
            40% { transform: rotate(-15deg); }
            60% { transform: rotate(10deg); }
            80% { transform: rotate(-10deg); }
        }
        .animate-swing { animation: swing 2s infinite ease-in-out; }
    `}</style>
  </button>
);
