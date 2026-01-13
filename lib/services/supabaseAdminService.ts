import { IAdminService, AdminStatsData, PaginatedResponse } from './interfaces.ts';
import { supabase } from '../supabaseClient.ts';
import { SupportTicket, SystemStatus, ClientOrganization, UserRole } from '../../types.ts';
import { SupabaseNotificationService } from './supabaseNotificationService.ts'; // Import corrected
import { SupabaseUserService } from './supabaseUserService.ts'; // Import corrected

export const SupabaseAdminService: IAdminService = {
    getSystemStatus: async () => {
        try {
            const { data, error } = await supabase.from('system_settings').select('*').single();
            if (error || !data) return { mode: 'ONLINE' };
            return {
                mode: data.mode,
                message: data.message,
                scheduledStart: data.scheduled_start,
                scheduledEnd: data.scheduled_end
            };
        } catch (e) {
            return { mode: 'ONLINE' };
        }
    },

    updateSystemStatus: async (user, newStatus) => {
        if (user.role !== UserRole.ADMIN) throw new Error("Apenas administradores podem alterar o status do sistema.");

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
            message: newStatus.message,
            scheduledStart: newStatus.scheduledStart,
            scheduledEnd: newStatus.scheduledEnd
        } as SystemStatus;
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
                    scheduledEnd: s.scheduled_end
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
                openTickets: 0,
                logsLast24h: 0,
                systemHealthStatus: 'HEALTHY',
                ...simulatedInfra
            };
        }

        return {
            totalUsers: data.total_users,
            activeUsers: data.active_users,
            activeClients: data.active_clients,
            openTickets: data.open_tickets,
            logsLast24h: data.logs_last_24_h,
            systemHealthStatus: data.system_health_status as any,
            ...simulatedInfra
        };
    },

    getClients: async (filters, page = 1, pageSize = 20): Promise<PaginatedResponse<ClientOrganization>> => {
        console.log(`[SupabaseAdminService] getClients called with filters: ${JSON.stringify(filters)}, page: ${page}, pageSize: ${pageSize}`);
        
        let query = supabase
            .from('organizations')
            .select('*', { count: 'exact' });

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
        if (user.role !== UserRole.ADMIN) throw new Error("Permissão negada para gerenciar organizações.");

        const payload = {
            name: data.name,
            cnpj: data.cnpj,
            status: data.status,
            contract_date: data.contractDate,
            // pending_docs e compliance_score removidos daqui também
        };

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
            // Valores default ou null para campos não selecionados/salvos
            pendingDocs: 0, // Definido como 0 por padrão para novos/atualizados
            complianceScore: 100, // Definido como 100 por padrão
            lastAnalysisDate: undefined // Definido como undefined por padrão
        };
    },

    deleteClient: async (user, id) => {
        if (user.role !== UserRole.ADMIN) throw new Error("Apenas administradores podem excluir organizações.");
        const { error } = await supabase.from('organizations').delete().eq('id', id);
        if (error) throw error;
    },

    getTickets: async () => {
        const { data, error } = await supabase
            .from('tickets')
            .select(`
                *,
                profiles (full_name),
                organizations (name)
            `)
            .order('created_at', { ascending: false });
        
        if (error) throw error;

        return (data || []).map(t => ({
            id: t.id,
            flow: t.flow,
            userId: t.user_id,
            userName: t.profiles?.full_name || 'Usuário Desconhecido',
            clientId: t.organization_id,
            clientName: t.organizations?.name || 'N/A', // Add clientName
            subject: t.subject,
            description: t.description,
            priority: t.priority,
            status: (t.status as string).toUpperCase() as SupportTicket['status'], // Normalize status
            resolutionNote: t.resolution_note,
            createdAt: new Date(t.created_at).toLocaleString(),
            updatedAt: t.updated_at ? new Date(t.updated_at).toLocaleString() : undefined
        })) as any;
    },

    getMyTickets: async (user, filters) => {
        let query = supabase
            .from('tickets')
            .select('*')
            .eq('user_id', user.id);
        
        if (filters?.status && filters.status !== 'ALL') {
            // Usa toUpperCase() para garantir que a comparação do enum seja case-sensitive com o DB
            query = query.eq('status', filters.status.toUpperCase());
        }

        const { data, error } = await query.order('created_at', { ascending: false });
        
        if (error) throw error;
        return (data || []).map(t => ({ 
            ...t, 
            userName: user.name,
            status: (t.status as string).toUpperCase() as SupportTicket['status'], // Normalize status
            createdAt: new Date(t.created_at).toLocaleString() 
        })) as any;
    },

    getUserTickets: async (userId) => {
        const { data, error } = await supabase
            .from('tickets')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return (data || []).map(t => ({ 
            ...t, 
            status: (t.status as string).toUpperCase() as SupportTicket['status'], // Normalize status
            createdAt: new Date(t.created_at).toLocaleString() 
        })) as any;
    },

    getQualityInbox: async (filters?: { search?: string; status?: string }): Promise<SupportTicket[]> => {
        let query = supabase
            .from('tickets')
            .select(`
                *,
                profiles (full_name),
                organizations (name)
            `)
            .eq('flow', 'CLIENT_TO_QUALITY')
            .order('created_at', { ascending: false });
        
        if (filters?.search) {
            query = query.or(`subject.ilike.%${filters.search}%,description.ilike.%${filters.search}%,profiles.full_name.ilike.%${filters.search}%,organizations.name.ilike.%${filters.search}%`);
        }

        if (filters?.status && filters.status !== 'ALL') {
            // Usa toUpperCase() para garantir que a comparação do enum seja case-sensitive com o DB
            query = query.eq('status', filters.status.toUpperCase());
        }

        const { data, error } = await query;
        
        if (error) throw error;
        return (data || []).map(t => ({ 
            id: t.id,
            flow: t.flow,
            userId: t.user_id,
            userName: t.profiles?.full_name || 'N/A',
            clientId: t.organization_id,
            clientName: t.organizations?.name || 'N/A', // Adicionado nome da organização
            subject: t.subject,
            description: t.description,
            priority: t.priority,
            status: (t.status as string).toUpperCase() as SupportTicket['status'], // Normalize status
            resolutionNote: t.resolution_note,
            createdAt: new Date(t.created_at).toLocaleString(),
            updatedAt: t.updated_at ? new Date(t.updated_at).toLocaleString() : undefined
        })) as any;
    },

    getAdminInbox: async () => {
        const { data, error } = await supabase
            .from('tickets')
            .select(`
                *,
                profiles (full_name)
            `)
            .eq('flow', 'QUALITY_TO_ADMIN')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return (data || []).map(t => ({ 
            ...t, 
            userName: t.profiles?.full_name,
            status: (t.status as string).toUpperCase() as SupportTicket['status'], // Normalize status
            createdAt: new Date(t.created_at).toLocaleString() 
        })) as any;
    },

    createTicket: async (user, data) => {
        const flow = user.role === UserRole.QUALITY ? 'QUALITY_TO_ADMIN' : 'CLIENT_TO_QUALITY';
        
        const { data: ticket, error } = await supabase.from('tickets').insert({
            user_id: user.id,
            organization_id: user.clientId,
            subject: data.subject,
            description: data.description,
            priority: data.priority,
            status: 'OPEN', // Alterado para CAIXA ALTA
            flow
        }).select().single();
        
        if (error) throw error;
        return {
            ...ticket,
            userName: user.name,
            status: (ticket.status as string).toUpperCase() as SupportTicket['status'], // Normalize status
            createdAt: new Date(ticket.created_at).toLocaleString()
        } as any;
    },

    resolveTicket: async (user, id, status, note) => {
        if (user.role !== UserRole.ADMIN && user.role !== UserRole.QUALITY) {
            throw new Error("Permissão negada para resolver tickets.");
        }

        const { data: existingTicket, error: fetchError } = await supabase
            .from('tickets')
            .select('user_id, subject')
            .eq('id', id)
            .single();

        if (fetchError) throw fetchError;
        if (!existingTicket) throw new Error("Ticket não encontrado.");

        const { error } = await supabase
            .from('tickets')
            .update({ 
                status: status.toUpperCase(), // Converte para CAIXA ALTA
                resolution_note: note, 
                updated_at: new Date().toISOString() 
            })
            .eq('id', id);
        if (error) throw error;

        // Notify the client that their ticket has been resolved
        await SupabaseNotificationService.addNotification(
            existingTicket.user_id,
            `Chamado #${id.slice(-4)} Resolvido!`,
            `Seu chamado "${existingTicket.subject}" foi resolvido com sucesso pela equipe de Qualidade.`,
            'SUCCESS',
            '/dashboard?view=tickets'
        );
    },

    updateTicketStatus: async (user, id, status, resolutionNote?) => {
        if (user.role !== UserRole.ADMIN && user.role !== UserRole.QUALITY) {
            throw new Error("Permissão negada para atualizar tickets.");
        }

        const { error } = await supabase
            .from('tickets')
            .update({ 
                status: status.toUpperCase(), // Converte para CAIXA ALTA
                resolution_note: resolutionNote, // Optional resolution note
                updated_at: new Date().toISOString() 
            })
            .eq('id', id);
        if (error) throw error;
    },

    escalateTicketToAdmin: async (user, id, note) => {
        if (user.role !== UserRole.QUALITY) {
            throw new Error("Permissão negada. Apenas Analistas de Qualidade podem escalar tickets.");
        }

        const { data: existingTicket, error: fetchError } = await supabase
            .from('tickets')
            .select('user_id, subject, organization_id')
            .eq('id', id)
            .single();
        
        if (fetchError) throw fetchError;
        if (!existingTicket) throw new Error("Ticket não encontrado para escalonamento.");

        const { error } = await supabase
            .from('tickets')
            .update({
                flow: 'QUALITY_TO_ADMIN',
                status: 'OPEN', // Alterado para CAIXA ALTA
                updated_at: new Date().toISOString(),
                resolution_note: note || 'Escalado para administração.'
            })
            .eq('id', id);
        
        if (error) throw error;

        // Notify all administrators
        const adminUsers = await SupabaseUserService.getUsersByRole(UserRole.ADMIN);
        for (const admin of adminUsers) {
            await SupabaseNotificationService.addNotification(
                admin.id,
                `Chamado #${id.slice(-4)} Escalado!`,
                `Um chamado do cliente (${existingTicket.organization_id || 'N/A'}) "${existingTicket.subject}" foi escalado para sua revisão.`,
                'ALERT',
                '/admin?tab=tickets'
            );
        }

        // Also notify the original client about the escalation (optional, but good practice)
        await SupabaseNotificationService.addNotification(
            existingTicket.user_id,
            `Chamado #${id.slice(-4)} Em Revisão`,
            `Seu chamado "${existingTicket.subject}" foi escalado para a equipe de administração para revisão aprofundada.`,
            'INFO',
            '/dashboard?view=tickets'
        );
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
        return (data || []);
    },

    scheduleMaintenance: async (user, event) => {
        if (user.role !== UserRole.ADMIN) throw new Error("Ação exclusiva para administradores.");

        const { data, error } = await supabase.from('maintenance_events').insert({
            ...event,
            created_by: user.id
        }).select().single();
        if (error) throw error;
        return data as any;
    },

    cancelMaintenance: async (user, id) => {
        await supabase.from('maintenance_events').update({ status: 'CANCELLED' }).eq('id', id);
    },

    requestInfrastructureSupport: async (user, data) => {
        const { data: req, error } = await supabase.from('external_support_requests').insert({
            user_id: user.id,
            payload: data,
            status: 'PENDING'
        }).select().single();
        
        if (error) throw error;
        return req.id;
    }
};