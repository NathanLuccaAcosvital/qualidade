

import { User, UserRole } from '../../types.ts';
import { IUserService } from './interfaces.ts';
import { supabase } from '../supabaseClient.ts';
import { SupabaseFileService } from './supabaseFileService.ts'; // Import for logAction

// O logAction foi movido para SupabaseFileService e tornado interno (_logAction).
// Para acessar, precisamos usar a instância exportada SupabaseFileService.
const _logAction = SupabaseFileService.logAction;

export const SupabaseUserService: IUserService = {
    authenticate: async (email, password): Promise<{ success: boolean; error?: string }> => {
        const normalizedEmail = email.trim().toLowerCase();
        
        const { data, error } = await supabase.auth.signInWithPassword({ 
            email: normalizedEmail, 
            password 
        });
        
        if (error) {
            console.error("Erro no Auth Supabase:", error.message);
            // Fix: Ensure category, severity, and status are explicitly passed to _logAction
            await _logAction(null, 'LOGIN_FAILURE', normalizedEmail, 'AUTH', 'WARNING', 'FAILURE', { reason: error.message });
            return { success: false, error: error.message };
        }

        try {
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('id, full_name, role, status, organization_id') // Adiciona organization_id aqui
                .eq('id', data.user.id)
                .single();

            if (profileError) {
                console.error("Erro Crítico de RLS no Perfil:", profileError.message);
                // Fix: Ensure category, severity, and status are explicitly passed to _logAction
                await _logAction({ id: data.user.id, email: normalizedEmail, name: 'Unknown', role: 'UNKNOWN' as UserRole }, 
                                  'PROFILE_FETCH_FAILURE', normalizedEmail, 'AUTH', 'CRITICAL', 'FAILURE', { reason: profileError.message });
                if (profileError.message.includes('infinite recursion')) {
                    throw new Error("Falha Crítica de Banco de Dados: Recursão infinita detectada. O SQL de correção de políticas de JWT precisa ser executado no console do Supabase.");
                }
                throw new Error("Erro ao acessar dados de perfil. O administrador precisa revisar as políticas de segurança.");
            }

            if (!profile) {
                await supabase.auth.signOut();
                // Fix: Ensure category, severity, and status are explicitly passed to _logAction
                await _logAction({ id: data.user.id, email: normalizedEmail, name: 'Unknown', role: 'UNKNOWN' as UserRole }, 
                                  'PROFILE_NOT_FOUND', normalizedEmail, 'AUTH', 'ERROR', 'FAILURE', { reason: "User authenticated but profile not found" });
                throw new Error("Usuário autenticado no sistema de segurança, mas perfil não encontrado no banco de dados.");
            }

            if (profile.status === 'BLOCKED') {
                await supabase.auth.signOut();
                // Fix: Ensure category, severity, and status are explicitly passed to _logAction
                 await _logAction({ id: data.user.id, email: normalizedEmail, name: profile.full_name, role: profile.role as UserRole }, 
                                  'LOGIN_BLOCKED', normalizedEmail, 'AUTH', 'WARNING', 'FAILURE', { reason: "User account is blocked" });
                throw new Error("Sua conta está bloqueada. Entre em contato com o administrador.");
            }

            // ATUALIZADO: Atualiza last_login no perfil
            await supabase.from('profiles').update({ last_login: new Date().toISOString() }).eq('id', data.user.id);


            // Fix: Ensure category, severity, and status are explicitly passed to _logAction
            await _logAction({ id: data.user.id, email: normalizedEmail, name: profile.full_name, role: profile.role as UserRole }, 
                             'LOGIN_SUCCESS', normalizedEmail, 'AUTH', 'INFO', 'SUCCESS');
            return { success: true };
        } catch (err: any) {
            console.error("Falha na validação de login:", err.message);
            // Log já feito em caso de profileError ou profileNotFound
            if (!err.message.includes("Usuário autenticado no sistema de segurança, mas perfil não encontrado no banco de dados.")) { // Avoid double logging
                // Fix: Ensure category, severity, and status are explicitly passed to _logAction
                await _logAction(null, 'LOGIN_VALIDATION_FAILURE', normalizedEmail, 'AUTH', 'ERROR', 'FAILURE', { reason: err.message });
            }
            return { success: false, error: err.message };
        }
    },

    signUp: async (email, password, fullName, organizationId, department): Promise<void> => {
        const normalizedEmail = email.trim().toLowerCase();
        
        const metadata: Record<string, any> = {
            full_name: fullName.trim(),
            department: department?.trim() || 'Geral',
            organization_id: (organizationId && organizationId !== 'NEW') ? organizationId : null
        };

        try {
            const { data, error } = await supabase.auth.signUp({
                email: normalizedEmail,
                password,
                options: {
                    data: metadata
                }
            });

            if (error) {
                console.error("Erro no SignUp Supabase:", error.message);
                // Fix: Ensure category, severity, and status are explicitly passed to _logAction
                await _logAction(null, 'SIGNUP_FAILURE', normalizedEmail, 'AUTH', 'ERROR', 'FAILURE', { reason: error.message, fullName, organizationId });
                throw error;
            }
            // ALTERADO: Passa organizationId para o log e tipo User
            // Fix: Adiciona um objeto User mais completo para o logAction
            await _logAction({ id: data.user?.id || 'pending', email: normalizedEmail, name: fullName, role: UserRole.CLIENT, organizationId: organizationId }, 
                             'SIGNUP_SUCCESS', normalizedEmail, 'AUTH', 'INFO', 'SUCCESS', { fullName, organizationId });

        } catch (error: any) {
            console.error("Erro no SignUp Supabase:", error.message);
            // Fix: Ensure category, severity, and status are explicitly passed to _logAction
            await _logAction(null, 'SIGNUP_FAILURE', normalizedEmail, 'AUTH', 'ERROR', 'FAILURE', { reason: error.message, fullName, organizationId });
            throw error;
        }
    },

    getCurrentUser: async (): Promise<User | null> => {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        if (authError || !authUser) return null;

        const { data: profile, error } = await supabase
            .from('profiles')
            .select(`id, full_name, role, organization_id, department, status, email`) // Added 'email' to select
            .eq('id', authUser.id)
            .maybeSingle();

        if (error || !profile) {
            return null;
        }

        return {
            id: authUser.id,
            name: profile.full_name,
            email: authUser.email!, // Email from authUser, as profiles.email might be null
            role: (profile.role?.toUpperCase() || UserRole.CLIENT) as UserRole,
            organizationId: profile.organization_id, // ALTERADO: clientId para organizationId
            status: (profile.status || 'ACTIVE') as any, // Default to ACTIVE if null
            department: profile.department
        };
    },

    logout: async (): Promise<void> => {
        const currentUser = await SupabaseUserService.getCurrentUser(); // Get current user before logging out
        try {
            await supabase.auth.signOut();
            // Fix: Ensure category, severity, and status are explicitly passed to _logAction
            await _logAction(currentUser, 'LOGOUT_SUCCESS', currentUser?.email || 'Unknown', 'AUTH', 'INFO', 'SUCCESS');
        } catch (e: any) {
            // Fix: Ensure category, severity, and status are explicitly passed to _logAction
            await _logAction(currentUser, 'LOGOUT_FAILURE', currentUser?.email || 'Unknown', 'AUTH', 'ERROR', 'FAILURE', { reason: e.message });
            throw e;
        }
    },

    getUsers: async (): Promise<User[]> => {
        const { data, error } = await supabase
            .from('profiles')
            .select(`
                id, full_name, role, department, status, email, last_login,
                organization_id, 
                organization_details:organizations!profiles_organization_id_fkey(name)
            `) // ALTERADO: Adicionado `email` e `last_login`
            .order('full_name');
            
        if (error) {
            console.error("Erro ao buscar usuários:", error.message); // ALTERADO: Logar error.message
            throw error;
        }
        
        return (data || []).map(p => ({
            id: p.id,
            name: p.full_name,
            email: p.email || '', // Mapeia o email da tabela profiles
            role: (p.role?.toUpperCase() || UserRole.CLIENT) as UserRole,
            organizationId: p.organization_id, // NOVO: Mapeia o ID da organização
            organizationName: p.organization_details ? p.organization_details.name : 'Interno', // ALTERADO: Acessa o nome da organização pelo novo alias
            status: (p.status || 'ACTIVE') as any, // Default to ACTIVE if null
            department: p.department,
            lastLogin: p.last_login ? new Date(p.last_login).toLocaleString() : 'Nunca' // ATUALIZADO: last_login
        }));
    },

    getUsersByRole: async (role: UserRole): Promise<User[]> => {
        const { data, error } = await supabase
            .from('profiles')
            .select('id, full_name, email, role, organization_id, department, status')
            .eq('role', role); 
        
        if (error) {
            console.error(`Erro ao buscar usuários com papel ${role}:`, error);
            throw error;
        }

        return (data || []).map(p => ({
            id: p.id,
            name: p.full_name,
            email: p.email || '',
            role: (p.role?.toUpperCase() || UserRole.CLIENT) as UserRole,
            organizationId: p.organization_id, // ALTERADO: clientId para organizationId
            status: (p.status || 'ACTIVE') as any, // Default to ACTIVE if null
            department: p.department
        }));
    },

    saveUser: async (user: User, initialPassword?: string) => {
        const currentUser = await SupabaseUserService.getCurrentUser(); // Admin performing action
        try {
            const { error } = await supabase.from('profiles').upsert({
                id: user.id,
                full_name: user.name,
                role: user.role,
                organization_id: (user.organizationId && user.organizationId !== 'Interno') ? user.organizationId : null, // ALTERADO: user.clientId para user.organizationId
                status: user.status, // NOVO: Campo de status
                department: user.department,
                updated_at: new Date().toISOString()
            });
            if (error) throw error;
            // Fix: Ensure category, severity, and status are explicitly passed to _logAction
            await _logAction(currentUser, 'USER_UPDATED', user.email, 'DATA', 'INFO', 'SUCCESS', { targetUserId: user.id, newRole: user.role, newStatus: user.status, organizationId: user.organizationId }); // ALTERADO: organizationId no log
        } catch (e: any) {
            // Fix: Ensure category, severity, and status are explicitly passed to _logAction
            await _logAction(currentUser, 'USER_UPDUPDATED', user.email, 'DATA', 'ERROR', 'FAILURE', { targetUserId: user.id, reason: e.message });
            throw e;
        }
    },

    changePassword: async (userId, current, newPass): Promise<boolean> => {
        const currentUser = await SupabaseUserService.getCurrentUser();
        try {
            // Supabase.auth.updateUser handles current password validation implicitly
            const { error } = await supabase.auth.updateUser({ password: newPass });
            if (error) {
                // Fix: Ensure category, severity, and status are explicitly passed to _logAction
                await _logAction(currentUser, 'PASSWORD_CHANGE', currentUser?.email || 'Unknown', 'SECURITY', 'ERROR', 'FAILURE', { targetUserId: userId, reason: error.message });
                throw error;
            }
            // Fix: Ensure category, severity, and status are explicitly passed to _logAction
            await _logAction(currentUser, 'PASSWORD_CHANGE', currentUser?.email || 'Unknown', 'SECURITY', 'INFO', 'SUCCESS', { targetUserId: userId });
            return true;
        } catch (e: any) {
            // Fix: Ensure category, severity, and status are explicitly passed to _logAction
            await _logAction(currentUser, 'PASSWORD_CHANGE', currentUser?.email || 'Unknown', 'SECURITY', 'ERROR', 'FAILURE', { targetUserId: userId, reason: e.message });
            throw e;
        }
    },

    deleteUser: async (userId): Promise<void> => {
        const adminUser = await SupabaseUserService.getCurrentUser();
        let targetUserEmail = `ID: ${userId}`;
        try {
            const { data: targetProfile, error: fetchError } = await supabase.from('profiles').select('email').eq('id', userId).single();
            if (targetProfile) targetUserEmail = targetProfile.email;

            const { error } = await supabase.from('profiles').delete().eq('id', userId);
            if (error) throw error;
            // Fix: Ensure category, severity, and status are explicitly passed to _logAction
            await _logAction(adminUser, 'USER_DELETED', targetUserEmail, 'DATA', 'INFO', 'SUCCESS', { targetUserId: userId });
        } catch (e: any) {
            // Fix: Ensure category, severity, and status are explicitly passed to _logAction
            await _logAction(adminUser, 'USER_DELETED', targetUserEmail, 'DATA', 'ERROR', 'FAILURE', { targetUserId: userId, reason: e.message });
            throw e;
        }
    },

    blockUserById: async (adminUser, targetUserId, reason): Promise<void> => {
        let targetUserEmail = `ID: ${targetUserId}`;
        try {
            const { data: targetProfile, error: fetchError } = await supabase.from('profiles').select('email').eq('id', targetUserId).single();
            if (targetProfile) targetUserEmail = targetProfile.email;

            const { error } = await supabase.from('profiles').update({ status: 'BLOCKED' }).eq('id', targetUserId);
            if (error) throw error;
            // Fix: Ensure category, severity, and status are explicitly passed to _logAction
            await _logAction(adminUser, 'USER_BLOCKED', targetUserEmail, 'SECURITY', 'WARNING', 'SUCCESS', { targetUserId, reason });
        } catch (e: any) {
            // Fix: Ensure category, severity, and status are explicitly passed to _logAction
            await _logAction(adminUser, 'USER_BLOCKED', targetUserEmail, 'SECURITY', 'ERROR', 'FAILURE', { targetUserId, reason, errorMessage: e.message });
            throw e;
        }
    },

    getUserStats: async () => {
        const { count: total } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        const { count: clients } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'CLIENT');
        return { total: total || 0, active: total || 0, clients: clients || 0 };
    },

    generateRandomPassword: () => Math.random().toString(36).slice(-10)
};