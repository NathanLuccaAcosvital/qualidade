import { User, UserRole, AccountStatus } from '../../types/auth.ts';
import { IUserService, RawProfile } from './interfaces.ts';
import { supabase } from '../supabaseClient.ts';
import { logAction } from './loggingService.ts';
import { normalizeRole } from '../mappers/roleMapper.ts';
import { withTimeout } from '../utils/apiUtils.ts';
// Fix: Replace `UserResponse` with `AuthResponse` for methods that return auth data,
// and alias Supabase's `User` type to avoid conflicts with local `User` interface.
// Fix: Removed `UpdateUserResponse` as it's not exported by `@supabase/supabase-js`.
import { AuthError, Session, User as SupabaseUser, AuthResponse, PostgrestSingleResponse, PostgrestResponse } from '@supabase/supabase-js';

const API_TIMEOUT = 8000; // Timeout de 8s para a maioria das operações
const LOGOUT_API_TIMEOUT = 15000; // Timeout de 15s especificamente para logout

/**
 * Mapper: Database Row (Profiles) -> Domain User (App)
 */
const toDomainUser = (row: RawProfile | null, sessionEmail?: string): User | null => {
  if (!row) return null;
  
  // Trata organizações vindo como objeto ou array (comum no Supabase)
  const orgData = Array.isArray(row.organizations) ? row.organizations[0] : row.organizations;

  return {
    id: row.id,
    name: row.full_name || 'Usuário Sem Nome',
    email: row.email || sessionEmail || '',
    role: normalizeRole(row.role),
    organizationId: row.organization_id || undefined,
    organizationName: orgData?.name || 'Aços Vital (Interno)',
    status: (row.status as AccountStatus) || AccountStatus.ACTIVE,
    department: row.department || undefined,
    lastLogin: row.last_login || undefined
  };
};

