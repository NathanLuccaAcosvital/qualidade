import { User, UserRole } from '../types/index';
import {
    LayoutDashboard, Home, Library, History, Star,
    BarChart3, Users, Building2, ShieldAlert, Settings, Activity, Lock, Shield, LogOut, Phone
} from 'lucide-react';
// Fix: Import TFunction from 'i18next'
import { TFunction } from 'i18next'; // Importa TFunction para tipagem de tradução

export type MenuItem = {
    label: string;
    icon: React.ElementType;
    path: string;
    exact?: boolean;
    onClick?: () => void; // Para itens de menu que disparam ações (e.g., logout)
};

export type MenuSection = {
    title?: string;
    items: MenuItem[];
};

/**
 * Retorna a configuração do menu de navegação com base no perfil do usuário.
 *
 * @param user O objeto de usuário logado.
 * @param t A função de tradução do i18n.
 * @param hooks Um objeto contendo funções de callback para ações específicas (e.g., logout, abrir modal de senha/privacidade).
 * @returns Um array de `MenuSection` contendo a estrutura de navegação.
 */
export const getMenuConfig = (user: User | null, t: TFunction, hooks?: {
    onLogout?: () => void;
    onOpenChangePassword?: () => void;
    onOpenPrivacy?: () => void;
}): MenuSection[] => {
    const role = user?.role?.toUpperCase();

    const commonBottomNavItems: MenuItem[] = [
        { label: t('menu.home'), icon: Home, path: '/dashboard', exact: true },
    ];

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
                    { label: t('quality.myAuditLog'), icon: Activity, path: '/quality?view=audit-log' },
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
                    { label: t('quality.myAuditLog'), icon: Activity, path: '/quality?view=audit-log' },
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

/**
 * Retorna os itens de navegação do rodapé para dispositivos móveis.
 *
 * @param user O objeto de usuário logado.
 * @param t A função de tradução do i18n.
 * @param hooks Um objeto contendo funções de callback para ações específicas (e.g., abrir menu mobile).
 * @returns Um array de `MenuItem` para a navegação do rodapé.
 */
export const getBottomNavItems = (user: User | null, t: TFunction): MenuItem[] => {
    const role = user?.role?.toUpperCase();
    const items: MenuItem[] = [
        { label: t('menu.home'), icon: Home, path: '/dashboard', exact: true },
    ];

    if (role === UserRole.CLIENT) {
        items.push({ label: t('menu.library'), icon: Library, path: '/dashboard?view=files', exact: false });
    } else if (role === UserRole.ADMIN) {
        items.push({ label: t('admin.tabs.overview'), icon: BarChart3, path: '/admin?tab=overview', exact: false });
    } else if (role === UserRole.QUALITY) {
        items.push({ label: t('menu.clientPortfolio'), icon: Users, path: '/quality?view=clients', exact: false });
        items.push({ label: t('quality.myAuditLog'), icon: Activity, path: '/quality?view=audit-log', exact: false });
    }

    return items;
};

/**
 * Retorna os itens de menu do perfil do usuário.
 *
 * @param t A função de tradução do i18n.
 * @param hooks Um objeto contendo funções de callback para ações específicas.
 * @returns Um array de `MenuItem` para o menu do usuário.
 */
export const getUserMenuItems = (t: TFunction, hooks: {
    onLogout: () => void;
    onOpenChangePassword: () => void;
    onOpenPrivacy: () => void;
}): MenuItem[] => {
    return [
        { label: t('common.changePassword'), icon: Lock, path: '#', onClick: hooks.onOpenChangePassword },
        { label: t('common.privacy'), icon: Shield, path: '#', onClick: hooks.onOpenPrivacy },
        { label: t('common.logout'), icon: LogOut, path: '#', onClick: hooks.onLogout },
    ];
};