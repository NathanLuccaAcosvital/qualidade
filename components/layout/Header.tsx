
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, LogOut, User as UserIcon } from 'lucide-react';
import { User, UserRole } from '../../types/index.ts';

const LOGO_URL = "https://wtydnzqianhahiiasows.supabase.co/storage/v1/object/public/public_assets/hero/logo.png";

interface HeaderProps {
  title: string;
  user: User | null;
  role: UserRole;
  unreadCount: number;
  onLogout: () => void;
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, user, role, unreadCount, onLogout, onOpenMobileMenu }) => {
  const { t } = useTranslation();

  return (
    <>
      {/* Desktop Header */}
      <header className="hidden md:flex h-20 bg-white border-b border-slate-200 items-center justify-between px-8 shrink-0 z-50">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h2>
          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-0.5">
            <span className="text-blue-600 font-black">{t(`roles.${role}`)}</span>
            <span className="opacity-30">|</span>
            <span className="truncate max-w-[200px]">{user?.organizationName}</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <NotificationTrigger count={unreadCount} />
          <div className="h-8 w-px bg-slate-100" />
          <button 
            onClick={onLogout} 
            className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-red-600 transition-colors group"
          >
            <LogOut size={16} className="group-hover:translate-x-0.5 transition-transform" /> 
            {t('common.logout')}
          </button>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="md:hidden h-16 bg-[#0f172a] text-white flex items-center justify-between px-4 z-40 shrink-0 shadow-lg">
        <img src={LOGO_URL} alt="Aços Vital" className="h-8" />
        <div className="flex items-center gap-2">
            <NotificationTrigger count={unreadCount} />
            <button onClick={onOpenMobileMenu} className="p-2 text-slate-300 hover:text-white transition-colors">
              <UserIcon size={24} />
            </button>
        </div>
      </header>
    </>
  );
};

const NotificationTrigger = ({ count }: { count: number }) => (
  <button className="p-2 text-slate-400 hover:text-blue-600 relative transition-colors">
    <Bell size={20} />
    {count > 0 && (
      <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[8px] font-black rounded-full border-2 border-white flex items-center justify-center animate-in zoom-in">
        {count > 9 ? '9+' : count}
      </span>
    )}
  </button>
);
