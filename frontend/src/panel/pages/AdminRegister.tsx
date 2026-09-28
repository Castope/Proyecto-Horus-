import { useState } from 'react';
import type { ChangeEvent, SubmitEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAdminAuth } from '../context';
import { registerAdmin } from '../services';
import AdminAuthLayout from '../components/AdminAuthLayout';
import AdminPasswordField from '../components/AdminPasswordField';
import PanelIcon from '../components/PanelIcon';

export default function AdminRegister() {
  const navigate = useNavigate();
  const { token } = useAdminAuth();
  const [form, setForm] = useState({ nombre: '', email: '', password: '', confirmPassword: '' });
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);


  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm(previous => ({ ...previous, [name]: value }));
    setMensaje('');
  };

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading || !token) return;
    if (form.nombre.trim().length < 2) {
      const message = 'Ingresa un nombre de al menos 2 caracteres.';
      setMensaje(message);
      toast.error(message);
      return;
    }
    if (form.password !== form.confirmPassword) {
      const message = 'Las contraseñas no coinciden. Revisa la confirmación.';
      setMensaje(message);
      toast.error(message);
      return;
    }
    setLoading(true);
    setMensaje('');
    try {
      const response = await registerAdmin({
        nombre: form.nombre.trim(), email: form.email.trim(), password: form.password,
      }, token);
      if (response.ok) {
        const successMessage = response.mensaje || 'Administrador creado correctamente.';
        setMensaje(successMessage);
        toast.success(successMessage);
        navigate('/admin/dashboard', { replace: true });
      } else {

        const errorMessage = response.mensaje || 'No se pudo crear la cuenta. Revisa tus datos.';
        setMensaje(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'No se pudo crear la cuenta.';
      setMensaje(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminAuthLayout registration eyebrow="Haz crecer tu equipo" title="Crear administrador"
      description="Crea una cuenta para una persona autorizada a administrar Horus Group.">
      <form className="admin-auth__form" onSubmit={handleSubmit} aria-busy={loading}>
        <fieldset className="admin-auth__fields" disabled={loading}>
          <legend className="admin-auth__sr-only">Datos de la nueva cuenta</legend>
          <div className="admin-auth__field">
            <label htmlFor="nombre">Nombre completo</label>
            <div className="admin-auth__input"><PanelIcon name="user" size={18} /><input id="nombre" name="nombre" value={form.nombre} onChange={handleChange}
              autoComplete="name" placeholder="Nombre y apellido" minLength={2} maxLength={100} required /></div>
          </div>
          <div className="admin-auth__field">
            <label htmlFor="email">Correo electrónico</label>
            <div className="admin-auth__input"><PanelIcon name="mail" size={18} /><input id="email" name="email" type="email" value={form.email} onChange={handleChange}
              autoComplete="username" autoCapitalize="none" spellCheck={false} placeholder="nombre@ejemplo.com" required /></div>
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
      <p className="admin-auth__switch"><Link to="/admin/dashboard">Volver al panel</Link></p>
      <p className="admin-auth__note">Conoce cómo tratamos tus datos en nuestra <Link to="/politicas/privacidad">política de privacidad</Link>.</p>
    </AdminAuthLayout>
  );
}
