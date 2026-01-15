import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '../lib/supabaseClient.ts';
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

  // --- LÓGICA RPC OTIMIZADA ---
  const initializeApp = async () => {
    try {
      // 1 Request Único: Busca User + Sistema com atomicidade no banco
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
      console.error("[Auth] Erro crítico RPC:", error);
      if (mounted.current) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: "Erro de conexão.",
          systemStatus: { mode: 'ONLINE' } // Fallback para não travar o app
        }));
      }
    }
  };

  useEffect(() => {
    mounted.current = true;

    const bootstrap = async () => {
      // OTIMIZAÇÃO DE VELOCIDADE:
      // Aguarda o Supabase ler o token do LocalStorage ANTES de chamar o RPC.
      // Isso evita que o RPC rode como "Visitante" e depois rode de novo como "Admin".
      await supabase.auth.getSession(); 
      
      if (mounted.current) {
        await initializeApp();
      }
    };

    bootstrap();

    // Listener para eventos futuros (Login/Logout manual)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      // Ignora INITIAL_SESSION pois o 'bootstrap' acima já cuida disso mais rápido
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
    
    const result = await userService.authenticate(email, password);
    
    if (!result.success) {
      setState(prev => ({ ...prev, isLoading: false, error: result.error }));
      return result;
    }
    // O onAuthStateChange (SIGNED_IN) dispara o initializeApp automaticamente
    return { success: true };
  };

  const logout = async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      await userService.logout();
      window.location.href = '/'; // Hard refresh para limpar cache de memória
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