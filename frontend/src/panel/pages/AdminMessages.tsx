import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdminAuth } from '../context';
import { createAdminMessage, deleteAdminMessage, getAdminMessages, updateAdminMessage } from '../services';
import type { AdminMessage } from '../types';

const initialForm = { nombre: '', email: '', telefono: '', asunto: '', mensaje: '' };

export default function AdminMessages() {
  const { token } = useAdminAuth();
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [form, setForm] = useState(initialForm);
  const [showForm, setShowForm] = useState(false);
  const [notice, setNotice] = useState('');

  const load = async () => {
    if (!token) return;
    try {
      const response = await getAdminMessages(token);
      if (response.ok) setMessages(response.messages || []);
      else setNotice(response.mensaje || 'No se pudieron cargar los mensajes.');
    } catch {
      setNotice('No fue posible conectar con el servidor.');
    }
  };

  useEffect(() => {
    void load();
  }, [token]);

  const changeStatus = async (id: number, estado: AdminMessage['estado']) => {
    if (!token) return;
    const response = await updateAdminMessage(token, id, estado);
    if (response.ok && response.message) {
      setMessages((all) => all.map((message) => (message.id === id ? response.message! : message)));
    } else {
      setNotice(response.mensaje || 'No se pudo actualizar el mensaje.');
    }
  };

  const remove = async (message: AdminMessage) => {
    if (!token || !window.confirm(`¿Eliminar el mensaje de ${message.nombre}?`)) return;
    const response = await deleteAdminMessage(token, message.id);
    if (response.ok) {
      setMessages((all) => all.filter((current) => current.id !== message.id));
    } else {
      setNotice(response.mensaje || 'No se pudo eliminar el mensaje.');
    }
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;
    const response = await createAdminMessage(token, form);
    if (response.ok && response.message) {
      setMessages((all) => [response.message!, ...all]);
      setForm(initialForm);
      setShowForm(false);
      setNotice('Mensaje creado correctamente.');
    } else {
      setNotice(response.mensaje || 'No se pudo crear el mensaje.');
    }
  };

  return (
    <main className="panel-page" style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 20px' }}>
      <header className="panel-page__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <Link to="/admin/dashboard" style={{ color: '#1a3a6b', textDecoration: 'none', fontWeight: 600 }}>
            ← Volver al resumen
          </Link>
          <p className="panel-kicker" style={{ marginTop: 12 }}>Comunicación</p>
          <h1 style={{ margin: '4px 0 8px', fontSize: '2rem' }}>Mensajes</h1>
          <p style={{ color: '#667085' }}>Gestiona las consultas recibidas desde la web.</p>
        </div>
        <button className="panel-primary" type="button" onClick={() => setShowForm((value) => !value)}>
          + Nuevo mensaje
        </button>
      </header>

      {notice && <p className="panel-message" style={{ marginBottom: 16 }}>{notice}</p>}

      {showForm && (
        <form className="panel-form panel-inline-form" onSubmit={submit} style={{ marginBottom: 24, padding: 20, background: '#fff', borderRadius: 12, border: '1px solid #e5eaf1' }}>
          <input
            placeholder="Nombre"
            value={form.nombre}
            onChange={(event) => setForm({ ...form, nombre: event.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Correo"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            required
          />
          <input
            placeholder="Teléfono"
            value={form.telefono}
            onChange={(event) => setForm({ ...form, telefono: event.target.value })}
            required
          />
          <input
            placeholder="Asunto"
            value={form.asunto}
            onChange={(event) => setForm({ ...form, asunto: event.target.value })}
            required
          />
          <textarea
            placeholder="Mensaje"
            value={form.mensaje}
            onChange={(event) => setForm({ ...form, mensaje: event.target.value })}
            required
          />
          <button className="panel-primary" type="submit">Guardar mensaje</button>
        </form>
      )}

      <section className="panel-messages" style={{ display: 'grid', gap: 16 }}>
        {messages.length ? (
          messages.map((message) => (
            <article
              key={message.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 16,
                padding: 20,
                background: '#fff',
                borderRadius: 12,
                border: '1px solid #e5eaf1',
              }}
            >
              <div>
                <strong style={{ fontSize: '1.1rem', display: 'block', marginBottom: 4 }}>{message.asunto}</strong>
                <span style={{ color: '#667085', fontSize: '0.85rem' }}>
                  {message.nombre} · {message.email} {message.telefono ? `· Tel: ${message.telefono}` : ''}
                </span>
                <p style={{ marginTop: 10, color: '#374151', lineHeight: 1.5 }}>{message.mensaje}</p>
              </div>
              <div className="panel-message-actions" style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
                <select
                  value={message.estado}
                  onChange={(event) => void changeStatus(message.id, event.target.value as AdminMessage['estado'])}
                  style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #d0d5dd', fontSize: '0.85rem' }}
                >
                  <option value="nuevo">Nuevo</option>
                  <option value="en_proceso">En proceso</option>
                  <option value="atendido">Atendido</option>
                </select>
                <button
                  className="panel-delete"
                  onClick={() => void remove(message)}
                  type="button"
                  style={{ background: 'none', border: 'none', color: '#b42318', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
                >
                  Eliminar
                </button>
              </div>
            </article>
          ))
        ) : (
          <div className="panel-empty" style={{ textAlign: 'center', padding: '48px 20px', background: '#fff', borderRadius: 12, border: '1px solid #e5eaf1' }}>
            <strong style={{ display: 'block', marginBottom: 6 }}>No hay mensajes todavía</strong>
            <span style={{ color: '#667085' }}>Las consultas del formulario de contacto aparecerán aquí.</span>
          </div>
        )}
      </section>
    </main>
  );
}
