import { Navigate, Outlet } from 'react-router-dom';
import { useAdminAuth } from '../context';
export default function AdminRoute() {
 const { isAuthenticated, checking } = useAdminAuth();
 if (checking) return <main className="hp-empty" role="status"><span className="hp-loading" /><p>Validando tu sesión…</p></main>;
 return isAuthenticated ? <Outlet /> : <Navigate to="/admin/login" replace />;
}
