import { User, UserRole, AccountStatus } from '../../types/auth.ts';
import { IUserService, RawProfile } from './interfaces.ts';
import { supabase } from '../supabaseClient.ts';
import { logAction } from './loggingService.ts';
import { normalizeRole } from '../mappers/roleMapper.ts';
import { withTimeout } from '../utils/apiUtils.ts'; // Import withTimeout
// import { config } from '../config.ts'; // Removido
import { AuthError, Session, UserResponse, PostgrestSingleResponse, PostgrestResponse } from '@supabase/supabase-js';


const API_TIMEOUT = 8000; // Definido localmente (Reduzido para 8 segundos)

/**
 * Mapper: Database Row (Profiles) -> Domain User (App)
 */
const toDomainUser = (row: RawProfile | null, sessionEmail?: string): User | null => { // Fix: Use RawProfile for input row and allow null return
  if (!row) return null;
  
  // Trata organizações vindo como objeto ou array (comum no Supabase)
  const orgData = Array.isArray(row.organizations) ? row.organizations[0] : row.organizations;

  return {
    id: row.id,
    name: row.full_name || 'Usuário Sem Nome',
    email: row.email || sessionEmail || '',
    role: normalizeRole(row.role),
    organizationId: row.organization_id || undefined, // Fix: Ensure undefined if null
    organizationName: orgData?.name || 'Aços Vital (Interno)',
    status: (row.status as AccountStatus) || AccountStatus.ACTIVE,
    department: row.department || undefined, // Fix: Ensure undefined if null
    lastLogin: row.last_login || undefined // Fix: Ensure undefined if null
  };
};

