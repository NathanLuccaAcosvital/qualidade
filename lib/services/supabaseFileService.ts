

import { supabase } from '../supabaseClient.ts';
import { User, UserRole } from '../../types/auth.ts';
import { FileNode, FileType, LibraryFilters, BreadcrumbItem, normalizeRole } from '../../types/index.ts';
import { QualityStatus } from '../../types/metallurgy.ts';
import { logAction as internalLogAction } from './loggingService.ts';
import { IFileService, PaginatedResponse, DashboardStatsData } from './interfaces.ts';
// import { config } from '../config.ts'; // Removido

const STORAGE_BUCKET = 'certificates';
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

/**
 * Mapper: DB Row -> Domain FileNode
 */
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

export const SupabaseFileService: IFileService = {
  getFiles: async (user, folderId, page = 1, pageSize = 50): Promise<PaginatedResponse<FileNode>> => {
    let query = supabase.from('files').select('*', { count: 'exact' });

    const role = normalizeRole(user.role);

    // Restrição de Segurança: Clientes só veem o que é deles e está aprovado
    if (role === UserRole.CLIENT) {
      if (user.organizationId) {
        query = query.eq('owner_id', user.organizationId);
      } else {
        // Se cliente não tem org vinculada, não vê nada por segurança
        return { items: [], total: 0, hasMore: false };
      }
      
      // Filtra apenas por APPROVED se for arquivo (folders não tem status em metadata geralmente, ou tratamos via owner_id)
      // Nota: No Supabase JSONB filtering
      query = query.or(`type.eq.FOLDER,metadata->>status.eq.${QualityStatus.APPROVED}`);
    }

    if (folderId) {
      query = query.eq('parent_id', folderId);
    } else {
      query = query.is('parent_id', null);
    }

    const from = (page - 1) * pageSize;
    const { data, count, error } = await query
      .range(from, from + pageSize - 1)
      .order('type', { ascending: false })
      .order('name', { ascending: true });

    if (error) throw error;

    return {
      items: (data || []).map(toDomainFile),
      total: count || 0,
      hasMore: (count || 0) > from + pageSize
    };
  },

  getFilesByOwner: async (ownerId) => {
    const { data, error } = await supabase.from('files').select('*').eq('owner_id', ownerId);
    if (error) throw error;
    return (data || []).map(toDomainFile);
  },

  getRecentFiles: async (user, limit = 10) => {
    let query = supabase.from('files').select('*');
    
    const role = normalizeRole(user.role);
    if (role === UserRole.CLIENT && user.organizationId) {
        query = query.eq('owner_id', user.organizationId).eq('metadata->>status', QualityStatus.APPROVED);
    }

    const { data, error } = await query
        .limit(limit)
        .order('updated_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(toDomainFile);
  },

  getLibraryFiles: async (user, filters, page = 1, pageSize = 20) => {
    return SupabaseFileService.getFiles(user, null, page, pageSize);
  },

  getDashboardStats: async (user): Promise<DashboardStatsData> => {
    const role = normalizeRole(user.role);
    
    // 1. Query para arquivos APROVADOS
    let approvedQuery = supabase.from('files').select('*', { count: 'exact', head: true }).neq('type', 'FOLDER');
    if (role === UserRole.CLIENT && user.organizationId) {
        approvedQuery = approvedQuery.eq('owner_id', user.organizationId);
    }
    approvedQuery = approvedQuery.eq('metadata->>status', QualityStatus.APPROVED);

    // 2. Query para arquivos PENDENTES (lógica diferente para clientes)
    let pendingQueryPromise;
    if (role === UserRole.CLIENT) {
        // Clientes não veem a contagem de pendências técnicas internas diretamente
        pendingQueryPromise = Promise.resolve({ count: 0, data: null, error: null }); 
    } else {
        // Admin/Quality veem todas as pendências
        let basePendingQuery = supabase.from('files').select('*', { count: 'exact', head: true }).neq('type', 'FOLDER');
        pendingQueryPromise = basePendingQuery.eq('metadata->>status', QualityStatus.PENDING);
    }

    // Executa ambas as queries em paralelo
    const [totalApprovedRes, totalPendingRes] = await Promise.all([
      approvedQuery,
      pendingQueryPromise
    ]);
    
    // Extrai as contagens
    const totalApproved = totalApprovedRes.count || 0;
    const totalPending = totalPendingRes.count || 0;

    return {
        mainValue: totalApproved,
        subValue: totalApproved, 
        pendingValue: totalPending,
        status: totalPending > 0 ? 'PENDING' : 'REGULAR',
        mainLabel: role === UserRole.CLIENT ? 'Meus Certificados' : 'Certificados Globais',
        subLabel: role === UserRole.CLIENT ? 'Validados e Prontos' : 'Docs. Validados'
    };
  },

  createFolder: async (user, parentId, name, ownerId) => {
    const { data, error } = await supabase.from('files').insert({
        name,
        type: 'FOLDER',
        parent_id: parentId,
        owner_id: ownerId || null,
        storage_path: 'system/folder',
        updated_at: new Date().toISOString()
    }).select().single();
    
    if (error) throw error;
    return toDomainFile(data);
  },

  uploadFile: async (user, fileData, ownerId) => {
    // Validações de upload
    if (fileData.fileBlob && fileData.fileBlob.size > MAX_FILE_SIZE_BYTES) {
      throw new Error(`O arquivo é muito grande. Tamanho máximo: ${MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB.`);
    }
    // TODO: Adicionar checagem de mimeType do fileBlob vs ALLOWED_MIME_TYPES

    const { data, error } = await supabase.from('files').insert({
        name: fileData.name,
        type: fileData.type || 'PDF',
        parent_id: fileData.parentId,
        owner_id: ownerId,
        storage_path: fileData.storagePath,
        size: fileData.size,
        metadata: fileData.metadata || { status: QualityStatus.PENDING },
        uploaded_by: user.id,
        updated_at: new Date().toISOString()
    }).select().single();

    if (error) throw error;
    return toDomainFile(data);
  },

  updateFile: async (user, fileId, updates) => {
    const { error } = await supabase.from('files').update({
        name: updates.name,
        metadata: updates.metadata,
        parent_id: updates.parentId,
        updated_at: new Date().toISOString()
    }).eq('id', fileId);
    if (error) throw error;
  },

  deleteFile: async (user, fileId) => {
    const { error } = await supabase.from('files').delete().eq('id', fileId);
    if (error) throw error;
  },

  searchFiles: async (user, query, page = 1, pageSize = 20) => {
    const from = (page - 1) * pageSize;
    let baseQuery = supabase.from('files').select('*', { count: 'exact' }).ilike('name', `%${query}%`);
    
    const role = normalizeRole(user.role);
    if (role === UserRole.CLIENT && user.organizationId) {
        baseQuery = baseQuery.eq('owner_id', user.organizationId).or(`type.eq.FOLDER,metadata->>status.eq.${QualityStatus.APPROVED}`);
    }

    const { data, count, error } = await baseQuery
        .range(from, from + pageSize - 1);
    
    if (error) throw error;
    return {
        items: (data || []).map(toDomainFile),
        total: count || 0,
        hasMore: (count || 0) > from + pageSize
    };
  },

  getBreadcrumbs: async (folderId) => {
    if (!folderId) return [{ id: null, name: 'Home' }];
    const { data } = await supabase.from('files').select('id, name').eq('id', folderId).single();
    return [{ id: null, name: 'Home' }, { id: folderId, name: data?.name || 'Pasta' }];
  },

  toggleFavorite: async (user, fileId) => {
    const { data: existing } = await supabase.from('file_favorites').select('*').eq('user_id', user.id).eq('file_id', fileId).maybeSingle();
    
    if (existing) {
        await supabase.from('file_favorites').delete().eq('id', existing.id);
        return false;
    } else {
        await supabase.from('file_favorites').insert({ user_id: user.id, file_id: fileId });
        return true;
    }
  },

  getFavorites: async (user) => {
    const { data, error } = await supabase.from('file_favorites').select('files(*)').eq('user_id', user.id);
    if (error) throw error;
    
    const role = normalizeRole(user.role);
    let filteredData = (data || []).map(f => toDomainFile(f.files));
    
    if (role === UserRole.CLIENT) {
        filteredData = filteredData.filter(f => f.metadata?.status === QualityStatus.APPROVED);
    }
    
    return filteredData;
  },

  getFileSignedUrl: async (user, fileId): Promise<string> => {
    const { data: file, error } = await supabase.from('files').select('storage_path').eq('id', fileId).single();
    if (error || !file) throw new Error("Documento não encontrado.");

    const { data, error: storageError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(file.storage_path, 3600);

    if (storageError) throw storageError;
    return data.signedUrl;
  },

  logAction: async (user, action, target, category, severity, status, metadata) => {
    await internalLogAction(user, action, target, category, severity, status, metadata);
  },

  getAuditLogs: async (user) => {
    const { data, error } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100);
    if (error) throw error;
    return (data || []).map(l => ({
        id: l.id,
        timestamp: l.created_at,
        userId: l.user_id,
        userName: l.metadata?.userName || 'Sistema',
        userRole: l.metadata?.userRole || 'SYSTEM',
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

  getQualityAuditLogs: async (user, filters) => {
    let query = supabase.from('audit_logs').select('*').eq('category', 'DATA').order('created_at', { ascending: false });
    if (filters?.severity && filters.severity !== 'ALL') {
        query = query.eq('severity', filters.severity);
    }
    const { data, error } = await query.limit(100);
    if (error) throw error;
    return (data || []).map(l => ({
        id: l.id,
        timestamp: l.created_at,
        userId: l.user_id,
        userName: l.metadata?.userName || 'Sistema',
        userRole: l.metadata?.userRole || 'SYSTEM',
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
  }
};