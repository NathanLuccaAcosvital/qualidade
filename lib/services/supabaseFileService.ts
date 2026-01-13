import { FileNode, User, FileType, LibraryFilters, AuditLog, BreadcrumbItem, MASTER_ORG_ID } from '../../types.ts';
import { IFileService, PaginatedResponse } from './interfaces.ts';
import { supabase } from '../supabaseClient.ts';

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

// Define a type for the data structure expected by Supabase insert for 'files' table,
// including database-specific fields not always present in the client-side FileNode.
type FileInsertPayload = Omit<FileNode, 'id' | 'updatedAt' | 'isFavorite'> & {
    storage_path: string;
    uploaded_by: string;
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
            if (!user.clientId) throw new Error("Usuário cliente sem organização vinculada.");
            query = query.eq('owner_id', user.clientId).eq('metadata->>status', 'APPROVED');
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
            if (!user.clientId) return [];
            query = query.eq('owner_id', user.clientId).eq('metadata->>status', 'APPROVED');
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
            
        if (fetchError || !file) throw new Error("Documento não encontrado.");
        
        if (user.role === 'CLIENT' && file.owner_id !== user.clientId) {
            throw new Error("Acesso negado: Este documento pertence a outra organização.");
        }

        const path = file.storage_path || `${file.owner_id}/${file.name}`;
        
        const { data, error } = await supabase.storage
            .from('certificates')
            .createSignedUrl(path, 3600);
        
        if (error) throw error;
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
            if (user.clientId) {
                queryTotal = queryTotal.eq('owner_id', user.clientId).eq('metadata->>status', 'APPROVED');
                queryPending = queryPending.eq('owner_id', user.clientId);
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
            if (user.clientId) query = query.eq('owner_id', user.clientId);
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
        const targetOwnerId = user.role === 'CLIENT' ? user.clientId : ownerId;
        const { data, error } = await supabase.from('files').insert({
            parent_id: parentId,
            name,
            type: 'FOLDER',
            owner_id: targetOwnerId,
            updated_at: new Date().toISOString()
        }).select().single();
        if (error) throw error;
        return {
            id: data.id,
            parentId: data.parent_id,
            name: data.name,
            type: FileType.FOLDER,
            updatedAt: new Date(data.updated_at).toLocaleDateString(),
            ownerId: data.owner_id,
            metadata: {}
        };
    },

    uploadFile: async (user: User, fileData: Partial<FileNode> & { fileBlob?: Blob }, ownerId: string): Promise<FileNode> => {
        if (!fileData.fileBlob || !fileData.name) throw new Error("Dados do arquivo incompletos para upload.");
        const storagePath = `${ownerId}/${fileData.name}`;
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
    },

    deleteFile: async (user: User, fileId: string): Promise<void> => {
        const { data: file } = await supabase.from('files').select('storage_path, owner_id').eq('id', fileId).single();
        if (!file) return;
        if (user.role === 'CLIENT' && file.owner_id !== user.clientId) throw new Error("Não permitido excluir arquivos de terceiros.");
        if (file.storage_path) await supabase.storage.from('certificates').remove([file.storage_path]);
        await supabase.from('files').delete().eq('id', fileId);
    },

    updateFile: async (user: User, fileId: string, updates: Partial<FileNode>): Promise<void> => {
        await supabase.from('files').update({
            name: updates.name,
            parent_id: updates.parentId,
            metadata: updates.metadata,
            updated_at: new Date().toISOString()
        }).eq('id', fileId);
    },

    searchFiles: async (user: User, query: string, page = 1, pageSize = 20): Promise<PaginatedResponse<FileNode>> => {
        let q = supabase.from('files').select('*', { count: 'exact' }).ilike('name', `%${query}%`);
        if (user.role === 'CLIENT' && user.clientId) {
            q = q.eq('owner_id', user.clientId).eq('metadata->>status', 'APPROVED');
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
        if (!folderId) return [{ id: 'root', name: 'Início' }];
        
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
            
            crumbs.unshift({ id: 'root', name: 'Início' });
            return crumbs;
        } catch (e) {
            return [{ id: 'root', name: 'Início' }];
        }
    },

    toggleFavorite: async (user: User, fileId: string): Promise<boolean> => {
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
            return false;
        } else {
            // Se não existe, cria (toggle ON)
            await supabase.from('file_favorites').insert({
                user_id: user.id,
                file_id: fileId
            });
            return true;
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

    logAction: async (user: User, action: string, target: string, severity: AuditLog['severity'] = 'INFO') => {
        await supabase.from('audit_logs').insert({ user_id: user.id, action, target, severity, category: 'DATA', metadata: { user_role: user.role } });
    },

    getAuditLogs: async (user: User): Promise<AuditLog[]> => {
        if (user.role !== 'ADMIN') throw new Error("Acesso negado.");
        const { data } = await supabase.from('audit_logs').select('*, profiles(full_name, role)').order('created_at', { ascending: false }).limit(100);
        return (data || []).map(l => ({
            id: l.id, timestamp: l.created_at, userId: l.user_id, userName: l.profiles?.full_name || 'Sistema', userRole: l.profiles?.role || 'SYSTEM',
            action: l.action, category: l.category as any, target: l.target, severity: l.severity as any, status: 'SUCCESS', ip: l.ip || '0.0.0.0',
            location: '', userAgent: l.user_agent || '', device: '', metadata: l.metadata || {}, requestId: ''
        }));
    },

    getMasterLibraryFiles: async () => {
        const { data, error } = await supabase.from('files').select('*').eq('owner_id', MASTER_ORG_ID).neq('type', 'FOLDER');
        if (error) throw error;
        return (data || []).map(f => ({
            id: f.id, parentId: f.parent_id, name: f.name, type: f.type as FileType, size: f.size, updatedAt: new Date(f.updated_at).toLocaleDateString(), ownerId: f.owner_id, metadata: f.metadata || {}, isFavorite: false
        }));
    },

    importFilesFromMaster: async (user: User, fileIds: string[], targetFolderId: string, targetOwnerId: string): Promise<void> => {
        const { data: masterFiles, error: fetchError } = await supabase
            .from('files')
            .select('name, type, size, storage_path, metadata')
            .in('id', fileIds)
            .eq('owner_id', MASTER_ORG_ID); // Ensure we only fetch from master
        
        if (fetchError) {
            console.error("Erro ao buscar arquivos mestre:", fetchError.message);
            throw new Error("Falha ao buscar arquivos da biblioteca mestre.");
        }
        if (!masterFiles || masterFiles.length === 0) return;

        // Fix: Use the new FileInsertPayload type
        const filesToInsert: FileInsertPayload[] = [];

        for (const mf of masterFiles) {
            if (!mf.storage_path) {
                console.warn(`Arquivo mestre '${mf.name}' (ID: ${mf.id}) não possui storage_path. Pulando.`);
                continue;
            }

            // 1. Download do arquivo original
            const { data: fileBlob, error: downloadError } = await supabase.storage
                .from('certificates')
                .download(mf.storage_path);

            if (downloadError) {
                console.error(`Erro ao baixar arquivo '${mf.name}':`, downloadError.message);
                throw new Error(`Falha ao baixar o arquivo mestre '${mf.name}'.`);
            }
            if (!fileBlob) {
                console.warn(`Arquivo mestre '${mf.name}' baixado, mas conteúdo vazio. Pulando.`);
                continue;
            }

            // 2. Upload para o novo caminho do cliente
            const newStoragePath = `${targetOwnerId}/${mf.name}`;
            const { error: uploadError } = await supabase.storage
                .from('certificates')
                .upload(newStoragePath, fileBlob, { cacheControl: '3600', upsert: true });

            if (uploadError) {
                console.error(`Erro ao fazer upload da cópia de '${mf.name}' para o cliente '${targetOwnerId}':`, uploadError.message);
                throw new Error(`Falha ao fazer upload da cópia do arquivo '${mf.name}'.`);
            }

            // 3. Preparar dados para inserção no banco de dados
            filesToInsert.push({
                name: mf.name,
                type: mf.type as FileType,
                size: mf.size,
                parentId: targetFolderId,
                ownerId: targetOwnerId,
                storage_path: newStoragePath, // This is now allowed by FileInsertPayload
                uploaded_by: user.id, // This is now allowed by FileInsertPayload
                metadata: { 
                    ...mf.metadata, 
                    status: 'PENDING', // Arquivos importados são PENDING para análise do Quality
                    imported_at: new Date().toISOString() 
                },
            });
        }
        
        // 4. Inserir os novos registros de arquivo no banco de dados
        if (filesToInsert.length > 0) {
            const { error: dbInsertError } = await supabase.from('files').insert(
                filesToInsert.map(f => ({
                    ...f, // Spreads all properties from FileInsertPayload, including storage_path and uploaded_by
                    updated_at: new Date().toISOString(), // Add updated_at
                }))
            );
            if (dbInsertError) {
                console.error("Erro ao inserir cópias de arquivos no DB:", dbInsertError.message);
                throw new Error("Falha ao registrar as cópias dos arquivos no banco de dados.");
            }
        }
    }
};