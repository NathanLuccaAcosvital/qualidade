// Fix: Updated import path for 'types' module to explicitly include '/index'
import { User, UserRole } from '../../types/index'; // Atualizado
import { IUserService } from './interfaces.ts';
import { supabase } from '../supabaseClient.ts';
import { logAction } from './supabaseFileService.ts'; // Importa a função de logAction
import { withAuditLog } from '../utils/auditLogWrapper.ts'; // Importa o novo wrapper

export const SupabaseUserService: IUserService = {
    authenticate: async (email, password): Promise<{ success: boolean; error?: string }> => {
        const normalizedEmail = email.trim().toLowerCase();
        
        try {
            const authServiceCall = async () => {
                const { data, error } = await supabase.auth.signInWithPassword({ 
                    email: normalizedEmail, 
                    password 
                });
                if (error) throw error;
                return data;
            };

            const authData = await withAuditLog(null, 'LOGIN_ATTEMPT', {
                target: normalizedEmail, 
                category: 'AUTH', 
                initialSeverity: 'INFO',
                errorSeverity: 'WARNING',
                metadata: { email: normalizedEmail }
            }, authServiceCall);

            const user = authData.user;

            const profileServiceCall = async () => {
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('id, full_name, role, status, organization_id')
                    .eq('id', user.id)
                    .single();

                if (profileError) throw profileError;
                return profile;
            };

            const profile = await withAuditLog({ id: user.id, email: normalizedEmail, name: 'Unknown', role: 'UNKNOWN' as UserRole }, 'PROFILE_FETCH', {
                target: normalizedEmail,
                category: 'AUTH',
                initialSeverity: 'INFO',
                errorSeverity: 'CRITICAL',
                metadata: { userId: user.id }
            }, profileServiceCall);


            if (!profile) {
                await supabase.auth.signOut();
                throw new Error("Usuário autenticado no sistema de segurança, mas perfil não encontrado no banco de dados.");
            }

            if (profile.status === 'BLOCKED') {
                await supabase.auth.signOut();
                throw new Error("Sua conta está bloqueada. Entre em contato com o administrador.");
            }

            const updateLastLoginCall = async () => {
                await supabase.from('profiles').update({ last_login: new Date().toISOString() }).eq('id', user.id);
            };
            await withAuditLog({ id: user.id, email: normalizedEmail, name: profile.full_name, role: profile.role as UserRole }, 'UPDATE_LAST_LOGIN', {
                target: normalizedEmail,
                category: 'AUTH',
                initialSeverity: 'INFO',
                errorSeverity: 'WARNING',
                metadata: { userId: user.id }
            }, updateLastLoginCall);

            return { success: true };
        } catch (err: any) {
            console.error("Falha na validação de login:", err.message);
            // logAction already called by withAuditLog, but if the error is from internal logic, log it
            if (!err.logged) { // Check if the error was already logged by the wrapper
                 await logAction(null, 'LOGIN_VALIDATION_FAILURE', normalizedEmail, 'AUTH', 'ERROR', 'FAILURE', { reason: err.message });
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

        const serviceCall = async () => {
            const { error } = await supabase.auth.signUp({
                email: normalizedEmail,
                password,
                options: {
                    data: metadata
                }
            });
            if (error) throw error;
        };

        await withAuditLog(null, 'SIGNUP', {
            target: normalizedEmail, 
            category: 'AUTH', 
            initialSeverity: 'INFO', 
            errorSeverity: 'ERROR',
            metadata: { fullName, organizationId }
        }, serviceCall);
    },

    getCurrentUser: async (): Promise<User | null> => {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        if (authError || !authUser) return null;

        const serviceCall = async () => {
            const { data: profile, error } = await supabase
                .from('profiles')
                .select(`id, full_name, role, organization_id, department, status, email`)
                .eq('id', authUser.id)
                .maybeSingle();

            if (error || !profile) return null;
            return {
                id: authUser.id,
                name: profile.full_name,
                email: authUser.email!,
                role: (profile.role?.toUpperCase() || UserRole.CLIENT) as UserRole,
                organizationId: profile.organization_id,
                status: (profile.status || 'ACTIVE') as any,
                department: profile.department
            };
        };
        // No need to log success/failure for getCurrentUser frequently, it's a utility.
        // If an error occurs, it's handled by the caller or caught here.
        return serviceCall();
    },

    logout: async (): Promise<void> => {
        const currentUser = await SupabaseUserService.getCurrentUser();
        const serviceCall = async () => {
            await supabase.auth.signOut();
        };

        await withAuditLog(currentUser, 'LOGOUT', { 
            target: currentUser?.email || 'Unknown', 
            category: 'AUTH', 
            initialSeverity: 'INFO',
            errorSeverity: 'ERROR'
        }, serviceCall);
    },

    getUsers: async (): Promise<User[]> => {
        const serviceCall = async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select(`
                    id, full_name, role, department, status, email, last_login,
                    organization_id, 
                    organization_details:organizations!profiles_organization_id_fkey(name)
                `)
                .order('full_name');
                
            if (error) throw error;
            return (data || []).map(p => ({
                id: p.id,
                name: p.full_name,
                email: p.email || '',
                role: (p.role?.toUpperCase() || UserRole.CLIENT) as UserRole,
                organizationId: p.organization_id,
                organizationName: p.organization_details ? p.organization_details.name : 'Interno',
                status: (p.status || 'ACTIVE') as any,
                department: p.department,
                lastLogin: p.last_login ? new Date(p.last_login).toLocaleString() : 'Nunca'
            }));
        };
        // No audit log for fetching user list, it's a common admin utility
        return serviceCall();
    },

    getUsersByRole: async (role: UserRole): Promise<User[]> => {
        const serviceCall = async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, full_name, email, role, organization_id, department, status')
                .eq('role', role); 
            
            if (error) throw error;
            return (data || []).map(p => ({
                id: p.id,
                name: p.full_name,
                email: p.email || '',
                role: (p.role?.toUpperCase() || UserRole.CLIENT) as UserRole,
                organizationId: p.organization_id,
                status: (p.status || 'ACTIVE') as any,
                department: p.department
            }));
        };
        // No audit log for fetching users by role, it's a common admin utility
        return serviceCall();
    },

    saveUser: async (userToSave: User) => {
        const currentUser = await SupabaseUserService.getCurrentUser(); // Get the user performing the action
        const serviceCall = async () => {
            const { error } = await supabase.from('profiles').upsert({
                id: userToSave.id,
                full_name: userToSave.name,
                role: userToSave.role,
                organization_id: (userToSave.organizationId && userToSave.organizationId !== 'Interno') ? userToSave.organizationId : null,
                status: userToSave.status,
                department: userToSave.department,
                updated_at: new Date().toISOString()
            });
            if (error) throw error;
        };

        await withAuditLog(currentUser, 'USER_UPDATED', {
            target: userToSave.email, 
            category: 'DATA', 
            initialSeverity: 'INFO', 
            errorSeverity: 'ERROR',
            metadata: { targetUserId: userToSave.id, newRole: userToSave.role, newStatus: userToSave.status, organizationId: userToSave.organizationId }
        }, serviceCall);
    },

    changePassword: async (userId, current, newPass): Promise<boolean> => {
        const currentUser = await SupabaseUserService.getCurrentUser();
        const serviceCall = async () => {
            // Note: Supabase's updateUser password change doesn't require current password validation
            // from the client side if the user is already authenticated.
            // It uses the JWT to identify the user.
            const { error } = await supabase.auth.updateUser({ password: newPass });
            if (error) throw error;
            return true;
        };

        return await withAuditLog(currentUser, 'PASSWORD_CHANGE', {
            target: currentUser?.email || 'Unknown', 
            category: 'SECURITY', 
            initialSeverity: 'INFO', 
            errorSeverity: 'ERROR',
            metadata: { targetUserId: userId }
        }, serviceCall);
    },

    deleteUser: async (userIdToDelete: string): Promise<void> => {
        const adminUser = await SupabaseUserService.getCurrentUser();
        let targetUserEmail = `ID: ${userIdToDelete}`;

        const serviceCall = async () => {
            const { data: targetProfile, error: fetchError } = await supabase.from('profiles').select('email').eq('id', userIdToDelete).single();
            if (targetProfile) targetUserEmail = targetProfile.email;

            const { error } = await supabase.from('profiles').delete().eq('id', userIdToDelete);
            if (error) throw error;
        };

        await withAuditLog(adminUser, 'USER_DELETED', {
            target: targetUserEmail, 
            category: 'DATA', 
            initialSeverity: 'INFO', 
            errorSeverity: 'ERROR',
            metadata: { targetUserId: userIdToDelete }
        }, serviceCall);
    },

    blockUserById: async (adminUser, targetUserId, reason): Promise<void> => {
        let targetUserEmail = `ID: ${targetUserId}`;

        const serviceCall = async () => {
            const { data: targetProfile, error: fetchError } = await supabase.from('profiles').select('email').eq('id', targetUserId).single();
            if (targetProfile) targetUserEmail = targetProfile.email;

            const { error } = await supabase.from('profiles').update({ status: 'BLOCKED' }).eq('id', targetUserId);
            if (error) throw error;
        };

        await withAuditLog(adminUser, 'USER_BLOCKED', {
            target: targetUserEmail, 
            category: 'SECURITY', 
            initialSeverity: 'WARNING', 
            errorSeverity: 'ERROR',
            metadata: { targetUserId, reason }
        }, serviceCall);
    },

    getUserStats: async () => {
        const serviceCall = async () => {
            const { count: total } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
            const { count: clients } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'CLIENT');
            return { total: total || 0, active: total || 0, clients: clients || 0 };
        };
        // No audit log for stats, typically an internal method or dashboard fetch
        return serviceCall();
    },

    generateRandomPassword: () => Math.random().toString(36).slice(-10)
};