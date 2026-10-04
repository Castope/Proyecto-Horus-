import { startTransition, useEffect, useState } from 'react';
import type {ChangeEvent, SubmitEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAdminAuth } from '../context';
import { loginAdmin } from '../services';
import AdminAuthLayout from '../components/AdminAuthLayout';
import AdminPasswordField from '../components/AdminPasswordField';
import PanelIcon from '../components/PanelIcon';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAdminAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // As a transition, the login stays on screen until the panel is ready instead of flashing a loading page.
    if (isAuthenticated) startTransition(() => navigate('/admin/dashboard', { replace: true }));
  }, [isAuthenticated, navigate]);

  // Download the panel while the user fills in the form so signing in opens it right away.
  useEffect(() => { void import('./AdminDashboard'); }, []);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm(previous => ({ ...previous, [name]: value }));
    setMensaje('');
  };

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setMensaje('');
    let signedIn = false;
    try {
      const response = await loginAdmin({ ...form, email: form.email.trim() });
      if (response.ok && response.token) {
        // A correct login is not a message: the form stays locked until the panel opens.
        signedIn = true;
        login(response.token, response.user);
      } else {
        const errorMessage = response.mensaje || response.message || 'Revisa tu correo y contraseña e inténtalo nuevamente.';
        const detail = Array.isArray(errorMessage) ? errorMessage.join(' ') : errorMessage;
        setMensaje(detail);
        toast.error(detail);
      }
    } catch {
      const errorMessage = 'No se pudo conectar con el servidor. Inténtalo nuevamente en unos momentos.';
      setMensaje(errorMessage);
      toast.error(errorMessage);
    } finally {
      if (!signedIn) setLoading(false);
    }
  };

  return (
    <AdminAuthLayout eyebrow="Tu espacio de trabajo" title="Bienvenido de nuevo"
      description="Ingresa a tu cuenta para continuar con la gestión de Horus Group.">
      <form className="admin-auth__form" onSubmit={handleSubmit} aria-busy={loading}>
        <fieldset className="admin-auth__fields" disabled={loading}>
          <legend className="admin-auth__sr-only">Datos de inicio de sesión</legend>
          <div className="admin-auth__field">
            <label htmlFor="email">Correo electrónico</label>
            <div className="admin-auth__input"><PanelIcon name="mail" size={18} /><input id="email" name="email" type="email" value={form.email} onChange={handleChange}
              autoComplete="username" autoCapitalize="none" spellCheck={false} placeholder="nombre@ejemplo.com" required /></div>
          </div>
          <AdminPasswordField id="password" label="Contraseña" value={form.password}
            onChange={handleChange} autoComplete="current-password" />
        </fieldset>
        {mensaje && <p className="admin-auth__error" role="alert">{mensaje}</p>}
        <button className="admin-auth__submit" type="submit" disabled={loading}>
          {loading && <span className="admin-auth__spinner" aria-hidden="true" />}
          {loading ? 'Ingresando…' : 'Iniciar sesión'}
          {!loading && <span aria-hidden="true">→</span>}
        </button>
      </form>
      <p className="admin-auth__forgot"><Link to="/admin/forgot-password">Olvidé mi contraseña</Link></p>
      <p className="admin-auth__switch">¿No tienes una cuenta? <Link to="/admin/register">Crear cuenta</Link></p>
      <div className="admin-auth__note admin-auth__note--access"><PanelIcon name="shield" size={16} /><span>Tu espacio para gestionar Horus Group.</span></div>
    </AdminAuthLayout>
  );
}
