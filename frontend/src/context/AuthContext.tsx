import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { authService } from '../services/authService';
import { UserSession } from '../types';

interface AuthContextValue {
  user: UserSession | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<string>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<string>;
  hydrate: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  const hydrate = async () => {
    const token = localStorage.getItem('qms_access_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const response = await authService.me();
      setUser(response.data || null);
    } catch {
      setUser(null);
      localStorage.removeItem('qms_access_token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void hydrate();
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isAuthenticated: Boolean(user),
    loading,
    login: async (username, password) => {
      const response = await authService.login(username, password);
      if (response.accessToken) {
        localStorage.setItem('qms_access_token', response.accessToken);
      }
      setUser(response.user || null);
    },
    logout: async () => {
      await authService.logout();
      localStorage.removeItem('qms_access_token');
      setUser(null);
    },
    forgotPassword: async (email) => {
      const response = await authService.forgotPassword(email);
      return response.message || 'Reset token generated';
    },
    changePassword: async (currentPassword, newPassword) => {
      const response = await authService.changePassword(currentPassword, newPassword);
      return response.message || 'Password updated';
    },
    hydrate,
  }), [loading, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};
