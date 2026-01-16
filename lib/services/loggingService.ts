
import { supabase } from '../supabaseClient.ts';
import { User, AuditLog } from '../../types/index';

/**
 * Tenta obter o IP público do cliente. 
 * Nota: Em produção, isso geralmente é feito via Headers no Backend (Edge Functions),
 * mas para um MVP frontend-only, usamos um lookup externo.
 */
const getClientIp = async (): Promise<string> => {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (e) {
        return '0.0.0.0 (Local/Proxy)';
    }
};

const getDeviceAndLocation = () => {
    const userAgent = navigator.userAgent;
    let device = 'Desktop';
    if (/Mobi|Android/i.test(userAgent)) device = 'Mobile';
    if (/Tablet|iPad/i.test(userAgent)) device = 'Tablet';
    
    // Simplificação para o MVP
    const platform = navigator.platform;
    const language = navigator.language;

    return { 
        userAgent, 
        device, 
        location: `Inferred (${language}/${platform})`,
        details: { platform, language }
    };
};

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
        const { userAgent, device, location, details } = getDeviceAndLocation();
        const ip = await getClientIp();
        const requestId = crypto.randomUUID();

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
                userName: user?.name || 'Sistema/Anônimo', 
                userRole: user?.role || 'SYSTEM', 
                browserDetails: details,
                ...metadata 
            },
            request_id: requestId,
        });
    } catch (e) {
        console.error("Erro crítico ao registrar log de auditoria:", e);
    }
};
