
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, Loader2, Archive, XCircle, Info, CheckCircle2, AlertTriangle, Mail } from 'lucide-react';
import { useNotifications } from './hooks/useNotifications.ts';

interface NotificationListProps {
  onClose?: () => void;
}

export const NotificationList: React.FC<NotificationListProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const { notifications, isLoading, markAsRead, markAllRead } = useNotifications();

  if (isLoading) {
    return (
      <div className="p-20 text-center text-slate-400 flex flex-col items-center gap-4">
        <Loader2 size={40} className="animate-spin text-blue-500" />
        <p className="text-[10px] font-black uppercase tracking-[4px]">{t('notifications.loading')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-[2rem] overflow-hidden border border-slate-200 shadow-sm animate-in fade-in duration-500">
      <header className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-lg"><Bell size={20}/></div>
          <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">{t('notifications.title')}</h3>
        </div>
        {onClose && <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"><XCircle size={24} /></button>}
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-4">
        {notifications.length === 0 ? (
          <div className="py-24 text-center text-slate-300">
            <Mail size={56} className="mx-auto mb-6 opacity-20" />
            <p className="text-sm font-bold uppercase tracking-widest">{t('notifications.emptyState')}</p>
          </div>
        ) : (
          notifications.map((n, idx) => (
            <NotificationLargeItem key={n.id} notification={n} onMarkAsRead={() => markAsRead(n.id)} index={idx} />
          ))
        )}
      </div>

      {notifications.some(n => !n.isRead) && (
        <footer className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button 
            onClick={markAllRead} 
            className="flex items-center gap-3 px-8 py-3 bg-slate-900 hover:bg-black text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl active:scale-95"
          >
            <Archive size={14} /> {t('notifications.markAllAsRead')}
          </button>
        </footer>
      )}
    </div>
  );
};

const NOTIF_STYLE: Record<string, any> = {
  INFO: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  SUCCESS: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  WARNING: { icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
  ALERT: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
};

const NotificationLargeItem = ({ notification, onMarkAsRead, index }: any) => {
  const style = NOTIF_STYLE[notification.type] || NOTIF_STYLE.INFO;
  const Icon = style.icon;

  return (
    <div 
        className={`flex items-start gap-6 p-6 rounded-[1.5rem] border-2 transition-all relative group
                    ${notification.isRead ? 'bg-slate-50/50 border-slate-100 opacity-60' : `${style.bg} ${style.border} shadow-sm`}`}
        style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className={`p-3.5 rounded-2xl shrink-0 ${notification.isRead ? 'bg-white text-slate-300' : 'bg-white shadow-inner'}`}>
        <Icon size={24} className={notification.isRead ? 'text-slate-300' : style.color} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className={`text-sm font-black uppercase tracking-tight ${notification.isRead ? 'text-slate-600' : 'text-slate-900'}`}>{notification.title}</h4>
        <p className={`text-xs mt-1.5 leading-relaxed ${notification.isRead ? 'text-slate-400' : 'text-slate-700 font-medium'}`}>{notification.message}</p>
        <p className="text-[10px] text-slate-300 mt-4 font-mono font-bold">{new Date(notification.timestamp).toLocaleString()}</p>
      </div>
      {!notification.isRead && (
        <button 
          onClick={onMarkAsRead}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-xl transition-all opacity-0 group-hover:opacity-100 shadow-sm border border-transparent hover:border-slate-100"
        >
          <CheckCircle2 size={18} />
        </button>
      )}
    </div>
  );
};
