
import React, { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, CheckCircle2, XCircle, Info, Loader2, AlertTriangle, Mail, X, Archive, ExternalLink } from 'lucide-react';
import { AppNotification } from '../../../types/index.ts';
import { useNotifications } from './hooks/useNotifications.ts';

interface NotificationsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { notifications, isLoading, markAsRead, markAllRead } = useNotifications();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      ref={dropdownRef}
      className="absolute right-0 top-full mt-4 w-[400px] bg-white/95 backdrop-blur-2xl rounded-[2rem] shadow-[0_40px_80px_rgba(0,0,0,0.15)] border border-slate-200 overflow-hidden z-[200] animate-in fade-in slide-in-from-top-4 duration-300 flex flex-col max-h-[600px]"
    >
      <header className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/20 ring-4 ring-blue-500/5">
            <Bell size={20} strokeWidth={3} />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-[2px]">Central de Alertas</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Vital Command Center</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-all text-slate-400"><X size={20}/></button>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
        {isLoading ? (
          <div className="py-20 text-center">
            <Loader2 size={32} className="animate-spin mx-auto mb-4 text-blue-500" />
            <p className="text-[10px] font-black uppercase tracking-[4px] text-slate-400">Escaneando Ledger...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
               <Mail size={32} className="text-slate-200" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sistemas nominais. Sem alertas.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n, idx) => (
              <NotificationItem 
                key={n.id} 
                notification={n} 
                onMarkAsRead={() => markAsRead(n.id)} 
                index={idx}
              />
            ))}
          </div>
        )}
      </div>

      {notifications.some(n => !n.isRead) && (
        <footer className="p-4 border-t border-slate-100 bg-slate-50/80 flex justify-between items-center px-8">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{notifications.filter(n => !n.isRead).length} pendentes</span>
          <button 
            onClick={markAllRead} 
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl font-black text-[9px] uppercase tracking-widest transition-all active:scale-95 shadow-xl"
          >
            <Archive size={12} /> Arquivar Todos
          </button>
        </footer>
      )}
    </div>
  );
};

const NOTIF_CONFIG: Record<string, any> = {
  INFO: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100' },
  SUCCESS: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  WARNING: { icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100' },
  ALERT: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100' },
};

const NotificationItem = ({ notification, onMarkAsRead, index }: { notification: AppNotification, onMarkAsRead: () => void, index: number }) => {
  const cfg = NOTIF_CONFIG[notification.type] || NOTIF_CONFIG.INFO;
  const Icon = cfg.icon;

  return (
    <div 
      className={`group flex items-start gap-4 p-4 rounded-2xl border-2 transition-all relative overflow-hidden animate-in slide-in-from-right-4 fade-in duration-300`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className={`absolute top-0 left-0 w-1 h-full ${cfg.color.replace('text-', 'bg-')}`} />
      
      <div className={`p-2.5 rounded-xl shrink-0 shadow-sm ${cfg.bg} ${cfg.color}`}>
        <Icon size={18} strokeWidth={3} className={notification.type === 'ALERT' ? 'animate-pulse' : ''} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
            <h4 className={`text-xs font-black uppercase tracking-tight leading-tight ${notification.isRead ? 'text-slate-500' : 'text-slate-800'}`}>
                {notification.title}
            </h4>
            {!notification.isRead && (
                <button 
                  onClick={onMarkAsRead}
                  className="p-1 text-slate-300 hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100"
                >
                    <CheckCircle2 size={14} />
                </button>
            )}
        </div>
        <p className={`text-[11px] mt-1 leading-relaxed ${notification.isRead ? 'text-slate-400' : 'text-slate-600 font-medium'}`}>
            {notification.message}
        </p>
        <div className="mt-3 flex items-center justify-between">
            <p className="text-[9px] font-mono font-bold text-slate-300 uppercase tracking-tighter">
                {new Date(notification.timestamp).toLocaleString()}
            </p>
            {notification.link && (
                <button 
                  onClick={() => window.open(notification.link, '_blank')}
                  className="flex items-center gap-1.5 text-[9px] font-black text-blue-600 uppercase tracking-widest hover:underline"
                >
                    Detalhes <ExternalLink size={10} />
                </button>
            )}
        </div>
      </div>
    </div>
  );
};
