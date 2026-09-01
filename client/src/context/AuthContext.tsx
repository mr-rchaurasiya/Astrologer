import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { ApiClient, setAccessToken, getAccessToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  updatePassword: (data: { currentPassword: string; newPassword: string }) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const initAuth = async () => {
    setIsLoading(true);
    const token = getAccessToken();

    if (token) {
      try {
        const res = await ApiClient.getMe();
        if (res.success && res.data.user) {
          setUser(res.data.user);
        }
      } catch (err) {
        // Attempt refresh
        try {
          const refreshRes = await ApiClient.refreshToken();
          if (refreshRes.data.accessToken) {
            setAccessToken(refreshRes.data.accessToken);
            const userRes = await ApiClient.getMe();
            setUser(userRes.data.user);
          }
        } catch {
          setAccessToken(null);
          setUser(null);
        }
      }
    } else {
      // Check if refresh cookie exists
      try {
        const refreshRes = await ApiClient.refreshToken();
        if (refreshRes.data.accessToken) {
          setAccessToken(refreshRes.data.accessToken);
          const userRes = await ApiClient.getMe();
          setUser(userRes.data.user);
        }
      } catch {
        setUser(null);
      }
    }

    setIsLoading(false);
  };

  useEffect(() => {
    initAuth();

    const handleExpired = () => {
      setUser(null);
    };

    window.addEventListener('astrologer_auth_expired', handleExpired);
    return () => window.removeEventListener('astrologer_auth_expired', handleExpired);
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    const res = await ApiClient.login(credentials);
    if (res.success && res.data.user) {
      setUser(res.data.user);
    }
  };

  const register = async (data: { name: string; email: string; password: string }) => {
    const res = await ApiClient.register(data);
    if (res.success && res.data.user) {
      setUser(res.data.user);
    }
  };

  const logout = async () => {
    try {
      await ApiClient.logout();
    } finally {
      setUser(null);
    }
  };

  const updatePassword = async (data: { currentPassword: string; newPassword: string }) => {
    await ApiClient.updatePassword(data);
  };

  const refreshUser = async () => {
    const res = await ApiClient.getMe();
    if (res.success && res.data.user) {
      setUser(res.data.user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updatePassword,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
