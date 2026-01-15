
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getMenuConfig } from '../../config/navigation.ts';
import { User, UserRole } from '../../types/index.ts';

const LOGO_URL = "https://wtydnzqianhahiiasows.supabase.co/storage/v1/object/public/public_assets/hero/logo.png";

interface SidebarProps {
  user: User | null;
  role: UserRole;
  isCollapsed: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ user, role, isCollapsed, onToggle }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const menuSections = getMenuConfig(user, t);

  const isActive = (path: string, exact = false) => {
    const current = location.pathname + location.search;
    if (exact) return current === path;
    if (path.includes('?')) return current === path;
    return location.pathname === path.split('?')[0];
  };

  return (
    <aside className={`hidden md:flex flex-col bg-[#0f172a] text-slate-300 shadow-2xl z-[60] relative transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-72'}`}>
      <button 
        onClick={onToggle} 
        className="absolute -right-3 top-8 z-[70] bg-white text-slate-600 border rounded-full h-7 w-7 flex items-center justify-center shadow-lg hover:text-blue-600 transition-all active:scale-90"
        aria-label={isCollapsed ? "Expandir" : "Recolher"}
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <div className={`h-24 flex items-center shrink-0 border-b border-slate-800/60 transition-all ${isCollapsed ? 'justify-center' : 'px-6'}`}>
        <img src={LOGO_URL} alt="Aços Vital" className={isCollapsed ? 'h-8' : 'h-12'} />
      </div>

      <nav className="flex-1 py-6 space-y-1 overflow-y-auto custom-scrollbar px-3">
        {menuSections.map((section, idx) => (
          <div key={idx} className="mb-6">
            {!isCollapsed && (
              <div className="mb-2 px-3 text-[9px] font-black uppercase tracking-widest text-slate-500 opacity-60">
                {section.title}
              </div>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const active = isActive(item.path, item.exact);
                return (
                  <Link 
                    key={item.label} 
                    to={item.path} 
                    className={`flex items-center rounded-xl transition-all duration-200 ${
                      isCollapsed ? 'justify-center py-3' : 'px-4 py-2.5 gap-3'
                    } ${
                      active ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <item.icon size={20} className={active ? 'text-white' : 'text-slate-500'} />
                    {!isCollapsed && <span className="text-sm font-semibold truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800/60 bg-[#0f172a]/30">
        <SidebarUserProfile user={user} role={role} isCollapsed={isCollapsed} />
      </div>
    </aside>
  );
};

const SidebarUserProfile = ({ user, role, isCollapsed }: any) => (
  <div className={`flex items-center p-2.5 bg-slate-800/40 border border-slate-700/50 rounded-xl gap-3 transition-all ${isCollapsed ? 'justify-center' : ''}`}>
    <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shrink-0 shadow-inner">
      {user?.name.charAt(0) || 'U'}
    </div>
    {!isCollapsed && (
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-white truncate">{user?.name || 'Usuário'}</p>
        <p className="text-[9px] text-slate-500 uppercase font-black tracking-tighter">{user?.email || 'N/A'}</p>
      </div>
    )}
  </div>
);
