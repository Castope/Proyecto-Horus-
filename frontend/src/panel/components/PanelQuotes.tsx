import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAdminAuth } from '../context';
import { panelRequest, errorMessage } from '../services/panelApi';
import { useRequestStatus } from '../hooks/useRequestStatus';
import type { Quote, QuoteInput } from '../types/quotes';
import { quoteTransitions } from '../types/quotes';
import QuoteForm from './QuoteForm';
import QuotePrint from './QuotePrint';
import PanelDialog from './PanelDialog';
import '../styles/quotes.css';
export default function PanelQuotes() {
 const {token}=useAdminAuth();const [params,setParams]=useSearchParams();
 const [revision,setRevision]=useState(0),[page,setPage]=useState(1),[search,setSearch]=useState(''),[query,setQuery]=useState(''),[state,setState]=useState('');
 const [list,setList]=useState<{items:Quote[];pagination:{total:number;pages:number}}|null>(null);
 const [detail,setDetail]=useState<Quote|null>(null),[editing,setEditing]=useState<Quote|QuoteInput|null>(null),[creating,setCreating]=useState(false);
 const [busy,setBusy]=useState(false),[actionError,setActionError]=useState(''),[notice,setNotice]=useState('');
 const lock=useRef(false);const key=[page,query,state,revision].join(':');
 const {loading,error,setLoading,setError}=useRequestStatus(key);
 useEffect(()=>{const ctrl=new AbortController();let current=true;
 const q=new URLSearchParams({page:String(page),limit:'12',search:query,estado:state});
 void panelRequest<{items:Quote[];pagination:{total:number;pages:number}}>('cotizaciones?'+q,token,'GET',undefined,ctrl.signal).then(data=>{if(current)setList(data)}).catch(e=>{if(current)setError(errorMessage(e))}).finally(()=>{if(current)setLoading(false)});
 return()=>{current=false;ctrl.abort();};},[page,query,state,revision,token,setLoading,setError]);
 useEffect(()=>{const id=Number(params.get('contacto'));if(!id)return;const ctrl=new AbortController();
 void panelRequest<{message:{nombre:string;email:string;telefono:string}}>('messages/'+id,token,'GET',undefined,ctrl.signal).then(({message})=>{if(ctrl.signal.aborted)return;setEditing({cliente:message.nombre,email:message.email,telefono:message.telefono||'',documento:'',direccion:'',emisor:'',datos_emisor:'',moneda:'PEN',validez:new Date(Date.now()+7*86400000).toISOString().slice(0,10),condiciones:'',conceptos:[{descripcion:'',cantidad:1,precio:0}],descuento:0,tasa:18,contacto_id:id});setCreating(true);}).catch(e=>{if(!ctrl.signal.aborted)setActionError(errorMessage(e));});return()=>ctrl.abort();},[params,token]);
 const refresh=()=>{setDetail(null);setRevision(v=>v+1);};
 const open=async(id:number)=>{if(lock.current)return;lock.current=true;setBusy(true);setActionError('');try{const data=await panelRequest<{item:Quote}>('cotizaciones/'+id,token);setDetail(data.item);}catch(e){setActionError(errorMessage(e));}finally{lock.current=false;setBusy(false);}};
 const status=async(value:string)=>{if(!detail||lock.current)return;lock.current=true;setBusy(true);setActionError('');try{const data=await panelRequest<{item:Quote}>('cotizaciones/'+detail.id+'/estado',token,'POST',{estado:value,revision:detail.revision});setDetail(data.item);setRevision(v=>v+1);setNotice('Estado actualizado.');}catch(e){setActionError(errorMessage(e));}finally{lock.current=false;setBusy(false);}};
 const email=async()=>{if(!detail||lock.current)return;lock.current=true;setBusy(true);setActionError('');try{await panelRequest('cotizaciones/'+detail.id+'/correo',token,'POST',{revision:detail.revision});setNotice('Cotización enviada por correo.');}catch(e){setActionError(errorMessage(e));}finally{lock.current=false;setBusy(false);}};
 const closeForm=()=>{setCreating(false);setEditing(null);if(params.has('contacto')){const next=new URLSearchParams(params);next.delete('contacto');setParams(next);}};
 return <><div className="hp-heading"><div><p className="hp-kicker">GESTIÓN COMERCIAL</p><h1>Cotizaciones</h1><p>Prepara propuestas, revisa importes y registra su seguimiento.</p></div><div className="hp-actions"><button className="hp-btn hp-btn-primary" onClick={()=>{setEditing(null);setCreating(true)}}>Nueva cotización</button><button className="hp-btn" onClick={refresh} disabled={busy||loading}>Actualizar</button></div></div>
 {notice&&<p role="status" className="hp-notice">{notice}</p>}{(error||actionError)&&<p role="alert" className="hp-error">{error||actionError}</p>}
 <section className="hp-card"><form className="hp-toolbar" onSubmit={e=>{e.preventDefault();setPage(1);setQuery(search.trim())}}><input type="search" aria-label="Buscar cotización" maxLength={100} value={search} onChange={e=>setSearch(e.target.value)}/><button className="hp-btn">Buscar</button><select aria-label="Estado" value={state} onChange={e=>{setState(e.target.value);setPage(1)}}><option value="">Todos los estados</option>{Object.keys(quoteTransitions).map(v=><option key={v}>{v}</option>)}</select></form>
 {loading?<p role="status" className="hp-empty">Cargando cotizaciones…</p>:error?<button className="hp-btn" onClick={refresh}>Reintentar</button>:list?.items.length?<div className="hp-table-wrap"><table className="hp-table"><thead><tr><th>Número</th><th>Cliente</th><th>Estado</th><th>Total</th><th>Acción</th></tr></thead><tbody>{list.items.map(q=><tr key={q.id}><td>{q.numero}</td><td>{q.cliente}</td><td>{q.estado}</td><td>{Number(q.total).toFixed(2)} {q.moneda}</td><td><button className="hp-btn" onClick={()=>void open(q.id)} disabled={busy}>Ver propuesta</button></td></tr>)}</tbody></table></div>:<p className="hp-empty">No hay cotizaciones con estos filtros.</p>}
 <div className="hp-actions"><button className="hp-btn" disabled={page===1||loading} onClick={()=>setPage(v=>v-1)}>Anterior</button><span>Página {page}</span><button className="hp-btn" disabled={loading||!!error||page>=(list?.pagination.pages||0)} onClick={()=>setPage(v=>v+1)}>Siguiente</button></div></section>
 {detail&&!creating&&<PanelDialog title="Detalle de cotización" onClose={()=>setDetail(null)} busy={busy}><QuotePrint quote={detail}/><div className="hp-actions hq-no-print"><button className="hp-btn" onClick={()=>window.print()}>Imprimir / guardar PDF</button>{detail.estado==='borrador'&&<button className="hp-btn" onClick={()=>{setEditing(detail);setCreating(true)}}>Editar borrador</button>}<button className="hp-btn" onClick={()=>{const {id,revision:copyRevision,...copy}=detail;void id;void copyRevision;setEditing(copy);setCreating(true)}}>Preparar copia</button>{detail.email&&['borrador','enviada'].includes(detail.estado)&&<button className="hp-btn" disabled={busy} onClick={()=>void email()}>Enviar por correo</button>}
 {(quoteTransitions[detail.estado]||[]).map(v=><button className="hp-btn" disabled={busy} key={v} onClick={()=>void status(v)}>Marcar {v}</button>)}</div>{actionError&&<p role="alert" className="hp-error hq-no-print">{actionError}</p>}{notice&&<p role="status" className="hp-notice hq-no-print">{notice}</p>}<section className="hq-no-print"><h3>Historial</h3><ul>{detail.historial.map((h,i)=><li key={i}>{new Date(h.fecha).toLocaleString('es-PE')} · {h.accion} · Administrador #{h.usuario}</li>)}</ul><p>Imprimir o enviar por correo conserva el estado actual. Registra los cambios según la atención realizada.</p></section></PanelDialog>}
 {creating&&<QuoteForm initial={editing||undefined} onClose={closeForm} onSaved={()=>{closeForm();refresh();setNotice('Borrador guardado.')}}/>}</>;
}
