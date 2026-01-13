
import { FileNode, User, FileType, LibraryFilters, AuditLog, BreadcrumbItem, UserRole } from '../../types.ts';
import { IFileService, PaginatedResponse } from './interfaces.ts';
import { supabase } from '../supabaseClient.ts';
import { SupabaseAdminService } from './supabaseAdminService.ts'; // Importe para buscar dados do cliente

// Helper interno para buscar quais IDs da lista atual são favoritos do usuário
const _fetchUserFavorites = async (userId: string, fileIds: string[]): Promise<Set<string>> => {
    if (fileIds.length === 0) return new Set();
    
    const { data } = await supabase
        .from('file_favorites')
        .select('file_id')
        .eq('user_id', userId)
        .in('file_id', fileIds);
        
    return new Set((data || []).map(f => f.file_id));
};

// Gerador de IP e Localização simulados/básicos para frontend
const _getSimulatedIp = () => {
    const segments = Array.from({ length: 4 }, () => Math.floor(Math.random() * 256));
    return segments.join('.');
};
const _getDeviceAndLocation = () => {
    const userAgent = navigator.userAgent;
    let device = 'Desktop';
    if (/Mobi|Android/i.test(userAgent)) device = 'Mobile';
    if (/Tablet|iPad/i.test(userAgent)) device = 'Tablet';
    // Em um ambiente real, a localização viria de um serviço de geolocalização de IP
    const location = 'Unknown / Browser inferred'; 
    return { userAgent, device, location };
};

// Função interna para logar ações de auditoria
const _logAction = async (
    user: User | null, 
    action: string, 
    target: string, 
    category: AuditLog['category'],
    severity: AuditLog['severity'] = 'INFO',
    status: AuditLog['status'] = 'SUCCESS',
    metadata: Record<string, any> = {}
) => {
    try {
        const { userAgent, device, location } = _getDeviceAndLocation();
        const ip = _getSimulatedIp();
        const requestId = crypto.randomUUID(); // Gerar um UUID para requestId

        await supabase.from('audit_logs').insert({
            user_id: user?.id || null,
            action,
            target,
            category,
            severity,
            status,
            ip,
            location,
            user_agent: userAgent,
            device,
            metadata: { 
                userName: user?.name || 'Sistema', 
                userRole: user?.role || 'SYSTEM', 
                ...metadata 
            },
            request_id: requestId,
        });
    } catch (e) {
        console.error("Erro ao registrar log de auditoria:", e);
    }
};

// Helper para verificar responsabilidade e ajustar log
const _checkResponsibilityAndLog = async (
    user: User, 
    fileOwnerId: string, 
    action: string, 
    fileName: string,
    initialSeverity: AuditLog['severity'] = 'INFO',
    initialStatus: AuditLog['status'] = 'SUCCESS',
    initialMetadata: Record<string, any> = {}
) => {
    let finalSeverity = initialSeverity;
    // Fix: Explicitly declare metadata as a mutable object with Record<string, any> type
    let metadata: Record<string, any> = { ...initialMetadata, fileOwnerId };

    if (fileOwnerId) {
        const { data: clientOrg, error: orgError } = await supabase
            .from('organizations')
            .select('name, quality_analyst_id')
            .eq('id', fileOwnerId)
            .single();

        if (orgError) {
            console.warn(`Could not fetch organization for file owner ID ${fileOwnerId}:`, orgError.message);
            metadata.orgFetchError = orgError.message;
        } else if (clientOrg?.quality_analyst_id) {
            metadata.responsibleAnalystId = clientOrg.quality_analyst_id;
            
            if (user.role === UserRole.QUALITY && user.id !== clientOrg.quality_analyst_id) {
                // Analista de qualidade acessando/modificando arquivo de cliente não atribuído
                finalSeverity = 'WARNING';
                metadata.accessedByNonResponsibleAnalyst = true;
                console.warn(`WARNING: Quality Analyst ${user.name} (${user.id}) accessed/modified file of client ${clientOrg.name} (${fileOwnerId}) not assigned to them (responsible: ${clientOrg.quality_analyst_id}).`);
            } else if (user.role === UserRole.ADMIN && user.id !== clientOrg.quality_analyst_id) {
                // Admin acessando/modificando arquivo de cliente com analista de qualidade atribuído (diferente do admin)
                // Mantém INFO ou ajusta se houver uma política mais rigorosa para admins
                metadata.accessedByAdminNotAssignedAnalyst = true;
                // finalSeverity = 'INFO'; // Admins are allowed, so keep info but add metadata
            }
        }
    }
    
    await _logAction(user, action, fileName, 'DATA', finalSeverity, initialStatus, metadata);
};


