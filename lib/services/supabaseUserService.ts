
import { User } from '../../types/auth.ts';
import { UserRole, AccountStatus } from '../../types/enums.ts';
import { IUserService } from './interfaces.ts';
import { supabase } from '../supabaseClient.ts';
import { logAction } from './loggingService.ts';
import { normalizeRole } from '../mappers/roleMapper.ts';
import { AuthError } from '@supabase/supabase-js';

const normalizeAuthError = (error: AuthError): string => {
  const msg = error.message.toLowerCase();
  if (msg.includes("invalid login credentials")) return "auth.errors.invalidCredentials";
  if (msg.includes("too many requests")) return "auth.errors.tooManyRequests";
  if (msg.includes("user already registered")) return "auth.errors.alreadyRegistered";
  return "auth.errors.unexpected";
};

/**
 * Converte dados brutos do banco para o modelo de domínio User.
 */
const toDomainUser = (row: any, sessionUser?: any): User | null => {
  if (!row && sessionUser) {
    return {
      id: sessionUser.id,
      name: sessionUser.user_metadata?.full_name || 'Usuário Vital',
      email: sessionUser.email || '',
      role: normalizeRole(sessionUser.user_metadata?.role),
      organizationId: sessionUser.user_metadata?.organization_id,
      organizationName: 'Aços Vital (Sincronizando...)',
      status: AccountStatus.ACTIVE,
      department: sessionUser.user_metadata?.user_type || 'CLIENT_INTERNAL',
      isPendingDeletion: false
    };
  }

  if (!row) return null;

  const orgData = Array.isArray(row.organizations) ? row.organizations[0] : row.organizations;
  const isPendingDeletion = sessionUser?.user_metadata?.is_pending_deletion === true || row.department === 'PENDING_DELETION';

  return {
    id: row.id,
    name: row.full_name || sessionUser?.user_metadata?.full_name || 'Usuário Sem Nome',
    email: row.email || sessionUser?.email || '',
    role: normalizeRole(row.role),
    organizationId: row.organization_id || undefined,
    organizationName: orgData?.name || 'Aços Vital (Interno)',
    status: (row.status as AccountStatus) || AccountStatus.ACTIVE,
    department: row.department || 'CLIENT_INTERNAL',
    lastLogin: row.last_login || undefined,
    isPendingDeletion
  };
};

export const SupabaseUserService: IUserService = {
  authenticate: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password
    });
    if (error) return { success: false, error: normalizeAuthError(error) };
    return { success: true };
  },

  signUp: async (email, password, fullName, organizationId, userType, role = UserRole.CLIENT) => {
    const emailClean = email.trim().toLowerCase();
    
    // Normalização rigorosa do ID da Organização (UUID ou null)
    const validOrgId = (organizationId && organizationId.trim() !== "" && organizationId !== "null") 
      ? organizationId 
      : null;

    // 1. Verificação preventiva para evitar erro de duplicidade no meio do processo
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', emailClean)
      .maybeSingle();
    
    if (existingProfile) {
      throw new Error(`O e-mail ${emailClean} já possui um perfil técnico no sistema.`);
    }

    // 2. Criar credenciais no Auth
    const { data, error: authError } = await supabase.auth.signUp({
      email: emailClean,
      password,
      options: {
        data: {
          full_name: fullName,
          user_type: userType,
          role: role,
          organization_id: validOrgId,
          is_pending_deletion: false
        }
      }
    });

    if (authError) throw new Error(authError.message);
    if (!data.user) throw new Error("O provedor de segurança não retornou um identificador válido.");

    // 3. Criar Perfil Técnico (A sincronização que estava falhando)
    // Usamos .insert() em vez de .upsert() para garantir que não estamos sobrescrevendo nada indevidamente
    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      full_name: fullName,
      email: emailClean,
      role: role,
      organization_id: validOrgId,
      department: userType,
      status: 'ACTIVE',
      updated_at: new Date().toISOString()
    });

    if (profileError) {
      console.error("[CRITICAL] Profile Sync Error:", profileError);
      
      // Lógica de Rollback: Se o perfil falhou, as credenciais auth ficam inúteis.
      // Em um ambiente ideal, isso seria uma Edge Function, mas aqui tentamos remediar.
      // Nota: O Admin pode precisar deletar o usuário manualmente no Dashboard do Supabase se o rollback falhar.
      
      const detailedError = profileError.code === '23503' 
        ? "Vínculo organizacional inválido. Verifique se a empresa selecionada ainda existe."
        : "Erro interno de permissão ao gravar dados técnicos.";

      throw new Error(`Falha na sincronização: ${detailedError}`);
    }

    await logAction(null, 'USER_CREATED', emailClean, 'AUTH', 'INFO', 'SUCCESS', { userType, role, organizationId: validOrgId });
  },

  getCurrentUser: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*, organizations!organization_id(name)')
      .eq('id', session.user.id)
      .maybeSingle();

    return toDomainUser(profile, session.user);
  },

  getUsers: async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, organizations!organization_id(name)')
      .order('full_name');

    if (error) throw error;
    return (data || []).map(p => toDomainUser(p));
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
    
    // Sincroniza metadados do Auth para garantir que o token JWT reflita as mudanças no próximo refresh
    await supabase.auth.updateUser({
      data: { 
        full_name: u.name, 
        role: u.role, 
        organization_id: validOrgId 
      }
    });

    await logAction(null, 'USER_UPDATED', u.email, 'DATA', 'INFO', 'SUCCESS', { id: u.id });
  },

  flagUserForDeletion: async (userId: string, adminUser: User) => {
    const { error } = await supabase.from('profiles').update({
      status: 'INACTIVE', 
      department: 'PENDING_DELETION' 
    }).eq('id', userId);

    if (error) throw error;
    await logAction(adminUser, 'USER_FLAGGED_DELETION', userId, 'SECURITY', 'WARNING', 'SUCCESS');
  },

  logout: async () => {
    await supabase.auth.signOut();
    localStorage.clear();
  },

  getUsersByRole: async (role) => {
    const { data, error } = await supabase.from('profiles').select('*, organizations!organization_id(name)').eq('role', role);
    if (error) throw error;
    return (data || []).map(p => toDomainUser(p));
  },

  changePassword: async (userId, current, newPass) => {
    const { error } = await supabase.auth.updateUser({ password: newPass });
    if (error) throw error;
    return true;
  },

  deleteUser: async (_userId: string) => {
    throw new Error("A exclusão direta foi desativada por política de segurança da Aços Vital. Use 'Sinalizar para Exclusão'.");
  },

  getUserStats: async () => {
    const [total, active] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'ACTIVE')
    ]);
    return { total: total.count || 0, active: active.count || 0, clients: 0 };
  }
};
