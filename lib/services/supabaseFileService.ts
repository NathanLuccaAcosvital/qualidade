

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
  mimeType: row.mime_type, // Mapeado
  updatedAt: row.updated_at,
  ownerId: row.owner_id,
  storagePath: row.storage_path,
  isFavorite: !!row.is_favorite,
  metadata: row.metadata 
});

export const SupabaseFileService: IFileService = {
  getFiles: async (user, folderId, page = 1, pageSize = 50, searchTerm = ''): Promise<PaginatedResponse<FileNode>> => {
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
      query = query.or(`type.eq.FOLDER,metadata->>status.eq.${QualityStatus.APPROVED}`);
    }

    if (folderId) {
      query = query.eq('parent_id', folderId);
    } else {
      query = query.is('parent_id', null);
    }

    if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
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
    
    // Função auxiliar para gerar a query base sempre limpa
    const getBaseQuery = () => {
      let query = supabase.from('files').select('*', { count: 'exact', head: true }).neq('type', 'FOLDER');
      
      if (role === UserRole.CLIENT && user.organizationId) {
          query = query.eq('owner_id', user.organizationId);
      }
      return query;
    };

    const [totalApproved, totalPending] = await Promise.all([
      // Chama a função para pegar uma nova query e aplica o filtro específico
      getBaseQuery().eq('metadata->>status', QualityStatus.APPROVED),
      
      role === UserRole.CLIENT 
        ? { count: 0 } 
        : getBaseQuery().eq('metadata->>status', QualityStatus.PENDING)
    ]);
    
    return {
        mainValue: totalApproved.count || 0,
        subValue: totalApproved.count || 0,
        pendingValue: totalPending.count || 0, // Ajuste aqui pois 'totalPending' pode ser o objeto { count: 0 }
        status: (totalPending.count || 0) > 0 ? 'PENDING' : 'REGULAR',
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
        storage_path: 'system/folder', // Pastas não têm um arquivo físico no storage, só metadados
        updated_at: new Date().toISOString(),
        mime_type: 'folder' // Tipo MIME para pastas
    }).select().single();
    
    if (error) throw error;
    return toDomainFile(data);
  },

  uploadFile: async (user, fileData, ownerId) => {
    // Validações de upload
    if (!fileData.fileBlob) {
        throw new Error("Blob do arquivo não fornecido.");
    }
    if (fileData.fileBlob.size > MAX_FILE_SIZE_BYTES) {
      throw new Error(`O arquivo é muito grande. Tamanho máximo: ${MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB.`);
    }
    if (!ALLOWED_MIME_TYPES.includes(fileData.fileBlob.type)) {
        throw new Error(`Tipo de arquivo não permitido: ${fileData.fileBlob.type}. Tipos aceitos: ${ALLOWED_MIME_TYPES.join(', ')}.`);
    }

    // Gerar um caminho único no storage
    const filePath = `${ownerId}/${fileData.parentId || 'root'}/${crypto.randomUUID()}-${fileData.name}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, fileData.fileBlob, {
            contentType: fileData.fileBlob.type,
            upsert: false
        });

    if (uploadError) throw uploadError;

    const { data, error } = await supabase.from('files').insert({
        name: fileData.name,
        type: fileData.type || (fileData.fileBlob.type.startsWith('image/') ? 'IMAGE' : 'PDF'),
        parent_id: fileData.parentId,
        owner_id: ownerId,
        storage_path: uploadData.path, // Caminho real no Supabase Storage
        size: `${(fileData.fileBlob.size / 1024 / 1024).toFixed(2)} MB`,
        mime_type: fileData.fileBlob.type, // Salva o tipo MIME
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

  renameFile: async (user, fileId, newName) => {
    const { error } = await supabase.from('files').update({
      name: newName,
      updated_at: new Date().toISOString()
    }).eq('id', fileId);
    if (error) throw error;
  },

  // Fix: Updated deleteFile to accept an array of IDs
  deleteFile: async (user, fileIds: string[]) => {
    // Primeiro, recuperar os caminhos dos arquivos no storage para deletar
    const { data: filesToDelete, error: fetchError } = await supabase.from('files').select('id, storage_path, type').in('id', fileIds);
    if (fetchError) throw fetchError;

    const storagePaths: string[] = [];
    const fileNodeIdsToDelete: string[] = [];

    for (const file of filesToDelete || []) {
        fileNodeIdsToDelete.push(file.id);
        if (file.type !== 'FOLDER' && file.storage_path && file.storage_path !== 'system/folder') {
            storagePaths.push(file.storage_path);
        }
        // Para pastas, também precisamos deletar seus filhos recursivamente
        // Nota: Esta é uma exclusão em profundidade. Se a intenção é apenas excluir a pasta e seus conteúdos diretos,
        // mas não subpastas e seus conteúdos, a lógica precisaria ser adaptada.
        // Por enquanto, vamos manter a exclusão de filhos diretos apenas.
        if (file.type === 'FOLDER') {
            const { data: childFiles, error: childError } = await supabase.from('files').select('id, storage_path, type').eq('parent_id', file.id);
            if (childError) throw childError;
            for (const child of childFiles || []) {
                fileNodeIdsToDelete.push(child.id);
                if (child.type !== 'FOLDER' && child.storage_path && child.storage_path !== 'system/folder') {
                    storagePaths.push(child.storage_path);
                }
            }
        }
    }

    // Deletar do Storage
    if (storagePaths.length > 0) {
        const { error: deleteStorageError } = await supabase.storage.from(STORAGE_BUCKET).remove(storagePaths);
        if (deleteStorageError) throw deleteStorageError;
    }

    // Deletar do banco de dados (tabela 'files')
    const { error: deleteDbError } = await supabase.from('files').delete().in('id', fileNodeIdsToDelete);
    if (deleteDbError) throw deleteDbError;
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

  getBreadcrumbs: async (currentFolderId: string | null): Promise<BreadcrumbItem[]> => {
    const breadcrumbs: BreadcrumbItem[] = [{ id: null, name: 'Início' }];
    let folderId = currentFolderId;

    while (folderId) {
      const { data, error } = await supabase
        .from('files')
        .select('id, name, parent_id, owner_id') // Include owner_id to check access
        .eq('id', folderId)
        .single();

      if (error || !data) break;

      // Security check: ensure the user has access to this folder (e.g., it's within their organization)
      // This is a basic check; a more robust ACL would be needed for complex scenarios.
      // For now, assuming if it's in their path, they should see it.
      
      breadcrumbs.unshift({ id: data.id, name: data.name }); // Adiciona ao início
      folderId = data.parent_id;
    }
    return breadcrumbs;
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
    const { data: file, error } = await supabase.from('files').select('storage_path, owner_id, metadata').eq('id', fileId).single();
    if (error || !file) throw new Error("Documento não encontrado.");

    const role = normalizeRole(user.role);
    // Client-side check for security: ensure client can only access their own approved files
    if (role === UserRole.CLIENT) {
      if (file.owner_id !== user.organizationId) {
        throw new Error("Acesso negado: Este documento não pertence à sua organização.");
      }
      if (file.metadata?.status !== QualityStatus.APPROVED) {
        throw new Error("Acesso negado: Este documento não foi aprovado.");
      }
    }


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