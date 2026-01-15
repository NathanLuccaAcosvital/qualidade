
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, CheckCircle2, XCircle, Info, Loader2, AlertTriangle, Mail, X } from 'lucide-react';
import { AppNotification } from '../../../../types/index.ts';
import { useAuth } from '../../../../context/authContext.tsx';
import { notificationService } from '../../../../lib/services/index.ts';
import { useToast } from '../../../../context/notificationContext.tsx';

// Hook para gerenciar a lógica de notificações
const useNotificationsList = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const fetchedNotifications = await notificationService.getNotifications(user);
      setNotifications(fetchedNotifications);
    } catch (err: any) {
      showToast(t('notifications.errorLoading', { message: err.message }), 'error');
    } finally {
      setIsLoading(false);
    }
  }, [user, showToast, t]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      showToast(t('notifications.markedAsRead'), 'success');
      fetchNotifications(); // Recarrega a lista para refletir a mudança
    } catch (err: any) {
      showToast(t('notifications.errorMarkingAsRead', { message: err.message }), 'error');
    }
  }, [fetchNotifications, showToast, t]);

  const markAllAsRead = useCallback(async () => {
    if (!user) return;
    try {
      await notificationService.markAllAsRead(user);
      showToast(t('notifications.markedAllAsRead'), 'success');
      fetchNotifications();
    } catch (err: any) {
      showToast(t('notifications.errorMarkingAllAsRead', { message: err.message }), 'error');
    }
  }, [user, fetchNotifications, showToast, t]);

  useEffect(() => {
    fetchNotifications(); // Carrega na montagem
    
    // Assina para atualizações em tempo real
    const unsubscribe = notificationService.subscribeToNotifications(fetchNotifications);
    return () => unsubscribe(); // Limpa a inscrição na desmontagem
  }, [fetchNotifications]);

  return { notifications, isLoading, markAsRead, markAllAsRead, refresh: fetchNotifications };
};

interface NotificationsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { notifications, isLoading, markAsRead, markAllAsRead } = useNotificationsList();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fecha o dropdown se clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 flex flex-col overflow-hidden z-[100] animate-in fade-in slide-in-from-top-4 duration-300" // Adicionadas classes de animação
      role="menu"
      aria-orientation="vertical"
      aria-labelledby="notifications-menu-button"
    >
      <header className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 text-[var(--color-detail-blue)] rounded-xl shadow-sm"><Bell size={18} /></div>
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">{t('notifications.title')}</h3>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-slate-200 rounded-full transition-colors text-slate-400" aria-label={t('common.close')}>
            <X size={18} />
        </button>
      </header>

      {isLoading ? (
        <div className="p-8 text-center text-slate-400">
          <Loader2 size={24} className="animate-spin mx-auto mb-3 text-[var(--color-detail-blue)]" />
          <p className="text-xs font-black uppercase tracking-widest">{t('notifications.loading')}</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-slate-400 italic">
              <Mail size={36} className="mx-auto mb-3 opacity-50" />
              <p className="text-xs font-medium">{t('notifications.emptyState')}</p>
            </div>
          ) : (
            notifications.map(notification => (
              <NotificationItem key={notification.id} notification={notification} onMarkAsRead={markAsRead} t={t} />
            ))
          )}
        </div>
      )}

      {notifications.some(n => !n.isRead) && (
        <footer className="p-3 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button 
            onClick={markAllAsRead} 
            className="px-5 py-2 bg-[var(--color-detail-blue)] hover:bg-blue-700 text-white rounded-lg font-bold text-[9px] uppercase tracking-widest transition-all shadow-md active:scale-95"
          >
            {t('notifications.markAllAsRead')}
          </button>
        </footer>
      )}
    </div>
  );
};

// Mapeamento de ícones e cores para tipos de notificação
const NOTIFICATION_TYPE_CONFIG = {
  INFO: { icon: Info, color: 'bg-blue-50 text-blue-700 border-blue-100' },
  SUCCESS: { icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  WARNING: { icon: AlertTriangle, color: 'bg-orange-50 text-orange-700 border-orange-100' },
  ALERT: { icon: XCircle, color: 'bg-red-50 text-red-700 border-red-100' },
};

const NotificationItem: React.FC<{ notification: AppNotification; onMarkAsRead: (id: string) => void; t: any }> = ({ notification, onMarkAsRead, t }) => {
  const config = NOTIFICATION_TYPE_CONFIG[notification.type] || NOTIFICATION_TYPE_CONFIG.INFO;
  const Icon = config.icon;

  const navigateToLink = useCallback(() => {
    if (notification.link) {
      window.open(notification.link, '_blank');
      if (!notification.isRead) {
        onMarkAsRead(notification.id); // Marca como lida ao clicar no link
      }
    }
  }, [notification.link, notification.isRead, onMarkAsRead]);

  return (
    <div 
      className={`flex items-start gap-3 p-3 rounded-xl border transition-all relative group 
                  ${notification.isRead ? 'bg-slate-50 border-slate-100 text-slate-500' : `${config.color} shadow-sm`}`}
      role="listitem"
    >
      <div className={`p-1.5 rounded-lg shrink-0 ${notification.isRead ? 'bg-slate-100 text-slate-400' : 'bg-white shadow-sm'}`}>
        <Icon size={16} />
      </div>
      <div className="flex-1">
        <h4 className={`text-sm font-bold ${notification.isRead ? 'text-slate-700' : 'text-slate-900'}`}>{notification.title}</h4>
        <p className={`text-xs mt-0.5 leading-relaxed ${notification.isRead ? 'text-slate-500' : 'text-slate-700'}`}>
          {notification.message}
        </p>
        <p className="text-[9px] text-slate-400 mt-1 font-mono">{new Date(notification.timestamp).toLocaleString()}</p>
      </div>
      {!notification.isRead && (
        <button 
          onClick={() => onMarkAsRead(notification.id)}
          className="absolute top-1.5 right-1.5 p-1 text-slate-400 hover:text-[var(--color-detail-blue)] hover:bg-slate-100 rounded-full transition-colors opacity-0 group-hover:opacity-100"
          title={t('notifications.markAsRead')}
          aria-label={t('notifications.markAsRead')}
        >
          <CheckCircle2 size={14} />
        </button>
      )}
      {notification.link && (
        <button 
          onClick={navigateToLink}
          className="ml-auto p-1 text-[var(--color-detail-blue)] hover:text-blue-800 rounded-full transition-colors"
          title="Ver Detalhes"
          aria-label="Ver Detalhes"
        >
          {/* Pode adicionar um ícone de link externo aqui se quiser */}
        </button>
      )}
    </div>
  );
};
