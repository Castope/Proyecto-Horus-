import { AdminAuthContext } from './adminAuth';
import { SESSION_EXPIRED_EVENT } from './sessionEvents';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { getCurrentAdmin } from '../services';
import { PanelApiError } from '../services/panelApi';
import type { AdminUser } from '../types';
const STORAGE_KEY = 'horus-admin-token';

// Pestañas del mismo origen: el token vive en localStorage y el evento `storage` avisa a las demás pestañas.
// Si el navegador bloquea localStorage la sesión funciona solo en memoria y NO se sincroniza entre pestañas
// (cada pestaña conserva su propia sesión hasta que expire o se cierre).
function storageWorks() {
  try { localStorage.getItem(STORAGE_KEY); return true; } catch { return false; }
}
function readSavedToken() {
  try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
}
function saveToken(token: string | null) {
  try {
    if (token) { if (localStorage.getItem(STORAGE_KEY) !== token) localStorage.setItem(STORAGE_KEY, token); }
    else if (localStorage.getItem(STORAGE_KEY) !== null) localStorage.removeItem(STORAGE_KEY);
  } catch { /* La sesión actual funciona en memoria si el navegador bloquea su persistencia. */ }
}
export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(readSavedToken);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [checking, setChecking] = useState(() => Boolean(token));
  const [sessionError, setSessionError] = useState('');
  const [revision, setRevision] = useState(0);
  // Sesión activa leída de forma síncrona: las respuestas y los 401 se comparan contra ella, no contra el estado de un render antiguo.
  const activeToken = useRef<string | null>(token);
  // Token that the server has just issued together with its user (login); it needs no second validation.
  const issuedNow = useRef<string | null>(null);

  // Sustituye la sesión activa. Nunca escribe en localStorage: lo usan los cambios que vienen de otra pestaña.
  const adopt = useCallback((next: string | null) => {
    issuedNow.current = null; activeToken.current = next;
    setUser(null); setSessionError(''); setChecking(Boolean(next)); setToken(next);
  }, []);
  // Si localStorage ya contiene otra sesión (otra pestaña inició o cerró sesión) esta pestaña la adopta y la revalida con /admin/me.
  const syncFromStorage = useCallback(() => {
    if (!storageWorks()) return false;
    const saved = readSavedToken();
    if (saved === activeToken.current) return false;
    adopt(saved);
    return true;
  }, [adopt]);
  // Cierra la sesión `expired` solo si sigue siendo la activa y sin borrar de localStorage una sesión más nueva.
  const expire = useCallback((expired: string) => {
    if (activeToken.current !== expired) return;
    if (syncFromStorage()) return;
    if (readSavedToken() === expired) saveToken(null);
    adopt(null);
  }, [adopt, syncFromStorage]);

  useEffect(() => {
    if (!token) return;
    if (issuedNow.current === token) { issuedNow.current = null; return; }
    const controller = new AbortController();
    let current = true;
    const timeout = window.setTimeout(() => controller.abort(), 15000);
    getCurrentAdmin(token, controller.signal).then(response => {
      if (!current || activeToken.current !== token) return; // respuesta de una sesión o de una comprobación antiguas
      if (!response.user) throw new Error('No se pudo validar tu identidad.');
      setUser(response.user); setSessionError('');
    }).catch(error => {
      if (!current || activeToken.current !== token) return;
      setUser(null);
      if (error instanceof PanelApiError && error.status === 401) expire(token);
      else setSessionError('No pudimos validar tu sesión. Puedes reintentar cuando el servidor esté disponible.');
    }).finally(() => { window.clearTimeout(timeout); if (current && activeToken.current === token) setChecking(false); });
    return () => { current = false; controller.abort(); window.clearTimeout(timeout); };
  }, [token, revision, expire]);

  useEffect(() => {
    const onExpired = (event: Event) => {
      const detail = (event as CustomEvent<{ token?: string | null }>).detail;
      if (!detail || detail.token === undefined) { // aviso sin sesión de origen: se revalida en lugar de cerrar a ciegas
        if (activeToken.current) { setChecking(true); setSessionError(''); setRevision(value => value + 1); }
        return;
      }
      if (detail.token) expire(detail.token); // un 401 de otra sesión (o sin sesión) no afecta a la activa
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === STORAGE_KEY) syncFromStorage();
    };
    const onVisible = () => { if (document.visibilityState === 'visible') syncFromStorage(); };
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    window.addEventListener('storage', onStorage);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
      window.removeEventListener('storage', onStorage);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [expire, syncFromStorage]);

  const value = useMemo(() => ({
    user, token, checking, sessionError, isAuthenticated: Boolean(token && user),
    retrySession: () => { setChecking(true); setSessionError(''); setRevision(value => value + 1); },
    login: (value: string, loggedUser?: AdminUser) => {
      saveToken(value); // antes del render: otra pestaña (o un cambio de visibilidad) no debe ver aún la sesión anterior
      activeToken.current = value; setSessionError('');
      if (loggedUser) { issuedNow.current = value; setUser(loggedUser); setChecking(false); setToken(value); return; }
      issuedNow.current = null; setChecking(true); setUser(null); setToken(value);
    },
    logout: () => { saveToken(null); adopt(null); },
  }), [user, token, checking, sessionError, adopt]);
  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}
