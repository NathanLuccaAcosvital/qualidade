
import { supabase } from '../supabaseClient.ts';
import { User, AuditLog } from '../../types/index';

const _getSimulatedIp = () => {
    const segments = Array.from({ length: 4 }, () => Math.floor(Math.random() * 256));
    return segments.join('.');
};

const _getDeviceAndLocation = () => {
    const userAgent = navigator.userAgent;
    let device = 'Desktop';
    if (/Mobi|Android/i.test(userAgent)) device = 'Mobile';
    if (/Tablet|iPad/i.test(userAgent)) device = 'Tablet';
    return { userAgent, device, location: 'Brasil / Inferred' };
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
        const { userAgent, device, location } = _getDeviceAndLocation();
        const ip = _getSimulatedIp();
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
                userName: user?.name || 'Sistema', 
                userRole: user?.role || 'SYSTEM', 
                ...metadata 
            },
            request_id: requestId,
        });
    } catch (e) {
        console.error("Erro crítico ao registrar log de auditoria:", e);
    }
};
