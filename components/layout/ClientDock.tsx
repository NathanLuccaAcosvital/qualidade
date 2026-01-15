
import React from 'react';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, Library, Star } from 'lucide-react';

interface ClientDockProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export const ClientDock: React.FC<ClientDockProps> = ({ activeView, onViewChange }) => {
  const { t } = useTranslation();

  const navItems = [
    { id: 'home', label: t('menu.dashboard'), icon: LayoutDashboard },
    { id: 'files', label: t('menu.library'), icon: Library },
    // Removido "Favorites" e outros itens que agora estão na SidebarClient
  ];

  return (
    <div 
      className="flex fixed bottom-0 md:bottom-6 left-1/2 -translate-x-1/2 z-[80] 
                 bg-white/50 backdrop-blur-xl border border-white/20 
                 p-2.5 rounded-full shadow-lg shadow-slate-900/10 
                 animate-in slide-in-from-bottom-6 duration-500 md:hidden" // Adicionado `md:hidden` para ocultar no desktop
    >
      <nav className="flex items-center gap-2" role="navigation" aria-label="Navegação Principal do Cliente">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`
                flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300
                ${isActive
                  ? 'bg-[var(--color-primary-dark-blue)] text-white shadow-md shadow-[var(--color-primary-dark-blue)]/20'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}
              `}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={18} className={isActive ? 'text-[var(--color-detail-blue)]' : 'text-slate-500'} />
              {item.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
