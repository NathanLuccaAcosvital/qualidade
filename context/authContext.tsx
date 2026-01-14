import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '../lib/supabaseClient.ts';
import { userService, adminService } from '../lib/services/index.ts';
import { User, UserRole, normalizeRole, SystemStatus } from '../types/index.ts';
import { withTimeout } from '../lib/utils/apiUtils.ts'; // Import withTimeout
// import { config } from '../lib/config.ts'; // Removido
// Fix: Import necessary Supabase types for explicit typing
import { AuthError, Session } from '@supabase/supabase-js';

const API_TIMEOUT = 15000; // Definido localmente

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  systemStatus: SystemStatus | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider Remasterizado
 * Gerencia a sessão do Supabase e sincroniza o perfil do usuário (Profiles).
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
    systemStatus: null,
  });

  const initialized = useRef(false);

  const syncUserProfile = useCallback(async () => {
    try {
      // Aplicar timeout às chamadas de serviço para prevenir hangs
      const [currentUser, sysStatus] = await Promise.all([
        withTimeout(userService.getCurrentUser(), API_TIMEOUT, "Falha ao carregar perfil: tempo esgotado."),
        withTimeout(adminService.getSystemStatus(), API_TIMEOUT, "Falha ao carregar status do sistema: tempo esgotado."),
      ]);
      
      if (currentUser) {
        currentUser.role = normalizeRole(currentUser.role);
      }

      setState(prev => ({ 
        ...prev, 
        user: currentUser, 
        isLoading: false,
        error: null,
        systemStatus: sysStatus,
      }));
      
      return currentUser;
    } catch (error: any) {
      console.error("[AuthContext] Erro na Sincronização:", error);
      setState(prev => ({ 
        ...prev, 
        user: null, 
        isLoading: false, 
        error: error.message || "Erro desconhecido na sincronização.", 
        systemStatus: null 
      }));
      return null;
    }
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const initAuth = async () => {
      setState(prev => ({ ...prev, isLoading: true, error: null })); // Reset error on init
      try {
        // Fix: Explicitly destructure `result` to correctly infer types from `withTimeout`
        // Fix: Added explicit type for result from withTimeout(supabase.auth.getSession())
        const result: { data: { session: Session | null }; error: AuthError | null } = await withTimeout( 
          supabase.auth.getSession(), 
          API_TIMEOUT / 2, 
          "Tempo esgotado ao verificar sessão."
        );
        const { data, error } = result;

        if (error) throw error; // Handle potential error from getSession
        
        if (data.session) {
          await syncUserProfile();
        } else {
          // Mesmo sem sessão, tenta obter o status do sistema, mas com timeout
          const sysStatus = await withTimeout(
            adminService.getSystemStatus(), 
            API_TIMEOUT, 
            "Falha ao carregar status do sistema (sem sessão): tempo esgotado."
          );
          setState(prev => ({ ...prev, isLoading: false, systemStatus: sysStatus }));
        }
      } catch (error: any) {
        console.error("[AuthContext] Erro na inicialização do Auth:", error);
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          user: null, 
          error: error.message || "Falha crítica na inicialização.", 
          systemStatus: null 
        }));
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        if (session) await syncUserProfile();
      } else if (event === 'SIGNED_OUT') {
        try {
          const sysStatus = await withTimeout( // Timeout para obter status após logout
            adminService.getSystemStatus(), 
            API_TIMEOUT, 
            "Falha ao carregar status do sistema (após logout): tempo esgotado."
          );
          setState({ user: null, isLoading: false, error: null, systemStatus: sysStatus });
        } catch (error: any) {
          console.error("[AuthContext] Erro ao carregar status do sistema após logout:", error);
          setState({ user: null, isLoading: false, error: error.message, systemStatus: null });
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [syncUserProfile]);

  const login = async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const authResult = await userService.authenticate(email, password);
      if (!authResult.success) {
        setState(prev => ({ ...prev, isLoading: false, error: authResult.error }));
        return authResult;
      }
      await syncUserProfile();
      return { success: true };
    } catch (err: any) {
      const msg = err.message || "Falha na autenticação.";
      setState(prev => ({ ...prev, isLoading: false, error: msg }));
      return { success: false, error: msg };
    }
  };

  const logout = async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      await userService.logout();
    } finally {
      try {
        const sysStatus = await withTimeout( // Timeout para obter status após logout
          adminService.getSystemStatus(), 
          API_TIMEOUT, 
          "Falha ao carregar status do sistema (após logout): tempo esgotado."
        );
        setState({ user: null, isLoading: false, error: null, systemStatus: sysStatus });
      } catch (error: any) {
        console.error("[AuthContext] Erro ao carregar status do sistema após logout:", error);
        setState({ user: null, isLoading: false, error: error.message, systemStatus: null });
      }
      window.location.hash = '#/login';
    }
  };

  const contextValue = useMemo(() => ({
    ...state,
    login,
    logout,
    refreshProfile: syncUserProfile
  }), [state, syncUserProfile]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
};