import { User, AuditLog } from '../../types/index';
// Importa o serviço de arquivo diretamente para acessar logAction
import { SupabaseFileService } from '../services/supabaseFileService.ts'; 

// Define a interface para as opções de log de auditoria
interface AuditLogOptions {
  target?: string;
  category?: AuditLog['category'];
  initialSeverity?: AuditLog['severity'];
  initialStatus?: AuditLog['status'];
  metadata?: Record<string, any>;
  errorSeverity?: AuditLog['severity']; // Permite sobrescrever a severidade em caso de erro
}

/**
 * Wrapper de função para centralizar a lógica de log de auditoria em chamadas de serviço.
 * Registra automaticamente o sucesso ou a falha de uma operação e lança o erro original.
 *
 * @param user O objeto do usuário que executa a ação.
 * @param action O nome da ação (ex: 'USER_LOGIN', 'FILE_UPLOAD').
 * @param options Opções para o log, incluindo target, categoria, severidade inicial, status inicial e metadados.
 * @param serviceCall A função assíncrona que representa a chamada de serviço real.
 * @returns Uma Promise que resolve com o resultado da `serviceCall` ou rejeita com o erro original.
 */
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
    // Log success
    await SupabaseFileService.logAction(user, action, target, category, initialSeverity, initialStatus, metadata);
    return result;
  } catch (error: any) {
    // Log failure with potentially custom error severity
    await SupabaseFileService.logAction(user, action, target, category, errorSeverity, 'FAILURE', { ...metadata, reason: error.message });
    throw error; // Re-throw the original error
  }
}
