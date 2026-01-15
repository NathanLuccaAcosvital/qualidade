import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '../lib/supabaseClient.ts';
import { userService, adminService } from '../lib/services/index.ts';
import { User, UserRole, normalizeRole, SystemStatus } from '../types/index.ts';
import { withTimeout } from '../lib/utils/apiUtils.ts';
import { AuthError, Session } from '@supabase/supabase-js';

const API_TIMEOUT = 30000;

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  systemStatus: SystemStatus | null;
  isInitialSyncComplete: boolean; // Novo estado para indicar se a primeira sincronização já ocorreu
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<User | null>;
  retryInitialSync: () => Promise<void>; // Novo método para retentar a sincronização inicial
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
    systemStatus: null,
    isInitialSyncComplete: false, // Inicialmente falso
  });

  const initialized = useRef(false);

  const syncUserProfile = useCallback(async () => {
    try {
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
      // Não rejeta, mas atualiza o estado com o erro para permitir retry na UI
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

  const initAuth = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null })); // Reset error on init
    try {
      const result: { data: { session: Session | null }; error: AuthError | null } = await withTimeout( 
        supabase.auth.getSession(), 
        API_TIMEOUT, // Usar API_TIMEOUT completo aqui
        "Tempo esgotado ao verificar sessão."
      );
      const { data, error } = result;

      if (error) throw error; // Handle potential error from getSession
      
      if (data.session) {
        await syncUserProfile();
      } else {
        const sysStatus = await withTimeout(
          adminService.getSystemStatus(), 
          API_TIMEOUT, 
          "Falha ao carregar status do sistema (sem sessão): tempo esgotado."
        );
        setState(prev => ({ ...prev, isLoading: false, systemStatus: sysStatus, user: null }));
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
    } finally {
      setState(prev => ({ ...prev, isInitialSyncComplete: true })); // Sinaliza que a tentativa inicial foi concluída
    }
  }, [syncUserProfile]);

  const retryInitialSync = useCallback(async () => {
    initialized.current = false; // Permite re-executar o useEffect da inicialização
    await initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        if (session) await syncUserProfile();
      } else if (event === 'SIGNED_OUT') {
        try {
          const sysStatus = await withTimeout( 
            adminService.getSystemStatus(), 
            API_TIMEOUT, 
            "Falha ao carregar status do sistema (após logout): tempo esgotado."
          );
          // Fix: Set isInitialSyncComplete to true on SIGNED_OUT
          setState({ user: null, isLoading: false, error: null, systemStatus: sysStatus, isInitialSyncComplete: true });
        } catch (error: any) {
          console.error("[AuthContext] Erro ao carregar status do sistema após logout:", error);
          // Fix: Set isInitialSyncComplete to true on SIGNED_OUT error
          setState({ user: null, isLoading: false, error: error.message, systemStatus: null, isInitialSyncComplete: true });
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [initAuth, syncUserProfile]);

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
        const sysStatus = await withTimeout( 
          adminService.getSystemStatus(), 
          API_TIMEOUT, 
          "Falha ao carregar status do sistema (após logout): tempo esgotado."
        );
        setState({ user: null, isLoading: false, error: null, systemStatus: sysStatus, isInitialSyncComplete: true });
      } catch (error: any) {
        console.error("[AuthContext] Erro ao carregar status do sistema após logout:", error);
        setState({ user: null, isLoading: false, error: error.message, systemStatus: null, isInitialSyncComplete: true });
      }
      window.location.hash = '#/login';
    }
  };

  const contextValue = useMemo(() => ({
    ...state,
    login,
    logout,
    refreshProfile: syncUserProfile,
    retryInitialSync // Expondo o novo método
  }), [state, syncUserProfile, retryInitialSync]);

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