
import { supabase } from '../supabaseClient';
import { normalizeRole, AccountStatus, User, SystemStatus, UserRole } from '../../types';

/**
 * appService - Gestor de Contexto Vital
 * Garante a sincronia entre Auth, Perfil e RBAC.
 */
export const appService = {
  getInitialData: async (): Promise<{ user: User | null; systemStatus: SystemStatus }> => {
    try {
      const { data: { session } } = await (supabase.auth as any).getSession();

      if (!session) {
        return { user: null, systemStatus: { mode: 'ONLINE' as const } };
      }

      // 1. Coleta dados do metadado do JWT (Imutável e rápido)
      const meta = session.user.user_metadata || {};
      
      // 2. Busca perfil para dados dinâmicos. 
      // FIX: Especificamos !profiles_organization_id_fkey para resolver o erro PGRST201
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*, organizations!profiles_organization_id_fkey(name)')
        .eq('id', session.user.id)
        .maybeSingle();

      if (profileError) console.error("[Identity] Erro ao carregar perfil:", profileError);

      // LÓGICA DE DETECÇÃO DE ROLE (Resolvendo o problema do CLIENT default)
      let detectedRoleRaw = profile?.role || meta.role;
      
      if (!detectedRoleRaw && session.user.email?.endsWith('@acosvital.com.br')) {
          detectedRoleRaw = UserRole.QUALITY; 
      }

      const finalRole = normalizeRole(detectedRoleRaw);
      
      const domainUser: User = {
        id: session.user.id,
        name: profile?.full_name || meta.full_name || 'Operador Vital',
        email: session.user.email || '',
        role: finalRole,
        organizationId: profile?.organization_id || meta.organization_id || meta.org_id,
        organizationName: profile?.organizations?.name || (finalRole === UserRole.CLIENT ? 'Parceiro Vital' : 'Aços Vital S.A.'),
        status: (profile?.status as AccountStatus) || AccountStatus.ACTIVE,
        department: profile?.department || meta.user_type,
        lastLogin: profile?.last_login
      };

      // Carrega configurações do sistema
      const { data: system } = await supabase.from('system_settings').select('*').eq('id', 1).maybeSingle();

      return { 
        user: domainUser, 
        systemStatus: system ? {
          mode: system.mode,
          message: system.message,
          scheduledStart: system.scheduled_start,
          scheduledEnd: system.scheduled_end
        } : { mode: 'ONLINE' }
      };
    } catch (err) {
      console.error("[Auth Sync] Falha crítica:", err);
      return { user: null, systemStatus: { mode: 'ONLINE' as const } };
    }
  }
};
