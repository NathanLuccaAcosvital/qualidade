
import { supabase } from '../supabaseClient.ts';
import { FileNode, FileType, BreadcrumbItem, User, UserRole, FileFilters, SteelBatchMetadata } from '../../types/index.ts';
import { IFileService, PaginatedResponse, DashboardStatsData } from './interfaces.ts';
import { toDomainFile } from '../mappers/fileMapper.ts';

const STORAGE_BUCKET = 'certificates';

export const SupabaseFileService: IFileService = {
  getRawFiles: async (folderId, page = 1, pageSize = 50, searchTerm = '', ownerId, filters?: FileFilters): Promise<PaginatedResponse<FileNode>> => {
    // Usando a constraint explícita do schema para o perfil do autor
    let query = supabase.from('files').select('*, profiles!files_uploaded_by_fkey(full_name)', { count: 'exact' });

    if (ownerId && ownerId !== 'global') query = query.eq('owner_id', ownerId);
    
    if (!searchTerm) {
      if (folderId) query = query.eq('parent_id', folderId);
      else query = query.is('parent_id', null);
    } else {
      query = query.ilike('name', `%${searchTerm}%`);
    }

    if (filters?.type && filters.type !== 'ALL') query = query.eq('type', filters.type);

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, count, error } = await query
      .range(from, to)
      .order('type', { ascending: false }) 
      .order('name', { ascending: true });

    if (error) throw error;

    return {
      items: (data || []).map(toDomainFile),
      total: count || 0,
      hasMore: (count || 0) > to + 1
    };
  },

  getFiles: async (user, folderId, page = 1, pageSize = 50, searchTerm = '') => {
    const effectiveOwnerId = user.role === UserRole.CLIENT ? user.organizationId : undefined;
    return SupabaseFileService.getRawFiles(folderId, page, pageSize, searchTerm, effectiveOwnerId);
  },

  getFile: async (user, fileId) => {
    if (!fileId) throw new Error("Identificador de arquivo ausente.");

    // Correção das constraints: files_uploaded_by_fkey e files_owner_id_fkey conforme o schema SQL
    const { data, error } = await supabase
      .from('files')
      .select('*, profiles!files_uploaded_by_fkey(full_name), organizations!files_owner_id_fkey(name)')
      .eq('id', fileId)
      .maybeSingle();

    if (error) {
        console.error(`[SupabaseFileService] Erro na query getFile (${fileId}):`, error);
        throw new Error("Falha na comunicação com a base de dados industrial.");
    }

    if (!data) {
        console.warn(`[SupabaseFileService] Arquivo ${fileId} não localizado ou sem permissão.`);
        throw new Error("Ativo não localizado no Ledger.");
    }

    return toDomainFile(data);
  },

  createFolder: async (user, parentId, name, ownerId) => {
    const { data, error } = await supabase.from('files').insert({
        name,
        type: FileType.FOLDER,
        parent_id: parentId,
        owner_id: ownerId || null,
        storage_path: 'system/folder',
        updated_at: new Date().toISOString()
    }).select().single();
    
    if (error) throw error;
    return toDomainFile(data);
  },

  uploadFile: async (user, fileData, ownerId) => {
    if (!ownerId) throw new Error("Contexto organizacional ausente para o upload.");
    
    const uniqueId = crypto.randomUUID();
    const folderPath = fileData.parentId || 'root';
    
    const sanitizedFileName = fileData.name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9._-]/g, "");
    
    const filePath = `${ownerId}/${folderPath}/${uniqueId}-${sanitizedFileName}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, fileData.fileBlob);

    if (uploadError) throw uploadError;

    const { data, error } = await supabase.from('files').insert({
        name: fileData.name,
        type: fileData.type,
        parent_id: fileData.parentId,
        owner_id: ownerId,
        storage_path: uploadData.path,
        size: `${(fileData.fileBlob.size / 1024 / 1024).toFixed(2)} MB`,
        uploaded_by: user.id,
        updated_at: new Date().toISOString(),
        metadata: { status: 'PENDING' }
    }).select().single();

    if (error) throw error;
    return toDomainFile(data);
  },

  updateFileMetadata: async (fileId, metadata) => {
    const { data: currentFile } = await supabase.from('files').select('metadata').eq('id', fileId).single();
    const newMetadata = { ...(currentFile?.metadata || {}), ...metadata };
    
    const { error } = await supabase
      .from('files')
      .update({ 
        metadata: newMetadata,
        updated_at: new Date().toISOString() 
      })
      .eq('id', fileId);
      
    if (error) throw error;
  },

  deleteFile: async (user, fileIds) => {
    const { data: items } = await supabase.from('files').select('storage_path, type').in('id', fileIds);
    const physicalPaths = (items || [])
      .filter(i => i.type !== FileType.FOLDER && i.storage_path !== 'system/folder')
      .map(i => i.storage_path);

    if (physicalPaths.length > 0) {
      await supabase.storage.from(STORAGE_BUCKET).remove(physicalPaths);
    }

    const { error } = await supabase.from('files').delete().in('id', fileIds);
    if (error) throw error;
  },

  deleteFiles: async (ids) => SupabaseFileService.deleteFile(null as any, ids),

  renameFile: async (user, fileId, newName) => {
    const { error } = await supabase
      .from('files')
      .update({ name: newName, updated_at: new Date().toISOString() })
      .eq('id', fileId);
    if (error) throw error;
  },

  getBreadcrumbs: async (user, currentFolderId) => {
    const breadcrumbs: BreadcrumbItem[] = [];
    let folderId = currentFolderId;
    let depth = 0;
    while (folderId && depth < 8) {
      const { data, error } = await supabase.from('files').select('id, name, parent_id').eq('id', folderId).maybeSingle();
      if (error || !data) break;
      breadcrumbs.unshift({ id: data.id, name: data.name });
      folderId = data.parent_id;
      depth++;
    }
    const rootName = user.role === UserRole.CLIENT ? 'Meu Drive Vital' : 'Global Cloud';
    breadcrumbs.unshift({ id: null, name: rootName });
    return breadcrumbs;
  },

  getSignedUrl: async (path) => {
    if (!path || path === 'system/folder') return '';
    
    const { data, error } = await supabase.storage.from(STORAGE_BUCKET).createSignedUrl(path, 3600);
    
    if (error) {
        console.error(`[Supabase Storage] Erro ao assinar URL para ${path}:`, error);
        const { data: publicData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
        if (publicData?.publicUrl) return publicData.publicUrl;
        throw error;
    }
    
    return data.signedUrl;
  },

  getFileSignedUrl: async (user, fileId) => {
    const { data, error } = await supabase.from('files').select('storage_path').eq('id', fileId).single();
    if (error || !data) {
        console.error(`[SupabaseFileService] Ativo ${fileId} não localizado para assinatura.`);
        throw new Error("Arquivo não encontrado no registro industrial.");
    }
    return SupabaseFileService.getSignedUrl(data.storage_path);
  },

  getAuditLogs: async () => [], 
  
  getDashboardStats: async (user) => {
    const ownerId = user.role === UserRole.CLIENT ? user.organizationId : null;
    let query = supabase.from('files').select('metadata->>status', { count: 'exact' }).neq('type', 'FOLDER');
    if (ownerId) query = query.eq('owner_id', ownerId);
    
    const { data } = await query;
    const stats = data || [];

    return {
      mainValue: stats.length,
      subValue: stats.filter(s => s.status === 'APPROVED').length,
      pendingValue: stats.filter(s => s.status === 'PENDING' || !s.status).length,
      status: 'REGULAR',
      mainLabel: 'Total de Ativos',
      subLabel: 'Aprovados'
    };
  },

  uploadRaw: async (user, blob, name, path) => {
    const { data, error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, blob);
    if (error) throw error;
    return data.path;
  },

  deleteRaw: async (paths) => {
    await supabase.storage.from(STORAGE_BUCKET).remove(paths);
  }
};
