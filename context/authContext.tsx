
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '../lib/supabaseClient.ts';
import { userService } from '../lib/services/index.ts';
import { User, UserRole, normalizeRole } from '../types/index.ts';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
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
    error: null
  });

  const initialized = useRef(false);

  const syncUserProfile = useCallback(async () => {
    try {
      const currentUser = await userService.getCurrentUser();
      
      if (currentUser) {
        // Força a normalização para garantir que 'CLIENT' ou 'CLIENTE' vire UserRole.CLIENT
        currentUser.role = normalizeRole(currentUser.role);
      }

      setState(prev => ({ 
        ...prev, 
        user: currentUser, 
        isLoading: false,
        error: null 
      }));
      
      return currentUser;
    } catch (error: any) {
      console.error("[AuthContext] Erro na Sincronização:", error);
      setState(prev => ({ ...prev, user: null, isLoading: false, error: error.message }));
      return null;
    }
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await syncUserProfile();
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        if (session) await syncUserProfile();
      } else if (event === 'SIGNED_OUT') {
        setState({ user: null, isLoading: false, error: null });
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
      setState({ user: null, isLoading: false, error: null });
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
