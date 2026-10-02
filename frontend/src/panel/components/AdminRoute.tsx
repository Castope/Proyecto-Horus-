import { Navigate, Outlet } from 'react-router-dom';
import { useAdminAuth } from '../context';
export default function AdminRoute() {
  const { isAuthenticated, checking, sessionError, retrySession, logout } = useAdminAuth();
  if (checking) return <main className="hp-empty" role="status"><span className="hp-loading" /><p>Validando tu sesión…</p></main>;
  if (sessionError) return <main className="hp-empty"><p role="alert">{sessionError}</p><button className="hp-btn" onClick={retrySession}>Reintentar</button><button className="hp-btn" onClick={logout}>Volver al login</button></main>;
  return isAuthenticated ? <Outlet /> : <Navigate to="/admin/login" replace />;
}
