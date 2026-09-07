import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/images/logo-horus.png';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { createAdminItem, deleteAdminItem, getAdminItems, updateAdminItem } from '../../services/adminApi';
import type { AdminItem } from '../../types/admin';

const emptyForm = { titulo: '', descripcion: '', categoria: 'general', estado: 'activo' };

export default function AdminDashboardV2() {
  const navigate = useNavigate();
  const { token, logout, user } = useAdminAuth();
  const [items, setItems] = useState<AdminItem[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [mensaje, setMensaje] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('todos');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const formRef = useRef<HTMLElement>(null);

  const loadItems = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await getAdminItems(token);
      if (response.ok && response.items) setItems(response.items);
      else setMensaje(response.mensaje || 'No se pudo cargar el contenido.');
    } catch {
      setMensaje('No fue posible conectar con el servidor.');
    } finally { setLoading(false); }
  };

  useEffect(() => { if (!token) navigate('/admin/login'); else void loadItems(); }, [token, navigate]);

  const visibleItems = useMemo(() => items.filter((item) => {
    const matchesSearch = `${item.titulo} ${item.descripcion}`.toLowerCase().includes(query.toLowerCase());
    return matchesSearch && (filter === 'todos' || item.estado === filter);
  }), [items, query, filter]);

  const activeItems = items.filter((item) => item.estado === 'activo').length;
  const inactiveItems = items.length - activeItems;
  const categories = new Set(items.map((item) => item.categoria)).size;
  const latestItem = items[0];

  const openForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setMensaje('');
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;
    setSaving(true);
    setMensaje('');
    try {
      const response = editingId
        ? await updateAdminItem(token, editingId, form)
        : await createAdminItem(token, form);
      if (response.ok && response.item) {
        setItems((previous) => editingId
          ? previous.map((item) => item.id === response.item!.id ? response.item! : item)
          : [response.item!, ...previous]);
        setMensaje(response.mensaje || 'Contenido guardado correctamente.');
        setForm(emptyForm);
        setEditingId(null);
      } else setMensaje(response.mensaje || 'No se pudo guardar el contenido.');
    } catch { setMensaje('No fue posible conectar con el servidor.'); }
    finally { setSaving(false); }
  };

  const editItem = (item: AdminItem) => {
    setEditingId(item.id);
    setForm({ titulo: item.titulo, descripcion: item.descripcion, categoria: item.categoria, estado: item.estado });
    setMensaje('Editando “' + item.titulo + '”.');
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const removeItem = async (item: AdminItem) => {
    if (!token || !window.confirm(`¿Eliminar “${item.titulo}”? Esta acción no se puede deshacer.`)) return;
    try {
      const response = await deleteAdminItem(token, item.id);
      if (response.ok) { setItems((previous) => previous.filter((current) => current.id !== item.id)); setMensaje('Elemento eliminado correctamente.'); }
      else setMensaje(response.mensaje || 'No se pudo eliminar el elemento.');
    } catch { setMensaje('No fue posible conectar con el servidor.'); }
  };

  const closeSession = () => { logout(); navigate('/admin/login'); };

  const duplicateItem = async (item: AdminItem) => {
    if (!token) return;
    try {
      const response = await createAdminItem(token, {
        titulo: `${item.titulo} (copia)`,
        descripcion: item.descripcion,
        categoria: item.categoria,
        estado: 'inactivo',
      });
      if (response.ok && response.item) {
        setItems((previous) => [response.item!, ...previous]);
        setMensaje('Se creó una copia como contenido inactivo.');
      } else setMensaje(response.mensaje || 'No se pudo duplicar el elemento.');
    } catch { setMensaje('No fue posible conectar con el servidor.'); }
  };

  const exportItems = () => {
    const header = ['Título', 'Descripción', 'Categoría', 'Estado'];
    const rows = items.map((item) => [item.titulo, item.descripcion, item.categoria, item.estado]);
    const csv = [header, ...rows].map((row) => row.map((value) => `"${value.replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'horus-contenido.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="panel-shell">
      <aside className="panel-sidebar">
        <img className="panel-logo" src={logo} alt="Horus Group" />
        <p className="panel-section-label">Panel principal</p>
        <nav className="panel-nav" aria-label="Navegación del panel">
          <button className="panel-nav__item panel-nav__item--active" type="button"><span>▦</span> Resumen</button>
          <button className="panel-nav__item" type="button" onClick={openForm}><span>✦</span> Contenido</button>
          <button className="panel-nav__item" type="button" onClick={() => navigate('/admin/messages')}><span>✉</span> Mensajes</button>
          <button className="panel-nav__item" type="button" disabled><span>◉</span> Ajustes <small>Pronto</small></button>
        </nav>
        <div className="panel-profile"><span>{user?.nombre?.charAt(0).toUpperCase() || 'A'}</span><div><strong>{user?.nombre || 'Administrador'}</strong><small>{user?.email || 'Acceso seguro'}</small></div></div>
        <div className="panel-sidebar__bottom">
          <a href="/" target="_blank" rel="noreferrer">↗ Ver sitio web</a>
          <button type="button" onClick={closeSession}>← Cerrar sesión</button>
        </div>
      </aside>

      <main className="panel-main">
        <header className="panel-header">
          <div><p className="panel-kicker">Panel administrativo</p><h1>Hola, {user?.nombre || 'Administrador'}</h1><p>Este es el resumen de tu contenido.</p></div>
          <div className="panel-header__actions"><button className="panel-secondary" onClick={exportItems} type="button" disabled={!items.length}>↓ Exportar</button><button className="panel-icon-button" onClick={() => void loadItems()} type="button" title="Actualizar contenido">↻</button><button className="panel-primary" onClick={openForm} type="button">+ Nuevo contenido</button></div>
        </header>

        <section className="panel-stats" aria-label="Resumen de contenido">
          <article><span className="panel-stat__icon panel-stat__icon--blue">▤</span><div><p>Total de elementos</p><strong>{items.length}</strong><small>En el panel</small></div></article>
          <article><span className="panel-stat__icon panel-stat__icon--green">✓</span><div><p>Contenido activo</p><strong>{activeItems}</strong><small>Visible para publicar</small></div></article>
          <article><span className="panel-stat__icon panel-stat__icon--gold">◆</span><div><p>Categorías</p><strong>{categories}</strong><small>Organizaciones usadas</small></div></article>
          <article><span className="panel-stat__icon panel-stat__icon--gray">◌</span><div><p>En borrador</p><strong>{inactiveItems}</strong><small>Requieren revisión</small></div></article>
        </section>

        <section className="panel-insights">
          <div className="panel-insights__intro"><span>✦</span><div><p className="panel-kicker">Espacio de trabajo</p><h2>Todo listo para publicar</h2><p>Gestiona los elementos, revísalos y mantenlos organizados desde un solo lugar.</p></div><button className="panel-text-button" type="button" onClick={openForm}>Crear ahora →</button></div>
          <div className="panel-activity"><p>Última actividad</p>{latestItem ? <><strong>{latestItem.titulo}</strong><small>Último elemento de tu biblioteca · {latestItem.estado}</small></> : <><strong>Aún no hay actividad</strong><small>Tu primer contenido aparecerá aquí.</small></>}</div>
        </section>

        <section className="panel-workspace">
          <section className="panel-editor" ref={formRef}>
            <div className="panel-card__heading"><div><p className="panel-kicker">Gestión de contenido</p><h2>{editingId ? 'Editar elemento' : 'Crear contenido'}</h2></div>{editingId && <button className="panel-text-button" type="button" onClick={openForm}>Cancelar</button>}</div>
            <form className="panel-form" onSubmit={handleSubmit}>
              <label>Título<input name="titulo" value={form.titulo} onChange={(event) => setForm({ ...form, titulo: event.target.value })} minLength={3} maxLength={150} placeholder="Ej. Nueva capacitación" required /></label>
              <label>Descripción<textarea name="descripcion" value={form.descripcion} onChange={(event) => setForm({ ...form, descripcion: event.target.value })} minLength={3} maxLength={5000} rows={5} placeholder="Describe brevemente este contenido" required /></label>
              <div className="panel-form__row"><label>Categoría<select value={form.categoria} onChange={(event) => setForm({ ...form, categoria: event.target.value })}><option value="general">General</option><option value="servicio">Servicio</option><option value="contenido">Contenido</option></select></label><label>Estado<select value={form.estado} onChange={(event) => setForm({ ...form, estado: event.target.value })}><option value="activo">Activo</option><option value="inactivo">Inactivo</option></select></label></div>
              {mensaje && <p className="panel-message" role="status">{mensaje}</p>}
              <button className="panel-primary" type="submit" disabled={saving}>{saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Guardar contenido'}</button>
            </form>
          </section>

          <section className="panel-list">
            <div className="panel-card__heading"><div><p className="panel-kicker">Biblioteca</p><h2>Contenido reciente</h2></div><span className="panel-count">{visibleItems.length}</span></div>
            <div className="panel-list__tools"><input aria-label="Buscar contenido" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar..." /><select aria-label="Filtrar por estado" value={filter} onChange={(event) => setFilter(event.target.value)}><option value="todos">Todos los estados</option><option value="activo">Activos</option><option value="inactivo">Inactivos</option></select></div>
            <div className="panel-items">
              {loading ? <p className="panel-empty">Cargando contenido...</p> : visibleItems.length === 0 ? <div className="panel-empty"><strong>{items.length ? 'No hay coincidencias' : 'Tu biblioteca está vacía'}</strong><span>{items.length ? 'Prueba con otra búsqueda o filtro.' : 'Crea tu primer elemento para verlo aquí.'}</span>{!items.length && <button className="panel-text-button" type="button" onClick={openForm}>Crear contenido</button>}</div> : visibleItems.map((item) => <article className="panel-item" key={item.id}><div className="panel-item__main"><div className="panel-item__title"><h3>{item.titulo}</h3><span className={item.estado === 'activo' ? 'panel-status panel-status--active' : 'panel-status'}>{item.estado}</span></div><p>{item.descripcion}</p><small>{item.categoria}{item.createdAt ? ` · ${new Date(item.createdAt).toLocaleDateString('es-PE')}` : ''}</small></div><div className="panel-item__actions"><button type="button" onClick={() => editItem(item)}>Editar</button><button type="button" onClick={() => void duplicateItem(item)}>Duplicar</button><button className="panel-delete" type="button" onClick={() => void removeItem(item)}>Eliminar</button></div></article>)}
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}
