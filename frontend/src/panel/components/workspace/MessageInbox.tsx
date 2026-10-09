import { useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAdminAuth } from '../../context';
import { useConfirmLeave } from '../../unsaved/unsavedContext';
import { panelRequest, errorMessage } from '../../services/panelApi';
import { label, type Row } from '../../types/workspace';
import { useCollection, dateLabel } from './useCollection';
import { useMessageDetail } from './useMessageDetail';
import AttentionEditor from '../AttentionEditor';
import PanelIcon from '../PanelIcon';

export default function MessageInbox() {
  const { token } = useAdminAuth();
  const [params, setParams] = useSearchParams();
  const [revision, setRevision] = useState(0);
  const [search, setSearch] = useState('');
  const [channel, setChannel] = useState('');
  const [page,setPage]=useState(1);
  const status = params.get('estado') || '';
  const listParams=new URLSearchParams({page:String(page),limit:'20',...(search.trim()?{search:search.trim()}:{}),...(status?{estado:status}:{}),...(channel?{channel}:{})});
  const {rows,loading,error,total,pages,metrics:counts}=useCollection('messages',false,revision,String(listParams));
  // Solo un entero positivo es una consulta; cualquier otro valor de ?id= se ignora (sin redirigir, para no crear bucles).
  const rawId = params.get('id');
  const selectedId = rawId && /^\d{1,9}$/.test(rawId) ? Number(rawId) : 0;
  // El detalle NO depende de la página, la búsqueda ni el filtro: sale de la lista si está, y si no, de la última versión conocida o de GET /messages/:id.
  const detail = useMessageDetail(selectedId, token, rows, loading);
  const selected = detail.row;
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');
  const [notice, setNotice] = useState('');
  const lock = useRef(false);
  const confirmLeave = useConfirmLeave(); // los cambios sin guardar del seguimiento nunca se pierden en silencio
  const [editorEpoch, setEditorEpoch] = useState(0); // fuerza una carga nueva del seguimiento (revisión al día) tras cambiar el estado
  const fromChat = (row: Row) => String(row.asunto).startsWith('[Chatbot]');
  // Página fuera de rango (se eliminó el último registro de la página o una búsqueda redujo las páginas): se vuelve a la última que existe.
  if (!loading && !error && page > 1 && page > Math.max(1, pages)) setPage(Math.max(1, pages));
  const outOfList = !!selected && !loading && !error && !rows.some(row => row.id === selected.id);
  const updateParams = (key: string, value: string) => confirmLeave(() => {
    const next = new URLSearchParams(params); if (value) next.set(key, value); else next.delete(key);
    if (key === 'estado') { next.delete('id'); setPage(1); } setParams(next);
  });
  const changeState = (state: string) => confirmLeave(() => void applyState(state));
  const applyState = async (state: string) => {
    if (!selected || !token || lock.current) return;
    lock.current = true; setBusy(true); setActionError(''); setNotice('');
    try {
      const path='seguimiento/messages/'+selected.id;
      const {item}=await panelRequest<{item:{revision:number;responsable:string;notas:string;respuesta:string}}>(path,token);
      await panelRequest(path,token,'PUT',{estado:state,revision:item.revision,responsable:item.responsable,notas:item.notas,respuesta:item.respuesta});
      detail.patch({ estado: state }); // el detalle abierto refleja el estado nuevo aunque ya no cumpla el filtro del listado
      setNotice('Consulta de ' + selected.nombre + ': ' + label(state) + '.'); setRevision(value => value + 1); setEditorEpoch(value => value + 1);
    } catch (err) { setActionError(errorMessage(err)); }
    finally { lock.current = false; setBusy(false); }
  };
  const metrics = [['nuevo', 'Por atender'], ['en_proceso', 'En proceso'], ['atendido', 'Atendidos']];
  const email = selected && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(selected.email)) ? String(selected.email) : '';
  const phone = selected ? String(selected.telefono || '').replace(/[^+\d]/g, '') : '';
  return <>
    <div className="hp-heading"><div><p className="hp-kicker">ATENCIÓN AL CLIENTE</p><h1>Centro de consultas</h1><p>Lee, clasifica y continúa la atención de cada persona.</p></div><div className="hp-actions">
      <Link className="hp-btn" to="/admin/dashboard?section=mensajes&crear=1"><PanelIcon name="plus" />Registro manual</Link>
      <button className="hp-btn" onClick={() => confirmLeave(() => setRevision(value => value + 1))} disabled={loading || busy}><PanelIcon name="refresh" />Actualizar</button></div></div>
    <div className="hw-insights">{metrics.map(([state, title]) => <button key={state} onClick={() => updateParams('estado', state)} aria-pressed={status === state}><span className={'hp-badge hp-state-' + state}>{title}</span><strong>{loading ? '…' : error ? '—' : counts[state]||0}</strong><span>Ver consultas <PanelIcon name="arrow" size={14} /></span></button>)}</div>
    {notice && <p className="hp-notice" role="status">{notice}</p>}
    {(error || actionError) && <p className="hp-error" role="alert">{error || actionError}</p>}
    <section className="hp-card">
      <div className="hp-card-heading"><div><h2>Bandeja de atención</h2><p>{loading ? 'Cargando…' : error ? 'Datos no disponibles' : total + ' consultas coinciden con tus filtros'}</p></div><Link className="hp-text-btn" to="/admin/dashboard?section=mensajes&vista=tabla">Vista de registros</Link></div>
      <div className="hp-toolbar"><div className="hp-search"><PanelIcon name="search" /><input aria-label="Buscar consultas" placeholder="Nombre, correo, asunto o mensaje…" value={search} onChange={e => { const value = e.target.value; confirmLeave(() => { setPage(1); setSearch(value); }); }} /></div>
        <select aria-label="Estado de atención" value={status} onChange={e => updateParams('estado', e.target.value)}><option value="">Todos los estados</option>{metrics.map(([state, title]) => <option value={state} key={state}>{title}</option>)}</select>
        <select aria-label="Origen de consulta" value={channel} onChange={e => { const value = e.target.value; confirmLeave(() => { setPage(1); setChannel(value); }); }}><option value="">Todos los orígenes</option><option value="chatbot">Chatbot</option><option value="other">Web / manual</option></select></div>
      {/* El listado y el detalle son independientes: cargar, fallar o vaciarse el listado NO desmonta el detalle abierto ni lo que se esté escribiendo. */}
      <div className="hw-inbox" aria-busy={loading}>
        <div className="hw-inbox-list" aria-label="Consultas recibidas">{error ? <div className="hp-empty hp-empty-compact"><p>No se pudo consultar la bandeja.</p><button className="hp-btn" onClick={() => setRevision(value => value + 1)}>Reintentar</button></div> : loading && !rows.length ? <div className="hp-empty hp-empty-compact" role="status">Cargando consultas…</div> : rows.length ? rows.map(row => <button key={row.id} className={selectedId === row.id ? 'is-selected' : ''} onClick={() => updateParams('id', String(row.id))} disabled={busy} aria-pressed={selectedId === row.id}>
          <span className="hw-inbox-meta"><strong>{String(row.nombre)}</strong><small>{dateLabel(row.createdAt)}</small></span>
          <span className="hw-inbox-subject">{String(row.asunto)}</span><span className="hw-inbox-preview">{String(row.mensaje)}</span>
          <span className="hw-inbox-meta"><span className={'hp-badge hp-state-' + row.estado}>{label(row.estado)}</span><small>{fromChat(row) ? 'Chatbot' : 'Web / manual'}</small></span>
        </button>) : <div className="hp-empty hp-empty-compact"><PanelIcon name="mail" size={28} /><p>No hay consultas con estos filtros.</p></div>}</div>
        <div className="hw-inbox-detail">{selected ? <>
          {outOfList && <p className="hw-caption" data-testid="outside-list">Esta consulta no aparece en la página, la búsqueda o el filtro actuales. Sigue abierta para que no pierdas lo que estás haciendo.</p>}
          <div className="hw-detail-heading"><span className={'hp-badge hp-state-' + selected.estado}>{label(selected.estado)}</span><small>Consulta #{selected.id}</small><h2>{String(selected.asunto)}</h2><p>{String(selected.nombre)} · {dateLabel(selected.createdAt)}</p></div>
          <dl className="hw-contact-data"><div><dt>Correo</dt><dd>{String(selected.email)}</dd></div><div><dt>Teléfono</dt><dd>{String(selected.telefono || 'No indicado')}</dd></div></dl>
          <div className="hw-message-text">{String(selected.mensaje)}</div>
          <div className="hp-actions">{email && <a className="hp-btn" href={'mailto:' + encodeURIComponent(email) + '?subject=' + encodeURIComponent('Re: ' + selected.asunto)}><PanelIcon name="mail" />Abrir correo</a>}{phone.length >= 6 && <a className="hp-btn" href={'tel:' + phone}>Llamar</a>}</div>
          <Link className="hp-btn" to={'/admin/dashboard?section=cotizaciones&contacto='+selected.id}>Preparar cotización</Link><p className="hw-caption">El correo se abre en tu aplicación. El estado de la consulta se actualiza por separado.</p>
          <AttentionEditor key={selected.id} syncKey={editorEpoch} resource="messages" id={selected.id} onSaved={(item)=>{detail.patch({ estado: item.estado });setNotice('Seguimiento guardado.');setRevision(v=>v+1)}} /><div className="hw-next-action"><strong>Siguiente paso</strong><p>Actualiza el estado según la atención realizada.</p><div className="hp-actions">
            {metrics.filter(([state]) => state !== selected.estado).map(([state]) => <button className={'hp-btn' + (state === 'atendido' ? ' hp-btn-primary' : '')} key={state} disabled={busy} onClick={() => void changeState(state)}>{busy ? 'Guardando…' : state === 'nuevo' ? 'Volver a pendiente' : state === 'en_proceso' ? 'Iniciar atención' : 'Marcar atendido'}</button>)}
          </div></div>
        </> : detail.status === 'loading' ? <div className="hp-empty" role="status"><p>Cargando consulta…</p></div>
          : detail.status === 'missing' ? <div className="hp-empty" role="alert"><PanelIcon name="mail" size={38} /><h3>Esta consulta ya no está disponible</h3><p>Puede haberse eliminado. Elige otra consulta de la lista.</p><button className="hp-btn" onClick={() => updateParams('id', '')}>Cerrar detalle</button></div>
          : detail.status === 'error' ? <div className="hp-empty" role="alert"><PanelIcon name="mail" size={38} /><h3>No pudimos cargar esta consulta</h3><p>Comprueba tu conexión e inténtalo de nuevo. La consulta no se ha eliminado.</p><div className="hp-actions"><button className="hp-btn hp-btn-primary" onClick={detail.retry}>Reintentar</button><button className="hp-btn" onClick={() => updateParams('id', '')}>Cerrar detalle</button></div></div>
          : <div className="hp-empty"><PanelIcon name="mail" size={38} /><h3>Una consulta, toda la información</h3><p>Selecciona una persona para leer su mensaje y continuar la atención.</p></div>}</div>
      </div>
    <footer className="hp-pagination"><button className="hp-btn" disabled={loading||page===1} onClick={()=>confirmLeave(()=>setPage(v=>v-1))}>Anterior</button><span>Página {page}</span><button className="hp-btn" disabled={loading||!!error||page>=pages} onClick={()=>confirmLeave(()=>setPage(v=>v+1))}>Siguiente</button></footer></section>
  </>;
}
