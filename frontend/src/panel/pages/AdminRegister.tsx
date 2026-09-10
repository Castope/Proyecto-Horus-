import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context';
import { registerAdmin } from '../services';
import AdminAuthLayout from '../components/AdminAuthLayout';
import AdminPasswordField from '../components/AdminPasswordField';

export default function AdminRegister() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAdminAuth();
  const [form, setForm] = useState({ nombre: '', email: '', password: '', confirmPassword: '' });
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
    if (form.nombre.trim().length < 2) {
      setMensaje('Ingresa un nombre de al menos 2 caracteres.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setMensaje('Las contraseñas no coinciden. Revisa la confirmación.');
      return;
    }
    setLoading(true);
    setMensaje('');
    try {
      const response = await registerAdmin({
        nombre: form.nombre.trim(), email: form.email.trim(), password: form.password,
      });
      if (response.ok && response.token) {
        login(response.token);
      } else {
        const detail = Array.isArray(response.message) ? response.message.join(' ') : response.message;
        setMensaje(response.mensaje || detail || 'No se pudo crear la cuenta. Revisa tus datos.');
      }
    } catch {
      setMensaje('No se pudo conectar con el servidor. Inténtalo nuevamente en unos momentos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminAuthLayout eyebrow="Comienza aquí" title="Crea tu cuenta"
      description="Completa tus datos para acceder al panel administrativo de Horus Group.">
      <form className="admin-auth__form" onSubmit={handleSubmit} aria-busy={loading}>
        <fieldset className="admin-auth__fields" disabled={loading}>
          <legend className="admin-auth__sr-only">Datos de la nueva cuenta</legend>
          <div className="admin-auth__field">
            <label htmlFor="nombre">Nombre completo</label>
            <input id="nombre" name="nombre" value={form.nombre} onChange={handleChange}
              autoComplete="name" placeholder="Tu nombre y apellido" minLength={2} maxLength={100} required />
          </div>
          <div className="admin-auth__field">
            <label htmlFor="email">Correo electrónico</label>
            <input id="email" name="email" type="email" value={form.email} onChange={handleChange}
              autoComplete="username" autoCapitalize="none" spellCheck={false} placeholder="nombre@ejemplo.com" required />
          </div>
          <AdminPasswordField id="password" label="Contraseña" value={form.password} onChange={handleChange}
            autoComplete="new-password" minLength={8} maxLength={72} hint="Usa entre 8 y 72 caracteres." />
          <AdminPasswordField id="confirmPassword" label="Confirmar contraseña" value={form.confirmPassword}
            onChange={handleChange} autoComplete="new-password" minLength={8} maxLength={72} />
        </fieldset>
        {mensaje && <p className="admin-auth__error" role="alert">{mensaje}</p>}
        <button className="admin-auth__submit" type="submit" disabled={loading}>
          {loading && <span className="admin-auth__spinner" aria-hidden="true" />}
          {loading ? 'Creando cuenta…' : 'Crear cuenta'}
          {!loading && <span aria-hidden="true">→</span>}
        </button>
      </form>
      <p className="admin-auth__switch">¿Ya tienes una cuenta? <Link to="/admin/login">Iniciar sesión</Link></p>
      <p className="admin-auth__note">Conoce cómo tratamos tus datos en nuestra <Link to="/politicas/privacidad">política de privacidad</Link>.</p>
    </AdminAuthLayout>
  );
}
