import { supabase } from '../supabaseClient';
import { normalizeRole } from '../mappers/roleMapper';

export const SupabaseAppService = {
  getInitialData: async () => {
    try {
      // Chama a função SQL
      const { data, error } = await supabase.rpc('get_initial_app_data');
      
      // Se houver erro ou data for null, não estoure erro imediatamente se pudermos recuperar
      if (error) {
        console.warn("RPC Warning:", error.message); 
        // Não dê throw aqui se quiser tentar recuperar sessão via methods padrão depois
        // Mas para manter a lógica atual, vamos assumir falha apenas se crítico
      }

      // Mapeamento dos dados
      const rawUser = data?.user;
      const rawSystem = data?.systemStatus;

      const domainUser = rawUser ? {
        id: rawUser.id,
        name: rawUser.full_name || 'Usuário',
        email: rawUser.email || '',
        role: normalizeRole(rawUser.role),
        organizationId: rawUser.organization_id,
        organizationName: rawUser.organization_name || 'Aços Vital (Interno)',
        status: rawUser.status || 'ACTIVE',
        department: rawUser.department,
        lastLogin: rawUser.last_login
      } : null;

      // CORREÇÃO AQUI: Adicionar fallback. Se o DB não retornar status, assuma ONLINE.
      // Isso impede o loop infinito no routes.tsx
      const domainSystem = rawSystem ? {
        mode: rawSystem.mode,
        message: rawSystem.message,
        scheduledStart: rawSystem.scheduled_start,
        scheduledEnd: rawSystem.scheduled_end,
        updatedBy: rawSystem.updated_by
      } : { 
        mode: 'ONLINE', // Fallback padrão
        message: '',
        scheduledStart: null,
        scheduledEnd: null,
        updatedBy: 'System'
      };

      return { user: domainUser, systemStatus: domainSystem };
    } catch (err) {
      console.error("Falha crítica no RPC get_initial_app_data:", err);
      // Retorna nulos para forçar logout em caso de falha crítica de conexão
      return { user: null, systemStatus: null };
    }
  }
};