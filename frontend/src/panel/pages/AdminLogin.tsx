import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context';
import { loginAdmin } from '../services';
import AdminAuthLayout from '../components/AdminAuthLayout';
import AdminPasswordField from '../components/AdminPasswordField';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAdminAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate('/admin/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm(previous => ({ ...previous, [name]: value }));
    setMensaje('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setMensaje('');
    try {
      const response = await loginAdmin({ ...form, email: form.email.trim() });
      if (response.ok && response.token) {
        login(response.token);
      } else {
        setMensaje(response.mensaje || 'Revisa tu correo y contraseña e inténtalo nuevamente.');
      }
    } catch {
      setMensaje('No se pudo conectar con el servidor. Inténtalo nuevamente en unos momentos.');
    } finally {
      setLoading(false);
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
            <input id="email" name="email" type="email" value={form.email} onChange={handleChange}
              autoComplete="username" autoCapitalize="none" spellCheck={false} placeholder="nombre@ejemplo.com" required />
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
      <p className="admin-auth__switch">¿Aún no tienes una cuenta? <Link to="/admin/register">Crear cuenta</Link></p>
      <div className="admin-auth__note">Un espacio para administrar contenido y atender a tu comunidad.</div>
    </AdminAuthLayout>
  );
}
