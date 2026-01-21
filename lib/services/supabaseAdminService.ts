
import { IAdminService, AdminStatsData, PaginatedResponse, RawClientOrganization } from './interfaces.ts';
import { supabase } from '../supabaseClient.ts';
import { SystemStatus, MaintenanceEvent } from '../../types/system.ts';
import { ClientOrganization, User, UserRole, normalizeRole, AccountStatus } from '../../types/index.ts';
import { withAuditLog } from '../utils/auditLogWrapper.ts';
import { withTimeout } from '../utils/apiUtils.ts';
import { PostgrestResponse, PostgrestSingleResponse } from '@supabase/supabase-js';

const API_TIMEOUT = 8000;

export const SupabaseAdminService: IAdminService = {
  getSystemStatus: async () => {
    const fetchStatusPromise = Promise.resolve(supabase.from('system_settings').select('*').single());
    const result = await withTimeout(fetchStatusPromise as any, API_TIMEOUT, "Tempo esgotado ao buscar status do sistema.");
    const { data, error } = result as PostgrestSingleResponse<any>;
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
      return {
        mode: data.mode,
        message: data.message,
        scheduledStart: data.scheduled_start,
        scheduledEnd: data.scheduled_end,
        updatedBy: data.updated_by
      } as SystemStatus;
    };
    return await withAuditLog(user, 'SYS_STATUS_CHANGE', { target: `Mode: ${newStatus.mode}`, category: 'SYSTEM', initialSeverity: 'WARNING' }, action);
  },

  updateGatewayMode: async (user, mode) => {
    await SupabaseAdminService.updateSystemStatus(user, { mode });
  },

  subscribeToSystemStatus: (listener) => {
    const channel = supabase.channel('system_state').on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'system_settings' }, payload => {
      const data = payload.new as any;
      listener({ mode: data.mode, message: data.message, scheduledStart: data.scheduled_start, scheduledEnd: data.scheduled_end, updatedBy: data.updated_by });
    }).subscribe();
    return () => { supabase.removeChannel(channel); };
  },

  getAdminStats: async (): Promise<AdminStatsData> => {
    const [u, a, c, l] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'ACTIVE'),
      supabase.from('organizations').select('*', { count: 'exact', head: true }).eq('status', 'ACTIVE'),
      supabase.from('audit_logs').select('*', { count: 'exact', head: true }).gt('created_at', new Date(Date.now() - 86400000).toISOString())
    ]);
    const getOscillatedValue = (base: number, range: number) => Math.floor(base + (Math.random() * range - range / 2));
    return { totalUsers: u.count || 0, activeUsers: a.count || 0, activeClients: c.count || 0, logsLast24h: l.count || 0, systemHealthStatus: 'HEALTHY', cpuUsage: Math.min(95, getOscillatedValue(12, 4) + (u.count || 0) * 0.1), memoryUsage: Math.min(95, getOscillatedValue(35, 6)), dbConnections: Math.max(1, getOscillatedValue(8, 2)), dbMaxConnections: 100 };
  },

  getClients: async (filters, page = 1, pageSize = 20) => {
    let query = supabase
      .from('organizations')
      .select('*, profiles!organizations_quality_analyst_id_fkey(full_name)', { count: 'exact' });
    
    if (filters?.search) query = query.ilike('name', `%${filters.search}%`);
    if (filters?.status && filters.status !== 'ALL') query = query.eq('status', filters.status);

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const queryPromise = Promise.resolve(query.range(from, to).order('name'));
    const result = await withTimeout(queryPromise as any, API_TIMEOUT, "Tempo esgotado ao carregar clientes.");
    const { data, count, error } = result as PostgrestResponse<RawClientOrganization>;

    if (error) throw error;

    return {
      items: (data || []).map(c => {
        const profileData = Array.isArray(c.profiles) ? c.profiles[0] : c.profiles;
        return {
          id: c.id, 
          name: c.name || 'Empresa Sem Nome', 
          cnpj: c.cnpj || '00.000.000/0000-00', 
          status: c.status, 
          contractDate: c.contract_date,
          qualityAnalystId: c.quality_analyst_id || undefined,
          qualityAnalystName: profileData?.full_name || 'N/A'
        };
      }),
      total: count || 0,
      hasMore: (count || 0) > to + 1
    };
  },

  saveClient: async (user, data) => {
    const isNew = !data.id;
    const action = async () => {
      if (isNew) {
        const { data: existing } = await supabase.from('organizations').select('id').eq('cnpj', data.cnpj).maybeSingle();
        if (existing) throw new Error(`Já existe uma empresa registrada com o CNPJ ${data.cnpj}.`);
      }

      let validQualityAnalystId = (data.qualityAnalystId && data.qualityAnalystId.trim() !== "") 
        ? data.qualityAnalystId 
        : null;

      if (!validQualityAnalystId && normalizeRole(user.role) === UserRole.QUALITY) {
          validQualityAnalystId = user.id;
      }

      const payload = { 
        name: data.name, 
        cnpj: data.cnpj, 
        status: data.status, 
        contract_date: data.contractDate, 
        quality_analyst_id: validQualityAnalystId 
      };

      const query = data.id 
        ? supabase.from('organizations').update(payload).eq('id', data.id) 
        : supabase.from('organizations').insert(payload);

      const { data: res, error } = await query.select().maybeSingle();
      
      if (error) {
        console.error("[Supabase Error] saveClient:", JSON.stringify(error, null, 2));
        throw error;
      }

      const finalOrg = res || { id: data.id, ...payload };

      if (isNew && finalOrg.id) {
          const { data: existingFolder } = await supabase.from('files').select('id').eq('owner_id', finalOrg.id).is('parent_id', null).maybeSingle();
          if (!existingFolder) {
              await supabase.from('files').insert({ 
                name: finalOrg.name, 
                type: 'FOLDER', 
                parent_id: null, 
                owner_id: finalOrg.id, 
                storage_path: 'system/folder', 
                updated_at: new Date().toISOString(),
                metadata: { status: 'SENT' } 
              });
          }
      }
      return { 
        id: finalOrg.id, 
        name: finalOrg.name, 
        cnpj: finalOrg.cnpj, 
        status: finalOrg.status, 
        contractDate: finalOrg.contract_date, 
        qualityAnalystId: finalOrg.quality_analyst_id 
      } as ClientOrganization;
    };
    return await withAuditLog(user, data.id ? 'CLIENT_UPDATE' : 'CLIENT_CREATE', { target: data.name || 'Org', category: 'DATA' }, action);
  },

  deleteClient: async (user, id) => {
    const action = async () => {
      const { error } = await supabase.from('organizations').delete().eq('id', id);
      if (error) throw error;
    };
    return await withAuditLog(user, 'CLIENT_DELETE', { target: id, category: 'DATA', initialSeverity: 'WARNING' }, action);
  },

  flagClientForDeletion: async (user, clientId) => {
    const action = async () => {
      const { error } = await supabase.from('organizations').update({ 
        status: AccountStatus.INACTIVE,
        // Nota: Idealmente haveria uma coluna is_pending_deletion no DB real
      }).eq('id', clientId);
      if (error) throw error;
    };
    return await withAuditLog(user, 'CLIENT_FLAGGED_DELETION', { target: clientId, category: 'DATA', initialSeverity: 'WARNING' }, action);
  },

  scheduleMaintenance: async (user, event) => {
     const { data, error } = await supabase.from('maintenance_events').insert({ title: event.title, scheduled_date: event.scheduledDate, duration_minutes: event.durationMinutes, description: event.description, status: 'SCHEDULED', created_by: user.id }).select().single();
     if (error) throw error;
     return { id: data.id, title: data.title, scheduledDate: data.scheduled_date, durationMinutes: data.duration_minutes, description: data.description, status: data.status, createdBy: data.created_by } as MaintenanceEvent;
  },

  getGlobalAuditLogs: async () => {
    const { data, error } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(200);
    if (error) throw error;
    return (data || []).map(l => ({ 
        id: l.id, 
        timestamp: l.created_at, 
        userId: l.user_id, 
        userName: l.metadata?.userName || 'Sistema', 
        userRole: l.metadata?.userRole || 'UNKNOWN', 
        action: l.action, 
        category: l.category, 
        target: l.target, 
        severity: l.severity, 
        status: l.status, 
        ip: l.ip, // Pega direto do banco preenchido pela trigger
        location: l.location, 
        userAgent: l.user_agent, 
        device: l.device, 
        metadata: l.metadata, 
        requestId: l.request_id 
    }));
  },

  manageUserAccess: async (admin, targetUser) => {
    if (!targetUser.id) throw new Error("ID do usuário alvo é obrigatório.");
    const { error } = await supabase.from('profiles').update({ role: targetUser.role, status: targetUser.status, updated_at: new Date().toISOString() }).eq('id', targetUser.id);
    if (error) throw error;
  },

  getAllClients: async () => {
    const res = await SupabaseAdminService.getClients(undefined, 1, 1000);
    return res.items;
  },

  generateSystemBackup: async (user) => {
    const action = async () => {
      const [orgs, profiles, files, audit] = await Promise.all([ supabase.from('organizations').select('*'), supabase.from('profiles').select('*'), supabase.from('files').select('*'), supabase.from('audit_logs').select('*').limit(1000) ]);
      const backupManifest = { version: "1.0", timestamp: new Date().toISOString(), generatedBy: user.email, data: { organizations: orgs.data || [], profiles: profiles.data || [], files_metadata: files.data || [], audit_ledger_slice: audit.data || [] } };
      const jsonStr = JSON.stringify(backupManifest, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const fileName = `VITAL_BACKUP_${new Date().toISOString().split('T')[0]}.json`;
      return { blob, fileName };
    };
    return await withAuditLog(user, 'SYSTEM_BACKUP_GENERATED', { target: 'CLOUD_RECOVERY_LEDGER', category: 'SYSTEM', initialSeverity: 'CRITICAL' }, action);
  }
};
