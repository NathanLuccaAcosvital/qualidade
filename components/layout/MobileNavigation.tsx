
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import { getBottomNavItems, getUserMenuItems } from '../../config/navigation.ts';
import { User, UserRole, normalizeRole } from '../../types/index.ts';

interface MobileNavProps {
  user: User | null;
  userRole: UserRole;
  isMenuOpen: boolean;
  onCloseMenu: () => void;
  onLogout: () => void;
  // onOpenPassword e onOpenPrivacy removidos, substituídos por onNavigateToSettings
  onNavigateToSettings: () => void; 
}

export const MobileNavigation: React.FC<MobileNavProps> = ({ 
  user, userRole, isMenuOpen, onCloseMenu, onLogout, onNavigateToSettings 
}) => {
  const { t } = useTranslation();
  const location = useLocation();
  const bottomNavItems = getBottomNavItems(user, t);

  const isActive = (path: string, exact = false) => {
    const current = location.pathname + location.search;
    if (exact) return current === path;
    return location.pathname === path.split('?')[0];
  };

  const isClient = userRole === UserRole.CLIENT;

  return (
    <>
      {/* Bottom Action Bar (Apenas visível se NÃO for CLIENTE, pois ClientDock agora é universal) */}
      {!isClient && bottomNavItems.length > 0 && ( // Adiciona verificação bottomNavItems.length
        <nav className="md:hidden h-16 bg-white border-t border-slate-200 flex items-center justify-around shrink-0 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] z-[45]">
          {bottomNavItems.map((item, idx) => {
            const active = isActive(item.path, item.exact);
            return (
              <Link 
                key={idx} 
                to={item.path} 
                className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-blue-600 scale-105' : 'text-slate-400'}`}
              >
                <item.icon size={20} strokeWidth={active ? 2.5 : 2} />
                <span className="text-[9px] font-bold uppercase tracking-wider">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      )}

      {/* Profile/Settings Drawer */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[100] bg-[#0f172a]/80 backdrop-blur-md p-6 animate-in fade-in flex flex-col justify-end">
          <div className="bg-white rounded-3xl w-full max-h-[80vh] flex flex-col p-8 shadow-2xl animate-in slide-in-from-bottom-20 duration-500">
            <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-black text-slate-800">Menu de Perfil</h3>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{user?.email}</p>
              </div>
              <button onClick={onCloseMenu} className="p-3 bg-slate-100 rounded-full text-slate-600 hover:bg-slate-200 transition-colors">
                <ChevronDown size={24} />
              </button>
            </div>
            
            <div className="space-y-4 overflow-y-auto">
              {getUserMenuItems(t, { 
                onLogout: () => {
                  onLogout();
                  onCloseMenu();
                }, 
                onNavigateToSettings: () => { 
                  onNavigateToSettings();
                  onCloseMenu();
                } 
              }).map((item, idx) => (
                <button 
                  key={idx} 
                  onClick={item.onClick}
                  className="w-full flex items-center gap-4 p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 active:bg-blue-50 active:border-blue-200 transition-all text-left"
                >
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm border border-slate-100">
                    <item.icon size={20} />
                  </div>
                  <span className="text-sm">{item.label}</span>
                </button>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-[4px]">Aços Vital • Portal V1.0</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
