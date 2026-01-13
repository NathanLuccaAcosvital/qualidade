import { User, UserRole } from '../../types.ts';
import { IUserService } from './interfaces.ts';
import { supabase } from '../supabaseClient.ts';

export const SupabaseUserService: IUserService = {
    authenticate: async (email, password): Promise<boolean> => {
        console.log("Iniciando autenticação para:", email);
        
        // Remoção da limpeza preventiva de sessões zumbis.
        // O método signInWithPassword do Supabase é projetado para lidar com sessões existentes,
        // substituindo-as automaticamente por uma nova sessão válida, tornando o signOut() prévio redundante
        // e otimizando o número de requisições de rede.

        // Passo 2: Login no Auth
        const { data, error } = await supabase.auth.signInWithPassword({ 
            email: email.trim().toLowerCase(), 
            password 
        });
        
        if (error) {
            console.error("Erro no Auth Supabase:", error.message);
            throw error;
        }

        console.log("Autenticação Auth OK. Validando perfil...");
        
        try {
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('id, role')
                .eq('id', data.user.id)
                .single();

            if (profileError) {
                console.error("Erro Crítico de RLS no Perfil:", profileError.message);
                
                if (profileError.message.includes('infinite recursion')) {
                    throw new Error("Falha Crítica de Banco de Dados: Recursão infinita detectada. O SQL de correção de políticas de JWT precisa ser executado no console do Supabase.");
                }
                
                throw new Error("Erro ao acessar dados de perfil. O administrador precisa revisar as políticas de segurança.");
            }

            if (!profile) {
                await supabase.auth.signOut();
                throw new Error("Usuário autenticado no sistema de segurança, mas perfil não encontrado no banco de dados.");
            }

            return true;
        } catch (err: any) {
            console.error("Falha na validação de login:", err.message);
            throw err;
        }
    },

    signUp: async (email, password, fullName, organizationId, department): Promise<void> => {
        const normalizedEmail = email.trim().toLowerCase();
        
        const metadata: Record<string, any> = {
            full_name: fullName.trim(),
            department: department?.trim() || 'Geral',
            organization_id: (organizationId && organizationId !== 'NEW') ? organizationId : null
        };

        const { data, error } = await supabase.auth.signUp({
            email: normalizedEmail,
            password,
            options: {
                data: metadata
            }
        });

        if (error) {
            console.error("Erro no SignUp Supabase:", error.message);
            throw error;
        }
    },

    getCurrentUser: async (): Promise<User | null> => {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        if (authError || !authUser) return null;

        const { data: profile, error } = await supabase
            .from('profiles')
            .select(`id, full_name, role, organization_id, department, status`)
            .eq('id', authUser.id)
            .maybeSingle();

        if (error || !profile) {
            return null;
        }

        return {
            id: authUser.id,
            name: profile.full_name,
            email: authUser.email!,
            role: (profile.role?.toUpperCase() || UserRole.CLIENT) as UserRole,
            clientId: profile.organization_id,
            status: profile.status as any,
            department: profile.department
        };
    },

    logout: async (): Promise<void> => {
        await supabase.auth.signOut();
    },

    getUsers: async (): Promise<User[]> => {
        const { data, error } = await supabase
            .from('profiles')
            .select(`
                *,
                organizations (name)
            `)
            .order('full_name');
            
        if (error) {
            console.error("Erro ao buscar usuários:", error);
            throw error;
        }
        
        return (data || []).map(p => ({
            id: p.id,
            name: p.full_name,
            email: p.email || '',
            role: (p.role?.toUpperCase() || UserRole.CLIENT) as UserRole,
            clientId: p.organizations?.name || 'Interno',
            status: p.status as any,
            department: p.department,
            lastLogin: p.last_login ? new Date(p.last_login).toLocaleString() : 'Nunca'
        }));
    },

    getUsersByRole: async (role: UserRole): Promise<User[]> => {
        const { data, error } = await supabase
            .from('profiles')
            .select('id, full_name, email, role, organization_id, department, status')
            .eq('role', role); // Removido .toLowerCase()
        
        if (error) {
            console.error(`Erro ao buscar usuários com papel ${role}:`, error);
            throw error;
        }

        return (data || []).map(p => ({
            id: p.id,
            name: p.full_name,
            email: p.email || '',
            role: (p.role?.toUpperCase() || UserRole.CLIENT) as UserRole,
            clientId: p.organization_id,
            status: p.status as any,
            department: p.department
        }));
    },

    saveUser: async (user, initialPassword) => {
        const { error } = await supabase.from('profiles').upsert({
            id: user.id,
            full_name: user.name,
            role: user.role,
            organization_id: (user.clientId && user.clientId !== 'Interno') ? user.clientId : null,
            status: user.status,
            department: user.department,
            updated_at: new Date().toISOString()
        });
        if (error) throw error;
    },

    changePassword: async (userId, current, newPass): Promise<boolean> => {
        const { error } = await supabase.auth.updateUser({ password: newPass });
        if (error) throw error;
        return true;
    },

    deleteUser: async (userId): Promise<void> => {
        const { error } = await supabase.from('profiles').delete().eq('id', userId);
        if (error) throw error;
    },

    blockUserById: async (adminUser, targetUserId, reason): Promise<void> => {
        const { error } = await supabase.from('profiles').update({ status: 'BLOCKED' }).eq('id', targetUserId);
        if (error) throw error;
    },

    getUserStats: async () => {
        const { count: total } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        const { count: clients } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'CLIENT');
        return { total: total || 0, active: total || 0, clients: clients || 0 };
    },

    generateRandomPassword: () => Math.random().toString(36).slice(-10)
};