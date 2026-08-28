import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { createAdminItem, deleteAdminItem, getAdminItems, updateAdminItem } from '../../services/adminApi';
import type { AdminItem } from '../../types/admin';

const emptyForm = { titulo: '', descripcion: '', categoria: 'general', estado: 'activo' };

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { token, logout, user } = useAdminAuth();
  const [items, setItems] = useState<AdminItem[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
      return;
    }

    const fetchItems = async () => {
      const response = await getAdminItems(token);
      if (response.ok && response.items) {
        setItems(response.items);
      }
    };

    fetchItems();
  }, [token, navigate]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;

    const payload = {
      titulo: form.titulo,
      descripcion: form.descripcion,
      categoria: form.categoria,
      estado: form.estado,
    };

    if (editingId) {
      const response = await updateAdminItem(token, editingId, payload);
      if (response.ok && response.item) {
        setItems((prev) => prev.map((item) => (item.id === response.item!.id ? response.item! : item)));
        setMensaje(response.mensaje || 'Elemento actualizado.');
      }
    } else {
      const response = await createAdminItem(token, payload);
      if (response.ok && response.item) {
        setItems((prev) => [response.item!, ...prev]);
        setMensaje(response.mensaje || 'Elemento creado.');
      }
    }

    setForm(emptyForm);
    setEditingId(null);
  };

  const handleEdit = (item: AdminItem) => {
    setEditingId(item.id);
    setForm({
      titulo: item.titulo,
      descripcion: item.descripcion,
      categoria: item.categoria,
      estado: item.estado,
    });
  };

  const handleDelete = async (id: number) => {
    if (!token) return;

    const response = await deleteAdminItem(token, id);
    if (response.ok) {
      setItems((prev) => prev.filter((item) => item.id !== id));
      setMensaje(response.mensaje || 'Elemento eliminado.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f3f6fb', padding: 32 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 32 }}>Dashboard</h1>
            <p style={{ margin: '6px 0 0', color: '#666' }}>Hola, {user?.nombre || 'Administrador'}</p>
          </div>

          <button onClick={logout} style={{ background: '#111827', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: 10, cursor: 'pointer' }}>
            Cerrar sesión
          </button>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.4fr', gap: 24 }}>
          <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 12px 30px rgba(0,0,0,0.04)' }}>
            <h2 style={{ marginTop: 0 }}>{editingId ? 'Editar elemento' : 'Crear nuevo elemento'}</h2>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Título</label>
              <input name="titulo" value={form.titulo} onChange={handleChange} required style={{ width: '100%', padding: '11px 12px', borderRadius: 10, border: '1px solid #dfe3ec' }} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Descripción</label>
              <textarea name="descripcion" value={form.descripcion} onChange={handleChange} required rows={5} style={{ width: '100%', padding: '11px 12px', borderRadius: 10, border: '1px solid #dfe3ec', resize: 'vertical' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Categoría</label>
                <select name="categoria" value={form.categoria} onChange={handleChange} style={{ width: '100%', padding: '11px 12px', borderRadius: 10, border: '1px solid #dfe3ec' }}>
                  <option value="general">General</option>
                  <option value="servicio">Servicio</option>
                  <option value="contenido">Contenido</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Estado</label>
                <select name="estado" value={form.estado} onChange={handleChange} style={{ width: '100%', padding: '11px 12px', borderRadius: 10, border: '1px solid #dfe3ec' }}>
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>
            </div>

            {mensaje && <p style={{ color: '#0f766e', marginBottom: 12 }}>{mensaje}</p>}

            <button type="submit" style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 18px', fontWeight: 700, cursor: 'pointer' }}>
              {editingId ? 'Guardar cambios' : 'Guardar elemento'}
            </button>
          </form>

          <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 12px 30px rgba(0,0,0,0.04)' }}>
            <h2 style={{ marginTop: 0 }}>Elementos</h2>
            <div style={{ display: 'grid', gap: 12 }}>
              {items.length === 0 ? (
                <p style={{ color: '#666' }}>No hay elementos registrados.</p>
              ) : (
                items.map((item) => (
                  <div key={item.id} style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 12 }}>
                      <div>
                        <h3 style={{ margin: '0 0 8px' }}>{item.titulo}</h3>
                        <p style={{ margin: '0 0 8px', color: '#4b5563' }}>{item.descripcion}</p>
                        <small style={{ color: '#6b7280' }}>Categoría: {item.categoria} · Estado: {item.estado}</small>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => handleEdit(item)} style={{ background: '#e0f2fe', color: '#0f172a', border: 'none', borderRadius: 8, padding: '8px 10px', cursor: 'pointer' }}>Editar</button>
                        <button onClick={() => handleDelete(item.id)} style={{ background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: 8, padding: '8px 10px', cursor: 'pointer' }}>Eliminar</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
