import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, ApiError, invalidateCsrfToken } from '../api/client';
import type { PublicUser } from '../api/types';

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface AuthContextValue {
  user: PublicUser | null;
  isLoading: boolean;
  register: (input: RegisterInput) => Promise<void>;
  login: (input: LoginInput) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children, onAuthenticated }: { children: React.ReactNode; onAuthenticated?: () => void }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api
      .get<{ user: PublicUser }>('/api/auth/me')
      .then((data) => {
        if (!cancelled) setUser(data.user);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const data = await api.post<{ user: PublicUser }>('/api/auth/register', input);
    invalidateCsrfToken();
    setUser(data.user);
    onAuthenticated?.();
  }, [onAuthenticated]);

  const login = useCallback(async (input: LoginInput) => {
    const data = await api.post<{ user: PublicUser }>('/api/auth/login', input);
    invalidateCsrfToken();
    setUser(data.user);
    onAuthenticated?.();
  }, [onAuthenticated]);

  const loginWithGoogle = useCallback(async (credential: string) => {
    const data = await api.post<{ user: PublicUser }>('/api/auth/google', { credential });
    invalidateCsrfToken();
    setUser(data.user);
    onAuthenticated?.();
  }, [onAuthenticated]);

  const logout = useCallback(async () => {
    try {
      await api.post('/api/auth/logout');
    } catch {
      // Best-effort — clear local state regardless of server response.
    }
    invalidateCsrfToken();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const data = await api.get<{ user: PublicUser }>('/api/auth/me');
      setUser(data.user);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, register, login, loginWithGoogle, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
