
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/authContext.tsx';
import { notificationService, adminService } from '../../lib/services/index.ts';
import { AppNotification, UserRole, SystemStatus } from '../../types.ts';
import { CookieBanner } from '../common/CookieBanner.tsx';
import { PrivacyModal } from '../common/PrivacyModal.tsx';
import { ChangePasswordModal } from '../features/auth/ChangePasswordModal.tsx';
import { MaintenanceBanner } from '../common/MaintenanceBanner.tsx';
import { useTranslation } from 'react-i18next';
import { 
  LogOut, 
  LayoutDashboard, 
  Settings, 
  ShieldCheck,
  Bell,
  Search,
  FileBadge,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Check,
  History,
  Star,
  Home,
  Library,
  Shield,
  User as UserIcon,
  Info,
  ArrowLeft,
  BarChart3,
  Users,
  Building2,
  ShieldAlert,
  Server,
  Lock,
  Activity, // NOVO: Importa Activity icon
  // REMOVIDO: Database, pois não é mais usado para a Biblioteca Mestra
} from 'lucide-react';
import { useLocation, Link, useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
}

type MenuItem = {
  label: string;
  icon: React.ElementType;
  path: string;
  exact?: boolean;
};

type MenuSection = {
  title?: string;
  items: MenuItem[];
};

const LOGO_URL = "https://wtydnzqianhahiiasows.supabase.co/storage/v1/object/public/public_assets/hero/logo.png";

