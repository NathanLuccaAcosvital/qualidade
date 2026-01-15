// Adicione ao seu objecto de serviço ou crie uma função isolada
import { supabase } from '../supabaseClient';
import { normalizeRole } from '../mappers/roleMapper';

export const appService = {
  getInitialData: async () => {
    try {
      // Chama a função SQL que criámos
      const { data, error } = await supabase.rpc('get_initial_app_data');
      
      if (error) throw error;
      if (!data) throw new Error("Dados não retornados");

      // Mapeamento dos dados brutos do SQL para os tipos da aplicação
      const rawUser = data.user;
      const rawSystem = data.systemStatus;

      // Converter user raw para User do domínio (igual ao toDomainUser)
      const domainUser = rawUser ? {
        id: rawUser.id,
        name: rawUser.full_name || 'Usuário',
        email: rawUser.email || '',
        role: normalizeRole(rawUser.role),
        organizationId: rawUser.organization_id,
        organizationName: rawUser.organization_name || 'Aços Vital',
        status: rawUser.status || 'ACTIVE',
        department: rawUser.department,
        lastLogin: rawUser.last_login
      } : null;

      // Converter system raw (snake_case) para camelCase
      const domainSystem = rawSystem ? {
        mode: rawSystem.mode,
        message: rawSystem.message,
        scheduledStart: rawSystem.scheduled_start,
        scheduledEnd: rawSystem.scheduled_end,
        updatedBy: rawSystem.updated_by
      } : null;

      return { user: domainUser, systemStatus: domainSystem };
    } catch (err) {
      console.error("Falha no RPC get_initial_app_data:", err);
      return { user: null, systemStatus: null };
    }
  }
};