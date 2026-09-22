import { createContext, useContext } from 'react';
import type { AdminUser } from '../types';
interface AdminAuthContextValue {
 user: AdminUser | null; token: string | null; isAuthenticated: boolean; checking: boolean;
 login: (value: string) => void; logout: () => void;
}
export const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);
export function useAdminAuth() {
 const value = useContext(AdminAuthContext);
 if (!value) throw new Error('useAdminAuth debe usarse dentro de AdminAuthProvider');
 return value;
}
