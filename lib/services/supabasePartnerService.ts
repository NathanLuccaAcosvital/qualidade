
import { IPartnerService, PaginatedResponse, DashboardStatsData } from './interfaces.ts';
import { supabase } from '../supabaseClient.ts';
import { FileNode, QualityStatus, FileType, User } from '../../types/index.ts';
import { logAction } from './loggingService.ts';

const toDomainFile = (row: any): FileNode => ({
  id: row.id,
  parentId: row.parent_id,
  name: row.name,
  type: row.type as FileType,
  size: row.size,
  updatedAt: row.updated_at,
  ownerId: row.owner_id,
  storagePath: row.storage_path,
  isFavorite: !!row.is_favorite,
  metadata: row.metadata 
});

export const SupabasePartnerService: IPartnerService = {
  getCertificates: async (orgId, folderId, search) => {
    let query = supabase
      .from('files')
      .select('*', { count: 'exact' })
      .eq('owner_id', orgId);

    if (folderId) query = query.eq('parent_id', folderId);
    else query = query.is('parent_id', null);

    if (search) query = query.ilike('name', `%${search}%`);

    const { data, count, error } = await query.order('name');
    if (error) throw error;

    return {
      items: (data || []).map(toDomainFile),
      total: count || 0,
      hasMore: false
    };
  },

  getComplianceOverview: async (orgId) => {
    const { data: files, error } = await supabase
      .from('files')
      .select('metadata')
      .eq('owner_id', orgId)
      .neq('type', 'FOLDER');

    if (error) throw error;

    const approvedCount = files?.filter(f => f.metadata?.status === QualityStatus.APPROVED).length || 0;
    const rejectedCount = files?.filter(f => f.metadata?.status === QualityStatus.REJECTED).length || 0;
    
    // DOCUMENTOS NOVOS: Aprovados mas ainda não visualizados pelo cliente
    const unviewedCount = files?.filter(f => 
        f.metadata?.status === QualityStatus.APPROVED && !f.metadata?.viewedAt
    ).length || 0;

    return {
      approvedCount,
      rejectedCount,
      unviewedCount,
      lastAnalysis: new Date().toISOString()
    } as any;
  },

  getRecentActivity: async (orgId) => {
    // Garantindo que APENAS arquivos apareçam (exclui pastas da timeline)
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('owner_id', orgId)
      .neq('type', 'FOLDER')
      .order('updated_at', { ascending: false })
      .limit(5);
    if (error) throw error;
    return (data || []).map(toDomainFile);
  },

  getPartnerDashboardStats: async (orgId): Promise<DashboardStatsData> => {
    const { data: files, error } = await supabase
      .from('files')
      .select('metadata')
      .eq('owner_id', orgId)
      .neq('type', 'FOLDER');

    if (error) throw error;

    const total = files?.length || 0;
    const approved = files?.filter(f => f.metadata?.status === QualityStatus.APPROVED).length || 0;
    const rejected = files?.filter(f => f.metadata?.status === QualityStatus.REJECTED).length || 0;
    const unviewed = files?.filter(f => f.metadata?.status === QualityStatus.APPROVED && !f.metadata?.viewedAt).length || 0;

    // Ação Requerida = Itens que precisam de atenção do cliente (Novos + Contestados)
    const totalActions = rejected + unviewed;

    return {
      mainValue: total,
      subValue: approved,
      pendingValue: totalActions,
      unviewedCount: unviewed,
      rejectedCount: rejected,
      status: totalActions > 0 ? 'CRITICAL' : 'REGULAR',
      mainLabel: 'Certificados Recebidos',
      subLabel: 'Aprovados em Compliance',
      lastAnalysis: new Date().toISOString()
    };
  },

  logFileView: async (user: User, file: FileNode) => {
    if (file.metadata?.viewedAt) return;

    const updatedMetadata = {
      ...file.metadata,
      viewedAt: new Date().toISOString(),
      viewedBy: user.name
    };

    const { error } = await supabase.from('files').update({ metadata: updatedMetadata }).eq('id', file.id);
    if (error) return;
    
    await logAction(user, 'FILE_VIEWED_BY_CLIENT', file.name, 'DATA', 'INFO', 'SUCCESS', { 
      fileId: file.id,
      orgId: user.organizationId
    });
  },

  submitClientFeedback: async (user: User, file: FileNode, status: QualityStatus, observations?: string, flags?: string[], annotations?: any[]) => {
    const updatedMetadata = {
      ...file.metadata,
      status,
      clientObservations: observations,
      clientFlags: flags,
      lastClientInteractionAt: new Date().toISOString(),
      lastClientInteractionBy: user.name
    };

    const { error: fileUpdateError } = await supabase.from('files').update({ metadata: updatedMetadata }).eq('id', file.id);
    if (fileUpdateError) throw fileUpdateError;

    const { error: reviewError } = await supabase.from('file_reviews').insert({
      file_id: file.id,
      author_id: user.id,
      status: status,
      annotations: {
        drawings: annotations || [],
        flags: flags || [],
        observations: observations || "",
        client_name: user.name,
        timestamp: new Date().toISOString()
      }
    });

    if (reviewError) console.error("Falha ao registrar revisão detalhada:", reviewError);

    const actionName = status === QualityStatus.APPROVED ? 'CLIENT_APPROVED_FILE' : 
                       status === QualityStatus.REJECTED ? 'CLIENT_REJECTED_FILE' : 'CLIENT_MARKED_TO_DELETE';

    await logAction(user, actionName, file.name, 'DATA', status === QualityStatus.REJECTED ? 'WARNING' : 'INFO', 'SUCCESS', {
        review_id: !reviewError ? "ok" : "fail"
    });
  }
};
