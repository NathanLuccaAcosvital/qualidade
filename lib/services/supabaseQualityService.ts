
import { IQualityService, PaginatedResponse } from './interfaces.ts';
import { supabase } from '../supabaseClient.ts';
import { QualityStatus, FileNode, ClientOrganization, AuditLog, User, FileType } from '../../types/index.ts';

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

export const SupabaseQualityService: IQualityService = {
  getManagedPortfolio: async (_analystId) => {
    // QUALITY agora vê todas as organizações para supervisão global
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .order('name');
      
    if (error) throw error;
    return data.map(org => ({
      id: org.id,
      name: org.name,
      cnpj: org.cnpj,
      status: org.status,
      contractDate: org.contract_date,
      qualityAnalystId: org.quality_analyst_id
    }));
  },

  getPendingInspections: async (_analystId) => {
    // Busca pendências de todas as organizações
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('metadata->>status', QualityStatus.PENDING)
      .neq('type', 'FOLDER');
    
    if (error) throw error;
    return (data || []).map(toDomainFile);
  },

  submitTechnicalVeredict: async (analystId, fileId, status, metadata) => {
    const { error } = await supabase
      .from('files')
      .update({
        metadata: {
          ...metadata,
          status,
          inspectedAt: new Date().toISOString(),
          inspectedBy: analystId
        }
      })
      .eq('id', fileId);
    
    if (error) throw error;
  },

  getTechnicalAuditLogs: async (analystId, filters) => {
    let query = supabase
      .from('audit_logs')
      .select('*');

    // Se for um analista vendo seus próprios logs ou global se for admin (ajustável)
    if (analystId) query = query.eq('user_id', analystId);

    if (filters?.search) {
      query = query.or(`action.ilike.%${filters.search}%,target.ilike.%${filters.search}%`);
    }

    if (filters?.severity && filters.severity !== 'ALL') {
      query = query.eq('severity', filters.severity);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(100);

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
      ip: l.ip,
      location: l.location,
      userAgent: l.user_agent,
      device: l.device,
      metadata: l.metadata,
      requestId: l.request_id
    }));
  },

  getPortfolioFileExplorer: async (_analystId, folderId) => {
    let query = supabase.from('files').select('*', { count: 'exact' });
    
    if (folderId) query = query.eq('parent_id', folderId);
    else query = query.is('parent_id', null);

    const { data, count, error } = await query.order('name');
    if (error) throw error;

    return {
      items: (data || []).map(toDomainFile),
      total: count || 0,
      hasMore: false
    };
  },

  getManagedClients: async (_analystId, filters, page = 1) => {
    // QUALITY agora vê todos os clientes na listagem
    let query = supabase
      .from('organizations')
      .select('*', { count: 'exact' });

    if (filters.search) query = query.ilike('name', `%${filters.search}%`);
    if (filters.status && filters.status !== 'ALL') query = query.eq('status', filters.status);

    const pageSize = 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, count, error } = await query.range(from, to).order('name');
    if (error) throw error;

    return {
      items: (data || []).map(org => ({
        id: org.id,
        name: org.name,
        cnpj: org.cnpj,
        status: org.status,
        contractDate: org.contract_date,
        qualityAnalystId: org.quality_analyst_id
      })),
      total: count || 0,
      hasMore: (count || 0) > to + 1
    };
  },

  submitVeredict: async (user, file, status, reason) => {
    return await SupabaseQualityService.submitTechnicalVeredict(
      user.id, 
      file.id, 
      status, 
      { ...file.metadata, rejectionReason: reason }
    );
  }
};