export const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({ mode: 'ONLINE' });
  const [isCollapsed, setIsCollapsed] = useState(() => {
      const stored = localStorage.getItem('sidebar_collapsed');
      return stored === 'true';
  });

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
      if (user) {
          fetchNotifications();
          checkSystemStatus();
          const unsubStatus = adminService.subscribeToSystemStatus((status) => {
              setSystemStatus(status);
          });
          const unsubNotifs = notificationService.subscribeToNotifications(() => {
              fetchNotifications();
          });
          return () => {
              unsubStatus();
              // Fix: Corrected typo from `unifNotifs()` to `unsubNotifs()`
              unsubNotifs();
          };
      }
  }, [user]);

  const checkSystemStatus = async () => {
      const status = await adminService.getSystemStatus();
      setSystemStatus(status);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        const isMobileView = window.innerWidth < 768;
        if (!isMobileView && notifRef.current && !notifRef.current.contains(event.target as Node)) {
            setIsNotifOpen(false);
        }
        if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
            setIsUserMenuOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchNotifications = async () => {
      if (!user) return;
      const data = await notificationService.getNotifications(user);
      const count = await notificationService.getUnreadCount(user);
      setNotifications(data);
      setUnreadCount(count);
  };

  const handleMarkAsRead = async (id: string, link?: string) => {
      await notificationService.markAsRead(id);
      if (link) {
          setIsNotifOpen(false);
          navigate(link);
      }
  };

  const handleMarkAllRead = async () => {
      if (!user) return;
      await notificationService.markAllAsRead(user);
  };

  const toggleSidebar = () => {
      const newState = !isCollapsed;
      setIsCollapsed(newState);
      localStorage.setItem('sidebar_collapsed', String(newState));
  };

  const changeLanguage = (lng: string) => {
      i18n.changeLanguage(lng);
      localStorage.setItem('i18nextLng', lng);
  };

  const roleLabel = user ? t(`roles.${user.role}`) : '';

  const getMenuConfig = (): MenuSection[] => {
    // Normalização para evitar problemas de case-sensitivity vindo do backend
    const role = user?.role?.toUpperCase();

    if (role === UserRole.CLIENT) {
      return [
        {
          title: t('menu.main'),
          items: [
            { label: t('menu.home'), icon: Home, path: '/dashboard', exact: true },
            { label: t('menu.library'), icon: Library, path: '/dashboard?view=files' },
          ]
        },
        {
          title: t('menu.quickAccess'),
          items: [
            { label: t('menu.recent'), icon: History, path: '/dashboard?view=recent' },
            { label: t('menu.favorites'), icon: Star, path: '/dashboard?view=favorites' },
          ]
        }
      ];
    }

    if (role === UserRole.QUALITY) {
      return [
        {
          title: t('menu.qualityManagement'),
          items: [
            { label: t('quality.overview'), icon: LayoutDashboard, path: '/quality?view=overview' },
            { label: t('menu.clientPortfolio'), icon: Users, path: '/quality?view=clients' },
            { label: t('quality.myAuditLog'), icon: Activity, path: '/quality?view=audit-log' }, // NOVO ITEM DE MENU
            // REMOVIDO: { label: t('menu.masterLibrary'), icon: Database, path: '/quality?view=master' },
          ]
        }
      ];
    }

    if (role === UserRole.ADMIN) {
      return [
        {
          title: t('menu.management'),
          items: [
            { label: t('admin.tabs.overview'), icon: BarChart3, path: '/admin?tab=overview' },
            { label: t('admin.tabs.users'), icon: Users, path: '/admin?tab=users' },
            { label: t('admin.tabs.clients'), icon: Building2, path: '/admin?tab=clients' },
          ]
        },
        {
          title: t('menu.system'),
          items: [
            { label: t('admin.tabs.logs'), icon: ShieldAlert, path: '/admin?tab=logs' },
            { label: t('admin.tabs.settings'), icon: Settings, path: '/admin?tab=settings' },
            { label: t('quality.myAuditLog'), icon: Activity, path: '/quality?view=audit-log' }, // ADMIN também pode ver seu log individual
          ]
        }
      ];
    }

    // Fallback básico para segurança caso o papel seja nulo ou inválido
    return [
        {
          title: t('menu.main'),
          items: [{ label: t('menu.home'), icon: Home, path: '/dashboard', exact: true }]
        }
    ];
  };

  const getBottomNavItems = () => {
      const role = user?.role?.toUpperCase();
      const items = [
          { label: t('menu.home'), icon: Home, path: '/dashboard', exact: true },
      ];

      if (role === UserRole.CLIENT) {
          items.push({ label: t('menu.library'), icon: Library, path: '/dashboard?view=files', exact: false });
      } else if (role === UserRole.ADMIN) {
          items.push({ label: 'Admin', icon: BarChart3, path: '/admin?tab=overview', exact: false }); // Updated path
      } else if (role === UserRole.QUALITY) {
          items.push({ label: t('menu.clientPortfolio'), icon: Users, path: '/quality?view=clients', exact: false });
          items.push({ label: t('quality.myAuditLog'), icon: Activity, path: '/quality?view=audit-log', exact: false }); // NOVO: Log de Auditoria
          // REMOVIDO: items.push({ label: t('menu.masterLibrary'), icon: Database, path: '/quality?view=master', exact: false });
      }

      return items;
  };

  const menuSections = getMenuConfig();
  const bottomNavItems = getBottomNavItems();

  const isActive = (path: string, exact = false) => {
      if (exact) return location.pathname === path && location.search === '';
      if (path.includes('?')) {
          return location.pathname + location.search === path;
      }
      return location.pathname.startsWith(path);
  };

  const getNotifStyle = (type: AppNotification['type']) => {
      switch (type) {
          case 'SUCCESS': return { icon: CheckCircle2, bg: 'bg-emerald-100', text: 'text-emerald-600', border: 'border-emerald-200' };
          case 'WARNING': return { icon: AlertTriangle, bg: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-200' };
          case 'ALERT': return { icon: AlertCircle, bg: 'bg-red-100', text: 'text-red-600', border: 'border-red-200' };
          default: return { icon: Info, bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200' };
      }
  };

  const renderAdminSupportWidget = () => {
      // N3 Support and external team widget is removed as part of ticket removal
      return null; 
  };

  const NotificationButton = ({ mobile = false }) => {
    const renderNotificationList = () => (
        <div className="flex flex-col h-full bg-white md:bg-transparent">
             <div className={`${mobile ? 'p-4 mt-safe-top shadow-sm' : 'p-4'} border-b border-slate-100 flex justify-between items-center bg-white/95 backdrop-blur shrink-0 z-10`}>
                <div className="flex items-center gap-3">
                    {mobile && (
                        <button onClick={() => setIsNotifOpen(false)} className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full active:scale-95 transition-transform" aria-label={t('common.back')}>
                            <ArrowLeft size={20} aria-hidden="true" />
                        </button>
                    )}
                    <h3 className="font-bold text-slate-800 text-lg">{t('notifications.title')}</h3>
                </div>
                {unreadCount > 0 && (
                    <button 
                        onClick={handleMarkAllRead}
                        className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors active:scale-95"
                        aria-label={t('notifications.markAll')}
                    >
                        <Check size={14} aria-hidden="true" /> <span className="hidden sm:inline">{t('notifications.markAll')}</span>
                    </button>
                )}
            </div>
            
            <div className={`overflow-y-auto custom-scrollbar ${mobile ? 'flex-1 bg-slate-50 p-3' : 'max-h-[400px]'}`}>
                {notifications.length === 0 ? (
                    <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <Bell size={24} className="opacity-20" aria-hidden="true" />
                        </div>
                        <p className="text-sm font-medium">{t('notifications.empty')}</p>
                    </div>
                ) : (
                    <div className={`${mobile ? 'space-y-3' : 'divide-y divide-slate-100'}`}>
                        {notifications.map(notif => {
                            const style = getNotifStyle(notif.type);
                            const Icon = style.icon;

                            return (
                                <div 
                                    key={notif.id}
                                    onClick={() => handleMarkAsRead(notif.id, notif.link)}
                                    className={`
                                        group cursor-pointer transition-all
                                        ${mobile 
                                            ? `p-4 rounded-2xl border shadow-sm active:scale-[0.99] ${!notif.isRead ? 'bg-white border-blue-200 shadow-blue-500/5 ring-1 ring-blue-50' : 'bg-white border-slate-200'}`
                                            : `p-4 hover:bg-slate-50 ${!notif.isRead ? 'bg-blue-50/20' : ''}`
                                        }
                                    `}
                                    role="listitem" // A11y
                                    aria-label={`${notif.title}. ${notif.message}. ${notif.isRead ? t('notifications.read') : t('notifications.unread')}.`} // A11y
                                >
                                    <div className="flex gap-4">
                                        <div className={`shrink-0 mt-0.5 w-10 h-10 rounded-full flex items-center justify-center ${style.bg} ${style.text}`}>
                                            <Icon size={20} aria-hidden="true" />
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col gap-1">
                                            <div className="flex justify-between items-start gap-2">
                                                <h4 className={`text-sm leading-snug ${!notif.isRead ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                                                    {notif.title}
                                                </h4>
                                                <div className="flex flex-col items-end shrink-0 gap-1.5 pt-0.5">
                                                    <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                                                        {notif.timestamp}
                                                    </span>
                                                    {!notif.isRead && (
                                                        <div className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-sm ring-2 ring-white" aria-label={t('notifications.unread')}></div>
                                                    )}
                                                </div>
                                            </div>
                                            <p className={`text-xs leading-relaxed line-clamp-2 ${!notif.isRead ? 'text-slate-600 font-medium' : 'text-slate-500'}`}>
                                                {notif.message}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="relative" ref={notifRef}>
            <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className={`relative p-2 rounded-lg transition-colors ${
                    mobile 
                    ? 'text-white hover:bg-slate-800 active:bg-slate-700' 
                    : isNotifOpen ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:bg-slate-50 hover:text-blue-600'
                }`}
                aria-label={t('notifications.title')}
            >
                <Bell size={mobile ? 24 : 20} aria-hidden="true" />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse shadow-sm" aria-label={t('notifications.unreadCount', { count: unreadCount })}></span>
                )}
            </button>
            {isNotifOpen && (
                <>
                    {mobile ? (
                        <div className="fixed inset-0 z-[100] bg-slate-50 flex flex-col animate-in slide-in-from-right duration-300">
                             {renderNotificationList()}
                        </div>
                    ) : (
                        <div className="absolute right-0 mt-3 w-96 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 z-[100] origin-top-right">
                            {renderNotificationList()}
                        </div>
                    )}
                </>
            )}
        </div>
    );
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <CookieBanner />
      <PrivacyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
      <ChangePasswordModal isOpen={isChangePasswordOpen} onClose={() => setIsChangePasswordOpen(false)} />

      <aside className={`hidden md:flex flex-col bg-[#0f172a] text-slate-300 shadow-2xl z-[60] relative transition-all duration-500 ease-in-out ${isCollapsed ? 'w-20' : 'w-72'} overflow-visible h-screen`}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-900/20 via-[#0f172a] to-[#0f172a] pointer-events-none" aria-hidden="true"></div>
        <button onClick={toggleSidebar} className="absolute -right-3 top-8 z-[70] bg-white/90 backdrop-blur-md text-slate-600 border border-slate-200/60 rounded-full h-7 w-7 flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.1)] hover:text-blue-600 hover:border-blue-400 hover:scale-110 transition-all cursor-pointer" title={isCollapsed ? t('common.expand') : t('common.collapse')} aria-label={isCollapsed ? t('common.expandSidebar') : t('common.collapseSidebar')}>
            {isCollapsed ? <ChevronRight size={14} strokeWidth={3} aria-hidden="true" /> : <ChevronLeft size={14} strokeWidth={3} aria-hidden="true" />}
        </button>
        <div className={`h-28 flex items-center border-b border-slate-800/60 bg-[#0f172a]/50 backdrop-blur-sm shrink-0 transition-all duration-500 relative z-10 ${isCollapsed ? 'justify-center px-0' : 'px-6'}`}>
            <img src={LOGO_URL} alt={t('menu.portalNameShort')} className={`transition-all duration-500 object-contain drop-shadow-[0_4px_12px_rgba(255,255,255,0.1)] ${isCollapsed ? 'h-12 w-12' : 'h-16'}`} />
        </div>
        <nav className="flex-1 py-3 space-y-1 relative z-10 overflow-y-auto sidebar-scrollbar overflow-x-hidden min-h-0" aria-label={t('common.mainNavigation')}>
          {menuSections.map((section, idx) => (
            <div key={idx} className="px-3">
               {!isCollapsed && section.title && (
                 <div className="mb-2 px-3 text-[9px] font-bold uppercase tracking-widest text-slate-500 animate-in fade-in duration-500 mt-2" aria-hidden="true">
                    {section.title}
                 </div>
               )}
               {isCollapsed && section.title && idx > 0 && <div className="my-3 border-t border-slate-800/50 mx-2" role="separator" aria-hidden="true" />}
               <div className="space-y-1" role="menu">
                 {section.items.map((item) => {
                    const active = isActive(item.path, item.exact);
                    return (
                      <Link key={item.label} to={item.path} className={`group flex items-center relative py-2.5 rounded-xl transition-all duration-300 ease-out ${isCollapsed ? 'justify-center px-0 mx-1' : 'px-4 gap-3'} ${active ? 'bg-gradient-to-r from-blue-600/20 to-indigo-600/10 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] border border-white/5 backdrop-blur-md' : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'}`} role="menuitem" aria-current={active ? 'page' : undefined}>
                        {active && !isCollapsed && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-blue-500 rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.6)]" aria-hidden="true"></div>}
                        <item.icon size={isCollapsed ? 20 : 18} className={`shrink-0 transition-all duration-300 ${active ? 'text-blue-400 drop-shadow-[0_0_5px_rgba(96,165,250,0.5)]' : 'group-hover:text-white group-hover:scale-110'}`} strokeWidth={active ? 2.5 : 2} aria-hidden="true"/>
                        <span className={`whitespace-nowrap text-sm font-medium transition-all duration-500 ${isCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100 block'}`}>{item.label}</span>
                        {isCollapsed && (
                            <div className="absolute left-full ml-4 px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap z-50 border border-slate-700 translate-x-2 group-hover:translate-x-0" role="tooltip">
                                {item.label}
                                <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 bg-slate-800 rotate-45 border-l border-b border-slate-700" aria-hidden="true"></div>
                            </div>
                        )}
                      </Link>
                    );
                 })}
               </div>
            </div>
          ))}
          {user?.role?.toUpperCase() === UserRole.ADMIN && renderAdminSupportWidget()}
        </nav>
        <div className="p-4 border-t border-slate-800/60 bg-[#0f172a]/30 shrink-0 relative z-10" ref={userMenuRef}>
          <div onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className={`flex items-center rounded-xl transition-all duration-300 relative ${isCollapsed ? 'justify-center p-0' : 'p-2.5 bg-slate-800/40 border border-slate-700/50 gap-3 cursor-pointer hover:border-slate-600 hover:bg-slate-800/60 group'}`} role="button" aria-expanded={isUserMenuOpen} aria-haspopup="true" aria-label={t('common.userMenu')}>
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center text-white font-bold shadow-inner border border-slate-500/30 shrink-0 text-sm">
              {user?.name.charAt(0)}
            </div>
            <div className={`flex-1 overflow-hidden transition-all duration-500 ${isCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100 block'}`}>
              <p className="text-xs font-semibold text-white truncate group-hover:text-blue-200 transition-colors">{user?.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" aria-hidden="true"></span>
                  <p className="text-[9px] text-slate-400 truncate uppercase tracking-wider font-bold">{roleLabel}</p>
              </div>
            </div>
            {!isCollapsed && isUserMenuOpen && (
                <div className="absolute bottom-full left-0 mb-4 w-full bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 z-50" role="menu" aria-orientation="vertical">
                    <button onClick={() => setIsChangePasswordOpen(true)} className="w-full text-left px-5 py-3 text-xs font-bold text-slate-300 hover:bg-slate-700 hover:text-white flex items-center gap-3 transition-colors" role="menuitem">
                        <Lock size={14} className="text-blue-500" aria-hidden="true" /> {t('common.changePassword')}
                    </button>
                    <div className="h-px bg-slate-700/50" role="separator" aria-hidden="true" />
                    <button onClick={() => setIsPrivacyOpen(true)} className="w-full text-left px-5 py-3 text-xs font-bold text-slate-300 hover:bg-slate-700 hover:text-white flex items-center gap-3 transition-colors" role="menuitem">
                        <Shield size={14} className="text-blue-500" aria-hidden="true" /> {t('common.privacy')}
                    </button>
                    <div className="h-px bg-slate-700/50" role="separator" aria-hidden="true" />
                    <button onClick={logout} className="w-full text-left px-5 py-3 text-xs font-bold text-red-400 hover:bg-red-900/20 flex items-center gap-3 transition-colors" role="menuitem">
                        <LogOut size={14} aria-hidden="true" /> {t('common.logout')}
                    </button>
                </div>
            )}
          </div>
          {isCollapsed && (
             <button onClick={logout} className="mt-3 w-full flex justify-center items-center py-2 text-slate-500 hover:text-red-400 hover:bg-red-900/10 rounded-xl transition-all group relative" aria-label={t('common.logout')}>
                <LogOut size={18} aria-hidden="true" />
            </button>
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-slate-50 w-full min-w-0">
        {/* Removido mx-4 para banner cobrir a largura total da área de conteúdo */}
        <div className="w-full relative z-30"> 
            <MaintenanceBanner status={systemStatus} isAdmin={user?.role?.toUpperCase() === UserRole.ADMIN} />
        </div>
        <header className="md:hidden h-20 bg-slate-900 text-white flex items-center justify-between px-4 shadow-md z-20 shrink-0">
          <img src={LOGO_URL} alt={t('menu.portalNameShort')} className="h-12 object-contain" />
          <NotificationButton mobile={true} />
        </header>

        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white/90 backdrop-blur-xl border-t border-slate-200 z-40 flex items-center justify-around pb-2 px-2 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]" role="navigation" aria-label={t('common.mobileNavigation')}>
            {bottomNavItems.map((item, idx) => {
                const active = isActive(item.path, item.exact);
                return (
                    <Link key={idx} to={item.path} className={`flex flex-col items-center justify-center w-16 h-full space-y-1 transition-all ${active ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`} role="menuitem" aria-current={active ? 'page' : undefined}>
                        <div className={`p-1.5 rounded-xl transition-all ${active ? 'bg-blue-50 scale-110' : ''}`}>
                            <item.icon size={24} strokeWidth={active ? 2.5 : 2} aria-hidden="true" />
                        </div>
                        <span className="text-[10px] font-medium">{item.label}</span>
                    </Link>
                )
            })}
            <button onClick={() => setIsMobileMenuOpen(true)} className={`flex flex-col items-center justify-center w-16 h-full space-y-1 ${isMobileMenuOpen ? 'text-blue-600' : 'text-slate-400'}`} aria-label={t('common.menu')}>
                 <div className="p-1.5 rounded-xl"><UserIcon size={24} aria-hidden="true" /></div>
                 <span className="text-[10px] font-medium">{t('common.menu')}</span>
            </button>
        </nav>

        {isMobileMenuOpen && (
           <>
               <div className="md:hidden fixed inset-0 bg-slate-900/50 z-50 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsMobileMenuOpen(false)} aria-hidden="true" />
               <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-[60] p-6 pb-24 shadow-2xl animate-in slide-in-from-bottom-full duration-300 border-t border-slate-100" role="dialog" aria-modal="true" aria-label={t('common.mobileMenu')}>
                    <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6" aria-hidden="true"></div>
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-xl font-bold text-slate-600 border border-slate-200" aria-hidden="true">{user?.name.charAt(0)}</div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">{user?.name}</h3>
                            <span className="inline-block mt-1 px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase rounded-md border border-blue-100">{roleLabel}</span>
                        </div>
                    </div>
                    <div className="space-y-2" role="menu">
                        <button onClick={() => setIsChangePasswordOpen(true)} className="flex items-center gap-4 px-4 py-4 w-full text-slate-700 hover:bg-slate-50 rounded-2xl border border-transparent hover:border-slate-100 transition-all font-medium" role="menuitem">
                            <div className="p-2 bg-slate-50 text-blue-600 rounded-lg"><Lock size={20} aria-hidden="true" /></div> {t('common.changePassword')}
                        </button>
                        <button onClick={() => setIsPrivacyOpen(true)} className="flex items-center gap-4 px-4 py-4 w-full text-slate-700 hover:bg-slate-50 rounded-2xl border border-transparent hover:border-slate-100 transition-all font-medium" role="menuitem">
                            <div className="p-2 bg-slate-50 text-blue-600 rounded-lg"><Shield size={20} aria-hidden="true" /></div> {t('common.privacy')}
                        </button>
                        <button onClick={logout} className="flex items-center gap-4 px-4 py-4 w-full text-red-600 hover:bg-red-50 rounded-2xl border border-transparent hover:border-red-100 transition-all font-medium" role="menuitem">
                            <div className="p-2 bg-red-50 text-red-600 rounded-lg"><LogOut size={20} aria-hidden="true" /></div> {t('common.logout')}
                        </button>
                    </div>
               </div>
           </>
        )}

        <header className="hidden md:flex h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 items-center justify-between px-8 sticky top-0 z-40 shrink-0 transition-all">
            <div className="flex flex-col justify-center animate-in fade-in slide-in-from-left-2 duration-300">
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{title}</h2>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{t('menu.portalName')}</span>
                    <span className="text-slate-300" aria-hidden="true">/</span>
                    <span className="font-medium text-blue-600">{roleLabel}</span>
                    {user?.organizationName && ( // NOVO: Mostra o nome da organização se existir
                      <>
                        <span className="text-slate-300" aria-hidden="true">/</span>
                        <span className="font-medium text-slate-600">{user.organizationName}</span>
                      </>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-6">
                <NotificationButton mobile={false} />
            </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-8 custom-scrollbar pb-24 md:pb-10">
            <div className="max-w-[1600px] mx-auto space-y-4 md:space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 min-h-full">
                {children}
            </div>
        </main>
      </div>
    </div>
  );
};