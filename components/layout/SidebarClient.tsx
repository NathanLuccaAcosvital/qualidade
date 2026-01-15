
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, LayoutDashboard, Library, Clock, BarChart3, Bell, Settings, LogOut, ChevronDown } from 'lucide-react';
import { getClientSidebarMenuConfig } from '../../config/navigation.ts';
import { User, UserRole } from '../../types/index.ts';

const LOGO_URL = "https://wtydnzqianhahiiasows.supabase.co/storage/v1/object/public/public_assets/hero/logo.png";

interface SidebarClientProps {
  user: User | null;
  role: UserRole;
  isCollapsed: boolean;
  onToggle: () => void;
  onLogout: () => void;
  onNavigateToSettings: () => void;
}

export const SidebarClient: React.FC<SidebarClientProps> = ({ user, role, isCollapsed, onToggle, onLogout, onNavigateToSettings }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const menuSections = getClientSidebarMenuConfig(t);

  const isActive = (path: string, exact = false) => {
    const current = location.pathname + location.search;
    if (exact) return current === path;
    if (path.includes('?')) return current === path; // Check if the path itself contains query params
    return location.pathname === path.split('?')[0] && current.startsWith(path); // Match base path and ensure it's a sub-route or exact match for queries
  };

  const isClient = role === UserRole.CLIENT; // Assumindo que esta sidebar é exclusiva para CLIENT

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
        <img 
          src={LOGO_URL} 
          alt="Aços Vital" 
          className={isCollapsed ? 'h-8 filter brightness-0 invert' : 'h-12 filter brightness-0 invert'} 
        />
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
                const Icon = item.icon; // Certifique-se de que Icon está sendo usado
                
                // Renderizar item de menu principal
                if (!item.subItems) {
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
                      <Icon size={20} className={active ? 'text-white' : 'text-blue-400'} />
                      {!isCollapsed && <span className="text-sm font-semibold truncate">{item.label}</span>}
                    </Link>
                  );
                } else {
                  // Renderizar item de menu com sub-itens (expansível)
                  const isSectionActive = item.subItems.some(subItem => isActive(subItem.path, subItem.exact));
                  const [isSubMenuOpen, setIsSubMenuOpen] = React.useState(isSectionActive);

                  return (
                    <div key={item.label}>
                      <button
                        onClick={() => setIsSubMenuOpen(!isSubMenuOpen)}
                        className={`flex items-center w-full rounded-xl transition-all duration-200 ${
                          isCollapsed ? 'justify-center py-3' : 'px-4 py-2.5 gap-3'
                        } ${
                          isSectionActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                        aria-expanded={isSubMenuOpen}
                      >
                        <Icon size={20} className={isSectionActive ? 'text-white' : 'text-blue-400'} />
                        {!isCollapsed && (
                          <>
                            <span className="text-sm font-semibold flex-1 text-left truncate">{item.label}</span>
                            <ChevronDown size={16} className={`transition-transform ${isSubMenuOpen ? 'rotate-180' : ''}`} />
                          </>
                        )}
                      </button>
                      {isSubMenuOpen && !isCollapsed && (
                        <div className="ml-4 mt-1 space-y-1 border-l border-slate-700">
                          {item.subItems.map(subItem => {
                            const subActive = isActive(subItem.path, subItem.exact);
                            const SubIcon = subItem.icon;
                            return (
                              <Link
                                key={subItem.label}
                                to={subItem.path}
                                className={`flex items-center px-4 py-2.5 rounded-xl transition-all duration-200 gap-3 ml-2 ${
                                  subActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                              >
                                <SubIcon size={16} className={subActive ? 'text-white' : 'text-blue-400'} />
                                <span className="text-sm font-semibold truncate">{subItem.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }
              })}
            </div>
          </div>
        ))}

        {/* Separator Line */}
        {!isCollapsed && <div className="h-px w-full bg-slate-800/60 my-6" />}
        
        {/* Settings and Logout for Client */}
        {!isCollapsed && (
          <div className="space-y-1">
            <button
              onClick={onNavigateToSettings}
              className="flex items-center w-full px-4 py-2.5 gap-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Settings size={20} className="text-blue-400" />
              <span className="text-sm font-semibold truncate">{t('menu.settings')}</span>
            </button>
            <button
              onClick={onLogout}
              className="flex items-center w-full px-4 py-2.5 gap-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <LogOut size={20} className="text-blue-400" />
              <span className="text-sm font-semibold truncate">{t('common.logout')}</span>
            </button>
          </div>
        )}
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
      {user?.name?.charAt(0) || 'U'}
    </div>
    {!isCollapsed && (
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-white truncate">{user?.name || 'Usuário'}</p>
        <p className="text-[9px] text-slate-500 uppercase font-black tracking-tighter">{user?.email || 'N/A'}</p>
      </div>
    )}
  </div>
);
