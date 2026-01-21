
import { supabase } from '../supabaseClient.ts';
import { User, AuditLog } from '../../types/index.ts';

/**
 * Registro de Auditoria B2B - Aços Vital
 * Implementa persistência de ações críticas para conformidade técnica.
 * O IP agora é capturado diretamente pelo banco de dados para maior precisão forense.
 */
export const logAction = async (
    user: User | null, 
    action: string, 
    target: string, 
    category: AuditLog['category'],
    severity: AuditLog['severity'] = 'INFO',
    status: AuditLog['status'] = 'SUCCESS',
    metadata: Record<string, any> = {}
) => {
    try {
        const userAgent = navigator.userAgent;
        const requestId = crypto.randomUUID().split('-')[0].toUpperCase();
        
        // Enviamos o log sem o campo IP para que o banco utilize o valor default 
        // ou capturado via trigger (ex: request.headers() no Supabase/Postgres)
        await supabase.from('audit_logs').insert({
            user_id: user?.id || null,
            action,
            target,
            category,
            severity,
            status,
            user_agent: userAgent,
            request_id: requestId,
            metadata: { 
                userName: user?.name || 'Sistema', 
                userRole: user?.role || 'SYSTEM',
                ...metadata 
            }
        });
    } catch (e) {
        console.error("Falha crítica no sistema de auditoria:", e);
    }
};

/**
 * Log específico de acesso a arquivos para rastreabilidade de certificados.
 */
export const logFileAccess = async (user: User, fileId: string, fileName: string, type: 'VIEW' | 'DOWNLOAD') => {
    try {
        await supabase.from('file_access_history').insert({
            file_id: fileId,
            user_id: user.id,
            access_type: type,
            metadata: {
                fileName,
                userName: user.name,
                orgId: user.organizationId,
                userAgent: navigator.userAgent
            }
        });

        // Também registra no log de auditoria global
        await logAction(user, `FILE_${type}`, fileName, 'DATA', 'INFO', 'SUCCESS', { fileId });
    } catch (e) {
        console.error("Erro ao registrar acesso ao arquivo:", e);
    }
};