export const SupabaseUserService: IUserService = {
  authenticate: async (email, password) => {
    try {
      const authPromise = Promise.resolve(supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      }));

      const result: { data: { session: Session | null }; error: AuthError | null } = await withTimeout(
        authPromise,
        API_TIMEOUT,
        "Tempo esgotado ao autenticar. Verifique sua conexão."
      );
      const { error } = result;

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
    // 1. Auth SignUp
    const authPromise = Promise.resolve(supabase.auth.signUp({ 
        email: email.trim().toLowerCase(), 
        password 
      }));
    
    // Fix: Use `AuthResponse` directly as the return type for `signUp`
    const authResult: AuthResponse = await withTimeout( 
      authPromise,
      API_TIMEOUT,
      "Tempo esgotado ao registrar usuário."
    );
    const { data, error: authError } = authResult;
    
    if (authError) throw authError;

    // 2. Profile Creation
    // Fix: `data.user` is now correctly typed as `SupabaseUser | null` from `AuthResponse`
    if (data.user) {
      const profilePromise: Promise<PostgrestResponse<null>> = Promise.resolve(supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: fullName.trim(),
          email: email.trim().toLowerCase(),
          organization_id: organizationId || null,
          department: department || null,
          role: role,
          status: 'ACTIVE'
        }));

      const profileResult = await withTimeout( 
        profilePromise,
        API_TIMEOUT,
        "Tempo esgotado ao criar perfil."
      );
      const { error: profileError } = profileResult;

      if (profileError) {
        console.error("Erro ao criar perfil:", profileError);
        throw new Error("Usuário criado, mas houve um erro ao configurar o perfil.");
      }
    }
  },

  getCurrentUser: async () => {
    try {
      const sessionResult: { data: { session: Session | null }; error: AuthError | null } = await withTimeout( 
        Promise.resolve(supabase.auth.getSession()),
        API_TIMEOUT,
        "Tempo esgotado ao buscar sessão de usuário."
      );
      
      const { data: { session } } = sessionResult;
      if (!session?.user) return null;

      const profileQuery = supabase
        .from('profiles')
        .select('*, organizations!organization_id(name)')
        .eq('id', session.user.id)
        .maybeSingle();

      const profileFetchResult: PostgrestSingleResponse<RawProfile> = await withTimeout( 
        Promise.resolve(profileQuery),
        API_TIMEOUT,
        "Tempo esgotado ao buscar perfil do usuário."
      );
      
      const { data: profile, error } = profileFetchResult;

      if (error) {
        console.warn("[getCurrentUser] Falha ao carregar perfil:", error.message);
        return null; 
      }
      
      if (!profile) return null;

      return toDomainUser(profile, session.user.email);
    } catch (e: any) {
      console.error("[getCurrentUser] Erro geral:", e.message);
      return null;
    }
  },

  logout: async () => {
    const result: { error: AuthError | null } = await withTimeout( 
      Promise.resolve(supabase.auth.signOut()),
      LOGOUT_API_TIMEOUT, // Usar o timeout específico para logout
      "Tempo esgotado ao fazer logout."
    );
    const { error } = result;
    if (error) throw error;
    // localStorage.clear(); // Removido, agora gerenciado no AuthContext
  },

  getUsers: async () => {
    const usersPromise: Promise<PostgrestResponse<RawProfile>> = Promise.resolve(supabase
        .from('profiles')
        .select('*, organizations!organization_id(name)')
        .order('full_name'));

    const result = await withTimeout( 
      usersPromise,
      API_TIMEOUT,
      "Tempo esgotado ao buscar usuários."
    );
    const { data, error } = result;
    if (error) throw error;

    return (data || [])
      .map(p => toDomainUser(p))
      .filter((u): u is User => u !== null);
  },

  getUsersByRole: async (role) => {
    const usersByRolePromise: Promise<PostgrestResponse<RawProfile>> = Promise.resolve(supabase
        .from('profiles')
        .select('*, organizations!organization_id(name)')
        .eq('role', role));

    const result = await withTimeout( 
      usersByRolePromise,
      API_TIMEOUT,
      `Tempo esgotado ao buscar usuários por role (${role}).`
    );
    const { data, error } = result;
    if (error) throw error;

    return (data || [])
      .map(p => toDomainUser(p))
      .filter((u): u is User => u !== null);
  },

  saveUser: async (u) => {
    const saveUserPromise: Promise<PostgrestResponse<null>> = Promise.resolve(supabase.from('profiles').update({
        full_name: u.name,
        role: u.role,
        organization_id: u.organizationId || null,
        status: u.status,
        department: u.department || null,
        updated_at: new Date().toISOString()
      }).eq('id', u.id));

    const result = await withTimeout( 
      saveUserPromise,
      API_TIMEOUT,
      "Tempo esgotado ao salvar usuário."
    );
    const { error } = result;
    if (error) throw error;
  },

  // Fix: Corrected the type of `updatePasswordPromise` from `UserResponse` to `AuthResponse` and simplified the promise creation.
  changePassword: async (userId, current, newPass) => {
    const updatePasswordPromise = supabase.auth.updateUser({ password: newPass });

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
    const deleteUserPromise: Promise<PostgrestResponse<null>> = Promise.resolve(
      supabase.from('profiles').delete().eq('id', id)
    );
    const result = await withTimeout( 
      deleteUserPromise,
      API_TIMEOUT,
      "Tempo esgotado ao deletar usuário."
    );
    const { error } = result;
    if (error) throw error;
  },

  blockUserById: async (admin, target, reason) => {
    const blockUserPromise: Promise<PostgrestResponse<null>> = Promise.resolve(
      supabase.from('profiles').update({ status: 'BLOCKED' }).eq('id', target)
    );
    const result = await withTimeout( 
      blockUserPromise,
      API_TIMEOUT,
      "Tempo esgotado ao bloquear usuário."
    );
    const { error } = result;
    if (error) throw error;
    await logAction(admin, 'SEC_USER_BLOCKED', target, 'SECURITY', 'CRITICAL', 'SUCCESS', { reason });
  },

  getUserStats: async () => {
    const [totalResult, activeResult] = await withTimeout( 
      Promise.all([
        Promise.resolve(supabase.from('profiles').select('*', { count: 'exact', head: true })),
        Promise.resolve(supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'ACTIVE'))
      ]),
      API_TIMEOUT,
      "Tempo esgotado ao buscar estatísticas de usuário."
    );
    return { total: totalResult.count || 0, active: activeResult.count || 0, clients: 0 };
  },

  generateRandomPassword: () => Math.random().toString(36).slice(-10)
};