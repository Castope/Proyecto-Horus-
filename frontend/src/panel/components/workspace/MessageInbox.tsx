import { useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAdminAuth } from '../../context';
import { panelRequest, errorMessage } from '../../services/panelApi';
import { label, type Row } from '../../types/workspace';
import { useCollection, dateLabel } from './useCollection';
import PanelIcon from '../PanelIcon';

export default function MessageInbox() {
  const { token } = useAdminAuth();
  const [params, setParams] = useSearchParams();
  const [revision, setRevision] = useState(0);
  const { rows, loading, error } = useCollection('messages', false, revision);
  const [search, setSearch] = useState('');
  const [channel, setChannel] = useState('');
  const status = params.get('estado') || '';
  const selectedId = Number(params.get('id'));
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');
  const [notice, setNotice] = useState('');
  const lock = useRef(false);
  const fromChat = (row: Row) => String(row.asunto).startsWith('[Chatbot]');
  const visible = useMemo(() => rows.filter(row => (!status || row.estado === status) &&
    (!channel || (channel === 'chatbot' ? fromChat(row) : !fromChat(row))) &&
    (!search.trim() || [row.nombre, row.email, row.asunto, row.mensaje].join(' ').toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()))), [rows, search, status, channel]);
  const selected = visible.find(row => row.id === selectedId) || null;
  const updateParams = (key: string, value: string) => {
    const next = new URLSearchParams(params); if (value) next.set(key, value); else next.delete(key);
    if (key === 'estado') next.delete('id'); setParams(next);
  };
  const changeState = async (state: string) => {
    if (!selected || !token || lock.current) return;
    lock.current = true; setBusy(true); setActionError(''); setNotice('');
    try {
      await panelRequest('messages/' + selected.id, token, 'PUT', { estado: state });
      setNotice('Consulta de ' + selected.nombre + ': ' + label(state) + '.'); setRevision(value => value + 1);
    } catch (err) { setActionError(errorMessage(err)); }
    finally { lock.current = false; setBusy(false); }
  };
  const metrics = [['nuevo', 'Por atender'], ['en_proceso', 'En proceso'], ['atendido', 'Atendidos']];
  const email = selected && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(selected.email)) ? String(selected.email) : '';
  const phone = selected ? String(selected.telefono || '').replace(/[^+\d]/g, '') : '';
  return <>
    <div className="hp-heading"><div><p className="hp-kicker">ATENCIÓN AL CLIENTE</p><h1>Centro de consultas</h1><p>Lee, clasifica y continúa la atención de cada persona.</p></div><div className="hp-actions">
      <Link className="hp-btn" to="/admin/dashboard?section=mensajes&crear=1"><PanelIcon name="plus" />Registro manual</Link>
      <button className="hp-btn" onClick={() => setRevision(value => value + 1)} disabled={loading || busy}><PanelIcon name="refresh" />Actualizar</button></div></div>
    <div className="hw-insights">{metrics.map(([state, title]) => <button key={state} onClick={() => updateParams('estado', state)} aria-pressed={status === state}><span className={'hp-badge hp-state-' + state}>{title}</span><strong>{loading ? '…' : error ? '—' : rows.filter(row => row.estado === state).length}</strong><span>Ver consultas <PanelIcon name="arrow" size={14} /></span></button>)}</div>
    {notice && <p className="hp-notice" role="status">{notice}</p>}
    {(error || actionError) && <p className="hp-error" role="alert">{error || actionError}</p>}
    <section className="hp-card">
      <div className="hp-card-heading"><div><h2>Bandeja de atención</h2><p>{loading ? 'Cargando…' : error ? 'Datos no disponibles' : visible.length + ' consultas coinciden con tus filtros'}</p></div><Link className="hp-text-btn" to="/admin/dashboard?section=mensajes&vista=tabla">Vista de registros</Link></div>
      <div className="hp-toolbar"><div className="hp-search"><PanelIcon name="search" /><input aria-label="Buscar consultas" placeholder="Nombre, correo, asunto o mensaje…" value={search} onChange={e => setSearch(e.target.value)} /></div>
        <select aria-label="Estado de atención" value={status} onChange={e => updateParams('estado', e.target.value)}><option value="">Todos los estados</option>{metrics.map(([state, title]) => <option value={state} key={state}>{title}</option>)}</select>
        <select aria-label="Origen de consulta" value={channel} onChange={e => setChannel(e.target.value)}><option value="">Todos los orígenes</option><option value="chatbot">Chatbot</option><option value="other">Web / manual</option></select></div>
      {loading ? <div className="hp-empty" role="status">Cargando consultas…</div> : error ? <div className="hp-empty"><p>No se pudo consultar la bandeja.</p><button className="hp-btn" onClick={() => setRevision(value => value + 1)}>Reintentar</button></div> :
      <div className="hw-inbox">
        <div className="hw-inbox-list" aria-label="Consultas recibidas">{visible.length ? visible.map(row => <button key={row.id} className={selected?.id === row.id ? 'is-selected' : ''} onClick={() => updateParams('id', String(row.id))} disabled={busy} aria-pressed={selected?.id === row.id}>
          <span className="hw-inbox-meta"><strong>{String(row.nombre)}</strong><small>{dateLabel(row.createdAt)}</small></span>
          <span className="hw-inbox-subject">{String(row.asunto)}</span><span className="hw-inbox-preview">{String(row.mensaje)}</span>
          <span className="hw-inbox-meta"><span className={'hp-badge hp-state-' + row.estado}>{label(row.estado)}</span><small>{fromChat(row) ? 'Chatbot' : 'Web / manual'}</small></span>
        </button>) : <div className="hp-empty hp-empty-compact"><PanelIcon name="mail" size={28} /><p>No hay consultas con estos filtros.</p></div>}</div>
        <div className="hw-inbox-detail">{selected ? <>
          <div className="hw-detail-heading"><span className={'hp-badge hp-state-' + selected.estado}>{label(selected.estado)}</span><small>Consulta #{selected.id}</small><h2>{String(selected.asunto)}</h2><p>{String(selected.nombre)} · {dateLabel(selected.createdAt)}</p></div>
          <dl className="hw-contact-data"><div><dt>Correo</dt><dd>{String(selected.email)}</dd></div><div><dt>Teléfono</dt><dd>{String(selected.telefono || 'No indicado')}</dd></div></dl>
          <div className="hw-message-text">{String(selected.mensaje)}</div>
          <div className="hp-actions">{email && <a className="hp-btn" href={'mailto:' + encodeURIComponent(email) + '?subject=' + encodeURIComponent('Re: ' + selected.asunto)}><PanelIcon name="mail" />Abrir correo</a>}{phone.length >= 6 && <a className="hp-btn" href={'tel:' + phone}>Llamar</a>}</div>
          <p className="hw-caption">El correo se abre en tu aplicación. El estado de la consulta se actualiza por separado.</p>
          <div className="hw-next-action"><strong>Siguiente paso</strong><p>Actualiza el estado según la atención realizada.</p><div className="hp-actions">
            {metrics.filter(([state]) => state !== selected.estado).map(([state, title]) => <button className={'hp-btn' + (state === 'atendido' ? ' hp-btn-primary' : '')} key={state} disabled={busy} onClick={() => void changeState(state)}>{busy ? 'Guardando…' : state === 'nuevo' ? 'Volver a pendiente' : state === 'en_proceso' ? 'Iniciar atención' : 'Marcar atendido'}</button>)}
          </div></div>
        </> : <div className="hp-empty"><PanelIcon name="mail" size={38} /><h3>Una consulta, toda la información</h3><p>Selecciona una persona para leer su mensaje y continuar la atención.</p></div>}</div>
      </div>}
    </section>
  </>;
}
