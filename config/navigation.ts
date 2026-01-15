
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
  Settings, // Import Settings icon
  BarChart3, // New icon for reports
  Bell // New icon for notifications
} from 'lucide-react';
import { User, UserRole, normalizeRole } from '../types/index.ts';

export interface NavItem {
  label: string;
  path: string;
  icon: any;
  exact?: boolean;
  subItems?: NavItem[]; // Adicionado para suportar sub-menus
  onClick?: () => void; // Para itens de menu que não são links (ex: logout)
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

// Nova função para a navegação da Sidebar do Cliente
export const getClientSidebarMenuConfig = (t: any): NavSection[] => [
  {
    title: "PRINCIPAL",
    items: [
      { label: t('menu.dashboard'), path: '/client/dashboard', icon: LayoutDashboard, exact: true },
    ]
  },
  {
    title: "DOCUMENTOS",
    items: [
      {
        label: "Certificados", // Main label for expandable section
        icon: Library,
        path: '/client/dashboard?view=files', // This path will be active if any sub-item is active
        subItems: [
          { label: t('menu.library'), path: '/client/dashboard?view=files', icon: Library, exact: false },
        ],
      },
    ]
  },
  // Configurações e Logout serão adicionados diretamente na SidebarClient, não neste array
];


export const getMenuConfig = (user: User | null, t: any): NavSection[] => {
  if (!user) return [];
  const role = normalizeRole(user.role);
  const navigationMap: Record<UserRole, (t: any) => NavSection[]> = {
    [UserRole.ADMIN]: getAdminNavigation,
    [UserRole.QUALITY]: getQualityNavigation,
    [UserRole.CLIENT]: getClientSidebarMenuConfig, // Cliente agora usa a SidebarClient com sua própria config
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

  // O ClientDock será agora o principal para o Cliente, então o MobileNavigation
  // não precisará de itens de navegação inferiores se o role for CLIENT.
  // Vou remover os itens do cliente daqui, pois a SidebarClient e o ClientDock cuidarão disso.
  if (role === UserRole.CLIENT) {
    // Retorna vazio ou apenas um item essencial se a barra lateral é a principal
    return []; 
  }
  
  return [
      { label: "Resumo", path: '/quality/dashboard', icon: Activity, exact: true },
      { label: "Auditoria", path: '/quality?view=audit-log', icon: FileText },
  ];
};

export const getUserMenuItems = (t: any, hooks: { onLogout: () => void, onNavigateToSettings: () => void }) => [
  { label: t('menu.settings'), icon: Settings, onClick: hooks.onNavigateToSettings },
  { label: t('common.logout'), icon: LogOut, onClick: hooks.onLogout },
];
