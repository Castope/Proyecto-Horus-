import { useAdminAuth } from '../../context';
import { useConfirmLeave } from '../../unsaved/unsavedContext';
import { panelRequest, errorMessage } from '../../services/panelApi';
import { useRef, useEffect, useState } from 'react';
import { collectionRows, type CollectionResponse, useCollection, dateLabel } from './useCollection';
import type { Row } from '../../types/workspace';
import PanelDialog from '../PanelDialog';
import AttentionEditor from '../AttentionEditor';
import PanelIcon from '../PanelIcon';

const complaintFields = [
  ['numero_reclamo', 'Número'], ['nombres', 'Nombres'], ['apellidos', 'Apellidos'],
  ['tipo_doc', 'Tipo de documento'], ['num_doc', 'Documento'], ['email', 'Correo'],
  ['telefono', 'Teléfono'], ['direccion', 'Dirección'], ['tipo_registro', 'Tipo'],
  ['area', 'Área'], ['fecha_incidente', 'Fecha del incidente'], ['descripcion_bien', 'Bien o servicio'],
  ['detalle_reclamo', 'Detalle del reclamo'], ['acepta_comunicaciones', 'Acepta comunicaciones'], ['createdAt', 'Fecha de registro'],
];
const subscriberFields = [['email', 'Correo'], ['interes', 'Interés'], ['activo', 'Estado'], ['createdAt', 'Fecha de suscripción']];
const valueLabel = (row: Row, key: string) => key === 'fecha_incidente' ? dateLabel(row[key], true) : key === 'createdAt' ? dateLabel(row[key]) :
  key === 'activo' ? row[key] === true ? 'Activo' : 'Inactivo' : key === 'acepta_comunicaciones' ? row[key] === true ? 'Sí' : 'No' : String(row[key] ?? 'No indicado');

