import { useRequestStatus } from '../hooks/useRequestStatus';
import { useEffect, useRef, useState, type SubmitEvent } from 'react';
import { useAdminAuth } from '../context';
import { Link, useSearchParams } from 'react-router-dom';
import ResourceCards from './workspace/ResourceCards';
import CourseAgenda from './workspace/CourseAgenda';
import ResourcePreview from './workspace/ResourcePreview';
import { panelRequest, errorMessage } from '../services/panelApi';
import { type Resource, type Row, label, rowState } from '../types/workspace';
import PanelIcon from './PanelIcon';
import PanelDialog from './PanelDialog';

type ListResponse = { items?: Row[]; messages?: Row[]; pagination?: { total: number; pages: number } };
type Props = { resource: Resource; autoCreate?: boolean };
export default function ResourceManager({ resource: r, autoCreate }: Props) {
  const { token } = useAdminAuth();
  const [params] = useSearchParams();
  const visual = ['cursos', 'servicios', 'galeria', 'preguntas-frecuentes'].includes(r.endpoint);
  const [view, setView] = useState(params.get('vista') === 'agenda' && r.endpoint === 'cursos' ? 'agenda' : params.get('vista') === 'tabla' ? 'table' : visual ? 'cards' : 'table');
  const [preview, setPreview] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState(r.states.includes(params.get('estado') || '') ? params.get('estado')! : '');
  const [notice, setNotice] = useState('');
  const [reload, setReload] = useState(0);
  const [editor, setEditor] = useState<{ row?: Row; view?: boolean } | null>(autoCreate ? {} : null);
  const defaults = (row?: Row) => Object.fromEntries(r.fields.map(field => {
    let value = row?.[field.key];
    if (field.key === 'activo') value = row ? row.activo ? 'activo' : 'inactivo' : 'activo';
    if (field.type === 'date' && value) value = String(value).slice(0, 10);
    return [field.key, String(value ?? field.options?.[0] ?? (field.type === 'number' ? '0' : ''))];
  }));
  const [form, setForm] = useState<Record<string, string>>(() => autoCreate ? defaults() : {});
  const [formError, setFormError] = useState('');
  const [pendingDelete, setPendingDelete] = useState<Row | null>(null);
  const [busy, setBusy] = useState(false);
  const actionLock = useRef(false);
  const pageSize = 8;
  const { loading, error, setLoading, setError } = useRequestStatus(JSON.stringify([token, r.endpoint, page, query, status, reload]));

  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    const params = new URLSearchParams({ page: String(page), limit: String(pageSize) });
    if (query.trim()) params.set('search', query.trim());
    if (status) params.set('estado', status);
    panelRequest<ListResponse>(r.endpoint + (r.catalog ? '?' + params : ''), token, 'GET', undefined, controller.signal)
      .then(data => {
        if (controller.signal.aborted) return;
        if (r.catalog) {
          setRows(data.items || []); setTotal(data.pagination?.total || 0); setPages(data.pagination?.pages || 0);
          if (page > 1 && page > (data.pagination?.pages || 0)) setPage(Math.max(1, data.pagination?.pages || 1));
        } else {
          const filtered = (data.items || data.messages || []).filter(row =>
            (!status || rowState(row) === status) &&
            (!query || Object.values(row).join(' ').toLocaleLowerCase().includes(query.toLocaleLowerCase())));
          const last = Math.ceil(filtered.length / pageSize);
          setTotal(filtered.length); setPages(last);
          if (page > 1 && page > last) setPage(Math.max(1, last));
          setRows(filtered.slice((page - 1) * pageSize, page * pageSize));
        }
      }).catch(err => { if (!controller.signal.aborted) setError(errorMessage(err)); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [token, r, page, query, status, reload, setLoading, setError]);

  const openNew = () => { setForm(defaults()); setFormError(''); setEditor({}); };
  const openRow = async (row: Row, view = false) => {
    if (!token || actionLock.current) return;
    actionLock.current = true; setBusy(true); setError('');
    try {
      // Gallery only exposes a public detail route, so admin uses its list data.
      const data = r.endpoint === 'galeria' ? { item: row } :
        await panelRequest<{ item?: Row; message?: Row }>(r.endpoint + '/' + row.id, token);
      const current = data.item || data.message;
      if (!current) throw new Error('No se encontró el registro.');
      setForm({ ...defaults(current), estado: String(current.estado || 'nuevo') });
      setEditor({ row: current, view }); setFormError('');
    } catch (err) { setError(errorMessage(err)); }
    finally { actionLock.current = false; setBusy(false); }
  };
  const duplicate = async (row: Row) => {
    if (!token || actionLock.current) return;
    actionLock.current = true; setBusy(true); setError('');
    try {
      const data = await panelRequest<{ item: Row }>(r.endpoint + '/' + row.id, token);
      const copied = defaults(data.item);
      copied[r.title] = String(data.item[r.title]).slice(0, r.endpoint === 'preguntas-frecuentes' ? 285 : 145) + ' (copia)';
      if ('slug' in copied) copied.slug = copied.slug.slice(0, 140).replace(/-+$/, '') + '-copia-' + Date.now();
      copied.estado = 'borrador';
      setForm(copied); setFormError(''); setPreview(true); setEditor({});
    } catch (err) { setError(errorMessage(err)); }
    finally { actionLock.current = false; setBusy(false); }
  };
  const save = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token || actionLock.current) return;
    actionLock.current = true; setBusy(true); setFormError('');
    try {
      let payload: Record<string, unknown> = {};
      for (const field of r.fields) {
        const value = (form[field.key] ?? '').trim();
        if (!value && !field.required && !editor?.row?.[field.key]) continue;
        payload[field.key] = field.key === 'activo' ? value === 'activo' : field.type === 'number' ? Number(value) : value;
      }
      if (r.endpoint === 'messages' && editor?.row) payload = { estado: form.estado };
      await panelRequest(r.endpoint + (editor?.row ? '/' + editor.row.id : ''), token, editor?.row ? 'PUT' : 'POST', payload);
      setEditor(null); setNotice('Cambios guardados correctamente.'); setReload(n => n + 1);
    } catch (err) { setFormError(errorMessage(err)); }
    finally { actionLock.current = false; setBusy(false); }
  };
  const remove = async () => {
    if (!token || !pendingDelete || actionLock.current) return;
    actionLock.current = true; setBusy(true); setFormError('');
    try {
      await panelRequest(r.endpoint + '/' + pendingDelete.id, token, 'DELETE');
      setPendingDelete(null); setNotice(r.catalog ? 'Registro archivado. Puedes recuperarlo editando su estado.' : 'Registro eliminado.');
      setReload(n => n + 1);
    } catch (err) { setFormError(errorMessage(err)); }
    finally { actionLock.current = false; setBusy(false); }
  };
  const exportPage = () => {
    const cols = ['id', ...r.fields.map(field => field.key)];
    const escape = (value: unknown) => {
      let str = String(value ?? '');
      if (/^[=+@\-\t\r\n]/.test(str)) str = "'" + str;
      return '"' + str.replace(/"/g, '""') + '"';
    };
    const csv = '\uFEFF' + [cols, ...rows.map(row => cols.map(key => row[key]))].map(row => row.map(escape).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = r.endpoint + '-pagina-' + page + '.csv'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return <>
    <div className="hp-heading"><div><p className="hp-kicker">ESPACIO DE TRABAJO</p><h1>{r.label}</h1><p>{r.description}</p></div>
      <button className="hp-btn hp-btn-primary" onClick={openNew} disabled={busy}><PanelIcon name="plus" />Crear {r.singular}</button></div>
    {r.endpoint === 'messages' && <p className="hw-caption"><Link className="hp-text-btn" to="/admin/messages">← Volver al centro de consultas</Link></p>}
    {notice && <div className="hp-notice" role="status"><PanelIcon name="check" />{notice}<button aria-label="Cerrar aviso" onClick={() => setNotice('')}><PanelIcon name="close" size={16} /></button></div>}
    <section className="hp-card">
      <div className="hp-card-heading"><div><h2>{r.endpoint === 'galeria' ? 'Biblioteca visual' : r.endpoint === 'cursos' ? 'Oferta y planificación' : r.endpoint === 'servicios' ? 'Portafolio de soluciones' : r.endpoint === 'preguntas-frecuentes' ? 'Centro de respuestas' : 'Todos los registros'} <span className="hp-count">{loading ? '…' : error ? '—' : total}</span></h2><p>{visual ? 'Revisa, prepara y organiza el contenido de esta sección.' : 'Consulta y administra tu información.'}</p></div>
        <div className="hp-actions"><button className="hp-btn" onClick={exportPage} disabled={view === 'agenda' || loading || !!error || !rows.length}><PanelIcon name="download" />Exportar página</button>
          <button className="hp-icon-btn" aria-label="Actualizar registros" onClick={() => setReload(n => n + 1)} disabled={loading}><PanelIcon name="refresh" /></button></div></div>
      {visual && <div className="hw-viewbar"><div className="hw-tabs" aria-label="Vista de contenido">
        <button aria-pressed={view === 'cards'} onClick={() => setView('cards')}>{r.endpoint === 'preguntas-frecuentes' ? 'Por categoría' : 'Vista visual'}</button>
        <button aria-pressed={view === 'table'} onClick={() => setView('table')}>Tabla</button>
        {r.endpoint === 'cursos' && <button aria-pressed={view === 'agenda'} onClick={() => setView('agenda')}>Agenda de cursos</button>}
      </div><span className="hw-caption">{view === 'agenda' ? 'Planifica fechas del catálogo completo' : 'Resultados paginados · 8 por página'}</span></div>}
      {view === 'agenda' ? <CourseAgenda revision={reload} onOpen={row => void openRow(row)} /> : <>
      <form className="hp-toolbar" onSubmit={e => { e.preventDefault(); setPage(1); setQuery(search.trim()); }}>
        <div className="hp-search"><PanelIcon name="search" /><input aria-label="Buscar registros" placeholder="Buscar por nombre o título…" value={search} onChange={e => setSearch(e.target.value)} maxLength={100} /></div>
        <button className="hp-btn" type="submit">Buscar</button>
        <select aria-label="Filtrar por estado" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}><option value="">Todos los estados</option>{r.states.map(s => <option key={s} value={s}>{label(s)}</option>)}</select>
      </form>
      {error ? <div className="hp-empty" role="alert"><PanelIcon name="help" size={32} /><h3>No pudimos cargar los registros</h3><p>{error}</p><button className="hp-btn" onClick={() => setReload(n => n + 1)}>Reintentar</button></div> :
        loading ? <div className="hp-empty" role="status"><span className="hp-loading" /><p>Cargando registros…</p></div> :
        rows.length ? (view === 'cards' ? <ResourceCards resource={r} rows={rows} busy={busy} onOpen={(row, view) => void openRow(row, view)} onDuplicate={row => void duplicate(row)} onRemove={row => { setFormError(''); setPendingDelete(row); }} /> : <div className="hp-table-wrap"><table className="hp-table"><thead><tr><th>{r.endpoint === 'messages' ? 'Consulta' : 'Contenido'}</th><th>Categoría / tipo</th><th>Estado</th><th>Actualización</th><th className="hp-align-right">Acciones</th></tr></thead>
          <tbody>{rows.map(row => <tr key={row.id}><td><div className="hp-record"><span className={'hp-record-icon hp-tone-' + r.icon}><PanelIcon name={r.icon} /></span><div><strong>{String(row[r.title])}</strong><small>{String(row.nombre || row.slug || 'Registro #' + row.id)}</small></div></div></td>
            <td>{label(row.categoria || row.tipo || (r.endpoint === 'messages' ? 'Contacto web / manual' : 'General'))}</td>
            <td><span className={'hp-badge hp-state-' + rowState(row)}>{label(rowState(row))}</span></td>
            <td>{row.updatedAt || row.createdAt ? new Date(String(row.updatedAt || row.createdAt)).toLocaleDateString('es-PE') : '—'}</td>
            <td><div className="hp-row-actions"><button className="hp-icon-btn" aria-label={'Ver ' + row[r.title]} title="Ver detalle" disabled={busy} onClick={() => void openRow(row, true)}><PanelIcon name="eye" size={17} /></button>
              <button className="hp-icon-btn" aria-label={'Editar ' + row[r.title]} title={r.endpoint === 'messages' ? 'Cambiar estado' : 'Editar'} disabled={busy} onClick={() => void openRow(row)}><PanelIcon name="edit" size={17} /></button>
              <button className="hp-icon-btn hp-danger" aria-label={(r.catalog ? 'Archivar ' : 'Eliminar ') + row[r.title]} title={r.catalog ? 'Archivar' : 'Eliminar'} disabled={busy || (r.catalog && row.estado === 'archivado')} onClick={() => { setFormError(''); setPendingDelete(row); }}><PanelIcon name="trash" size={17} /></button></div></td></tr>)}</tbody></table></div>) :
          <div className="hp-empty"><span className="hp-empty-icon"><PanelIcon name={r.icon} size={30} /></span><h3>{query || status ? 'No encontramos coincidencias' : 'Tu próximo proyecto empieza aquí'}</h3><p>{query || status ? 'Prueba con otra búsqueda o cambia el filtro.' : 'Crea tu primer registro. Su información quedará guardada en el sistema.'}</p><button className="hp-btn hp-btn-primary" onClick={openNew}>Crear {r.singular}<PanelIcon name="plus" /></button></div>}
      <footer className="hp-pagination"><span>{error ? 'Sin conexión con los datos' : total + ' registros encontrados'} · {pageSize} por página</span><div><button className="hp-btn" disabled={loading || !!error || page <= 1} onClick={() => setPage(p => p - 1)}>Anterior</button><span>{page} / {Math.max(1, pages)}</span><button className="hp-btn" disabled={loading || !!error || page >= pages} onClick={() => setPage(p => p + 1)}>Siguiente</button></div></footer></>}
    </section>
    {editor && <PanelDialog title={(editor.view ? 'Detalle de ' : editor.row ? 'Editar ' : 'Crear ') + r.singular} busy={busy} onClose={() => setEditor(null)}>
      {editor.view ? <>{visual && <ResourcePreview resource={r} values={editor.row!} />}<dl className="hp-details">{r.fields.map(field => <div key={field.key}><dt>{field.label}</dt><dd>{label(editor.row?.[field.key]) || 'Sin especificar'}</dd></div>)}</dl><div className="hp-dialog-footer"><button className="hp-btn hp-btn-primary" onClick={() => setEditor({ ...editor, view: false })}>Editar registro<PanelIcon name="edit" /></button></div></> :
      <form onSubmit={save}>
        {visual && <div className="hw-editor-tools"><strong>{editor.row ? 'Edición de contenido' : 'Prepara una nueva publicación'}</strong><button type="button" className="hp-btn" onClick={() => setPreview(value => !value)} aria-expanded={preview}><PanelIcon name="eye" size={16} />{preview ? 'Ocultar vista previa' : 'Vista previa'}</button></div>}
        {visual && preview && <ResourcePreview resource={r} values={form} />}
        <fieldset className="hp-form-grid" disabled={busy}><legend className="hp-sr">Datos del registro</legend>
        {r.fields.map(field => {
          const locked = r.endpoint === 'messages' && !!editor.row;
          const common = { id: 'field-' + field.key, value: form[field.key] || '', required: field.required, disabled: locked,
            onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm(prev => ({ ...prev, [field.key]: event.target.value })) };
          return <label key={field.key} className={field.type === 'textarea' ? 'hp-full' : ''} htmlFor={common.id}>{field.label}{field.required && <span className="hp-required"> *</span>}
            {field.type === 'textarea' ? <textarea {...common} rows={4} minLength={field.min} maxLength={field.max} /> :
              field.type === 'select' ? <select {...common}>{field.options?.map(o => <option key={o} value={o}>{label(o)}</option>)}</select> :
              <input {...common} type={field.type || 'text'} minLength={field.type === 'number' ? undefined : field.min} maxLength={field.type === 'number' ? undefined : field.max} min={field.type === 'number' ? field.min : undefined} max={field.type === 'number' ? field.max : undefined}
                pattern={field.key === 'slug' ? '[a-z0-9]+(-[a-z0-9]+)*' : undefined} />}
            {field.key === 'slug' && <small>Minúsculas y guiones. <button type="button" className="hp-text-btn" onClick={() => setForm(prev => ({ ...prev, slug: (prev.titulo || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 180) }))}>Generar desde el título</button></small>}
          </label>;
        })}
        {r.endpoint === 'messages' && editor.row && <label className="hp-full">Estado de atención<select value={form.estado} onChange={e => setForm(prev => ({ ...prev, estado: e.target.value }))}>{r.states.map(s => <option key={s} value={s}>{label(s)}</option>)}</select></label>}
      </fieldset>{formError && <p className="hp-error" role="alert">{formError}</p>}
        <div className="hp-dialog-footer"><button type="button" className="hp-btn" disabled={busy} onClick={() => setEditor(null)}>Cancelar</button><button className="hp-btn hp-btn-primary" disabled={busy}>{busy ? 'Guardando…' : 'Guardar cambios'}<PanelIcon name="check" /></button></div></form>}
    </PanelDialog>}
    {pendingDelete && <PanelDialog title={r.catalog ? 'Archivar registro' : 'Eliminar registro'} busy={busy} onClose={() => setPendingDelete(null)}>
      <div className="hp-confirm"><PanelIcon name="trash" size={34} /><h3>{String(pendingDelete[r.title])}</h3><p>{r.catalog ? 'Dejará de aparecer en las consultas públicas. Podrás publicarlo nuevamente desde Editar.' : 'Este registro se eliminará de la base de datos. Esta acción no se puede deshacer.'}</p></div>
      {formError && <p className="hp-error" role="alert">{formError}</p>}<div className="hp-dialog-footer"><button className="hp-btn" disabled={busy} onClick={() => setPendingDelete(null)}>Cancelar</button><button className="hp-btn hp-btn-danger" disabled={busy} onClick={() => void remove()}>{busy ? 'Procesando…' : r.catalog ? 'Confirmar archivo' : 'Confirmar eliminación'}</button></div>
    </PanelDialog>}
  </>;
}
