import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getCurrentAdmin } from '../services/adminApi';
import type { AdminUser } from '../types/admin';

interface AdminAuthContextValue {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (tokenValue: string) => void;
  logout: () => void;
}

const STORAGE_KEY = 'horus-admin-token';

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY));
  const [user, setUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }

    localStorage.setItem(STORAGE_KEY, token);
    getCurrentAdmin(token)
      .then((response) => {
        if (response.ok && response.user) {
          setUser(response.user);
        } else {
          setUser(null);
          localStorage.removeItem(STORAGE_KEY);
          setToken(null);
        }
      })
      .catch(() => {
        setUser(null);
        localStorage.removeItem(STORAGE_KEY);
        setToken(null);
      });
  }, [token]);

  const value = useMemo<AdminAuthContextValue>(() => ({
    user,
    token,
    isAuthenticated: Boolean(token && user),
    login: (tokenValue: string) => setToken(tokenValue),
    logout: () => {
      localStorage.removeItem(STORAGE_KEY);
      setToken(null);
      setUser(null);
    },
  }), [token, user]);

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);

  if (!context) {
    throw new Error('useAdminAuth debe usarse dentro de AdminAuthProvider');
  }

  return context;
}
