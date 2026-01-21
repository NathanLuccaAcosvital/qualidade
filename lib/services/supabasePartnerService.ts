import { IPartnerService, DashboardStatsData } from './interfaces.ts';
import { supabase } from '../supabaseClient.ts';
import { QualityStatus, User, UserRole } from '../../types/index.ts';
import { logAction } from './loggingService.ts';
import { toDomainFile } from '../mappers/fileMapper.ts';

export const SupabasePartnerService: IPartnerService = {
  getCertificates: async (orgId, folderId, search) => {
    if (!orgId) throw new Error("ID da Organização ausente no perfil do usuário.");

    let query = supabase
      .from('files')
      .select('*, profiles:uploaded_by(full_name)', { count: 'exact' })
      .eq('owner_id', orgId);

    if (search) {
      query = query.ilike('name', `%${search}%`);
    } else {
      if (folderId) {
        query = query.eq('parent_id', folderId);
      } else {
        query = query.is('parent_id', null);
      }
    }

    const { data, count, error } = await query
      .order('type', { ascending: true }) // FOLDER vem antes de PDF/IMAGE
      .order('name', { ascending: true });

    if (error) {
      console.error("Erro Supabase getCertificates:", error.message);
      throw error;
    }

    return {
      items: (data || []).map(toDomainFile),
      total: count || 0,
      hasMore: false
    };
  },

  getComplianceOverview: async (orgId) => {
    if (!orgId) return { approvedCount: 0, rejectedCount: 0, unviewedCount: 0, lastAnalysis: new Date().toISOString() };

    const { data: stats, error } = await supabase
      .from('files')
      .select('metadata->>status, updated_at')
      .eq('owner_id', orgId)
      .neq('type', 'FOLDER');

    if (error) return { approvedCount: 0, rejectedCount: 0, unviewedCount: 0, lastAnalysis: new Date().toISOString() };

    const timestamps = stats.map(f => new Date(f.updated_at).getTime());
    const latest = timestamps.length > 0 ? Math.max(...timestamps) : Date.now();

    return {
      approvedCount: stats.filter(s => s.status === QualityStatus.APPROVED).length,
      rejectedCount: stats.filter(s => s.status === QualityStatus.REJECTED).length,
      unviewedCount: stats.filter(s => !s.viewedAt).length,
      lastAnalysis: new Date(latest).toISOString()
    } as any;
  },

  getRecentActivity: async (orgId) => {
    if (!orgId) return [];
    const { data, error } = await supabase
      .from('files')
      .select('*, profiles:uploaded_by(full_name)')
      .eq('owner_id', orgId)
      .neq('type', 'FOLDER')
      .order('updated_at', { ascending: false })
      .limit(5);
    
    return (data || []).map(toDomainFile);
  },

  getPartnerDashboardStats: async (orgId): Promise<DashboardStatsData> => {
    if (!orgId) {
      return { mainValue: 0, subValue: 0, pendingValue: 0, status: 'REGULAR', mainLabel: 'Certificados', subLabel: 'Aprovados' };
    }

    const { data, error } = await supabase
      .from('files')
      .select('id, type, metadata, updated_at')
      .eq('owner_id', orgId);

    if (error || !data) {
       return { mainValue: 0, subValue: 0, pendingValue: 0, status: 'REGULAR', mainLabel: 'Certificados', subLabel: 'Aprovados' };
    }

    const filesOnly = data.filter(f => f.type !== 'FOLDER');
    const approved = filesOnly.filter(f => f.metadata?.status === QualityStatus.APPROVED).length;
    const pending = filesOnly.filter(f => f.metadata?.status === QualityStatus.PENDING || !f.metadata?.status).length;
    
    // Calcula a última sincronização baseada no arquivo mais recente
    const timestamps = data.map(f => new Date(f.updated_at).getTime());
    const latestSync = timestamps.length > 0 ? Math.max(...timestamps) : Date.now();

    return {
      mainValue: filesOnly.length,
      subValue: approved,
      pendingValue: pending,
      status: pending > 0 ? 'PENDING' : 'REGULAR',
      mainLabel: 'Certificados Totais',
      subLabel: 'Validados',
      lastAnalysis: new Date(latestSync).toISOString()
    };
  },

  logFileView: async (user, file) => {
    if (user.role === UserRole.CLIENT) {
        try {
            const now = new Date().toISOString();
            const { data: currentFile } = await supabase.from('files').select('metadata').eq('id', file.id).single();
            
            const updatedMetadata = {
                ...(currentFile?.metadata || {}),
                viewedAt: now,
                lastClientInteractionAt: now,
                lastClientInteractionBy: user.name
            };

            await supabase.from('files')
                .update({ metadata: updatedMetadata })
                .eq('id', file.id);
        } catch (e) {
            console.error("Falha ao atualizar timestamp de visualização:", e);
        }
    }

    await logAction(user, 'CLIENT_FILE_VIEW', file.name, 'DATA', 'INFO', 'SUCCESS', { fileId: file.id });
  },

  submitClientFeedback: async (user, file, status, observations, flags, annotations) => {
    const { error } = await supabase.from('file_reviews').insert({
      file_id: file.id,
      author_id: user.id,
      status: status,
      annotations: {
        observations: observations || "",
        flags: flags || [],
        drawings: annotations || [],
        client_name: user.name,
        timestamp: new Date().toISOString()
      }
    });

    if (error) throw error;
    await logAction(user, `REVIEW_SUBMITTED_${status}`, file.name, 'DATA', 'INFO', 'SUCCESS');
  }
};