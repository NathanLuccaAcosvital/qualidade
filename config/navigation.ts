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
  Terminal,
  ClipboardList
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
      { label: "Gestão Master", path: '/admin/console', icon: Terminal },
    ]
  },
  {
    title: "Auditoria Industrial",
    items: [
      { label: "Fluxo de Auditoria", path: '/quality/monitor', icon: ClipboardList },
      { label: "Gestão de Clientes", path: '/quality/portfolio', icon: Building2 },
      { label: "Logs Forenses", path: '/quality/audit', icon: History }
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
      { label: "Fluxo de Auditoria", path: '/quality/monitor', icon: ClipboardList },
      { label: "Gestão de Clientes", path: '/quality/portfolio', icon: Building2 },
    ]
  },
  {
    title: "Documentação Vital",
    items: [
      { label: "Cloud de Arquivos", path: '/quality/explorer', icon: FolderTree },
      { label: "Acessos Parceiros", path: '/quality/users', icon: UserCheck },
      { label: "Log de Vereditos", path: '/quality/audit', icon: History }
    ]
  }
];

/**
 * Menu exclusivo para o perfil CLIENTE
 */
export const getClientMenuConfig = (t: any): NavSection[] => [
  {
    title: "Terminal B2B",
    items: [
      { label: "Início", path: '/client/portal', icon: LayoutDashboard, exact: true },
      { label: "Arquivos", path: '/client/portal?view=library', icon: Library },
      { label: "Fluxo de Auditoria", path: '/client/portal?view=audit_flow', icon: ClipboardList },
    ]
  }
];

export const getClientSidebarMenuConfig = (t: any): NavSection[] => getClientMenuConfig(t);

export const getMenuConfig = (user: any, t: any): NavSection[] => {
  if (!user) return [];
  const role = user.role;
  if (role === UserRole.ADMIN) return getAdminMenuConfig(t);
  if (role === UserRole.QUALITY) return getQualityMenuConfig(t);
  if (role === UserRole.CLIENT) return getClientMenuConfig(t);
  return [];
};

export const getUserMenuItems = (t: any, callbacks: { onLogout: () => void, onNavigateToSettings: () => void }) => [
  { label: t('menu.settings'), icon: Settings, onClick: callbacks.onNavigateToSettings },
  { label: t('common.logout'), icon: LogOut, onClick: callbacks.onLogout }
];

export const getBottomNavItems = (user: any, t: any): NavItem[] => {
  if (!user) return [];
  const role = user.role;

  if (role === UserRole.ADMIN) {
    return [
      { label: "Home", path: '/admin/dashboard', icon: LayoutDashboard },
      { label: "Fluxo", path: '/quality/monitor', icon: ClipboardList },
      { label: "Consola", path: '/admin/console', icon: Terminal },
    ];
  }

  if (role === UserRole.QUALITY) {
    return [
      { label: "Home", path: '/quality/dashboard', icon: LayoutDashboard },
      { label: "Fluxo", path: '/quality/monitor', icon: ClipboardList },
      { label: "Clientes", path: '/quality/portfolio', icon: Building2 },
    ];
  }
  
  if (role === UserRole.CLIENT) {
    return [
        { label: "Início", path: '/client/portal', icon: LayoutDashboard },
        { label: "Fluxo", path: '/client/portal?view=audit_flow', icon: ClipboardList },
        { label: "Arquivos", path: '/client/portal?view=library', icon: Library },
    ];
  }

  return [];
};