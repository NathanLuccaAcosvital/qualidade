import { IAdminService, AdminStatsData, PaginatedResponse, RawClientOrganization } from './interfaces.ts';
import { supabase } from '../supabaseClient.ts';
import { SystemStatus, MaintenanceEvent } from '../../types/system.ts';
import { ClientOrganization } from '../../types/auth.ts';
import { withAuditLog } from '../utils/auditLogWrapper.ts';
import { withTimeout } from '../utils/apiUtils.ts'; // Import withTimeout
// import { config } from '../config.ts'; // Removido
// Fix: Import necessary Supabase types for explicit typing
import { PostgrestError, PostgrestResponse, PostgrestSingleResponse } from '@supabase/supabase-js';

const API_TIMEOUT = 8000; // Definido localmente (Reduzido para 8 segundos)

/**
 * Implementação Supabase para Gestão Administrativa.
 */
export const SupabaseAdminService: IAdminService = {
  getSystemStatus: async () => {
    // Fix: Explicitly type fetchStatusPromise to match the expected return type for withTimeout
    const fetchStatusPromise: Promise<PostgrestSingleResponse<SystemStatus>> = supabase.from('system_settings').select('*').single();
    
    // Aplica timeout à requisição do status do sistema
    // Fix: Explicitly destructure result to correctly infer types from withTimeout
    const result = await withTimeout(
      fetchStatusPromise, 
      API_TIMEOUT, 
      "Tempo esgotado ao buscar status do sistema."
    );
    const { data, error } = result;

    if (error || !data) return { mode: 'ONLINE' };
    return {
      mode: data.mode,
      message: data.message,
      scheduledStart: data.scheduled_start, // Fix: Use snake_case from DB
      scheduledEnd: data.scheduled_end,     // Fix: Use snake_case from DB
      updatedBy: data.updated_by            // Fix: Use snake_case from DB
    };
  },

  updateSystemStatus: async (user, newStatus) => {
    const action = async () => {
      const { data, error } = await supabase.from('system_settings').update({
        mode: newStatus.mode,
        message: newStatus.message,
        scheduled_start: newStatus.scheduledStart, // Fix: Use snake_case for DB column
        scheduled_end: newStatus.scheduledEnd,     // Fix: Use snake_case for DB column
        updated_by: user.id,                       // Fix: Use snake_case for DB column
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
    // As chamadas de stats geralmente são rápidas, mas podemos adicionar timeout aqui também se necessário.
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

    // Fix: Explicitly type the promise to match the expected return type for withTimeout
    const queryPromise: Promise<PostgrestResponse<RawClientOrganization>> = query.range(from, to).order('name');
    const result = await withTimeout( 
      queryPromise,
      API_TIMEOUT,
      "Tempo esgotado ao carregar clientes."
    );
    const { data, count, error } = result;

    if (error) throw error;

    return {
      // Fix: Map raw data to ClientOrganization domain type
      items: (data || []).map(c => {
        // Tratar o retorno do join que pode vir como objeto ou array
        const profileData = Array.isArray(c.profiles) ? c.profiles[0] : c.profiles;
        return {
          id: c.id, 
          name: c.name || 'Empresa Sem Nome', 
          cnpj: c.cnpj || '00.000.000/0000-00', 
          status: c.status, 
          contractDate: c.contract_date, // Fix: Map from snake_case to camelCase
          qualityAnalystId: c.quality_analyst_id || undefined, // Fix: Map from snake_case
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
        name: data.name, 
        cnpj: data.cnpj, 
        status: data.status,
        contract_date: data.contractDate, // Fix: Use snake_case for DB column
        quality_analyst_id: data.qualityAnalystId // Fix: Use snake_case for DB column
      };
      const query = data.id ? supabase.from('organizations').update(payload).eq('id', data.id) : supabase.from('organizations').insert(payload);
      
      // Fix: Explicitly type the promise to match the expected return type for withTimeout
      const queryPromise: Promise<PostgrestSingleResponse<ClientOrganization>> = query.select().single();
      const result = await withTimeout( 
        queryPromise,
        API_TIMEOUT,
        "Tempo esgotado ao salvar cliente."
      );
      const { data: res, error } = result;

      if (error) throw error;
      return res as ClientOrganization;
    };
    return await withAuditLog(user, data.id ? 'CLIENT_UPDATE' : 'CLIENT_CREATE', { target: data.name || 'Org', category: 'DATA' }, call);
  },

  deleteClient: async (user, id) => {
    const action = async () => {
      // Fix: Explicitly type the promise to match the expected return type for withTimeout
      const deletePromise: Promise<PostgrestResponse<null>> = supabase.from('organizations').delete().eq('id', id);
      const result = await withTimeout( 
        deletePromise,
        API_TIMEOUT,
        "Tempo esgotado ao deletar cliente."
      );
      const { error } = result;
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
    // Fix: Explicitly type the promise to match the expected return type for withTimeout
     const insertPromise: Promise<PostgrestSingleResponse<MaintenanceEvent>> = supabase.from('maintenance_events').insert({
         title: event.title,
         scheduled_date: event.scheduledDate, // Fix: Use snake_case for DB column
         duration_minutes: event.durationMinutes,
         description: event.description,
         status: 'SCHEDULED',
         created_by: user.id
       }).select().single();
     const result = await withTimeout( 
       insertPromise,
       API_TIMEOUT,
       "Tempo esgotado ao agendar manutenção."
     );
     const { data, error } = result;
     
     if (error) throw error;
     return data as MaintenanceEvent;
  },
  cancelMaintenance: async (user, id) => {
    const action = async () => {
      // Fix: Explicitly type the promise to match the expected return type for withTimeout
      const updatePromise: Promise<PostgrestResponse<null>> = supabase.from('maintenance_events').update({ status: 'CANCELLED' }).eq('id', id);
      const result = await withTimeout( 
        updatePromise,
        API_TIMEOUT,
        "Tempo esgotado ao cancelar manutenção."
      );
      const { error } = result;
      if (error) throw error;
    };
    await withAuditLog(user, 'MAINTENANCE_CANCEL', { target: id, category: 'SYSTEM' }, action);
  }
};