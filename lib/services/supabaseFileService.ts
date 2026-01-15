
import { supabase } from '../supabaseClient.ts';
import { FileNode, FileType, BreadcrumbItem, normalizeRole, UserRole } from '../../types/index.ts';
import { QualityStatus } from '../../types/metallurgy.ts';
import { logAction as internalLogAction } from './loggingService.ts';
import { IFileService, PaginatedResponse, DashboardStatsData } from './interfaces.ts';

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
  mimeType: row.mime_type,
  updatedAt: row.updated_at,
  ownerId: row.owner_id,
  storagePath: row.storage_path,
  isFavorite: !!row.is_favorite,
  metadata: row.metadata 
});

export const SupabaseFileService: IFileService = {
  getFiles: async (user, folderId, page = 1, pageSize = 50, searchTerm = ''): Promise<PaginatedResponse<FileNode>> => {
    // RLS (Row Level Security) no Supabase já filtra por organização automaticamente.
    let query = supabase.from('files').select('*', { count: 'exact' });

    const role = normalizeRole(user.role);

    // Regra de Negócio: Clientes só devem ver arquivos APROVADOS (além de serem da sua org, garantido pelo RLS)
    // Pastas (FOLDER) são estruturais e permitidas.
    if (role === UserRole.CLIENT) {
       query = query.or(`type.eq.FOLDER,metadata->>status.eq.${QualityStatus.APPROVED}`);
    }

    // Filtros de Navegação
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
      .order('type', { ascending: false }) // Pastas primeiro
      .order('name', { ascending: true });

    if (error) throw error;

    return {
      items: (data || []).map(toDomainFile),
      total: count || 0,
      hasMore: (count || 0) > from + pageSize
    };
  },

  getFilesByOwner: async (ownerId) => {
    // Apenas busca, o RLS impedirá acesso se o user não tiver permissão sobre esse ownerId
    const { data, error } = await supabase.from('files').select('*').eq('owner_id', ownerId);
    if (error) throw error;
    return (data || []).map(toDomainFile);
  },

  getRecentFiles: async (user, limit = 10) => {
    let query = supabase.from('files').select('*');
    
    const role = normalizeRole(user.role);
    // Regra de Negócio: Clientes só veem aprovados
    if (role === UserRole.CLIENT) {
        query = query.eq('metadata->>status', QualityStatus.APPROVED);
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
    
    // Query base limpa - O RLS filtra a Org.
    const getBaseQuery = () => supabase.from('files').select('*', { count: 'exact', head: true }).neq('type', 'FOLDER');

    const [totalApproved, totalPending] = await Promise.all([
      getBaseQuery().eq('metadata->>status', QualityStatus.APPROVED),
      
      // Para clientes, forçamos 0 pendentes na visualização para não confundir, 
      // embora o RLS já possa estar ocultando-os se configurado estritamente.
      role === UserRole.CLIENT 
        ? { count: 0 } 
        : getBaseQuery().eq('metadata->>status', QualityStatus.PENDING)
    ]);
    
    return {
        mainValue: totalApproved.count || 0,
        subValue: totalApproved.count || 0,
        pendingValue: totalPending.count || 0,
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
        storage_path: 'system/folder',
        updated_at: new Date().toISOString(),
        mime_type: 'folder'
    }).select().single();
    
    if (error) throw error;
    return toDomainFile(data);
  },

  uploadFile: async (user, fileData, ownerId) => {
    if (!fileData.fileBlob) throw new Error("Blob do arquivo não fornecido.");
    
    if (fileData.fileBlob.size > MAX_FILE_SIZE_BYTES) {
      throw new Error(`O arquivo é muito grande. Tamanho máximo: ${MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB.`);
    }
    if (!ALLOWED_MIME_TYPES.includes(fileData.fileBlob.type)) {
        throw new Error(`Tipo de arquivo não permitido. Tipos aceitos: ${ALLOWED_MIME_TYPES.join(', ')}.`);
    }

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
        storage_path: uploadData.path,
        size: `${(fileData.fileBlob.size / 1024 / 1024).toFixed(2)} MB`,
        mime_type: fileData.fileBlob.type,
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

  deleteFile: async (user, fileIds: string[]) => {
    const { data: filesToDelete, error: fetchError } = await supabase.from('files').select('id, storage_path, type').in('id', fileIds);
    if (fetchError) throw fetchError;

    const storagePaths: string[] = [];
    const fileNodeIdsToDelete: string[] = [];

    // Lógica recursiva simples para identificar arquivos a deletar
    const collectPaths = async (files: any[]) => {
        for (const file of files) {
            fileNodeIdsToDelete.push(file.id);
            if (file.type !== 'FOLDER' && file.storage_path && file.storage_path !== 'system/folder') {
                storagePaths.push(file.storage_path);
            }
            if (file.type === 'FOLDER') {
                const { data: children } = await supabase.from('files').select('id, storage_path, type').eq('parent_id', file.id);
                if (children && children.length > 0) {
                    await collectPaths(children);
                }
            }
        }
    };

    await collectPaths(filesToDelete || []);

    if (storagePaths.length > 0) {
        const { error: deleteStorageError } = await supabase.storage.from(STORAGE_BUCKET).remove(storagePaths);
        if (deleteStorageError) throw deleteStorageError;
    }

    if (fileNodeIdsToDelete.length > 0) {
        const { error: deleteDbError } = await supabase.from('files').delete().in('id', fileNodeIdsToDelete);
        if (deleteDbError) throw deleteDbError;
    }
  },

  searchFiles: async (user, queryStr, page = 1, pageSize = 20) => {
    const from = (page - 1) * pageSize;
    let baseQuery = supabase.from('files').select('*', { count: 'exact' }).ilike('name', `%${queryStr}%`);
    
    const role = normalizeRole(user.role);
    // Regra de Negócio: Cliente só vê aprovado
    if (role === UserRole.CLIENT) {
        baseQuery = baseQuery.or(`type.eq.FOLDER,metadata->>status.eq.${QualityStatus.APPROVED}`);
    }

    const { data, count, error } = await baseQuery.range(from, from + pageSize - 1);
    
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

    // Proteção contra loop infinito e verificação de acesso via RLS a cada passo
    while (folderId) {
      const { data, error } = await supabase
        .from('files')
        .select('id, name, parent_id')
        .eq('id', folderId)
        .single();

      if (error || !data) break;
      
      breadcrumbs.unshift({ id: data.id, name: data.name });
      folderId = data.parent_id;
    }
    return breadcrumbs;
  },

  // Removed toggleFavorite: async (user, fileId) => { ... }

  // Removed getFavorites: async (user) => { ... }

  getFileSignedUrl: async (user, fileId): Promise<string> => {
    // RLS garantirá que só encontramos o arquivo se pertencermos à org correta
    const { data: file, error } = await supabase.from('files').select('storage_path, metadata').eq('id', fileId).single();
    
    if (error || !file) throw new Error("Documento não encontrado ou acesso negado.");

    const role = normalizeRole(user.role);
    // Regra de Negócio: Cliente só baixa se aprovado
    if (role === UserRole.CLIENT) {
      if (file.metadata?.status !== QualityStatus.APPROVED) {
        throw new Error("Acesso negado: Este documento ainda não foi aprovado pela Qualidade.");
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
    // Logs geralmente precisam de RLS próprio ou serem restritos apenas a ADMIN
    const { data, error } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100);
    if (error) throw error;
    return data.map(l => mapLog(l));
  },

  getQualityAuditLogs: async (user, filters) => {
    let query = supabase.from('audit_logs').select('*').eq('category', 'DATA').order('created_at', { ascending: false });
    if (filters?.severity && filters.severity !== 'ALL') {
        query = query.eq('severity', filters.severity);
    }
    const { data, error } = await query.limit(100);
    if (error) throw error;
    return (data || []).map(l => mapLog(l));
  }
};

// Helper para mapear logs e evitar duplicação de código
const mapLog = (l: any) => ({
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
});