export const SupabaseFileService: IFileService = {
    getFiles: async (user: User, folderId: string | null, page = 1, pageSize = 20): Promise<PaginatedResponse<FileNode>> => {
        let query = supabase
            .from('files')
            .select('*', { count: 'exact' });

        if (folderId) {
            query = query.eq('parent_id', folderId);
        } else {
            query = query.is('parent_id', null);
        }

        if (user.role === 'CLIENT') {
            // Replaced user.clientId with user.organizationId
            if (!user.organizationId) throw new Error("Usuário cliente sem organização vinculada.");
            query = query.eq('owner_id', user.organizationId).eq('metadata->>status', 'APPROVED');
        }

        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        const { data, count, error } = await query.range(from, to).order('type', { ascending: false }).order('name');
        if (error) throw error;
        
        const files = data || [];
        // Busca quais desses arquivos são favoritos
        const favSet = await _fetchUserFavorites(user.id, files.map(f => f.id));

        return {
            items: files.map(f => ({
                id: f.id,
                parentId: f.parent_id,
                name: f.name,
                type: f.type as FileType,
                size: f.size,
                updatedAt: new Date(f.updated_at).toLocaleDateString(),
                ownerId: f.owner_id,
                metadata: f.metadata || {},
                isFavorite: favSet.has(f.id)
            })),
            total: count || 0,
            hasMore: (count || 0) > to + 1
        };
    },

    getRecentFiles: async (user: User, limit = 20): Promise<FileNode[]> => {
        let query = supabase
            .from('files')
            .select('*')
            .neq('type', 'FOLDER')
            .limit(limit)
            .order('updated_at', { ascending: false });
            
        if (user.role === 'CLIENT') {
            // Replaced user.clientId with user.organizationId
            if (!user.organizationId) return [];
            query = query.eq('owner_id', user.organizationId).eq('metadata->>status', 'APPROVED');
        }
        
        const { data, error } = await query;
        if (error) throw error;
        
        const files = data || [];
        const favSet = await _fetchUserFavorites(user.id, files.map(f => f.id));
        
        return files.map(f => ({
            id: f.id,
            parentId: f.parent_id,
            name: f.name,
            type: f.type as FileType,
            size: f.size,
            updatedAt: new Date(f.updated_at).toLocaleDateString(),
            ownerId: f.owner_id,
            metadata: f.metadata || {},
            isFavorite: favSet.has(f.id)
        }));
    },

    getFileSignedUrl: async (user: User, fileId: string): Promise<string> => {
        const { data: file, error: fetchError } = await supabase
            .from('files')
            .select('name, owner_id, storage_path')
            .eq('id', fileId)
            .single();
            
        if (fetchError || !file) {
            await _logAction(user, 'FILE_DOWNLOAD', `ID: ${fileId}`, 'DATA', 'ERROR', 'FAILURE', { reason: "File not found or access denied" });
            throw new Error("Documento não encontrado.");
        }
        
        // Replaced user.clientId with user.organizationId
        if (user.role === 'CLIENT' && file.owner_id !== user.organizationId) {
            await _logAction(user, 'FILE_DOWNLOAD', file.name, 'SECURITY', 'WARNING', 'FAILURE', { reason: "Acesso negado: Este documento pertence a outra organização." });
            throw new Error("Acesso negado: Este documento pertence a outra organização.");
        }

        // NOVO: Verificação de responsabilidade para logs de auditoria
        if (user.role === UserRole.QUALITY || user.role === UserRole.ADMIN) {
             await _checkResponsibilityAndLog(user, file.owner_id, 'FILE_DOWNLOAD', file.name);
        } else {
             await _logAction(user, 'FILE_DOWNLOAD', file.name, 'DATA', 'INFO', 'SUCCESS');
        }

        const path = file.storage_path || `${file.owner_id}/${file.name}`;
        
        const { data, error } = await supabase.storage
            .from('certificates')
            .createSignedUrl(path, 3600);
        
        if (error) {
            await _logAction(user, 'FILE_DOWNLOAD', file.name, 'SYSTEM', 'ERROR', 'FAILURE', { reason: error.message });
            throw error;
        }

        return data.signedUrl;
    },

    getDashboardStats: async (user: User) => {
        let queryTotal = supabase
            .from('files')
            .select('*', { count: 'exact', head: true })
            .neq('type', 'FOLDER');

        let queryPending = supabase
            .from('files')
            .select('*', { count: 'exact', head: true })
            .eq('metadata->>status', 'PENDING');

        if (user.role === 'CLIENT') {
            // Replaced user.clientId with user.organizationId
            if (user.organizationId) {
                queryTotal = queryTotal.eq('owner_id', user.organizationId).eq('metadata->>status', 'APPROVED');
                queryPending = queryPending.eq('owner_id', user.organizationId);
            } else {
                return { mainLabel: 'Aguardando', subLabel: 'Organização', mainValue: 0, subValue: 0, pendingValue: 0, status: 'PENDING' };
            }
        }
            
        const [{ count: total }, { count: pending }] = await Promise.all([
            queryTotal,
            queryPending
        ]);

        return {
            mainLabel: user.role === 'CLIENT' ? 'Conformidade' : 'Gestão',
            subLabel: 'Arquivos Ativos',
            mainValue: 100,
            subValue: total || 0,
            pendingValue: pending || 0,
            status: 'REGULAR'
        };
    },

    getLibraryFiles: async (user: User, filters: LibraryFilters, page = 1, pageSize = 20): Promise<PaginatedResponse<FileNode>> => {
        let query = supabase.from('files').select('*', { count: 'exact' }).neq('type', 'FOLDER');
        
        if (user.role === 'CLIENT') {
            // Replaced user.clientId with user.organizationId
            if (user.organizationId) query = query.eq('owner_id', user.organizationId);
            query = query.eq('metadata->>status', 'APPROVED');
        }
        
        if (filters.search) query = query.ilike('name', `%${filters.search}%`);
        if (filters.status && filters.status !== 'ALL') query = query.eq('metadata->>status', filters.status);
        
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        
        const { data, count, error } = await query.range(from, to).order('updated_at', { ascending: false });
        if (error) throw error;

        const files = data || [];
        const favSet = await _fetchUserFavorites(user.id, files.map(f => f.id));

        return {
            items: files.map(f => ({
                id: f.id,
                parentId: f.parent_id,
                name: f.name,
                type: f.type as FileType,
                size: f.size,
                updatedAt: new Date(f.updated_at).toLocaleDateString(),
                ownerId: f.owner_id,
                metadata: f.metadata || {},
                isFavorite: favSet.has(f.id)
            })),
            total: count || 0,
            hasMore: (count || 0) > to + 1
        };
    },

    createFolder: async (user: User, parentId: string | null, name: string, ownerId?: string): Promise<FileNode | null> => {
        // Replaced user.clientId with user.organizationId
        const targetOwnerId = user.role === 'CLIENT' ? user.organizationId : ownerId;
        try {
            const { data, error } = await supabase.from('files').insert({
                parent_id: parentId,
                name,
                type: 'FOLDER',
                owner_id: targetOwnerId,
                updated_at: new Date().toISOString()
            }).select().single();
            if (error) throw error;

            // NOVO: Verificação de responsabilidade para logs de auditoria
            if (user.role === UserRole.QUALITY || user.role === UserRole.ADMIN) {
                await _checkResponsibilityAndLog(user, targetOwnerId || '', 'FOLDER_CREATED', name);
            } else {
                await _logAction(user, 'FOLDER_CREATED', name, 'DATA', 'INFO', 'SUCCESS', { parentId, ownerId: targetOwnerId });
            }

            return {
                id: data.id,
                parentId: data.parent_id,
                name: data.name,
                type: FileType.FOLDER,
                updatedAt: new Date(data.updated_at).toLocaleDateString(),
                ownerId: data.owner_id,
                metadata: {}
            };
        } catch (e: any) {
            await _logAction(user, 'FOLDER_CREATED', name, 'DATA', 'ERROR', 'FAILURE', { reason: e.message, parentId, ownerId: targetOwnerId });
            throw e;
        }
    },

    uploadFile: async (user: User, fileData: Partial<FileNode> & { fileBlob?: Blob }, ownerId: string): Promise<FileNode> => {
        if (!fileData.fileBlob || !fileData.name) {
            await _logAction(user, 'FILE_UPLOAD', fileData.name || 'Unknown', 'DATA', 'ERROR', 'FAILURE', { reason: "File data incomplete" });
            throw new Error("Dados do arquivo incompletos para upload.");
        }
        const storagePath = `${ownerId}/${fileData.name}`;
        
        try {
            const { error: storageError } = await supabase.storage.from('certificates').upload(storagePath, fileData.fileBlob, { cacheControl: '3600', upsert: true });
            if (storageError) throw storageError;

            const { data, error: dbError } = await supabase.from('files').insert({
                parent_id: fileData.parentId || null,
                name: fileData.name,
                type: FileType.PDF, // Assumindo PDF para uploads manuais, ajustar se necessário
                size: `${(fileData.fileBlob.size / (1024 * 1024)).toFixed(2)} MB`,
                owner_id: ownerId,
                storage_path: storagePath,
                uploaded_by: user.id,
                metadata: { ...fileData.metadata, status: fileData.metadata?.status || 'PENDING' },
                updated_at: new Date().toISOString()
            }).select().single();
            if (dbError) throw dbError;

            // NOVO: Verificação de responsabilidade para logs de auditoria
            if (user.role === UserRole.QUALITY || user.role === UserRole.ADMIN) {
                await _checkResponsibilityAndLog(user, ownerId, 'FILE_UPLOAD', fileData.name, 'INFO', 'SUCCESS', { parentId: fileData.parentId, status: fileData.metadata?.status || 'PENDING' });
            } else {
                await _logAction(user, 'FILE_UPLOAD', fileData.name, 'DATA', 'INFO', 'SUCCESS', { ownerId, parentId: fileData.parentId, status: fileData.metadata?.status || 'PENDING' });
            }

            return {
                id: data.id,
                parentId: data.parent_id,
                name: data.name,
                type: data.type as FileType,
                size: data.size,
                updatedAt: new Date(data.updated_at).toLocaleDateString(),
                ownerId: data.owner_id,
                metadata: data.metadata,
                isFavorite: false
            };
        } catch (e: any) {
            await _logAction(user, 'FILE_UPLOAD', fileData.name, 'DATA', 'ERROR', 'FAILURE', { reason: e.message, ownerId, parentId: fileData.parentId });
            throw e;
        }
    },

    deleteFile: async (user: User, fileId: string): Promise<void> => {
        let fileName = `ID: ${fileId}`;
        let fileOwnerId: string | null = null;
        try {
            const { data: file, error: fetchError } = await supabase.from('files').select('name, storage_path, owner_id').eq('id', fileId).single();
            if (fetchError || !file) throw new Error("File not found.");

            fileName = file.name;
            fileOwnerId = file.owner_id;

            // Replaced user.clientId with user.organizationId
            if (user.role === 'CLIENT' && file.owner_id !== user.organizationId) {
                await _logAction(user, 'FILE_DELETE', fileName, 'SECURITY', 'WARNING', 'FAILURE', { reason: "Attempted to delete another client's file" });
                throw new Error("Não permitido excluir arquivos de terceiros.");
            }
            
            if (file.storage_path) await supabase.storage.from('certificates').remove([file.storage_path]);
            await supabase.from('files').delete().eq('id', fileId);

            // NOVO: Verificação de responsabilidade para logs de auditoria
            if (user.role === UserRole.QUALITY || user.role === UserRole.ADMIN) {
                await _checkResponsibilityAndLog(user, fileOwnerId, 'FILE_DELETE', fileName, 'INFO', 'SUCCESS');
            } else {
                await _logAction(user, 'FILE_DELETE', fileName, 'DATA', 'INFO', 'SUCCESS', { fileOwnerId });
            }

        } catch (e: any) {
            await _logAction(user, 'FILE_DELETE', fileName, 'DATA', 'ERROR', 'FAILURE', { reason: e.message, fileOwnerId });
            throw e;
        }
    },

    updateFile: async (user: User, fileId: string, updates: Partial<FileNode>): Promise<void> => {
        let fileName = `ID: ${fileId}`;
        let oldMetadata: any = {};
        let fileOwnerId: string | null = null;
        try {
            const { data: currentFile, error: fetchError } = await supabase.from('files').select('name, metadata, owner_id').eq('id', fileId).single();
            if (fetchError || !currentFile) throw new Error("File not found.");
            
            fileName = currentFile.name;
            oldMetadata = currentFile.metadata;
            fileOwnerId = currentFile.owner_id;

            await supabase.from('files').update({
                name: updates.name,
                parent_id: updates.parentId,
                metadata: updates.metadata,
                updated_at: new Date().toISOString()
            }).eq('id', fileId);

            const newMetadata = updates.metadata;
            const changes = { old: oldMetadata, new: newMetadata, updates };
            
            // NOVO: Verificação de responsabilidade para logs de auditoria
            if (user.role === UserRole.QUALITY || user.role === UserRole.ADMIN) {
                await _checkResponsibilityAndLog(user, fileOwnerId, 'FILE_UPDATE', fileName, 'INFO', 'SUCCESS', { fileId, changes });
            } else {
                await _logAction(user, 'FILE_UPDATE', fileName, 'DATA', 'INFO', 'SUCCESS', { fileId, changes });
            }

        } catch (e: any) {
            await _logAction(user, 'FILE_UPDATE', fileName, 'DATA', 'ERROR', 'FAILURE', { reason: e.message, fileId, updates, oldMetadata });
            throw e;
        }
    },

    searchFiles: async (user: User, query: string, page = 1, pageSize = 20): Promise<PaginatedResponse<FileNode>> => {
        let q = supabase.from('files').select('*', { count: 'exact' }).ilike('name', `%${query}%`);
        // Replaced user.clientId with user.organizationId
        if (user.role === 'CLIENT' && user.organizationId) {
            q = q.eq('owner_id', user.organizationId).eq('metadata->>status', 'APPROVED');
        }
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        const { data, count, error } = await q.range(from, to).order('updated_at', { ascending: false });
        if (error) throw error;
        
        const files = data || [];
        const favSet = await _fetchUserFavorites(user.id, files.map(f => f.id));

        return {
            items: files.map(f => ({
                id: f.id,
                parentId: f.parent_id,
                name: f.name,
                type: f.type as FileType,
                size: f.size,
                updatedAt: new Date(f.updated_at).toLocaleDateString(),
                ownerId: f.owner_id,
                metadata: f.metadata || {},
                isFavorite: favSet.has(f.id)
            })),
            total: count || 0,
            hasMore: (count || 0) > to + 1
        };
    },

    getBreadcrumbs: async (folderId: string | null): Promise<BreadcrumbItem[]> => {
        // Fix: Return the translation key for the root breadcrumb instead of hardcoding "Início"
        if (!folderId) return [{ id: 'root', name: 'common.home' }];
        
        try {
            const crumbs: BreadcrumbItem[] = [];
            let currentId: string | null = folderId;
            
            for (let i = 0; i < 10 && currentId; i++) {
                const { data, error } = await supabase
                    .from('files')
                    .select('id, name, parent_id')
                    .eq('id', currentId)
                    .single();
                
                if (error || !data) break;
                
                crumbs.unshift({ id: data.id, name: data.name });
                currentId = data.parent_id;
            }
            
            // Fix: Return the translation key for the root breadcrumb on error as well
            crumbs.unshift({ id: 'root', name: 'common.home' });
            return crumbs;
        } catch (e) {
            // Fix: Return the translation key for the root breadcrumb on error as well
            return [{ id: 'root', name: 'common.home' }];
        }
    },

    toggleFavorite: async (user: User, fileId: string): Promise<boolean> => {
        let isFavorite = false;
        let fileName = `ID: ${fileId}`;
        let fileOwnerId: string | null = null;
        try {
            // Fetch file name and owner for logging
            const { data: fileData, error: fileError } = await supabase.from('files').select('name, owner_id').eq('id', fileId).single();
            if (fileData) {
                fileName = fileData.name;
                fileOwnerId = fileData.owner_id;
            }

            // Verifica se já existe
            const { data } = await supabase
                .from('file_favorites')
                .select('id')
                .eq('user_id', user.id)
                .eq('file_id', fileId)
                .single();

            if (data) {
                // Se existe, remove (toggle OFF)
                await supabase.from('file_favorites').delete().eq('id', data.id);
                isFavorite = false;
            } else {
                // Se não existe, cria (toggle ON)
                await supabase.from('file_favorites').insert({
                    user_id: user.id,
                    file_id: fileId
                });
                isFavorite = true;
            }
            
            // NOVO: Verificação de responsabilidade para logs de auditoria
            if (user.role === UserRole.QUALITY || user.role === UserRole.ADMIN) {
                await _checkResponsibilityAndLog(user, fileOwnerId || '', 'FILE_FAVORITE_TOGGLE', fileName, 'INFO', 'SUCCESS', { isFavorite });
            } else {
                await _logAction(user, 'FILE_FAVORITE_TOGGLE', fileName, 'DATA', 'INFO', 'SUCCESS', { isFavorite });
            }

            return isFavorite;
        } catch (e: any) {
            await _logAction(user, 'FILE_FAVORITE_TOGGLE', fileName, 'DATA', 'ERROR', 'FAILURE', { isFavorite, reason: e.message });
            throw e;
        }
    },

    getFavorites: async (user: User): Promise<FileNode[]> => {
        // Busca os favoritos do usuário com JOIN na tabela de arquivos
        const { data, error } = await supabase
            .from('file_favorites')
            .select(`
                file_id,
                files:file_id (*)
            `)
            .eq('user_id', user.id);
        
        if (error) throw error;
        
        // Mapeia o resultado do JOIN para o formato FileNode
        return (data || [])
            .map((item: any) => item.files) // Extrai o objeto file
            .filter((f: any) => f !== null) // Remove nulos (caso arquivo tenha sido deletado)
            .map((f: any) => ({
                id: f.id,
                parentId: f.parent_id,
                name: f.name,
                type: f.type as FileType,
                size: f.size,
                updatedAt: new Date(f.updated_at).toLocaleDateString(),
                ownerId: f.owner_id,
                metadata: f.metadata || {},
                isFavorite: true // Já sabemos que é favorito pois veio desta query
            }));
    },

    getFilesByOwner: async (ownerId: string): Promise<FileNode[]> => {
        if (!ownerId) return [];
        const { data, error } = await supabase.from('files').select('*').eq('owner_id', ownerId);
        if (error) throw error;
        // Nota: Neste método específico, não estamos injetando isFavorite para manter performance,
        // mas pode ser adicionado se necessário no contexto de Admin.
        return (data || []).map(f => ({
            id: f.id,
            parentId: f.parent_id,
            name: f.name,
            type: f.type as FileType,
            size: f.size,
            updatedAt: new Date(f.updated_at).toLocaleDateString(),
            ownerId: f.owner_id,
            metadata: f.metadata || {},
            isFavorite: false
        }));
    },

    // A função logAction é agora o _logAction interno. Este é um alias para chamadas externas que não foram migradas.
    logAction: _logAction,

    getAuditLogs: async (user: User): Promise<AuditLog[]> => {
        if (user.role !== 'ADMIN') throw new Error("Acesso negado.");
        const { data } = await supabase.from('audit_logs').select('*, profiles(full_name, role)').order('created_at', { ascending: false }).limit(100);
        return (data || []).map(l => ({
            id: l.id, timestamp: l.created_at, userId: l.user_id, userName: l.metadata?.userName || l.profiles?.full_name || 'Sistema', userRole: l.metadata?.userRole || l.profiles?.role || 'SYSTEM',
            action: l.action, category: l.category as any, target: l.target, severity: l.severity as any, status: l.status as any, ip: l.ip || '0.0.0.0',
            location: l.location || 'Unknown', userAgent: l.user_agent || '', device: l.device || '', metadata: l.metadata || {}, requestId: l.request_id || ''
        }));
    },

    getQualityAuditLogs: async (user: User, filters?: { search?: string; severity?: AuditLog['severity'] | 'ALL' }): Promise<AuditLog[]> => {
        // Esta função é destinada à perspectiva de um Analista de Qualidade.
        // Mesmo que um Admin a chame, ele verá logs relacionados às suas próprias ações
        // e ações em clientes para os quais ele é explicitamente o 'quality_analyst_id'.

        let responsibleClientIds: string[] = [];
        
        // Encontra todos os IDs de organizações de clientes onde o usuário atual é o analista de qualidade responsável
        const { data: clientsData, error: clientsError } = await supabase
            .from('organizations')
            .select('id')
            .eq('quality_analyst_id', user.id);

        if (clientsError) {
            console.error("Erro ao buscar clientes responsáveis para o usuário logado:", clientsError.message);
            throw clientsError;
        }
        responsibleClientIds = (clientsData || []).map(c => c.id);

        let query = supabase
            .from('audit_logs')
            .select('*, profiles(full_name, role)');

        // Constrói a condição OR: logs pelo próprio usuário OU logs relacionados aos clientes responsáveis
        let orConditions: string[] = [`user_id.eq.${user.id}`]; // Sempre inclui as próprias ações

        if (responsibleClientIds.length > 0) {
            // Logs onde fileOwnerId (para arquivos) ou clientId (para registros de clientes) 
            // corresponde a um ID de cliente responsável.
            // Usamos `contains` para verificar se o ID está presente em um array, 
            // caso o `metadata->>fileOwnerId` ou `metadata->>clientId` possa ser um array de IDs.
            // Se eles são strings simples, `.eq` é mais apropriado, mas `contains` oferece flexibilidade.
            // Para strings simples, faremos múltiplos `.eq` ou `in`.

            const fileOwnerIdConditions = responsibleClientIds.map(id => `metadata->>fileOwnerId.eq."${id}"`).join(',');
            const clientIdConditions = responsibleClientIds.map(id => `metadata->>clientId.eq."${id}"`).join(',');
            
            if (fileOwnerIdConditions) orConditions.push(fileOwnerIdConditions);
            if (clientIdConditions) orConditions.push(clientIdConditions);
        }
        
        query = query.or(orConditions.join(','));

        if (filters?.search) {
            const searchTerm = `%${filters.search.toLowerCase()}%`;
            query = query.or(`action.ilike.${searchTerm},target.ilike.${searchTerm},metadata->>userName.ilike.${searchTerm},profiles.full_name.ilike.${searchTerm}`);
        }

        if (filters?.severity && filters.severity !== 'ALL') {
            query = query.eq('severity', filters.severity);
        }

        const { data, error } = await query.order('created_at', { ascending: false }).limit(100);
        
        if (error) {
            console.error("Erro ao buscar logs de auditoria da qualidade:", error.message);
            throw error;
        }

        return (data || []).map(l => ({
            id: l.id,
            timestamp: l.created_at,
            userId: l.user_id,
            userName: l.metadata?.userName || l.profiles?.full_name || 'Sistema',
            userRole: l.metadata?.userRole || l.profiles?.role || 'SYSTEM',
            action: l.action,
            category: l.category as any,
            target: l.target,
            severity: l.severity as any,
            status: l.status as any,
            ip: l.ip || '0.0.0.0',
            location: l.location || 'Unknown',
            userAgent: l.user_agent || '',
            device: l.device || '',
            metadata: l.metadata || {},
            requestId: l.request_id || ''
        }));
    },
};