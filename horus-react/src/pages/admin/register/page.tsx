import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { registerAdmin } from '../../../apis/adminApi';
import AdminAuthLayout from '../../../components/AdminAuthLayout';

export default function AdminRegisterPage() {
  const navigate = useNavigate();
  const { login } = useAdminAuth();
  const [form, setForm] = useState({ nombre: '', email: '', password: '' });
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMensaje('');
    try {
      const response = await registerAdmin(form);
      if (response.ok) {
        login(response.token);
        navigate('/admin/dashboard');
        return;
      }
      setMensaje(response.mensaje || 'No se pudo registrar.');
    } catch {
      setMensaje('No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminAuthLayout eyebrow="Nuevo administrador" title="Crea tu acceso" description="Registra tus datos para comenzar a gestionar el contenido.">
      <div className="admin-auth__legacy-card">
        <h1 style={{ marginBottom: 8, fontSize: 32 }}>Crear administrador</h1>
        <p style={{ marginBottom: 24, color: '#666' }}>Completa los datos para crear tu acceso.</p>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label htmlFor="nombre" style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Nombre</label>
            <input id="nombre" name="nombre" value={form.nombre} onChange={handleChange} required style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #dfe3ec' }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label htmlFor="email" style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Correo</label>
            <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #dfe3ec' }} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label htmlFor="password" style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Contraseña</label>
            <input id="password" name="password" type="password" value={form.password} onChange={handleChange} required style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #dfe3ec' }} />
          </div>
          {mensaje && <p style={{ color: '#b42318', marginBottom: 16 }}>{mensaje}</p>}
          <button type="submit" disabled={loading} style={{ width: '100%', background: '#0f766e', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 16px', cursor: 'pointer', fontWeight: 700 }}>
            {loading ? 'Registrando...' : 'Registrar'}
          </button>
        </form>
        <p style={{ marginTop: 20, textAlign: 'center', color: '#555' }}>¿Ya tienes cuenta? <Link to="/admin/login">Inicia sesión</Link></p>
      </div>
    </AdminAuthLayout>
  );
}
