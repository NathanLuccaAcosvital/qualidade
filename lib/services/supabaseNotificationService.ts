// Fix: Updated import path for 'types' module to explicitly include '/index'
import { AppNotification, User } from '../../types/index'; // Atualizado
import { INotificationService } from './interfaces.ts';
import { supabase } from '../supabaseClient.ts';

export const SupabaseNotificationService: INotificationService = {
    subscribeToNotifications: (listener) => {
        const channel = supabase
            .channel('public:notifications')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, () => {
                listener();
            })
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    },

    getNotifications: async (user) => {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .or(`user_id.eq.${user.id},user_id.is.null`)
            .order('created_at', { ascending: false })
            .limit(50);
            
        if (error) throw error;
        return (data || []).map(n => ({
            id: n.id,
            userId: n.user_id,
            title: n.title,
            message: n.message,
            type: n.type as any,
            isRead: n.is_read,
            timestamp: new Date(n.created_at).toLocaleString(),
            link: n.link
        }));
    },

    getUnreadCount: async (user) => {
        const { count, error } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('is_read', false)
            .or(`user_id.eq.${user.id},user_id.is.null`);
            
        if (error) throw error;
        return count || 0;
    },

    markAsRead: async (id) => {
        await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    },

    markAllAsRead: async (user) => {
        await supabase.from('notifications')
            .update({ is_read: true })
            .eq('is_read', false)
            .or(`user_id.eq.${user.id},user_id.is.null`);
    },

    addNotification: async (userId, title, message, type, link) => {
        await supabase.from('notifications').insert({
            user_id: userId,
            title,
            message,
            type,
            link,
            is_read: false
        });
    }
};