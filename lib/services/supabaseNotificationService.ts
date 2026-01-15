

import { AppNotification, User } from '../../types/index.ts';
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
            userId: n.user_id || null, // Mapeia explicitamente para null se user_id for null
            title: n.title,
            message: n.message,
            type: n.type as AppNotification['type'], // Cast explícito para o tipo correto
            isRead: n.is_read,
            timestamp: n.created_at,
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

    addNotification: async (userId: string | null, title, message, type, link) => {
        await supabase.from('notifications').insert({
            user_id: userId, // Passa userId diretamente, pode ser null
            title,
            message,
            type,
            link,
            is_read: false
        });
    }
};
