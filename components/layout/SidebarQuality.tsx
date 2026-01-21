
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, LogOut, Settings } from 'lucide-react';
import { getQualityMenuConfig } from '../../config/navigation.ts';
import { User, UserRole } from '../../types/index.ts';
import { LogoutConfirmation } from './components/LogoutConfirmation.tsx';

const LOGO_URL = "https://wtydnzqianhahiiasows.supabase.co/storage/v1/object/public/public_assets/hero/logo.png";
const CORPORATE_BLUE_FILTER = "brightness(0) saturate(100%) invert(8%) sepia(35%) saturate(5833%) hue-rotate(222deg) brightness(95%) contrast(106%)";

interface SidebarQualityProps {
  user: User | null;
  role: UserRole;
  isCollapsed: boolean;
  onToggle: () => void;
  onLogout: () => void;
  onNavigateToSettings: () => void;
}

export const SidebarQuality: React.FC<SidebarQualityProps> = ({ 
  user, isCollapsed, onToggle, onLogout, onNavigateToSettings 
}) => {
  const { t } = useTranslation();
  const location = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const menuSections = getQualityMenuConfig(t);

  const isActive = (path: string, exact = false) => {
    const currentFull = location.pathname + location.search;
    if (exact) return currentFull === path;
    if (path.includes('?')) {
      const [basePath, queryString] = path.split('?');
      if (location.pathname !== basePath) return false;
      const targetParams = new URLSearchParams(queryString);
      const currentParams = new URLSearchParams(location.search);
      for (const [key, value] of targetParams) {
        if (currentParams.get(key) !== value) return false;
      }
      return true;
    }
    return location.pathname === path && !location.search;
  };

  return (
    <aside className={`hidden md:flex flex-col bg-white border-r border-slate-200 shadow-sm z-[60] relative transition-all duration-500 ${isCollapsed ? 'w-20' : 'w-72'}`}>
      <button 
        onClick={onToggle} 
        className="absolute -right-3.5 top-10 z-[70] bg-white text-slate-400 border border-slate-200 rounded-full h-7 w-7 flex items-center justify-center shadow-sm hover:text-[#132659] hover:border-blue-300 transition-all active:scale-90"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <div className={`h-24 flex items-center shrink-0 transition-all ${isCollapsed ? 'justify-center' : 'px-8'}`}>
        <img 
          src={LOGO_URL} 
          alt="Aços Vital" 
          className={`${isCollapsed ? 'h-9' : 'h-16'} transition-all object-contain`} 
          style={{ filter: CORPORATE_BLUE_FILTER }}
        />
      </div>

      <nav className="flex-1 py-4 space-y-8 overflow-y-auto custom-scrollbar px-2">
        {menuSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {!isCollapsed && (
              <div className="px-6 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 opacity-60">
                {section.title}
              </div>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.path, item.exact);
                const Icon = item.icon;
                return (
                  <Link 
                    key={item.label} 
                    to={item.path} 
                    className={`flex items-center transition-all duration-200 group relative ${
                      isCollapsed ? 'justify-center py-3' : 'px-6 py-3 gap-3'
                    } ${
                      active 
                      ? 'bg-slate-100/80 text-slate-900 border-l-4 border-[#132659]' 
                      : 'text-slate-500 hover:bg-slate-50 border-l-4 border-transparent'
                    }`}
                  >
                    <Icon size={18} strokeWidth={active ? 2.5 : 2} className={active ? 'text-[#132659]' : 'text-slate-400 group-hover:text-[#132659]'} />
                    {!isCollapsed && <span className={`text-sm tracking-tight ${active ? 'font-bold' : 'font-semibold'}`}>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-2">
        {!isCollapsed && (
          <button
            onClick={onNavigateToSettings}
            className="flex items-center w-full px-4 py-2.5 gap-3 rounded-lg text-slate-500 hover:bg-white hover:text-slate-900 transition-all border border-transparent hover:border-slate-200"
          >
            <Settings size={18} />
            <span className="text-sm font-semibold tracking-tight">Painel Técnico</span>
          </button>
        )}
        
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className={`flex items-center w-full transition-all duration-300 rounded-lg group ${
            isCollapsed ? 'justify-center py-3 text-slate-400 hover:text-red-600' : 'px-4 py-2.5 gap-3 text-slate-500 hover:bg-red-50 hover:text-red-600'
          }`}
        >
          <LogOut size={18} />
          {!isCollapsed && <span className="text-sm font-semibold tracking-tight">{t('common.logout')}</span>}
        </button>

        <div className={`mt-4 flex items-center p-2 rounded-xl gap-3 transition-all ${isCollapsed ? 'justify-center' : 'bg-white border border-slate-200'}`}>
          <div className="w-10 h-10 rounded-lg bg-[#132659] flex items-center justify-center text-white shrink-0 font-bold">
            {user?.name?.charAt(0)}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate text-slate-900">{user?.name}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Qualidade</p>
            </div>
          )}
        </div>
      </div>

      {showLogoutConfirm && <LogoutConfirmation onConfirm={onLogout} onCancel={() => setShowLogoutConfirm(false)} />}
    </aside>
  );
};
