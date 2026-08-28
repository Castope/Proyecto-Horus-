import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { loginAdmin } from '../../services/adminApi';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAdminAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMensaje('');

    const response = await loginAdmin(form);

    if (response.ok) {
      login(response.token);
      navigate('/admin/dashboard');
      return;
    }

    setMensaje(response.mensaje || 'Credenciales incorrectas.');
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f4f6fb', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420, background: '#fff', borderRadius: 16, padding: 32, boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
        <h1 style={{ marginBottom: 8, fontSize: 32 }}>Panel administrativo</h1>
        <p style={{ marginBottom: 24, color: '#666' }}>Inicia sesión para gestionar contenidos.</p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label htmlFor="email" style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Correo</label>
            <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #dfe3ec' }} />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label htmlFor="password" style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Contraseña</label>
            <input id="password" name="password" type="password" value={form.password} onChange={handleChange} required style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #dfe3ec' }} />
          </div>

          {mensaje && <p style={{ color: '#b42318', marginBottom: 16 }}>{mensaje}</p>}

          <button type="submit" disabled={loading} style={{ width: '100%', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 16px', cursor: 'pointer', fontWeight: 700 }}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p style={{ marginTop: 20, textAlign: 'center', color: '#555' }}>
          ¿No tienes cuenta? <Link to="/admin/register">Regístrate aquí</Link>
        </p>
      </div>
    </div>
  );
}
