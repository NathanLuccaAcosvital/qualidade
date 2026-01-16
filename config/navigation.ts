import { 
  Users, 
  ShieldCheck, 
  LayoutDashboard,
  Building2,
  History,
  UserCheck,
  Library,
  FolderTree,
  Settings,
  LogOut,
  Database,
  ScanEye
} from 'lucide-react';
import { UserRole } from '../types/index.ts';

export interface NavItem {
  label: string;
  path: string;
  icon: any;
  exact?: boolean;
  subItems?: NavItem[]; 
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

/**
 * Menu exclusivo para o perfil ADMINISTRADOR
 */
export const getAdminMenuConfig = (t: any): NavSection[] => [
  {
    title: "Governança Master",
    items: [
      { label: "Painel de Controle", path: '/admin/dashboard', icon: LayoutDashboard, exact: true },
      { label: "Monitor de Carteira", path: '/quality/portfolio', icon: Building2 },
      { label: "Base de Usuários", path: '/admin/users', icon: Users },
      { label: "Cofre de Backup", path: '/admin?tab=backup', icon: Database },
      { label: "Status do Sistema", path: '/admin/system', icon: ShieldCheck },
    ]
  }
];

/**
 * Menu exclusivo para o perfil QUALIDADE
 */
export const getQualityMenuConfig = (t: any): NavSection[] => [
  {
    title: "Operação Técnica",
    items: [
      { label: "Visão Geral", path: '/quality/dashboard', icon: LayoutDashboard, exact: true },
      { label: "Monitor de Carteira", path: '/quality/portfolio', icon: Building2 },
    ]
  },
  {
    title: "Documentação",
    items: [
      { label: "Explorador de Arquivos", path: '/quality/explorer', icon: FolderTree },
      { label: "Gestão de Usuários", path: '/quality/users', icon: UserCheck },
      { label: "Log de Vereditos", path: '/quality/audit', icon: History }
    ]
  }
];

/**
 * Menu exclusivo para o perfil CLIENTE
 */
export const getClientMenuConfig = (t: any): NavSection[] => [
  {
    title: t('menu.sections.main'),
    items: [
      { label: t('menu.dashboard'), path: '/client/dashboard', icon: LayoutDashboard, exact: true },
      { label: t('menu.library'), path: '/client/dashboard?view=library', icon: Library },
    ]
  }
];

// Fix: Added getClientSidebarMenuConfig to resolve error in components/layout/SidebarClient.tsx
export const getClientSidebarMenuConfig = (t: any): NavSection[] => getClientMenuConfig(t);

/**
 * Fix: Added getMenuConfig to resolve error in components/layout/Sidebar.tsx
 * Orchestrates role-based menu selection for the generic Sidebar component.
 */
export const getMenuConfig = (user: any, t: any): NavSection[] => {
  if (!user) return [];
  const role = user.role;
  if (role === UserRole.ADMIN) return getAdminMenuConfig(t);
  if (role === UserRole.QUALITY) return getQualityMenuConfig(t);
  if (role === UserRole.CLIENT) return getClientMenuConfig(t);
  return [];
};

/**
 * Fix: Added getUserMenuItems to resolve error in components/layout/MobileNavigation.tsx
 * Returns common actions for user profile management.
 */
export const getUserMenuItems = (t: any, callbacks: { onLogout: () => void, onNavigateToSettings: () => void }) => [
  { label: t('menu.settings'), icon: Settings, onClick: callbacks.onNavigateToSettings },
  { label: t('common.logout'), icon: LogOut, onClick: callbacks.onLogout }
];

// Mantidos para compatibilidade com Mobile Navigation
export const getBottomNavItems = (user: any, t: any): NavItem[] => {
  if (!user) return [];
  const role = user.role;

  if (role === UserRole.ADMIN) {
    return [
      { label: "Home", path: '/admin/dashboard', icon: LayoutDashboard },
      { label: "Carteira", path: '/quality/portfolio', icon: Building2 },
    ];
  }

  if (role === UserRole.QUALITY) {
    return [
      { label: "Dash", path: '/quality/dashboard', icon: LayoutDashboard },
      { label: "Carteira", path: '/quality/portfolio', icon: Building2 },
    ];
  }
  
  return [];
};