export const SupabaseUserService: IUserService = {
  authenticate: async (email, password) => {
    try {
      const authPromise = supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      });

      // Fix: Explicitly destructure result to correctly infer types from withTimeout
      const result: { data: { session: Session | null }; error: AuthError | null } = await withTimeout(
        authPromise,
        API_TIMEOUT,
        "Tempo esgotado ao autenticar. Verifique sua conexão."
      );
      const { data, error } = result;

      if (error) {
        return { 
          success: false, 
          error: error.message === "Invalid login credentials" 
            ? "E-mail ou senha incorretos." 
            : "Falha na autenticação."
        };
      }
      
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || "Erro de conexão." };
    }
  },

  signUp: async (email, password, fullName, organizationId, department, role = UserRole.QUALITY) => {
    // 1. Auth SignUp (Supabase Auth)
    // Fix: Explicitly destructure result to correctly infer types from withTimeout
    const authPromise = supabase.auth.signUp({ 
        email: email.trim().toLowerCase(), 
        password 
      });
    const authResult: { data: { user: UserResponse['user'] | null }; error: AuthError | null } = await withTimeout( 
      authPromise,
      API_TIMEOUT,
      "Tempo esgotado ao registrar usuário."
    );
    const { data, error: authError } = authResult;
    
    if (authError) throw authError;

    // 2. Profile Creation (Public Profiles Table)
    if (data.user) {
      // Fix: Explicitly destructure result to correctly infer types from withTimeout
      const profilePromise: Promise<PostgrestResponse<null>> = supabase.from('profiles').upsert({ // Fix: PostgrestResponse for upsert without select
          id: data.user.id,
          full_name: fullName.trim(),
          email: email.trim().toLowerCase(),
          organization_id: organizationId || null,
          department: department || null,
          role: role,
          status: 'ACTIVE'
        });
      const profileResult = await withTimeout( 
        profilePromise,
        API_TIMEOUT,
        "Tempo esgotado ao criar perfil."
      );
      const { error: profileError } = profileResult; // Fix: Destructure error property

      if (profileError) {
        console.error("Erro ao criar perfil:", profileError);
        throw new Error("Usuário criado, mas houve um erro ao configurar o perfil.");
      }
    }
  },

  getCurrentUser: async () => {
    try {
      // Fix: Explicitly destructure result to correctly infer types from withTimeout
      const sessionResult: { data: { session: Session | null }; error: AuthError | null } = await withTimeout( 
        supabase.auth.getSession(),
        API_TIMEOUT, // Usar API_TIMEOUT completo aqui
        "Tempo esgotado ao buscar sessão de usuário."
      );
      const { data: { session } } = sessionResult;
      if (!session?.user) return null;

      const profileQuery = supabase
        .from('profiles')
        .select('*, organizations!organization_id(name)')
        .eq('id', session.user.id)
        .maybeSingle();

      // Fix: Explicitly destructure result to correctly infer types from withTimeout
      const profileFetchResult: PostgrestSingleResponse<RawProfile> = await withTimeout( 
        profileQuery,
        API_TIMEOUT,
        "Tempo esgotado ao buscar perfil do usuário."
      );
      const { data: profile, error } = profileFetchResult;

      // Se houver erro na query ou o perfil não for encontrado, retornar null.
      // Removida a lógica de fallback para buscar perfil básico, simplificando o fluxo.
      if (error || !profile) {
        if (error) console.error("[getCurrentUser] Erro ao buscar perfil com organização:", error.message);
        return null; 
      }

      return toDomainUser(profile, session.user.email);
    } catch (e: any) {
      console.error("[getCurrentUser] Erro geral ao buscar usuário:", e.message);
      return null;
    }
  },

  logout: async () => {
    // Fix: Explicitly destructure result to correctly infer types from withTimeout
    const result: { error: AuthError | null } = await withTimeout( 
      supabase.auth.signOut(),
      API_TIMEOUT,
      "Tempo esgotado ao fazer logout."
    );
    const { error } = result;
    if (error) throw error; // Re-throw error if sign-out fails
    localStorage.clear();
  },

  getUsers: async () => {
    // Fix: Explicitly destructure result to correctly infer types from withTimeout
    const usersPromise: Promise<PostgrestResponse<RawProfile>> = supabase // Fix: RawProfile for joined data
        .from('profiles')
        .select('*, organizations!organization_id(name)')
        .order('full_name');
    const result = await withTimeout( 
      usersPromise,
      API_TIMEOUT,
      "Tempo esgotado ao buscar usuários."
    );
    const { data, error } = result; // Fix: Destructure data and error
    if (error) throw error;
    return (data || []).map(p => toDomainUser(p) as User); // Fix: Cast to User[] after mapping
  },

  getUsersByRole: async (role) => {
    // Fix: Explicitly destructure result to correctly infer types from withTimeout
    const usersByRolePromise: Promise<PostgrestResponse<RawProfile>> = supabase // Fix: RawProfile for joined data
        .from('profiles')
        .select('*, organizations!organization_id(name)')
        .eq('role', role);
    const result = await withTimeout( 
      usersByRolePromise,
      API_TIMEOUT,
      `Tempo esgotado ao buscar usuários por role (${role}).`
    );
    const { data, error } = result; // Fix: Destructure data and error
    if (error) throw error;
    return (data || []).map(p => toDomainUser(p) as User); // Fix: Cast to User[] after mapping
  },

  saveUser: async (u) => {
    // Fix: Explicitly destructure result to correctly infer types from withTimeout
    const saveUserPromise: Promise<PostgrestResponse<null>> = supabase.from('profiles').update({
        full_name: u.name,
        role: u.role,
        organization_id: u.organizationId || null, // Fix: handle undefined
        status: u.status,
        department: u.department || null, // Fix: handle undefined
        updated_at: new Date().toISOString()
      }).eq('id', u.id);
    const result = await withTimeout( 
      saveUserPromise,
      API_TIMEOUT,
      "Tempo esgotado ao salvar usuário."
    );
    const { error } = result; // Fix: Destructure error
    if (error) throw error;
  },

  changePassword: async (userId, current, newPass) => {
    // Fix: Explicitly destructure result to correctly infer types from withTimeout
    const updatePasswordPromise: Promise<{ data: UserResponse | null; error: AuthError | null }> = supabase.auth.updateUser({ password: newPass });
    const result = await withTimeout( 
      updatePasswordPromise,
      API_TIMEOUT,
      "Tempo esgotado ao alterar senha."
    );
    const { error } = result;
    if (error) throw error;
    return true;
  },

  deleteUser: async (id) => {
    // Fix: Explicitly destructure result to correctly infer types from withTimeout
    const deleteUserPromise: Promise<PostgrestResponse<null>> = supabase.from('profiles').delete().eq('id', id);
    const result = await withTimeout( 
      deleteUserPromise,
      API_TIMEOUT,
      "Tempo esgotado ao deletar usuário."
    );
    const { error } = result; // Fix: Destructure error
    if (error) throw error;
  },

  blockUserById: async (admin, target, reason) => {
    // Fix: Explicitly destructure result to correctly infer types from withTimeout
    const blockUserPromise: Promise<PostgrestResponse<null>> = supabase.from('profiles').update({ status: 'BLOCKED' }).eq('id', target);
    const result = await withTimeout( 
      blockUserPromise,
      API_TIMEOUT,
      "Tempo esgotado ao bloquear usuário."
    );
    const { error } = result; // Fix: Destructure error
    if (error) throw error;
    await logAction(admin, 'SEC_USER_BLOCKED', target, 'SECURITY', 'CRITICAL', 'SUCCESS', { reason });
  },

  getUserStats: async () => {
    // Fix: Explicitly destructure results of Promise.all to correctly infer types from withTimeout
    const [totalResult, activeResult]: [PostgrestResponse<null>, PostgrestResponse<null>] = await withTimeout( 
      Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'ACTIVE')
      ]),
      API_TIMEOUT,
      "Tempo esgotado ao buscar estatísticas de usuário."
    );
    // No error handling for Promise.all, assuming individual Supabase calls handle their errors if they resolve within timeout
    return { total: totalResult.count || 0, active: activeResult.count || 0, clients: 0 };
  },

  generateRandomPassword: () => Math.random().toString(36).slice(-10)
};