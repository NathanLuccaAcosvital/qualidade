
import { supabase } from '../supabaseClient';
import { normalizeRole, AccountStatus, User, SystemStatus } from '../../types';

export const appService = {
  /**
   * Obtém os dados iniciais necessários para a aplicação (Usuário e Status do Sistema).
   * Implementa tratamento resiliente para falhas no RPC ou na recuperação de perfil.
   */
  getInitialData: async (): Promise<{ user: User | null; systemStatus: SystemStatus }> => {
    try {
      // Tenta obter a sessão atual para fallback de metadados
      const { data: { session } } = await supabase.auth.getSession();

      // Chama a função SQL centralizadora de estado
      const { data, error } = await supabase.rpc('get_initial_app_data');
      
      if (error) {
        console.warn("RPC get_initial_app_data falhou, tentando modo degradado:", error.message);
        // Se o RPC falhar, não desistimos: retornamos apenas o usuário da sessão se existir
        return { 
          user: session ? {
            id: session.user.id,
            name: session.user.user_metadata?.full_name || 'Usuário',
            email: session.user.email || '',
            role: normalizeRole(session.user.user_metadata?.role),
            // Fix: Use AccountStatus enum instead of string literal to satisfy User interface
            status: AccountStatus.ACTIVE,
            organizationName: 'Aços Vital'
          } : null, 
          // Fix: Ensure systemStatus mode is strictly typed as 'ONLINE'
          systemStatus: { mode: 'ONLINE' as const } 
        };
      }

      if (!data) return { user: null, systemStatus: { mode: 'ONLINE' as const } };

      // Mapeamento resiliente do Usuário
      const rawUser = data.user;
      const domainUser: User | null = rawUser ? {
        id: rawUser.id,
        name: rawUser.full_name || session?.user.user_metadata?.full_name || 'Usuário',
        email: rawUser.email || session?.user.email || '',
        role: normalizeRole(rawUser.role || session?.user.user_metadata?.role),
        organizationId: rawUser.organization_id,
        organizationName: rawUser.organization_name || 'Aços Vital',
        // Fix: Explicitly cast raw status string to AccountStatus enum for type safety
        status: (rawUser.status as AccountStatus) || AccountStatus.ACTIVE,
        department: rawUser.department,
        lastLogin: rawUser.last_login
      } : null;

      // Mapeamento resiliente do Status do Sistema
      const rawSystem = data.systemStatus;
      const domainSystem: SystemStatus = rawSystem ? {
        // Fix: Explicitly cast mode to SystemStatus['mode'] string union type to prevent widening to string
        mode: (rawSystem.mode as 'ONLINE' | 'MAINTENANCE' | 'SCHEDULED') || 'ONLINE',
        message: rawSystem.message,
        scheduledStart: rawSystem.scheduled_start,
        scheduledEnd: rawSystem.scheduled_end,
        updatedBy: rawSystem.updated_by
      } : { mode: 'ONLINE' as const };

      return { user: domainUser, systemStatus: domainSystem };
    } catch (err) {
      console.error("Falha crítica no appService.getInitialData:", err);
      // Fix: Resilient fallback returning correctly typed objects
      return { user: null, systemStatus: { mode: 'ONLINE' as const } };
    }
  }
};
