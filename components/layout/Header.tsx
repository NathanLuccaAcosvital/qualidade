
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom'; // Import useLocation and useNavigate
import { Bell, LogOut, Settings, ArrowLeft } from 'lucide-react'; // Import ArrowLeft
import { User, UserRole } from '../../types/index.ts';

const LOGO_URL = "https://wtydnzqianhahiiasows.supabase.co/storage/v1/object/public/public_assets/hero/logo.png";

interface HeaderProps {
  title: string;
  user: User | null;
  role: UserRole;
  unreadCount: number;
  onLogout: () => void;
  onOpenMobileMenu: () => void; // Mantido para o ícone de configurações mobile abrir o drawer
  onNavigateBack: () => void; // Nova prop para o botão de voltar
  variant?: 'white' | 'blue';
}

export const Header: React.FC<HeaderProps> = ({ title, user, role, unreadCount, onLogout, onOpenMobileMenu, onNavigateBack, variant = 'white' }) => {
  const { t } = useTranslation();
  const location = useLocation();
  
  // Determina se estamos em uma página de dashboard principal para exibir o logo em vez do back button
  const isDashboard = ['/admin/dashboard', '/quality/dashboard', '/client/dashboard'].includes(location.pathname.split('?')[0]);

  const desktopHeaderBgClass = variant === 'blue' ? 'bg-[#0f172a] text-white' : 'bg-white';
  const desktopTitleClass = variant === 'blue' ? 'text-white' : 'text-slate-800';
  const desktopSubtitleClass = variant === 'blue' ? 'text-slate-400' : 'text-slate-400';
  const desktopRoleClass = variant === 'blue' ? 'text-blue-400' : 'text-blue-600';
  const desktopPipeClass = variant === 'blue' ? 'opacity-30' : 'opacity-30';
  const desktopOrgClass = variant === 'blue' ? 'text-slate-300' : 'text-slate-400';
  const desktopDividerClass = variant === 'blue' ? 'bg-slate-700' : 'bg-slate-100';
  const desktopLogoutClass = variant === 'blue' ? 'text-slate-300 hover:text-red-400' : 'text-slate-500 hover:text-red-600';
  const desktopNotificationClass = variant === 'blue' ? 'text-slate-300 hover:text-blue-400' : 'text-slate-400 hover:text-blue-600';
  const desktopSettingsClass = variant === 'blue' ? 'text-slate-300 hover:text-blue-400' : 'text-slate-400 hover:text-blue-600';


  return (
    <>
      {/* Desktop Header */}
      <header className={`hidden md:flex h-20 ${desktopHeaderBgClass} border-b ${variant === 'blue' ? 'border-slate-800' : 'border-slate-200'} items-center justify-between px-8 shrink-0 z-50`}>
        <div className="flex items-center gap-4">
          <img src={LOGO_URL} alt="Aços Vital" className={`h-14 object-contain ${variant === 'blue' ? 'filter brightness-0 invert' : ''}`} />
          <div>
            <h2 className={`text-xl font-bold ${desktopTitleClass} tracking-tight`}>{title}</h2>
            <div className={`flex items-center gap-2 text-[10px] ${desktopSubtitleClass} font-medium uppercase tracking-widest mt-0.5`}>
              <span className={`${desktopRoleClass} font-black`}>{t(`roles.${role}`)}</span>
              <span className={desktopPipeClass}>|</span>
              <span className={`truncate max-w-[200px] ${desktopOrgClass}`}>{user?.organizationName}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <NotificationTrigger count={unreadCount} className={desktopNotificationClass} />
          {/* Botão de Configurações para Alterar Senha, agora navega para a página de configurações */}
          <button 
            // Desktop sempre navega direto para /settings
            onClick={() => {
                const navigate = useNavigate();
                navigate('/settings');
            }} 
            className={`p-2 relative transition-colors ${desktopSettingsClass}`}
            title={t('menu.settings')}
            aria-label={t('menu.settings')}
          >
            <Settings size={20} />
          </button>
          <div className={`h-8 w-px ${desktopDividerClass}`} />
          <button 
            onClick={onLogout} 
            className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest ${desktopLogoutClass} transition-colors group`}
          >
            <LogOut size={16} className="group-hover:translate-x-0.5 transition-transform" /> 
            {t('common.logout')}
          </button>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="md:hidden h-16 bg-[#0f172a] text-white flex items-center justify-between px-4 z-40 shrink-0 shadow-lg">
        {/* Lado Esquerdo: Back Button ou Logo */}
        {!isDashboard && location.pathname !== '/login' ? ( // Não mostrar back button no login ou dashboard
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

        {/* Lado Direito: Notificações e Configurações */}
        <div className="flex items-center gap-2">
            <NotificationTrigger count={unreadCount} className="text-slate-300 hover:text-white" />
            <button 
              onClick={onOpenMobileMenu} // Este botão agora abre o menu mobile (drawer)
              className="p-2 text-slate-300 hover:text-white transition-colors"
              title={t('menu.settings')}
              aria-label={t('menu.settings')}
            >
              <Settings size={24} /> {/* Ícone de engrenagem */}
            </button>
        </div>
      </header>
    </>
  );
};

const NotificationTrigger = ({ count, className }: { count: number, className: string }) => (
  <button className={`p-2 relative transition-colors ${className}`}>
    <Bell size={20} />
    {count > 0 && (
      <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[8px] font-black rounded-full border-2 border-white flex items-center justify-center animate-in zoom-in">
        {count > 9 ? '9+' : count}
      </span>
    )}
  </button>
);