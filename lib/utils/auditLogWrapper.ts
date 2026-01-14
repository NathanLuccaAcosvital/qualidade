
import { User, AuditLog } from '../../types/index';
import { logAction } from '../services/loggingService.ts';

interface AuditLogOptions {
  target?: string;
  category?: AuditLog['category'];
  initialSeverity?: AuditLog['severity'];
  initialStatus?: AuditLog['status'];
  metadata?: Record<string, any>;
  errorSeverity?: AuditLog['severity'];
}

export async function withAuditLog<T>(
  user: User | null,
  action: string,
  options: AuditLogOptions,
  serviceCall: () => Promise<T>
): Promise<T> {
  const { 
    target = 'Unknown Target', 
    category = 'SYSTEM', 
    initialSeverity = 'INFO', 
    initialStatus = 'SUCCESS', 
    metadata = {},
    errorSeverity = 'ERROR'
  } = options;

  try {
    const result = await serviceCall();
    // Usa o serviço de log isolado para evitar dependência circular
    await logAction(user, action, target, category, initialSeverity, initialStatus, metadata);
    return result;
  } catch (error: any) {
    await logAction(user, action, target, category, errorSeverity, 'FAILURE', { ...metadata, reason: error.message });
    throw error;
  }
}
