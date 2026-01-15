import React, { createContext, useContext, useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient.ts';
import { userService, appService, adminService } from '../lib/services/index.ts'; // Importe adminService também
import { User, SystemStatus } from '../types/index.ts';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  systemStatus: SystemStatus | null;
  isInitialSyncComplete: boolean; // Re-adicionado
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  retryInitialSync: () => Promise<void>; // Re-adicionado
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
    systemStatus: null,
    isInitialSyncComplete: false, // Inicializado como false
  });

  const mounted = useRef(true);

  // Função centralizada de inicialização/sincronização de autenticação
  const initializeAuth = useCallback(async () => { // Renomeado para initializeAuth
    if (!mounted.current) return;

    setState(s => ({ ...s, isLoading: true, error: null }));

    try {
      const { user, systemStatus } = await appService.getInitialData(); // Usa appService
      
      if (mounted.current) {
        setState({
          user,
          systemStatus,
          isLoading: false,
          error: null,
          isInitialSyncComplete: true, // Marca como concluído no sucesso
        });
      }
    } catch (error: any) {
      console.error("[AuthContext] Erro Crítico na inicialização:", error);
      if (mounted.current) {
        setState(s => ({ 
          ...s, 
          isLoading: false, 
          isInitialSyncComplete: true, // Marca como concluído mesmo em erro para permitir UI de retry
          error: "Erro de conexão inicial. Tente novamente." // Mensagem mais amigável
        }));
      }
    }
  }, []);

  // Adiciona a função retryInitialSync
  const retryInitialSync = useCallback(async () => {
    await initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    mounted.current = true;
    
    const bootstrap = async () => {
      await supabase.auth.getSession(); 
      if (mounted.current) {
        await initializeAuth();
      }
    };

    bootstrap();

    // Listener para eventos de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        await initializeAuth();
      }
    });

    // Subscrição em tempo real para o status do sistema (agora no AuthContext)
    const unsubSystemStatus = adminService.subscribeToSystemStatus((newStatus) => {
      if (mounted.current) {
        setState(s => ({ ...s, systemStatus: newStatus }));
      }
    });

    return () => {
      mounted.current = false;
      subscription.unsubscribe();
      unsubSystemStatus(); // Desinscrever do status do sistema
    };
  }, [initializeAuth]); // Dependência em initializeAuth

  const login = async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    const result = await userService.authenticate(email, password);
    
    if (!result.success) {
      setState(prev => ({ ...prev, isLoading: false, error: result.error }));
      return result;
    }
    
    return { success: true };
  };

  const logout = async () => {
    // 1. Otimisticamente, limpa o estado no cliente para uma resposta instantânea da UI.
    setState(s => ({
      ...s,
      user: null,
      systemStatus: null,
      isLoading: true, // Indica que algo está acontecendo (redirecionamento/recarregamento)
      isInitialSyncComplete: false, // Força a tela de "Conectando..." no próximo load
      error: null,
    }));

    // 2. Limpa o localStorage imediatamente para remover quaisquer dados de sessão e app.
    localStorage.clear();

    // 3. Força o redirecionamento para a raiz da aplicação, causando um recarregamento completo.
    // Isso é feito imediatamente, sem esperar pelo backend.
    window.location.href = '/'; 

    // 4. Invalida a sessão no backend de forma assíncrona (fire-and-forget).
    // Erros aqui são logados, mas não bloqueiam a experiência do usuário.
    userService.logout().catch(err => {
      console.error("Erro assíncrono ao fazer logout no backend:", err);
      // Poderíamos adicionar um toast de erro silencioso aqui se necessário,
      // mas para logout "instantâneo", geralmente não queremos alertar o usuário.
    });
  };

  const refreshProfile = useCallback(async () => {
    await initializeAuth();
  }, [initializeAuth]);

  const value = useMemo(() => ({
    ...state,
    login,
    logout,
    refreshProfile,
    retryInitialSync, // Incluir retryInitialSync no valor do contexto
  }), [state, login, logout, refreshProfile, retryInitialSync]);

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