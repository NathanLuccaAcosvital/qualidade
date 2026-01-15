import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '../lib/supabaseClient.ts';
import { userService, supabaseAppService } from '../lib/services/index.ts'; // Importe o appService
import { User, SystemStatus } from '../types/index.ts';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  systemStatus: SystemStatus | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
    systemStatus: null,
  });

  const mounted = useRef(true);

  // NOVA LÓGICA: 1 Request Único (RPC)
  const initializeAuth = async () => {
    try {
      // Chama o RPC que busca TUDO de uma vez (User + SystemStatus)
      const { user, systemStatus } = await supabaseAppService.getInitialData();

      if (mounted.current) {
        setState({
          user,
          systemStatus: systemStatus as SystemStatus,
          isLoading: false,
          error: null
        });
      }
    } catch (error: any) {
      console.error("[AuthContext] Erro Crítico:", error);
      if (mounted.current) {
        setState(s => ({ 
          ...s, 
          isLoading: false, 
          error: "Erro de conexão com o servidor." 
        }));
      }
    }
  };

  useEffect(() => {
    mounted.current = true;
    
    // 1. Inicializa App
    initializeAuth();

    // 2. Ouve mudanças de login/logout
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      // Apenas recarrega dados se houver mudança real de sessão
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        await initializeAuth();
      }
    });

    return () => {
      mounted.current = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    // Login padrão do Supabase
    const result = await userService.authenticate(email, password);
    
    if (!result.success) {
      setState(prev => ({ ...prev, isLoading: false, error: result.error }));
      return result;
    }
    
    // Se o login funcionar, o 'onAuthStateChange' acima vai disparar o initializeAuth() automaticamente
    return { success: true };
  };

  const logout = async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      await userService.logout();
      // O redirecionamento é bom para limpar estados de memória
      window.location.href = '/'; 
    } catch (error) {
       console.error("Erro ao sair", error);
       setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Permite recarregar manualmente se necessário
  const refreshProfile = async () => {
    await initializeAuth();
  };

  const value = useMemo(() => ({
    ...state,
    login,
    logout,
    refreshProfile
  }), [state]);

  return (
    <AuthContext.Provider value={value}>
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