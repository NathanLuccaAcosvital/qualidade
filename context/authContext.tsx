// nathanluccaacosvital/qualidade/.../context/authContext.tsx

import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '../lib/supabaseClient.ts';
// Importamos o appService centralizado do index
import { userService, supabaseAppService } from '../lib/services/index.ts'; 
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

  // --- LÓGICA RPC (VELOCIDADE MÁXIMA) ---
  const initializeApp = async () => {
    try {
      // Chama o seu novo serviço RPC
      const { user, systemStatus } = await supabaseAppService.getInitialData();

      if (mounted.current) {
        setState({
          user,
          systemStatus,
          isLoading: false,
          error: null,
        });
      }
    } catch (error: any) {
      console.error("[Auth] Erro na inicialização:", error);
      if (mounted.current) {
        // Fallback seguro: Assume sistema ONLINE se a API falhar, para não travar o usuário
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: "Erro de conexão.",
          systemStatus: { mode: 'ONLINE' } 
        }));
      }
    }
  };

  useEffect(() => {
    mounted.current = true;
    
    // 1. Inicializa App (Busca User + Sistema em 1 request)
    initializeApp();

    // 2. Escuta mudanças de sessão (Login/Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        await initializeApp();
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
    // O 'onAuthStateChange' vai disparar o initializeApp automaticamente
    return { success: true };
  };

  const logout = async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      await userService.logout();
      window.location.href = '/'; // Limpa a memória forçando refresh
    } catch (error) {
       console.error("Erro ao sair", error);
       setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const refreshProfile = async () => {
    await initializeApp();
  };

  const contextValue = useMemo(() => ({
    ...state,
    login,
    logout,
    refreshProfile
  }), [state]);

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