import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { LoginRequest, LoginResponse, AdminInfo } from '../types';
import apiClient from '../api/client';

const AUTH_STORAGE_KEY = 'store-admin-auth';

interface AuthState {
  isAuthenticated: boolean;
  admin: AdminInfo | null;
  expiresAt: string | null;
}

interface AuthContextType extends AuthState {
  login: (request: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    admin: null,
    expiresAt: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load auth state from localStorage on mount
  useEffect(() => {
    const savedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    if (savedAuth) {
      try {
        const { accessToken, expiresAt, admin } = JSON.parse(savedAuth) as LoginResponse;
        const expiry = new Date(expiresAt);

        if (expiry > new Date()) {
          apiClient.setToken(accessToken);
          setState({
            isAuthenticated: true,
            admin,
            expiresAt,
          });
        } else {
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      } catch {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  // Auto logout when token expires
  useEffect(() => {
    if (!state.expiresAt) return;

    const expiresAt = new Date(state.expiresAt).getTime();
    const now = Date.now();
    const timeUntilExpiry = expiresAt - now;

    if (timeUntilExpiry <= 0) {
      logout();
      return;
    }

    const timer = setTimeout(() => {
      logout();
      alert('세션이 만료되었습니다. 다시 로그인해주세요.');
    }, timeUntilExpiry);

    return () => clearTimeout(timer);
  }, [state.expiresAt]);

  const login = useCallback(async (request: LoginRequest) => {
    const response = await apiClient.login(request);

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(response));

    setState({
      isAuthenticated: true,
      admin: response.admin,
      expiresAt: response.expiresAt,
    });
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient.logout();
    } catch {
      // Ignore logout errors
    }

    localStorage.removeItem(AUTH_STORAGE_KEY);
    apiClient.clearToken();

    setState({
      isAuthenticated: false,
      admin: null,
      expiresAt: null,
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        isLoading,
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
