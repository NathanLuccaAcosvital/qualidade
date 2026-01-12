
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types.ts';
import { userService } from '../lib/services/index.ts';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); 

  useEffect(() => {
    const initSession = async () => {
      // Tenta recuperar o usuário pelo token de sessão (Cookie)
      try {
          const profile = await userService.getCurrentUser();
          if (profile) {
              setUser(profile);
          }
      } catch (e) {
          console.error("Erro ao validar sessão:", e);
      } finally {
          setIsLoading(false);
      }
    };
    initSession();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
        const success = await userService.authenticate(email, password);
        if (success) {
          // Após autenticar (Cookie definido), busca o perfil do usuário
          const profile = await userService.getCurrentUser();
          setUser(profile);
          return { success: true };
        }
        return { success: false, error: 'Credenciais inválidas.' };
    } catch (e: any) {
        return { success: false, error: e.message };
    } finally {
        setIsLoading(false); 
    }
  };

  const logout = async () => {
    setIsLoading(true);
    await userService.logout();
    setUser(null);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
