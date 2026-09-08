import { Navigate, Outlet } from 'react-router-dom';
import { useAdminAuth } from '../context';

export default function AdminRoute() {
  const { isAuthenticated } = useAdminAuth();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
