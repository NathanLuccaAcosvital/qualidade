
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, LogOut, Settings, ClipboardCheck } from 'lucide-react';
import { getQualityMenuConfig } from '../../config/navigation.ts';
import { User, UserRole } from '../../types/index.ts';
import { LogoutConfirmation } from './Sidebar.tsx';

const LOGO_URL = "https://wtydnzqianhahiiasows.supabase.co/storage/v1/object/public/public_assets/hero/logo.png";
const ISOTIPO_URL = "https://wtydnzqianhahiiasows.supabase.co/storage/v1/object/public/public_assets/hero/isotipo.png";

interface SidebarQualityProps {
  user: User | null;
  role: UserRole;
  isCollapsed: boolean;
  onToggle: () => void;
  onLogout: () => void;
  onNavigateToSettings: () => void;
}

export const SidebarQuality: React.FC<SidebarQualityProps> = ({ 
  user, role, isCollapsed, onToggle, onLogout, onNavigateToSettings 
}) => {
  const { t } = useTranslation();
  const location = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const menuSections = getQualityMenuConfig(t);

  const isActive = (path: string, exact = false) => {
    const currentFull = location.pathname + location.search;
    
    if (path.includes('?')) {
      return currentFull === path;
    }
    
    if (exact) return currentFull === path;
    return location.pathname === path.split('?')[0];
  };

  return (
    <aside className={`hidden md:flex flex-col bg-[#081437] text-slate-300 shadow-2xl z-[60] relative transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-72'}`}>
      <button 
        onClick={onToggle} 
        className="absolute -right-3 top-8 z-[70] bg-white text-slate-600 border rounded-full h-7 w-7 flex items-center justify-center shadow-lg hover:text-[#b23c0e] transition-all active:scale-90"
        aria-label={isCollapsed ? "Expandir" : "Recolher"}
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <div className={`h-24 flex items-center shrink-0 border-b border-white/5 transition-all ${isCollapsed ? 'justify-center' : 'px-6'}`}>
        <img 
          src={isCollapsed ? ISOTIPO_URL : LOGO_URL} 
          alt="Aços Vital" 
          className={isCollapsed ? 'h-10' : 'h-12 filter brightness-0 invert'} 
        />
      </div>

      <nav className="flex-1 py-6 space-y-1 overflow-y-auto custom-scrollbar px-3">
        {menuSections.map((section, idx) => (
          <div key={idx} className="mb-6">
            {!isCollapsed && (
              <div className="mb-2 px-3 text-[9px] font-black uppercase tracking-widest text-orange-500/60">
                {section.title}
              </div>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const active = isActive(item.path, item.exact);
                const Icon = item.icon;
                return (
                  <Link 
                    key={item.label} 
                    to={item.path} 
                    className={`flex items-center rounded-xl transition-all duration-200 ${
                      isCollapsed ? 'justify-center py-3' : 'px-4 py-2.5 gap-3'
                    } ${
                      active ? 'bg-[#b23c0e] text-white shadow-lg shadow-[#b23c0e]/30' : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon size={20} className={active ? 'text-white' : 'text-[#b23c0e]'} />
                    {!isCollapsed && <span className="text-sm font-semibold truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-white/5 bg-black/20 space-y-3">
        {!isCollapsed && (
          <button
            onClick={onNavigateToSettings}
            className="flex items-center w-full px-4 py-2.5 gap-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Settings size={20} className="text-[#b23c0e]" />
            <span className="text-sm font-semibold truncate">Configurações Técnicas</span>
          </button>
        )}
        
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className={`flex items-center w-full transition-all duration-200 rounded-xl group ${
            isCollapsed ? 'justify-center py-3' : 'px-4 py-2.5 gap-3 hover:bg-red-500/10 text-slate-400 hover:text-red-400'
          }`}
        >
          <LogOut size={20} className="group-hover:scale-110 transition-transform" />
          {!isCollapsed && <span className="text-sm font-semibold">{t('common.logout')}</span>}
        </button>

        <div className={`flex items-center p-2.5 bg-white/5 border border-white/10 rounded-xl gap-3 transition-all ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-9 h-9 rounded-lg bg-[#b23c0e] flex items-center justify-center text-white font-bold shrink-0 shadow-inner">
            <ClipboardCheck size={18} />
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.name || 'Analista'}</p>
              <p className="text-[9px] text-orange-500/80 uppercase font-black tracking-tighter">PERFIL QUALIDADE</p>
            </div>
          )}
        </div>
      </div>

      {showLogoutConfirm && (
        <LogoutConfirmation 
          onConfirm={onLogout} 
          onCancel={() => setShowLogoutConfirm(false)} 
        />
      )}
    </aside>
  );
};
