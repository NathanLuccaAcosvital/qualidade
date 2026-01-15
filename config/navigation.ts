
import { 
  Home, 
  Library, 
  Star, 
  History, 
  ShieldCheck, 
  Users, 
  Activity, 
  LogOut,
  Lock,
  FileText,
  LayoutDashboard,
  ShieldAlert,
  Clock,
  Settings // Import Settings icon
} from 'lucide-react';
import { User, UserRole, normalizeRole } from '../types/index.ts';

export interface NavItem {
  label: string;
  path: string;
  icon: any;
  exact?: boolean;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

const getAdminNavigation = (t: any): NavSection[] => [
  {
    title: "OPERACIONAL",
    items: [
      { label: "Command Center", path: '/admin/dashboard', icon: LayoutDashboard, exact: true },
      { label: "Base de Usuários", path: '/admin?tab=users', icon: Users },
    ]
  },
  {
    title: "GOVERNANÇA",
    items: [
      { label: "Logs de Auditoria", path: '/admin?tab=logs', icon: ShieldAlert },
      { label: "Painel de Segurança", path: '/admin?tab=settings', icon: ShieldCheck },
    ]
  }
];

const getQualityNavigation = (t: any): NavSection[] => [
  {
    title: "OPERACIONAL",
    items: [
      { label: t('quality.overview'), path: '/quality/dashboard', icon: Activity, exact: true },
    ]
  },
  {
    title: "GOVERNANÇA",
    items: [
      { label: t('quality.myAuditLog'), path: '/quality?view=audit-log', icon: FileText }
    ]
  }
];

const getClientNavigation = (t: any): NavSection[] => [
  {
    title: "MEU PORTAL",
    items: [
      { label: t('menu.dashboard'), path: '/client/dashboard', icon: LayoutDashboard, exact: true },
      { label: t('menu.library'), path: '/client/dashboard?view=files', icon: Library },
    ]
  },
  {
    title: "SUGESTÕES",
    items: [
      // Removed Favorites: { label: t('menu.favorites'), path: '/client/dashboard?view=favorites', icon: Star },
    ]
  }
];

export const getMenuConfig = (user: User | null, t: any): NavSection[] => {
  if (!user) return [];
  const role = normalizeRole(user.role);
  const navigationMap: Record<UserRole, (t: any) => NavSection[]> = {
    [UserRole.ADMIN]: getAdminNavigation,
    [UserRole.QUALITY]: getQualityNavigation,
    [UserRole.CLIENT]: getClientNavigation,
  };
  return navigationMap[role]?.(t) || [];
};

export const getBottomNavItems = (user: User | null, t: any): NavItem[] => {
  if (!user) return [];
  const role = normalizeRole(user.role);

  if (role === UserRole.ADMIN) {
    return [
      { label: "Dash", path: '/admin/dashboard', icon: LayoutDashboard, exact: true },
      { label: "Usuários", path: '/admin?tab=users', icon: Users },
      { label: "Logs", path: '/admin?tab=logs', icon: ShieldAlert },
    ];
  }

  if (role === UserRole.CLIENT) {
    return [
      { label: "Início", path: '/client/dashboard', icon: LayoutDashboard, exact: true },
      { label: "Docs", path: '/client/dashboard?view=files', icon: Library },
      // Removed Favorites: { label: "Favoritos", path: '/client/dashboard?view=favorites', icon: Star },
    ];
  }
  
  return [
      { label: "Resumo", path: '/quality/dashboard', icon: Activity, exact: true },
      { label: "Auditoria", path: '/quality?view=audit-log', icon: FileText },
  ];
};

// Renamed onOpenChangePassword to onNavigateToSettings for the settings icon, as it now navigates to a page.
// The privacy modal is also now handled within the settings page.
export const getUserMenuItems = (t: any, hooks: { onLogout: () => void, onNavigateToSettings: () => void }) => [
  { label: t('menu.settings'), icon: Settings, onClick: hooks.onNavigateToSettings },
  { label: t('common.logout'), icon: LogOut, onClick: hooks.onLogout },
];
