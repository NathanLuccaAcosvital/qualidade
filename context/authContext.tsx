
import React, { createContext, useContext, useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient.ts';
import { userService } from '../lib/services/index.ts';
import { appService } from '../lib/services/appService.tsx';
import { User, SystemStatus } from '../types/index.ts';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  systemStatus: SystemStatus | null;
  error: string | null;
  isInitialSyncComplete: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  retryInitialSync: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    systemStatus: null,
    error: null,
    isInitialSyncComplete: false,
  });

  const mounted = useRef(true);

  const refreshAuth = useCallback(async () => {
    try {
      const data = await appService.getInitialData();
      
      if (mounted.current) {
        setState({
          user: data.user,
          systemStatus: data.systemStatus,
          isLoading: false,
          error: null,
          isInitialSyncComplete: true,
        });
      }
    } catch (error: any) {
      console.error("Critical Auth Sync Error:", error);
      if (mounted.current) {
        setState(s => ({ 
          ...s, 
          isLoading: false, 
          error: "Não foi possível validar sua identidade técnica.", 
          isInitialSyncComplete: true 
        }));
      }
    }
  }, []);

  const retryInitialSync = useCallback(async () => {
    setState(s => ({ ...s, isLoading: true, error: null, isInitialSyncComplete: false }));
    await refreshAuth();
  }, [refreshAuth]);

  useEffect(() => {
    mounted.current = true;
    refreshAuth();

    // Inscrição para eventos de auth globais (login/logout/token refresh)
    // Fix: Use 'as any' to bypass type errors for onAuthStateChange
    const { data: { subscription } } = (supabase.auth as any).onAuthStateChange((event: string, session: any) => {
      console.debug(`[Auth Event] ${event}`);
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        refreshAuth();
      }
    });

    return () => {
      mounted.current = false;
      subscription.unsubscribe();
    };
  }, [refreshAuth]);

  const login = async (email: string, password: string) => {
    setState(s => ({ ...s, isLoading: true, error: null }));
    const result = await userService.authenticate(email, password);
    if (!result.success) {
      setState(s => ({ ...s, isLoading: false, error: result.error || 'Autenticação recusada' }));
    }
    // O onAuthStateChange cuidará do refreshAuth se o login for bem sucedido
    return result;
  };

  const logout = async () => {
    await userService.logout();
    setState({
        user: null,
        systemStatus: null,
        isLoading: false,
        error: null,
        isInitialSyncComplete: true
    });
    window.location.href = '/'; 
  };

  const value = useMemo(() => ({ 
    ...state, 
    login, 
    logout, 
    retryInitialSync 
  }), [state, retryInitialSync]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return context;
};