
import { User, UserRole, AccountStatus } from '../../types/auth.ts';
import { IUserService } from './interfaces.ts';
import { supabase } from '../supabaseClient.ts';
import { logAction } from './loggingService.ts';
import { normalizeRole } from '../mappers/roleMapper.ts';

/**
 * Mapper: Database Row (Profiles) -> Domain User (App)
 */
const toDomainUser = (row: any, sessionEmail?: string): User => {
  if (!row) return null as any;
  
  // Trata organizações vindo como objeto ou array (comum no Supabase)
  const orgData = Array.isArray(row.organizations) ? row.organizations[0] : row.organizations;

  return {
    id: row.id,
    name: row.full_name || 'Usuário Sem Nome',
    email: row.email || sessionEmail || '',
    role: normalizeRole(row.role),
    organizationId: row.organization_id,
    organizationName: orgData?.name || 'Aços Vital (Interno)',
    status: (row.status as AccountStatus) || AccountStatus.ACTIVE,
    department: row.department,
    lastLogin: row.last_login
  };
};

export const SupabaseUserService: IUserService = {
  authenticate: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      });

      if (error) {
        return { 
          success: false, 
          error: error.message === "Invalid login credentials" 
            ? "E-mail ou senha incorretos." 
            : "Falha na autenticação."
        };
      }
      
      return { success: true };
    } catch (e) {
      return { success: false, error: "Erro de conexão." };
    }
  },

  signUp: async (email, password, fullName, organizationId, department, role = UserRole.QUALITY) => {
    // 1. Auth SignUp (Supabase Auth)
    const { data, error: authError } = await supabase.auth.signUp({ 
      email: email.trim().toLowerCase(), 
      password 
    });
    
    if (authError) throw authError;

    // 2. Profile Creation (Public Profiles Table)
    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        organization_id: organizationId || null,
        department: department || null,
        role: role,
        status: 'ACTIVE'
      });

      if (profileError) {
        console.error("Erro ao criar perfil:", profileError);
        throw new Error("Usuário criado, mas houve um erro ao configurar o perfil.");
      }
    }
  },

  getCurrentUser: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return null;

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*, organizations!organization_id(name)')
        .eq('id', session.user.id)
        .maybeSingle();

      if (error) {
        const { data: basicProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();
          
        if (!basicProfile) return null;
        return toDomainUser(basicProfile, session.user.email);
      }

      if (!profile) return null;

      return toDomainUser(profile, session.user.email);
    } catch (e) {
      return null;
    }
  },

  logout: async () => {
    await supabase.auth.signOut();
    localStorage.clear();
  },

  getUsers: async () => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*, organizations!organization_id(name)')
        .order('full_name');
    if (error) throw error;
    return (data || []).map(p => toDomainUser(p));
  },

  getUsersByRole: async (role) => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*, organizations!organization_id(name)')
        .eq('role', role);
    if (error) throw error;
    return (data || []).map(p => toDomainUser(p));
  },

  saveUser: async (u) => {
    const { error } = await supabase.from('profiles').update({
      full_name: u.name,
      role: u.role,
      organization_id: u.organizationId,
      status: u.status,
      department: u.department,
      updated_at: new Date().toISOString()
    }).eq('id', u.id);
    if (error) throw error;
  },

  changePassword: async (userId, current, newPass) => {
    const { error } = await supabase.auth.updateUser({ password: newPass });
    if (error) throw error;
    return true;
  },

  deleteUser: async (id) => {
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) throw error;
  },

  blockUserById: async (admin, target, reason) => {
    await supabase.from('profiles').update({ status: 'BLOCKED' }).eq('id', target);
    await logAction(admin, 'SEC_USER_BLOCKED', target, 'SECURITY', 'CRITICAL', 'SUCCESS', { reason });
  },

  getUserStats: async () => {
    const [total, active] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'ACTIVE')
    ]);
    return { total: total.count || 0, active: active.count || 0, clients: 0 };
  },

  generateRandomPassword: () => Math.random().toString(36).slice(-10)
};
