import { AdminAuthContext } from './adminAuth';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { getCurrentAdmin } from '../services';
import { PanelApiError } from '../services/panelApi';
import type { AdminUser } from '../types';
const STORAGE_KEY = 'horus-admin-token';
function readSavedToken() {
  try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
}
function saveToken(token: string | null) {
  try {
    if (token) localStorage.setItem(STORAGE_KEY, token);
    else localStorage.removeItem(STORAGE_KEY);
  } catch { /* La sesión actual funciona en memoria si el navegador bloquea su persistencia. */ }
}
export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(readSavedToken);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [checking, setChecking] = useState(() => Boolean(token));
  const [sessionError, setSessionError] = useState('');
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    let current = true;
    const timeout = window.setTimeout(() => controller.abort(), 15000);
    saveToken(token);
    getCurrentAdmin(token, controller.signal).then(response => {
      if (!current) return;
      if (!response.user) throw new Error('No se pudo validar tu identidad.');
      setUser(response.user); setSessionError('');
    }).catch(error => {
      if (!current) return;
      setUser(null);
      if (error instanceof PanelApiError && error.status === 401) {
        saveToken(null); setToken(null); setSessionError('');
      } else setSessionError('No pudimos validar tu sesión. Puedes reintentar cuando el servidor esté disponible.');
    }).finally(() => { window.clearTimeout(timeout); if (current) setChecking(false); });
    return () => { current = false; controller.abort(); window.clearTimeout(timeout); };
  }, [token, revision]);
  useEffect(() => {
    const expire = () => { saveToken(null); setUser(null); setToken(null); setChecking(false); setSessionError(''); };
    window.addEventListener('horus:session-expired', expire);
    return () => window.removeEventListener('horus:session-expired', expire);
  }, []);
  const value = useMemo(() => ({
    user, token, checking, sessionError, isAuthenticated: Boolean(token && user),
    retrySession: () => { setChecking(true); setSessionError(''); setRevision(value => value + 1); },
    login: (value: string) => { setChecking(true); setSessionError(''); setUser(null); setToken(value); },
    logout: () => { saveToken(null); setToken(null); setUser(null); setChecking(false); setSessionError(''); },
  }), [user, token, checking, sessionError]);
  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}
