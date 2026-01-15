import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '../lib/supabaseClient.ts';
import { userService, adminService } from '../lib/services/index.ts';
import { User, UserRole, normalizeRole, SystemStatus } from '../types/index.ts';
import { withTimeout } from '../lib/utils/apiUtils.ts';
import { AuthError, Session } from '@supabase/supabase-js';

const API_TIMEOUT = 15000;

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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true, // Começa carregando
    error: null,
    systemStatus: null,
  });

  const initialized = useRef(false);

  // Carrega APENAS o perfil do usuário (Crítico)
  const loadUserOnly = async () => {
      try {
          const currentUser = await withTimeout(
              userService.getCurrentUser(), 
              API_TIMEOUT, 
              "Tempo esgotado ao carregar perfil."
          );
          if (currentUser) currentUser.role = normalizeRole(currentUser.role);
          return currentUser;
      } catch (err) {
          console.warn("[AuthContext] Falha ao carregar usuário:", err);
          return null;
      }
  };

  // Carrega APENAS o status do sistema (Não Crítico para login inicial)
  const loadSystemStatusOnly = async () => {
      try {
          return await withTimeout(
              adminService.getSystemStatus(), 
              API_TIMEOUT, 
              "Tempo esgotado ao verificar sistema."
          );
      } catch (err) {
          console.warn("[AuthContext] Falha ao carregar status do sistema:", err);
          return null; // Retorna null mas não trava o app
      }
  };

  // Sincronização Unificada
  const syncUserProfile = useCallback(async () => {
    // 1. Dispara as requisições em paralelo, mas SEM Promise.all que falha se um falhar
    const userPromise = loadUserOnly();
    const statusPromise = loadSystemStatusOnly();

    // 2. Aguarda resultados
    const currentUser = await userPromise;
    const sysStatus = await statusPromise;

    setState(prev => ({ 
        ...prev, 
        user: currentUser, 
        isLoading: false,
        error: null,
        systemStatus: sysStatus,
    }));
      
    return currentUser;
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const initAuth = async () => {
      try {
        // Tenta obter sessão do Supabase (rápido, local)
        const { data, error } = await supabase.auth.getSession();

        if (error) throw error;
        
        if (data.session) {
          // Se tem sessão, sincroniza perfil completo
          await syncUserProfile();
        } else {
          // Sem sessão: carrega status do sistema e libera loading
          const sysStatus = await loadSystemStatusOnly();
          setState(prev => ({ ...prev, isLoading: false, user: null, systemStatus: sysStatus }));
        }
      } catch (error: any) {
        console.error("[AuthContext] Erro fatal na inicialização:", error);
        // Em caso de erro grave, tenta limpar estado para não travar em loop
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          user: null, 
          error: error.message || "Falha de conexão.", 
          systemStatus: null 
        }));
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        if (session) await syncUserProfile();
      } else if (event === 'SIGNED_OUT') {
         setState(prev => ({ ...prev, user: null, isLoading: false }));
         // Recarrega status após logout para garantir infos atualizadas (ex: modo manutenção)
         const sysStatus = await loadSystemStatusOnly();
         setState(prev => ({ ...prev, systemStatus: sysStatus }));
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
      const sysStatus = await loadSystemStatusOnly();
      setState({ user: null, isLoading: false, error: null, systemStatus: sysStatus });
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