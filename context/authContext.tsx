import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { userService } from '../lib/services';
import { appService } from '../lib/services/appService.tsx'; // Importe o novo serviço
import { User, SystemStatus } from '../types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  systemStatus: SystemStatus | null;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    systemStatus: null,
    error: null
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
          error: null
        });
      }
    } catch (error) {
      console.error("Erro crítico na inicialização:", error);
      if (mounted.current) setState(s => ({ ...s, isLoading: false, error: "Erro de conexão" }));
    }
  };

  useEffect(() => {
    mounted.current = true;
    refreshAuth();

    // Listener para Login/Logout
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
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

  const value = useMemo(() => ({ ...state, login, logout }), [state]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return context;
};