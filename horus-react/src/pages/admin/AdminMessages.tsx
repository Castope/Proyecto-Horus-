import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { createAdminMessage, deleteAdminMessage, getAdminMessages, updateAdminMessage } from '../../services/adminApi';
import type { AdminMessage } from '../../types/admin';

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
    } catch { setNotice('No fue posible conectar con el servidor.'); }
  };

  useEffect(() => { void load(); }, [token]);

  const changeStatus = async (id: number, estado: AdminMessage['estado']) => {
    if (!token) return;
    const response = await updateAdminMessage(token, id, estado);
    if (response.ok && response.message) setMessages((all) => all.map((message) => message.id === id ? response.message! : message));
    else setNotice(response.mensaje || 'No se pudo actualizar el mensaje.');
  };

  const remove = async (message: AdminMessage) => {
    if (!token || !window.confirm(`¿Eliminar el mensaje de ${message.nombre}?`)) return;
    const response = await deleteAdminMessage(token, message.id);
    if (response.ok) setMessages((all) => all.filter((current) => current.id !== message.id));
    else setNotice(response.mensaje || 'No se pudo eliminar el mensaje.');
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
    } else setNotice(response.mensaje || 'No se pudo crear el mensaje.');
  };

  return (
    <main className="panel-page">
      <header className="panel-page__header">
        <div><Link to="/admin/dashboard">← Volver al resumen</Link><p className="panel-kicker">Comunicación</p><h1>Mensajes</h1><p>Gestiona las consultas recibidas desde la web.</p></div>
        <button className="panel-primary" type="button" onClick={() => setShowForm((value) => !value)}>+ Nuevo mensaje</button>
      </header>
      {notice && <p className="panel-message">{notice}</p>}
      {showForm && <form className="panel-form panel-inline-form" onSubmit={submit}>
        <input placeholder="Nombre" value={form.nombre} onChange={(event) => setForm({ ...form, nombre: event.target.value })} required />
        <input type="email" placeholder="Correo" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
        <input placeholder="Teléfono" value={form.telefono} onChange={(event) => setForm({ ...form, telefono: event.target.value })} required />
        <input placeholder="Asunto" value={form.asunto} onChange={(event) => setForm({ ...form, asunto: event.target.value })} required />
        <textarea placeholder="Mensaje" value={form.mensaje} onChange={(event) => setForm({ ...form, mensaje: event.target.value })} required />
        <button className="panel-primary">Guardar mensaje</button>
      </form>}
      <section className="panel-messages">
        {messages.length ? messages.map((message) => <article key={message.id}>
          <div><strong>{message.asunto}</strong><span>{message.nombre} · {message.email}</span><p>{message.mensaje}</p></div>
          <div className="panel-message-actions"><select value={message.estado} onChange={(event) => void changeStatus(message.id, event.target.value as AdminMessage['estado'])}><option value="nuevo">Nuevo</option><option value="en_proceso">En proceso</option><option value="atendido">Atendido</option></select><button className="panel-delete" onClick={() => void remove(message)} type="button">Eliminar</button></div>
        </article>) : <div className="panel-empty"><strong>No hay mensajes todavía</strong><span>Las consultas del formulario de contacto aparecerán aquí.</span></div>}
      </section>
    </main>
  );
}
