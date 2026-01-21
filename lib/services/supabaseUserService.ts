
import { UserRole, AccountStatus } from '../../types/enums.ts';
import { IUserService } from './interfaces.ts';
import { supabase } from '../supabaseClient.ts';
import { logAction } from './loggingService.ts';
import { toDomainUser } from '../mappers/userMapper.ts';

const normalizeAuthError = (error: any): string => {
  const msg = error.message?.toLowerCase() || "";
  if (msg.includes("invalid login credentials")) return "auth.errors.invalidCredentials";
  if (msg.includes("too many requests")) return "auth.errors.tooManyRequests";
  return "auth.errors.unexpected";
};

export const SupabaseUserService: IUserService = {
  authenticate: async (email, password) => {
    try {
      const { data, error } = await (supabase.auth as any).signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      });
      if (error) return { success: false, error: normalizeAuthError(error) };
      if (data.user) {
        await supabase.from('profiles').update({ last_login: new Date().toISOString() }).eq('id', data.user.id);
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: "auth.errors.unexpected" };
    }
  },

  signUp: async (email, password, fullName, organizationId, userType, role = UserRole.CLIENT) => {
    const emailClean = email.trim().toLowerCase();
    const validOrgId = (organizationId && organizationId.trim() !== "" && organizationId !== "null") ? organizationId : null;

    const { data, error: authError } = await (supabase.auth as any).signUp({
      email: emailClean,
      password,
      options: { data: { full_name: fullName, user_type: userType, role: role, organization_id: validOrgId } }
    });

    if (authError) throw authError;

    // FIX: Usamos upsert em vez de insert para evitar conflito com gatilhos (triggers) de criação automática de perfil
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: data.user!.id, 
      full_name: fullName, 
      email: emailClean, 
      role: role,
      organization_id: validOrgId, 
      department: userType, 
      status: 'ACTIVE',
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' });

    if (profileError) throw profileError;
    await logAction(null, 'USER_REGISTERED', emailClean, 'AUTH', 'INFO', 'SUCCESS');
  },

  getCurrentUser: async () => {
    const { data: { session } } = await (supabase.auth as any).getSession();
    if (!session?.user) return null;
    const { data: profile } = await supabase
      .from('profiles')
      .select('*, organizations!profiles_organization_id_fkey(name)')
      .eq('id', session.user.id)
      .maybeSingle();
    return toDomainUser(profile, session.user);
  },

  getUsers: async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, organizations!profiles_organization_id_fkey(name)')
      .order('full_name');
    if (error) throw error;
    return (data || []).map(p => toDomainUser(p)).filter(Boolean) as any;
  },

  saveUser: async (u) => {
    const validOrgId = (u.organizationId && String(u.organizationId).trim() !== "") ? u.organizationId : null;

    const { error } = await supabase.from('profiles').update({
      full_name: u.name, 
      role: u.role, 
      organization_id: validOrgId,
      department: u.department, 
      status: u.status, 
      updated_at: new Date().toISOString()
    }).eq('id', u.id);
    if (error) throw error;
  },

  flagUserForDeletion: async (userId, adminUser) => {
    const { error } = await supabase.from('profiles').update({ status: 'INACTIVE', department: 'PENDING_DELETION' }).eq('id', userId);
    if (error) throw error;
    await logAction(adminUser, 'USER_FLAGGED_DELETION', userId, 'SECURITY', 'WARNING');
  },

  logout: async () => {
    await (supabase.auth as any).signOut();
    localStorage.clear();
  },

  getUsersByRole: async (role) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, organizations!profiles_organization_id_fkey(name)')
      .eq('role', role);
    if (error) throw error;
    return (data || []).map(p => toDomainUser(p)).filter(Boolean) as any;
  },

  changePassword: async (userId, current, newPass) => {
    const { error } = await (supabase.auth as any).updateUser({ password: newPass });
    if (error) throw error;
    return true;
  },

  deleteUser: async (userId) => {
    const { error } = await supabase.from('profiles').delete().eq('id', userId);
    if (error) throw error;
  },

  getUserStats: async () => {
    const [total, active] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'ACTIVE')
    ]);
    return { total: total.count || 0, active: active.count || 0, clients: 0 };
  }
};
