import { IAdminService, AdminStatsData, PaginatedResponse } from './interfaces.ts';
import { supabase } from '../supabaseClient.ts';
// Fix: Updated import path for 'types' module to explicitly include '/index'
import { SystemStatus, ClientOrganization, UserRole, MaintenanceEvent } from '../../types/index'; // Atualizado
// Importa o wrapper e a função de log do serviço de arquivo
import { withAuditLog } from '../utils/auditLogWrapper.ts';
import { logAction } from './supabaseFileService.ts'; // Importa a função de logAction diretamente

export const SupabaseAdminService: IAdminService = {
    getSystemStatus: async () => {
        try {
            const { data, error } = await supabase.from('system_settings').select('*').single();
            if (error || !data) return { mode: 'ONLINE' };
            return {
                mode: data.mode,
                message: data.message,
                scheduledStart: data.scheduled_start,
                scheduledEnd: data.scheduled_end,
                updatedBy: data.updated_by
            };
        } catch (e) {
            console.error("Erro ao buscar status do sistema:", e);
            return { mode: 'ONLINE' };
        }
    },

    updateSystemStatus: async (user, newStatus) => {
        if (user.role !== UserRole.ADMIN) {
            throw new Error("Apenas administradores podem alterar o status do sistema.");
        }

        let oldStatus: SystemStatus = { mode: 'ONLINE' };
        try {
            const { data: currentStatusData } = await supabase.from('system_settings').select('mode').single();
            if (currentStatusData) oldStatus.mode = currentStatusData.mode;
        } catch (e) {
            console.warn("Could not fetch current system status for logging:", e);
        }

        const serviceCall = async () => {
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

        return await withAuditLog(user, 'SYSTEM_STATUS_UPDATE', { 
            target: `Mode: ${newStatus.mode}`, 
            category: 'SYSTEM', 
            initialSeverity: 'WARNING', 
            metadata: { oldMode: oldStatus.mode, newMode: newStatus.mode, message: newStatus.message, scheduledStart: newStatus.scheduledStart, scheduledEnd: newStatus.scheduledEnd }
        }, serviceCall);
    },

    subscribeToSystemStatus: (listener) => {
        const channel = supabase
            .channel('system_changes')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'system_settings' }, payload => {
                const s = payload.new;
                listener({
                    mode: s.mode,
                    message: s.message,
                    scheduledStart: s.scheduled_start,
                    scheduledEnd: s.scheduled_end,
                    updatedBy: s.updated_by
                } as SystemStatus);
            })
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    },

    getAdminStats: async (): Promise<AdminStatsData> => {
        const { data, error } = await supabase.from('v_admin_stats').select('*').maybeSingle();
        
        const simulatedInfra = {
            cpuUsage: 15 + Math.floor(Math.random() * 20),
            memoryUsage: 45 + Math.floor(Math.random() * 15),
            dbConnections: 5 + Math.floor(Math.random() * 10),
            dbMaxConnections: 100
        };

        if (error || !data) {
            return {
                totalUsers: 0,
                activeUsers: 0,
                activeClients: 0,
                logsLast24h: 0,
                systemHealthStatus: 'HEALTHY',
                ...simulatedInfra
            };
        }

        return {
            totalUsers: data.total_users,
            activeUsers: data.active_users,
            activeClients: data.active_clients,
            logsLast24h: data.logs_last_24_h,
            systemHealthStatus: data.system_health_status as any,
            ...simulatedInfra
        };
    },

    getClients: async (filters, page = 1, pageSize = 20): Promise<PaginatedResponse<ClientOrganization>> => {
        console.log(`[SupabaseAdminService] getClients called with filters: ${JSON.stringify(filters)}, page: ${page}, pageSize: ${pageSize}`);
        
        let query = supabase
            .from('organizations')
            .select(`
                *,
                quality_analyst_profile:profiles!quality_analyst_id(full_name)
            `, { count: 'exact' });

        if (filters?.search) {
            query = query.or(`name.ilike.%${filters.search}%,cnpj.ilike.%${filters.search}%`);
        }
        
        if (filters?.status && filters.status !== 'ALL') {
            query = query.eq('status', filters.status);
        }

        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        const { data: orgsData, count, error } = await query
            .range(from, to)
            .order('name');
        
        if (error) {
            console.error("[SupabaseAdminService] Erro ao carregar organizações:", error.message);
            throw new Error(`Falha ao carregar organizações: ${error.message}`);
        }

        const itemsWithoutStats = (orgsData || []).map(c => ({
            id: c.id,
            name: c.name || 'Empresa sem Nome',
            cnpj: c.cnpj || '00.000.000/0000-00',
            status: (c.status || 'ACTIVE') as any,
            contractDate: c.contract_date || new Date().toISOString().split('T')[0],
            qualityAnalystId: c.quality_analyst_id,
            qualityAnalystName: c.quality_analyst_profile ? c.quality_analyst_profile.full_name : undefined,
        }));

        const clientIds = itemsWithoutStats.map(c => c.id);

        let filesStats: { [clientId: string]: { totalDocs: number; pendingDocs: number; approvedDocs: number; lastAnalysisDate?: string } } = {};

        if (clientIds.length > 0) {
            const { data: filesData, error: filesError } = await supabase
                .from('files')
                .select('owner_id, metadata->>status, metadata->>inspectedAt')
                .in('owner_id', clientIds)
                .neq('type', 'FOLDER');

            if (filesError) {
                console.error("[SupabaseAdminService] Erro ao carregar estatísticas de arquivos:", filesError.message);
            } else {
                filesStats = (filesData || []).reduce((acc, file) => {
                    const ownerId = file.owner_id;
                    if (!acc[ownerId]) {
                        acc[ownerId] = { totalDocs: 0, pendingDocs: 0, approvedDocs: 0 };
                    }
                    acc[ownerId].totalDocs++;
                    if (file.metadata?.status === 'PENDING') {
                        acc[ownerId].pendingDocs++;
                    } else if (file.metadata?.status === 'APPROVED') {
                        acc[ownerId].approvedDocs++;
                    }

                    const inspectedAt = file.metadata?.inspectedAt;
                    if (inspectedAt) {
                        const currentLast = acc[ownerId].lastAnalysisDate;
                        if (!currentLast || new Date(inspectedAt) > new Date(currentLast)) {
                            acc[ownerId].lastAnalysisDate = inspectedAt;
                        }
                    }
                    return acc;
                }, {});
            }
        }

        const itemsWithStats = itemsWithoutStats.map(c => {
            const stats = filesStats[c.id] || { totalDocs: 0, pendingDocs: 0, approvedDocs: 0 };
            const complianceScore = stats.totalDocs === 0 
                ? 100
                : Math.round((stats.approvedDocs / stats.totalDocs) * 100);

            return {
                ...c,
                pendingDocs: stats.pendingDocs,
                complianceScore,
                lastAnalysisDate: stats.lastAnalysisDate
            };
        });

        console.log(`[SupabaseAdminService] Fetched ${count} clients. Data:`, itemsWithStats);

        return {
            items: itemsWithStats,
            total: count || 0,
            hasMore: (count || 0) > to + 1
        };
    },

    saveClient: async (user, data) => {
        if (user.role !== UserRole.ADMIN) {
            throw new Error("Permissão negada para gerenciar organizações.");
        }

        const payload = {
            name: data.name,
            cnpj: data.cnpj,
            status: data.status,
            contract_date: data.contractDate,
            quality_analyst_id: data.qualityAnalystId || null,
        };

        let oldData: any = {};
        if (data.id) {
            const { data: existingClient } = await supabase.from('organizations').select('*').eq('id', data.id).single();
            oldData = existingClient || {};
        }

        const serviceCall = async () => {
            let query;
            if (data.id) {
                query = supabase.from('organizations').update(payload).eq('id', data.id);
            } else {
                query = supabase.from('organizations').insert(payload);
            }

            const { data: client, error } = await query.select().single();
            if (error) throw error;

            return {
                id: client.id,
                name: client.name,
                cnpj: client.cnpj,
                status: client.status as any,
                contractDate: client.contract_date,
                pendingDocs: 0,
                complianceScore: 100,
                lastAnalysisDate: undefined,
                qualityAnalystId: client.quality_analyst_id,
                qualityAnalystName: data.qualityAnalystName
            };
        };

        return await withAuditLog(user, data.id ? 'CLIENT_UPDATED' : 'CLIENT_CREATED', {
            target: data.name || 'New Client', 
            category: 'DATA', 
            metadata: { 
                clientId: data.id, new: payload, old: oldData,
                qualityAnalystId: data.qualityAnalystId,
                qualityAnalystName: data.qualityAnalystName
            }
        }, serviceCall);
    },

    deleteClient: async (user, id) => {
        if (user.role !== UserRole.ADMIN) {
            throw new Error("Apenas administradores podem excluir organizações.");
        }
        let clientName = `ID: ${id}`;
        let qualityAnalystId: string | undefined = undefined;

        const serviceCall = async () => {
            const { data: clientData } = await supabase.from('organizations').select('name, quality_analyst_id').eq('id', id).single();
            if (clientData) {
                clientName = clientData.name;
                qualityAnalystId = clientData.quality_analyst_id;
            }

            const { error } = await supabase.from('organizations').delete().eq('id', id);
            if (error) throw error;
        };

        await withAuditLog(user, 'CLIENT_DELETE', {
            target: clientName, 
            category: 'DATA', 
            metadata: { 
                clientId: id, 
                qualityAnalystId
            }
        }, serviceCall);
    },

    getFirewallRules: async () => {
        const { data } = await supabase.from('firewall_rules').select('*').order('priority');
        return (data || []);
    },

    getPorts: async () => {
        const { data } = await supabase.from('network_ports').select('*');
        return (data || []);
    },

    getMaintenanceEvents: async () => {
        const { data } = await supabase.from('maintenance_events').select('*').order('scheduled_date', { ascending: false });
        return (data || []).map(event => ({
            id: event.id,
            title: event.title,
            scheduledDate: event.scheduled_date,
            durationMinutes: event.duration_minutes,
            description: event.description,
            status: event.status,
            createdBy: event.created_by
        }));
    },

    scheduleMaintenance: async (user, event) => {
        if (user.role !== UserRole.ADMIN) {
            throw new Error("Ação exclusiva para administradores.");
        }
        const serviceCall = async () => {
            const { data, error } = await supabase.from('maintenance_events').insert({
                title: event.title,
                scheduled_date: event.scheduledDate,
                duration_minutes: event.durationMinutes,
                description: event.description,
                status: 'SCHEDULED',
                created_by: user.id
            }).select().single();
            if (error) throw error;
            return {
                id: data.id,
                title: data.title,
                scheduledDate: data.scheduled_date,
                durationMinutes: data.duration_minutes,
                description: data.description,
                status: data.status,
                createdBy: data.created_by
            } as MaintenanceEvent;
        };

        return await withAuditLog(user, 'MAINTENANCE_SCHEDULE', {
            target: event.title || 'New Event', 
            category: 'SYSTEM', 
            initialSeverity: 'WARNING', 
            metadata: { scheduledDate: event.scheduledDate }
        }, serviceCall);
    },

    cancelMaintenance: async (user, id) => {
        if (user.role !== UserRole.ADMIN) {
            throw new Error("Ação exclusiva para administradores.");
        }
        const serviceCall = async () => {
            await supabase.from('maintenance_events').update({ status: 'CANCELLED' }).eq('id', id);
        };

        await withAuditLog(user, 'MAINTENANCE_CANCEL', {
            target: `ID: ${id}`, 
            category: 'SYSTEM', 
            initialSeverity: 'WARNING', 
            metadata: { eventId: id }
        }, serviceCall);
    },
};