export default function CommunityRecords({ kind }: { kind: 'newsletter' | 'reclamaciones' }) {
  const [revision, setRevision] = useState(0);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [interest, setInterest] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Row | null>(null);
  const complaints = kind === 'reclamaciones';
  const confirmLeave = useConfirmLeave(); // cerrar el detalle con seguimiento sin guardar pide confirmación
  const {token}=useAdminAuth();
  const [subscriberBusy,setSubscriberBusy]=useState(false),[subscriberError,setSubscriberError]=useState('');
  const [exporting,setExporting]=useState(false),[exportError,setExportError]=useState('');
  const exportController=useRef<AbortController|null>(null);
  useEffect(()=>()=>exportController.current?.abort(),[]);
  const listParams=new URLSearchParams({page:String(page),limit:'10',...(search.trim()?{search:search.trim()}:{}),...(filter?{[complaints?'tipo_registro':'estado']:filter}:{}),...(interest?{interes:interest}:{})});
  const {rows,loading,error,total,pages:serverPages,metrics:counts,interests}=useCollection(kind,false,revision,String(listParams));
  const fields = complaints ? complaintFields : subscriberFields;
  const filtered = rows;
  const pages = Math.max(1, serverPages);
  const currentPage = Math.min(page, pages);
  const visible = filtered;
  const exportResults = async () => {
    if(exporting)return;const c=new AbortController();exportController.current=c;setExporting(true);setExportError('');
    try{const filtered:Row[]=[];const q=new URLSearchParams(listParams);q.set('limit','100');let number=1,last=1;do{q.set('page',String(number));const data=await panelRequest<CollectionResponse>(kind+'?'+q,token,'GET',undefined,c.signal);filtered.push(...collectionRows(data));last=data.pagination?.pages||0;number++;}while(number<=last);
    const escape = (value: unknown) => {
      const text = String(value ?? '');
      return '"' + (/^[\s]*[=+@-]|^[\t\r\n]/.test(text) ? "'" : '') + text.replace(/"/g, '""') + '"';
    };
    const csv = '\uFEFF' + [fields.map(([, title]) => title), ...filtered.map(row => fields.map(([key]) => valueLabel(row, key)))]
      .map(row => row.map(escape).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = kind + '-filtrados.csv'; link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    }catch(e){if(!c.signal.aborted)setExportError(errorMessage(e));}finally{if(!c.signal.aborted)setExporting(false);}
  };
  const deactivate=async()=>{if(!selected||subscriberBusy)return;setSubscriberBusy(true);setSubscriberError('');try{await panelRequest('newsletter/'+selected.id,token,'DELETE');setSelected({...selected,activo:false});setRevision(v=>v+1);}catch(e){setSubscriberError(errorMessage(e));}finally{setSubscriberBusy(false);}};
  const clearFilters = () => { setSearch(''); setFilter(''); setInterest(''); setPage(1); };
  const metrics = complaints ? [['Registros', counts.total||0], ['Reclamos', counts.reclamo||0], ['Quejas', counts.queja||0]] :
    [['Suscriptores', counts.total||0], ['Activos', counts.activo||0], ['Inactivos', counts.inactivo||0]];
  return <>
    <div className="hp-heading"><div><p className="hp-kicker">ATENCIÓN Y COMUNIDAD</p><h1>{complaints ? 'Libro de reclamaciones' : 'Suscripciones'}</h1>
      <p>{complaints ? 'Consulta los registros recibidos y revisa cada caso.' : 'Consulta tu comunidad y segmenta por interés y estado.'}</p></div>
      <button className="hp-btn" disabled={loading} onClick={() => setRevision(value => value + 1)}><PanelIcon name="refresh" />Actualizar</button></div>
    <div className="hw-insights" aria-label="Totales de la sección">{metrics.map(([title, count]) => <article key={title}><span>{title}</span><strong>{loading ? '…' : error ? '—' : count}</strong></article>)}</div>
    {exportError && <p className="hp-error" role="alert">{exportError}</p>}
    <section className="hp-card">
      <div className="hp-card-heading"><div><h2>{complaints ? 'Reclamos y quejas' : 'Directorio de suscriptores'}</h2><p>{loading ? 'Cargando…' : error ? 'Datos no disponibles' : total + ' resultados con los filtros actuales'}</p></div>
        <button className="hp-btn" onClick={exportResults} disabled={loading || !!error || !total || exporting}><PanelIcon name="download" />{exporting ? 'Exportando…' : 'Exportar resultados'}</button></div>
      <div className="hp-toolbar">
        <div className="hp-search"><PanelIcon name="search" /><input aria-label={complaints ? 'Buscar reclamaciones' : 'Buscar suscriptores'} placeholder={complaints ? 'Número, persona, documento o área…' : 'Correo o interés…'} value={search} maxLength={100} onChange={event => { setSearch(event.target.value); setPage(1); }} /></div>
        <select aria-label={complaints ? 'Tipo de registro' : 'Estado de suscripción'} value={filter} onChange={event => { setFilter(event.target.value); setPage(1); }}>
          <option value="">{complaints ? 'Todos los tipos' : 'Todos los estados'}</option>
          {complaints ? <><option value="reclamo">Reclamos</option><option value="queja">Quejas</option></> : <><option value="activo">Activos</option><option value="inactivo">Inactivos</option></>}
        </select>
        {!complaints && <select aria-label="Interés de suscripción" value={interest} onChange={event => { setInterest(event.target.value); setPage(1); }}><option value="">Todos los intereses</option>
          {interests.map(value => <option key={value} value={value}>{value}</option>)}
        </select>}
        {(search || filter || interest) && <button className="hp-btn" onClick={clearFilters}>Limpiar filtros</button>}
      </div>
      {loading ? <div className="hp-empty" role="status">Cargando registros…</div> : error ? <div className="hp-empty" role="alert"><p>{error}</p><button className="hp-btn" onClick={() => setRevision(value => value + 1)}>Reintentar</button></div> : !visible.length ?
        <div className="hp-empty"><PanelIcon name={complaints ? 'file' : 'mail'} size={30} /><h3>{rows.length ? 'No hay coincidencias' : 'Todavía no hay registros'}</h3><p>{rows.length ? 'Prueba otros filtros.' : 'Los registros del sitio web aparecerán aquí.'}</p></div> :
        <div className="hp-table-wrap"><table className="hp-table"><thead><tr><th>{complaints ? 'Registro / persona' : 'Correo'}</th><th>{complaints ? 'Tipo / área' : 'Interés'}</th><th>{complaints ? 'Fecha' : 'Estado'}</th><th>Detalle</th></tr></thead>
          <tbody>{visible.map(row => <tr key={row.id}><td><div className="hp-record"><div><strong>{complaints ? String(row.numero_reclamo || '#' + row.id) : String(row.email)}</strong><small>{complaints ? row.nombres + ' ' + row.apellidos : dateLabel(row.createdAt)}</small></div></div></td>
            <td>{complaints ? row.tipo_registro + ' · ' + row.area : String(row.interes)}</td><td>{complaints ? dateLabel(row.createdAt) : valueLabel(row, 'activo')}</td>
            <td><button className="hp-btn" onClick={() => {setSubscriberError('');setSelected(row)}} aria-label={'Ver detalle de ' + (complaints ? row.numero_reclamo || '#' + row.id : row.email)}><PanelIcon name="eye" size={16} />Ver</button></td></tr>)}</tbody>
        </table></div>}
      <footer className="hp-pagination"><span>10 registros por página</span><div><button className="hp-btn" disabled={loading || !!error || currentPage <= 1} onClick={() => setPage(currentPage - 1)}>Anterior</button><span aria-live="polite">{currentPage} / {loading || error ? '—' : pages}</span><button className="hp-btn" disabled={loading || !!error || currentPage >= pages} onClick={() => setPage(currentPage + 1)}>Siguiente</button></div></footer>
    </section>
    {selected && <PanelDialog title={complaints ? 'Detalle de la reclamación' : 'Detalle de la suscripción'} busy={subscriberBusy} onClose={() => confirmLeave(() => setSelected(null))}>
      <dl className="hp-details">{fields.map(([key, title]) => <div key={key}><dt>{title}</dt><dd className="hw-record-value">{valueLabel(selected, key)}</dd></div>)}</dl>
      {!complaints && selected.activo === true && <button className="hp-btn" disabled={subscriberBusy} onClick={()=>void deactivate()}>Desactivar suscripción</button>}
      {subscriberError && <p role="alert" className="hp-error">{subscriberError}</p>}
      {complaints && <AttentionEditor resource="reclamaciones" id={selected.id} />}
      <div className="hp-dialog-footer"><button className="hp-btn" onClick={() => confirmLeave(() => setSelected(null))}>Cerrar detalle</button></div>
    </PanelDialog>}
  </>;
}
