import { supabase } from '../supabaseClient.ts';
import { FileNode, FileType, BreadcrumbItem, AuditLog, User, UserRole } from '../../types/index.ts';
import { logAction as internalLogAction } from './loggingService.ts';
import { IFileService, PaginatedResponse, DashboardStatsData } from './interfaces.ts';

const STORAGE_BUCKET = 'certificates';

const sanitizeFilePathSegment = (segment: string): string => {
  return segment
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") 
    .replace(/\s+/g, '_')           
    .replace(/[^a-zA-Z0-9.\-_]/g, '') 
    .replace(/_{2,}/g, '_');        
};

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
  getRawFiles: async (folderId, page = 1, pageSize = 50, searchTerm = ''): Promise<PaginatedResponse<FileNode>> => {
    let query = supabase.from('files').select('*', { count: 'exact' });

    if (folderId) query = query.eq('parent_id', folderId);
    else query = query.is('parent_id', null);

    if (searchTerm) query = query.ilike('name', `%${searchTerm}%`);

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

  getFiles: async (user, folderId, page = 1, pageSize = 50, searchTerm = ''): Promise<PaginatedResponse<FileNode>> => {
    if (user.role === UserRole.CLIENT) {
        let query = supabase.from('files').select('*', { count: 'exact' }).eq('owner_id', user.organizationId);
        if (folderId) query = query.eq('parent_id', folderId);
        else query = query.is('parent_id', null);
        if (searchTerm) query = query.ilike('name', `%${searchTerm}%`);
        
        const from = (page - 1) * pageSize;
        const { data, count, error } = await query.range(from, from + pageSize - 1).order('type', { ascending: false }).order('name', { ascending: true });
        if (error) throw error;
        return { items: (data || []).map(toDomainFile), total: count || 0, hasMore: (count || 0) > from + pageSize };
    }
    
    return SupabaseFileService.getRawFiles(folderId, page, pageSize, searchTerm);
  },

  createFolder: async (user, parentId, name, ownerId) => {
    let resolvedOwnerId = ownerId || null;
    if (parentId) {
        const { data: parentFolder } = await supabase.from('files').select('owner_id').eq('id', parentId).single();
        if (parentFolder?.owner_id) resolvedOwnerId = parentFolder.owner_id;
    }

    const { data, error } = await supabase.from('files').insert({
        name,
        type: 'FOLDER',
        parent_id: parentId,
        owner_id: resolvedOwnerId,
        storage_path: 'system/folder',
        updated_at: new Date().toISOString()
    }).select().single();
    
    if (error) throw error;
    return toDomainFile(data);
  },

  uploadFile: async (user, fileData, ownerId) => {
    if (!fileData.fileBlob) throw new Error("Blob não fornecido.");
    
    let resolvedOwnerId = ownerId;
    if (fileData.parentId) {
        const { data: parentFolder } = await supabase.from('files').select('owner_id').eq('id', fileData.parentId).single();
        if (parentFolder?.owner_id) resolvedOwnerId = parentFolder.owner_id;
    }

    const sanitizedFileName = sanitizeFilePathSegment(fileData.name);
    const folderPath = fileData.parentId || 'root';
    const uniqueId = crypto.randomUUID();
    const filePath = `${resolvedOwnerId}/${folderPath}/${uniqueId}-${sanitizedFileName}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, fileData.fileBlob, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    const { data, error } = await supabase.from('files').insert({
        name: fileData.name, 
        type: fileData.type,
        parent_id: fileData.parentId,
        owner_id: resolvedOwnerId,
        storage_path: uploadData.path,
        size: `${(fileData.fileBlob.size / 1024 / 1024).toFixed(2)} MB`,
        metadata: fileData.metadata || { status: 'PENDING' },
        uploaded_by: user.id,
        updated_at: new Date().toISOString()
    }).select().single();

    if (error) {
      await supabase.storage.from(STORAGE_BUCKET).remove([filePath]);
      throw error;
    }

    return toDomainFile(data);
  },

  deleteFile: async (user, fileIds) => {
    return SupabaseFileService.deleteFiles(fileIds);
  },

  deleteFiles: async (fileIds) => {
    if (!fileIds || fileIds.length === 0) return;

    try {
        // 1. Buscar os caminhos de storage de todos os itens (e filhos se houver cascata manual necessária)
        // Para simplificar, focamos nos itens selecionados. Se for uma pasta, deletamos apenas o registro (o storage de pastas é virtual no DB)
        const { data: items, error: fetchError } = await supabase
            .from('files')
            .select('storage_path, type')
            .in('id', fileIds);

        if (fetchError) throw fetchError;

        const pathsToRemove = (items || [])
            .filter(item => item.type !== 'FOLDER' && item.storage_path && item.storage_path !== 'system/folder')
            .map(item => item.storage_path);

        // 2. Remover do Storage físico
        if (pathsToRemove.length > 0) {
            const { error: storageError } = await supabase.storage
                .from(STORAGE_BUCKET)
                .remove(pathsToRemove);
            
            if (storageError) {
                console.warn("[SupabaseFileService] Erro ao remover arquivos físicos, prosseguindo com limpeza do DB:", storageError.message);
            }
        }

        // 3. Remover registros do banco de dados
        const { error: dbError } = await supabase
            .from('files')
            .delete()
            .in('id', fileIds);

        if (dbError) throw dbError;

    } catch (error: any) {
        console.error("[SupabaseFileService] Falha crítica na exclusão:", error.message);
        throw new Error("Erro ao processar exclusão de recursos.");
    }
  },

  renameFile: async (user, fileId, newName) => {
    const { error } = await supabase.from('files').update({ name: newName, updated_at: new Date().toISOString() }).eq('id', fileId);
    if (error) throw error;
  },

  getBreadcrumbs: async (user, currentFolderId): Promise<BreadcrumbItem[]> => {
    const breadcrumbs: BreadcrumbItem[] = [];
    const isClient = user.role === UserRole.CLIENT;
    const companyName = user.organizationName || 'Organização';
    
    let folderId = currentFolderId;
    while (folderId) {
      const { data, error } = await supabase.from('files').select('id, name, parent_id, owner_id').eq('id', folderId).single();
      
      if (error || !data) break;

      const isCompanyRoot = isClient && data.owner_id === user.organizationId && data.parent_id === null;
      
      if (isCompanyRoot) {
          breadcrumbs.unshift({ id: data.id, name: 'Início' });
          breadcrumbs.unshift({ id: null, name: companyName }); 
          break;
      }

      breadcrumbs.unshift({ id: data.id, name: data.name });
      folderId = data.parent_id;
    }

    if (breadcrumbs.length === 0) {
        breadcrumbs.unshift({ id: null, name: companyName });
    }

    return breadcrumbs;
  },

  getSignedUrl: async (path): Promise<string> => {
    if (!path || path === 'system/folder') throw new Error("Recurso inválido para visualização.");
    const { data, error } = await supabase.storage.from(STORAGE_BUCKET).createSignedUrl(path, 3600);
    if (error) throw error;
    return data.signedUrl;
  },

  getFileSignedUrl: async (user, fileId) => {
    const { data, error } = await supabase.from('files').select('storage_path').eq('id', fileId).single();
    if (error || !data) throw new Error("Arquivo não encontrado.");
    return SupabaseFileService.getSignedUrl(data.storage_path);
  },

  getAuditLogs: async (user) => {
    const { data, error } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100);
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

  getDashboardStats: async (user): Promise<DashboardStatsData> => {
    const { count: totalCount } = await supabase.from('files').select('*', { count: 'exact', head: true }).eq('owner_id', user.organizationId).neq('type', 'FOLDER');
    const { count: pendingCount } = await supabase.from('files').select('*', { count: 'exact', head: true }).eq('owner_id', user.organizationId).eq('metadata->>status', 'PENDING');
    
    return {
      mainValue: totalCount || 0,
      subValue: (totalCount || 0) - (pendingCount || 0),
      pendingValue: pendingCount || 0,
      status: (pendingCount || 0) > 0 ? 'PENDING' : 'REGULAR',
      mainLabel: 'Documentos Totais',
      subLabel: 'Validados'
    };
  },

  uploadRaw: async (user, blob, name, path) => {
    const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, blob);
    if (error) throw error;
    return path;
  },

  deleteRaw: async (paths) => {
    const { error } = await supabase.storage.from(STORAGE_BUCKET).remove(paths);
    if (error) throw error;
  }
};