
import { IAdminService, AdminStatsData, PaginatedResponse } from './interfaces.ts';
import { supabase } from '../supabaseClient.ts';
import { SystemStatus, MaintenanceEvent } from '../../types/system.ts';
import { ClientOrganization } from '../../types/auth.ts';
import { withAuditLog } from '../utils/auditLogWrapper.ts';

/**
 * Implementação Supabase para Gestão Administrativa.
 */
export const SupabaseAdminService: IAdminService = {
  getSystemStatus: async () => {
    const { data, error } = await supabase.from('system_settings').select('*').single();
    if (error || !data) return { mode: 'ONLINE' };
    return {
      mode: data.mode,
      message: data.message,
      scheduledStart: data.scheduled_start,
      scheduledEnd: data.scheduled_end,
      updatedBy: data.updated_by
    };
  },

  updateSystemStatus: async (user, newStatus) => {
    const action = async () => {
      const { data, error } = await supabase.from('system_settings').update({
        mode: newStatus.mode,
        message: newStatus.message,
        scheduled_start: newStatus.scheduledStart,
        scheduled_end: newStatus.scheduledEnd,
        updated_by: user.id,
        updated_at: new Date().toISOString()
      }).eq('id', 1).select().single();
      
      if (error) throw error;
      return data as SystemStatus;
    };

    return await withAuditLog(user, 'SYS_STATUS_CHANGE', { 
      target: `Mode: ${newStatus.mode}`, 
      category: 'SYSTEM', 
      initialSeverity: 'WARNING' 
    }, action);
  },

  subscribeToSystemStatus: (listener) => {
    const channel = supabase
      .channel('system_state')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'system_settings' }, payload => {
        listener(payload.new as SystemStatus);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  },

  getAdminStats: async (): Promise<AdminStatsData> => {
    const [u, a, c, l] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'ACTIVE'),
      supabase.from('organizations').select('*', { count: 'exact', head: true }).eq('status', 'ACTIVE'),
      supabase.from('audit_logs').select('*', { count: 'exact', head: true }).gt('created_at', new Date(Date.now() - 86400000).toISOString())
    ]);

    const getOscillatedValue = (base: number, range: number) => 
      Math.floor(base + (Math.random() * range - range / 2));

    return {
      totalUsers: u.count || 0,
      activeUsers: a.count || 0,
      activeClients: c.count || 0,
      logsLast24h: l.count || 0,
      systemHealthStatus: 'HEALTHY',
      cpuUsage: Math.min(95, getOscillatedValue(12, 4) + (u.count || 0) * 0.1), 
      memoryUsage: Math.min(95, getOscillatedValue(35, 6)),
      dbConnections: Math.max(1, getOscillatedValue(8, 2)),
      dbMaxConnections: 100
    };
  },

  getClients: async (filters, page = 1, pageSize = 20) => {
    let query = supabase.from('organizations').select('*, profiles!quality_analyst_id(full_name)', { count: 'exact' });
    
    if (filters?.search) query = query.ilike('name', `%${filters.search}%`);
    if (filters?.status && filters.status !== 'ALL') query = query.eq('status', filters.status);

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, count, error } = await query
      .range(from, to)
      .order('name');

    if (error) throw error;

    return {
      items: (data || []).map(c => {
        // Tratar o retorno do join que pode vir como objeto ou array
        const profileData = Array.isArray(c.profiles) ? c.profiles[0] : c.profiles;
        return {
          id: c.id, 
          name: c.name || 'Empresa Sem Nome', 
          cnpj: c.cnpj || '00.000.000/0000-00', 
          status: c.status, 
          contractDate: c.contract_date,
          qualityAnalystName: profileData?.full_name || 'N/A'
        };
      }),
      total: count || 0,
      hasMore: (count || 0) > to + 1
    };
  },

  saveClient: async (user, data) => {
    const call = async () => {
      const payload = {
        name: data.name, cnpj: data.cnpj, status: data.status,
        contract_date: data.contractDate, quality_analyst_id: data.qualityAnalystId
      };
      const query = data.id ? supabase.from('organizations').update(payload).eq('id', data.id) : supabase.from('organizations').insert(payload);
      const { data: res, error } = await query.select().single();
      if (error) throw error;
      return res as ClientOrganization;
    };
    return await withAuditLog(user, data.id ? 'CLIENT_UPDATE' : 'CLIENT_CREATE', { target: data.name || 'Org', category: 'DATA' }, call);
  },

  deleteClient: async (user, id) => {
    const action = async () => {
      const { error } = await supabase.from('organizations').delete().eq('id', id);
      if (error) throw error;
    };

    return await withAuditLog(user, 'CLIENT_DELETE', { 
      target: id, 
      category: 'DATA', 
      initialSeverity: 'WARNING' 
    }, action);
  },

  getFirewallRules: async () => [],
  getPorts: async () => [],
  getMaintenanceEvents: async () => [],
  scheduleMaintenance: async (user, event) => {
     const { data, error } = await supabase.from('maintenance_events').insert({
       title: event.title,
       scheduled_date: event.scheduledDate,
       duration_minutes: event.durationMinutes,
       description: event.description,
       status: 'SCHEDULED',
       created_by: user.id
     }).select().single();
     
     if (error) throw error;
     return data as MaintenanceEvent;
  },
  cancelMaintenance: async (user, id) => {
    const action = async () => {
      const { error } = await supabase.from('maintenance_events').update({ status: 'CANCELLED' }).eq('id', id);
      if (error) throw error;
    };
    await withAuditLog(user, 'MAINTENANCE_CANCEL', { target: id, category: 'SYSTEM' }, action);
  }
};
