

import { IAdminService, AdminStatsData, PaginatedResponse } from './interfaces.ts';
import { supabase } from '../supabaseClient.ts';
import { SystemStatus, ClientOrganization, UserRole, MaintenanceEvent } from '../../types.ts';
import { SupabaseFileService } from './supabaseFileService.ts'; // Import for logAction

const _logAction = SupabaseFileService.logAction; // Access the internal logAction

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
                updatedBy: data.updated_by // Adicionado para consistência
            };
        } catch (e) {
            console.error("Erro ao buscar status do sistema:", e);
            return { mode: 'ONLINE' };
        }
    },

    updateSystemStatus: async (user, newStatus) => {
        if (user.role !== UserRole.ADMIN) {
            // Fix: Ensure all 7 arguments are passed to _logAction
            await _logAction(user, 'SYSTEM_STATUS_UPDATE', `Mode: ${newStatus.mode}`, 'SECURITY', 'CRITICAL', 'FAILURE', { reason: "Permission denied" });
            throw new Error("Apenas administradores podem alterar o status do sistema.");
        }

        let oldStatus: SystemStatus = { mode: 'ONLINE' };
        try {
            const { data: currentStatusData } = await supabase.from('system_settings').select('mode').single();
            if (currentStatusData) oldStatus.mode = currentStatusData.mode;

            const { data, error } = await supabase.from('system_settings').update({
                mode: newStatus.mode,
                message: newStatus.message,
                scheduled_start: newStatus.scheduledStart, // Passa scheduledStart
                scheduled_end: newStatus.scheduledEnd,     // Passa scheduledEnd
                updated_by: user.id,
                updated_at: new Date().toISOString()
            }).eq('id', 1).select().single();
            
            if (error) throw error;

            // Fix: Ensure all 7 arguments are passed to _logAction
            await _logAction(user, 'SYSTEM_STATUS_UPDATE', `Mode: ${newStatus.mode}`, 'SYSTEM', 'WARNING', 'SUCCESS', { oldMode: oldStatus.mode, newMode: newStatus.mode, message: newStatus.message, scheduledStart: newStatus.scheduledStart, scheduledEnd: newStatus.scheduledEnd });
            return {
                mode: data.mode,
                message: data.message, // Usa a mensagem retornada pelo DB
                scheduledStart: data.scheduled_start,
                scheduledEnd: data.scheduled_end,
                updatedBy: data.updated_by
            } as SystemStatus;
        } catch (e: any) {
            // Fix: Ensure all 7 arguments are passed to _logAction
            await _logAction(user, 'SYSTEM_STATUS_UPDATE', `Mode: ${newStatus.mode}`, 'SYSTEM', 'CRITICAL', 'FAILURE', { oldMode: oldStatus.mode, newMode: newStatus.mode, reason: e.message });
            throw e;
        }
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
            `, { count: 'exact' }); // ALTERADO: Usa sintaxe explícita para o FK 'quality_analyst_id' na tabela organizations.
                                    // Assumindo que organizations tem uma coluna 'quality_analyst_id' que é FK para profiles(id)

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
            qualityAnalystId: c.quality_analyst_id, // Inclui o ID
            qualityAnalystName: c.quality_analyst_profile ? c.quality_analyst_profile.full_name : undefined, // Acessa o nome do perfil pelo alias
        }));

        const clientIds = itemsWithoutStats.map(c => c.id);

        let filesStats: { [clientId: string]: { totalDocs: number; pendingDocs: number; approvedDocs: number; lastAnalysisDate?: string } } = {};

        if (clientIds.length > 0) {
            const { data: filesData, error: filesError } = await supabase
                .from('files')
                .select('owner_id, metadata->>status, metadata->>inspectedAt')
                .in('owner_id', clientIds)
                .neq('type', 'FOLDER'); // Only count actual documents, not folders

            if (filesError) {
                console.error("[SupabaseAdminService] Erro ao carregar estatísticas de arquivos:", filesError.message);
                // Continue with partial data if file stats fail
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

                    // Calculate last analysis date
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
                ? 100 // If no documents, assume 100% compliance
                : Math.round((stats.approvedDocs / stats.totalDocs) * 100);

            return {
                ...c,
                pendingDocs: stats.pendingDocs,
                complianceScore,
                lastAnalysisDate: stats.lastAnalysisDate // Adiciona a data da última análise
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
            // Fix: Ensure all 7 arguments are passed to _logAction
            await _logAction(user, 'CLIENT_SAVE', data.name || 'New Client', 'SECURITY', 'CRITICAL', 'FAILURE', { reason: "Permission denied" });
            throw new Error("Permissão negada para gerenciar organizações.");
        }

        const payload = {
            name: data.name,
            cnpj: data.cnpj,
            status: data.status,
            contract_date: data.contractDate,
            quality_analyst_id: data.qualityAnalystId || null, // NOVO: Persiste o ID do analista
        };

        try {
            let query;
            let actionType = data.id ? 'CLIENT_UPDATED' : 'CLIENT_CREATED';
            let oldData: any = {};

            if (data.id) {
                const { data: existingClient } = await supabase.from('organizations').select('*').eq('id', data.id).single();
                oldData = existingClient || {};
                query = supabase.from('organizations').update(payload).eq('id', data.id);
            } else {
                query = supabase.from('organizations').insert(payload);
            }

            const { data: client, error } = await query.select().single();
            if (error) throw error;
            
            // Fix: Ensure all 7 arguments are passed to _logAction
            await _logAction(user, actionType, client.name, 'DATA', 'INFO', 'SUCCESS', { 
                clientId: client.id, new: payload, old: oldData,
                qualityAnalystId: client.quality_analyst_id, // Adiciona ao log
                qualityAnalystName: data.qualityAnalystName // Adiciona ao log
            });

            return {
                id: client.id,
                name: client.name,
                cnpj: client.cnpj,
                status: client.status as any,
                contractDate: client.contract_date,
                pendingDocs: 0,
                complianceScore: 100,
                lastAnalysisDate: undefined,
                qualityAnalystId: client.quality_analyst_id, // Retorna o ID do analista
                qualityAnalystName: data.qualityAnalystName // Retorna o nome do analista
            };
        } catch (e: any) {
            // Fix: Ensure all 7 arguments are passed to _logAction
            await _logAction(user, data.id ? 'CLIENT_UPDATED' : 'CLIENT_CREATED', data.name || 'New Client', 'DATA', 'ERROR', 'FAILURE', { clientId: data.id, reason: e.message });
            throw e;
        }
    },

    deleteClient: async (user, id) => {
        if (user.role !== UserRole.ADMIN) {
            // Fix: Ensure all 7 arguments are passed to _logAction
            await _logAction(user, 'CLIENT_DELETE', `ID: ${id}`, 'SECURITY', 'CRITICAL', 'FAILURE', { reason: "Permission denied" });
            throw new Error("Apenas administradores podem excluir organizações.");
        }
        let clientName = `ID: ${id}`;
        let qualityAnalystId: string | undefined = undefined;
        try {
            const { data: clientData } = await supabase.from('organizations').select('name, quality_analyst_id').eq('id', id).single();
            if (clientData) {
                clientName = clientData.name;
                qualityAnalystId = clientData.quality_analyst_id;
            }

            const { error } = await supabase.from('organizations').delete().eq('id', id);
            if (error) throw error;

            // Fix: Ensure all 7 arguments are passed to _logAction
            await _logAction(user, 'CLIENT_DELETE', clientName, 'DATA', 'INFO', 'SUCCESS', { 
                clientId: id, 
                qualityAnalystId // Adiciona ao log
            });
        } catch (e: any) {
            // Fix: Ensure all 7 arguments are passed to _logAction
            await _logAction(user, 'CLIENT_DELETE', clientName, 'DATA', 'ERROR', 'FAILURE', { clientId: id, reason: e.message });
            throw e;
        }
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
            // Fix: Ensure all 7 arguments are passed to _logAction
            await _logAction(user, 'MAINTENANCE_SCHEDULE', event.title || 'New Event', 'SYSTEM', 'CRITICAL', 'FAILURE', { reason: "Permission denied" });
            throw new Error("Ação exclusiva para administradores.");
        }
        try {
            const { data, error } = await supabase.from('maintenance_events').insert({
                title: event.title,
                scheduled_date: event.scheduledDate, // Usar scheduledDate diretamente
                duration_minutes: event.durationMinutes,
                description: event.description,
                status: 'SCHEDULED', // Definir status como SCHEDULED
                created_by: user.id
            }).select().single();
            if (error) throw error;
            // Fix: Ensure all 7 arguments are passed to _logAction
            await _logAction(user, 'MAINTENANCE_SCHEDULE', data.title, 'SYSTEM', 'WARNING', 'SUCCESS', { eventId: data.id, scheduledDate: data.scheduled_date });
            return {
                id: data.id,
                title: data.title,
                scheduledDate: data.scheduled_date,
                durationMinutes: data.duration_minutes,
                description: data.description,
                status: data.status,
                createdBy: data.created_by
            } as MaintenanceEvent;
        } catch (e: any) {
            // Fix: Ensure all 7 arguments are passed to _logAction
            await _logAction(user, 'MAINTENANCE_SCHEDULE', event.title || 'New Event', 'SYSTEM', 'CRITICAL', 'FAILURE', { reason: e.message });
            throw e;
        }
    },

    cancelMaintenance: async (user, id) => {
        if (user.role !== UserRole.ADMIN) {
            // Fix: Ensure all 7 arguments are passed to _logAction
            await _logAction(user, 'MAINTENANCE_CANCEL', `ID: ${id}`, 'SYSTEM', 'CRITICAL', 'FAILURE', { reason: "Permission denied" });
            throw new Error("Ação exclusiva para administradores.");
        }
        try {
            await supabase.from('maintenance_events').update({ status: 'CANCELLED' }).eq('id', id);
            // Fix: Ensure all 7 arguments are passed to _logAction
            await _logAction(user, 'MAINTENANCE_CANCEL', `ID: ${id}`, 'SYSTEM', 'WARNING', 'SUCCESS', { eventId: id });
        } catch (e: any) {
            // Fix: Ensure all 7 arguments are passed to _logAction
            await _logAction(user, 'MAINTENANCE_CANCEL', `ID: ${id}`, 'SYSTEM', 'CRITICAL', 'FAILURE', { reason: e.message });
            throw e;
        }
    },
};