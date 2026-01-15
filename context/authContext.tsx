import React, { createContext, useContext, useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { userService } from '../lib/services';
import { appService } from '../lib/services/appService.tsx';
import { User, SystemStatus } from '../types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  systemStatus: SystemStatus | null;
  error: string | null;
  // Add new state properties for initial sync completion and retry mechanism
  isInitialSyncComplete: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  // Add new methods for retry mechanism
  retryInitialSync: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    systemStatus: null,
    error: null,
    isInitialSyncComplete: false, // Initialize as false
  });

  const mounted = useRef(true);

  // Função Ultra-Rápida de Inicialização
  const refreshAuth = async () => {
    try {
      // 1 Request Único ao Servidor
      const { user, systemStatus } = await appService.getInitialData();
      
      if (mounted.current) {
        setState({
          user,
          systemStatus,
          isLoading: false,
          error: null,
          isInitialSyncComplete: true, // Mark as true once initial sync is done
        });
      }
    } catch (error) {
      console.error("Erro crítico na inicialização:", error);
      if (mounted.current) setState(s => ({ ...s, isLoading: false, error: "Erro de conexão", isInitialSyncComplete: true })); // Also mark as true on error to stop initial loader
    }
  };

  // Function to retry the initial sync
  const retryInitialSync = useCallback(async () => {
    setState(s => ({ ...s, isLoading: true, error: null, isInitialSyncComplete: false }));
    await refreshAuth();
  }, []);

  useEffect(() => {
    mounted.current = true;
    refreshAuth();

    // Listener para Login/Logout
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        // Ensure that onAuthStateChange also triggers a full refresh
        setState(s => ({ ...s, isLoading: true, isInitialSyncComplete: false }));
        refreshAuth();
      }
    });

    return () => {
      mounted.current = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setState(s => ({ ...s, isLoading: true }));
    // O login continua normal via Supabase Auth
    const result = await userService.authenticate(email, password);
    
    if (!result.success) {
      setState(s => ({ ...s, isLoading: false, error: result.error || 'Erro' }));
    }
    // Se sucesso, o onAuthStateChange dispara o refreshAuth automaticamente
    return result;
  };

  const logout = async () => {
    await userService.logout();
    window.location.href = '/'; // Redirecionamento forçado para limpar memória
  };

  const value = useMemo(() => ({ ...state, login, logout, retryInitialSync }), [state, retryInitialSync]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return context;
};