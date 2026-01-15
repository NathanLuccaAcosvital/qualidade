import React, { createContext, useContext, useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { userService, appService, adminService } from '../lib/services'; 
import { User, SystemStatus } from '../types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  systemStatus: SystemStatus | null;
  isInitialSyncComplete: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  retryInitialSync: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
    systemStatus: null,
    isInitialSyncComplete: false,
  });

  const mounted = useRef(true);

  // Função centralizada de inicialização/sincronização de autenticação
  const initializeAuth = useCallback(async () => {
    if (!mounted.current) return;

    // Apenas define loading true se ainda não tiver completado o sync inicial
    // para evitar "piscar" a tela em revalidações
    setState(s => ({ ...s, isLoading: true, error: null }));

    try {
      // Busca dados unificados (User + SystemStatus)
      const { user, systemStatus } = await appService.getInitialData();
      
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
          isInitialSyncComplete: true, // Marca como concluído mesmo em erro para liberar a UI
          error: "Erro de conexão inicial. Tente novamente.",
          // Fallback de segurança para não travar a UI esperando systemStatus
          systemStatus: { 
            mode: 'ONLINE', 
            message: 'Falha ao carregar status inicial do sistema.',
            scheduledStart: null,
            scheduledEnd: null,
            updatedBy: 'System Fallback'
          } as SystemStatus
        }));
      }
    }
  }, []);

  // Função para re-tentar a sincronização em caso de falha
  const retryInitialSync = useCallback(async () => {
    await initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    mounted.current = true;
    
    const bootstrap = async () => {
      // Verifica sessão local
      await supabase.auth.getSession(); 
      if (mounted.current) {
        await initializeAuth();
      }
    };

    bootstrap();

    // Listener para eventos de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      // SIGNED_IN: Login ou recarga com sessão válida
      // SIGNED_OUT: Logout explícito
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        await initializeAuth();
      }
    });

    // Subscrição em tempo real para o status do sistema
    const unsubSystemStatus = adminService.subscribeToSystemStatus((newStatus) => {
      if (mounted.current) {
        setState(s => ({ ...s, systemStatus: newStatus }));
      }
    });

    return () => {
      mounted.current = false;
      subscription.unsubscribe();
      if (unsubSystemStatus) unsubSystemStatus();
    };
  }, [initializeAuth]);

  const login = async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    const result = await userService.authenticate(email, password);
    
    if (!result.success) {
      setState(prev => ({ ...prev, isLoading: false, error: result.error }));
      return result;
    }
    
    // O onAuthStateChange irá disparar o initializeAuth após o login
    return { success: true };
  };

  const logout = async () => {
    // 1. Otimisticamente, limpa o estado no cliente
    setState(s => ({
      ...s,
      user: null,
      systemStatus: null,
      isLoading: true,
      isInitialSyncComplete: false,
      error: null,
    }));

    // 2. Limpa o localStorage
    localStorage.clear();

    // 3. Força refresh da página para garantir limpeza de estados em memória
    window.location.href = '/'; 

    // 4. Invalida sessão no backend (sem await para não bloquear a UI)
    userService.logout().catch(err => {
      console.error("Erro assíncrono ao fazer logout no backend:", err);
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
    retryInitialSync,
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