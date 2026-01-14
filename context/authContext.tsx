import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '../lib/supabaseClient.ts';
import { userService, adminService } from '../lib/services/index.ts'; // Import adminService
import { User, UserRole, normalizeRole, SystemStatus } from '../types/index.ts';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  systemStatus: SystemStatus | null; // Added systemStatus
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
    error: null,
    systemStatus: null, // Initialized systemStatus
  });

  const initialized = useRef(false);

  const syncUserProfile = useCallback(async () => {
    try {
      const [currentUser, sysStatus] = await Promise.all([ // Fetch user and system status in parallel
        userService.getCurrentUser(),
        adminService.getSystemStatus(),
      ]);
      
      if (currentUser) {
        // Força a normalização para garantir que 'CLIENT' ou 'CLIENTE' vire UserRole.CLIENT
        currentUser.role = normalizeRole(currentUser.role);
      }

      setState(prev => ({ 
        ...prev, 
        user: currentUser, 
        isLoading: false,
        error: null,
        systemStatus: sysStatus, // Set systemStatus
      }));
      
      return currentUser;
    } catch (error: any) {
      console.error("[AuthContext] Erro na Sincronização:", error);
      setState(prev => ({ ...prev, user: null, isLoading: false, error: error.message, systemStatus: null })); // Handle error for systemStatus
      return null;
    }
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const initAuth = async () => {
      setState(prev => ({ ...prev, isLoading: true }));
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await syncUserProfile();
      } else {
        const sysStatus = await adminService.getSystemStatus(); // Fetch system status even if no user session
        setState(prev => ({ ...prev, isLoading: false, systemStatus: sysStatus }));
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        if (session) await syncUserProfile();
      } else if (event === 'SIGNED_OUT') {
        const sysStatus = await adminService.getSystemStatus(); // Fetch system status on sign out too
        setState({ user: null, isLoading: false, error: null, systemStatus: sysStatus });
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
      // After logout, refresh system status as it might be relevant for public-facing components
      const sysStatus = await adminService.getSystemStatus();
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