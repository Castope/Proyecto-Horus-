import { AdminAuthContext } from './adminAuth';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { getCurrentAdmin } from '../services';
import type { AdminUser } from '../types';
const STORAGE_KEY = 'horus-admin-token';
export function AdminAuthProvider({ children }: { children: ReactNode }) {
 const [token, setToken] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY));
 const [user, setUser] = useState<AdminUser | null>(null);
 const [checking, setChecking] = useState(() => Boolean(localStorage.getItem(STORAGE_KEY)));
 useEffect(() => {
   let cancelled = false;
   if (!token) return;
   localStorage.setItem(STORAGE_KEY, token);
   getCurrentAdmin(token).then(response => {
     if (cancelled) return;
     if (response.ok && response.user) setUser(response.user);
     else { localStorage.removeItem(STORAGE_KEY); setUser(null); setToken(null); }
   }).catch(() => { if (!cancelled) { localStorage.removeItem(STORAGE_KEY); setUser(null); setToken(null); } })
     .finally(() => { if (!cancelled) setChecking(false); });
   return () => { cancelled = true; };
 }, [token]);
 useEffect(() => {
   const expire = () => { localStorage.removeItem(STORAGE_KEY); setUser(null); setToken(null); setChecking(false); };
   window.addEventListener('horus:session-expired', expire);
   return () => window.removeEventListener('horus:session-expired', expire);
 }, []);
 const value = useMemo(() => ({
   user, token, checking, isAuthenticated: Boolean(token && user),
   login: (value: string) => { setChecking(true); setUser(null); setToken(value); },
   logout: () => { localStorage.removeItem(STORAGE_KEY); setToken(null); setUser(null); setChecking(false); },
 }), [user, token, checking]);
 return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}
