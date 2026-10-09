import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAdminAuth } from '../context';
import { PanelApiError, panelRequest, errorMessage } from '../services/panelApi';
import { mailResultFromFailure, mailResultFromSuccess, type MailResult } from '../services/mailOutcome';
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
 const [busy,setBusy]=useState(false),[actionError,setActionError]=useState(''),[notice,setNotice]=useState(''),[mail,setMail]=useState<MailResult|null>(null);
 const mailBox=useRef<HTMLDivElement>(null),noSendButton=useRef<HTMLButtonElement>(null),sendButton=useRef<HTMLButtonElement>(null);
 // Con confirmación pendiente el foco va a la opción segura («No enviar»); si no, al aviso (los botones se deshabilitan mientras se envía).
 const focusMail=useRef(false); // el foco se mueve cuando los botones ya no están deshabilitados (aquí se sigue ocupado hasta releer el detalle)
 useEffect(()=>{if(mail&&focusMail.current&&!busy){focusMail.current=false;(mail.needsConfirm?noSendButton.current:mailBox.current)?.focus();}},[mail,busy]);
 const dismissMail=()=>{setMail(null);window.setTimeout(()=>sendButton.current?.focus(),0);};
 const lock=useRef(false);const key=[page,query,state,revision].join(':');
 const {loading,error,setLoading,setError}=useRequestStatus(key);
 useEffect(()=>{const ctrl=new AbortController();let current=true;
 const q=new URLSearchParams({page:String(page),limit:'12',search:query,estado:state});
 void panelRequest<{items:Quote[];pagination:{total:number;pages:number}}>('cotizaciones?'+q,token,'GET',undefined,ctrl.signal).then(data=>{if(current)setList(data)}).catch(e=>{if(current)setError(errorMessage(e))}).finally(()=>{if(current)setLoading(false)});
 return()=>{current=false;ctrl.abort();};},[page,query,state,revision,token,setLoading,setError]);
 useEffect(()=>{const id=Number(params.get('contacto'));if(!id)return;const ctrl=new AbortController();
 void panelRequest<{message:{nombre:string;email:string;telefono:string}}>('messages/'+id,token,'GET',undefined,ctrl.signal).then(({message})=>{if(ctrl.signal.aborted)return;setEditing({cliente:message.nombre,email:message.email,telefono:message.telefono||'',documento:'',direccion:'',emisor:'',datos_emisor:'',moneda:'PEN',validez:new Date(Date.now()+7*86400000).toISOString().slice(0,10),condiciones:'',conceptos:[{descripcion:'',cantidad:1,precio:0}],descuento:0,tasa:18,contacto_id:id});setCreating(true);}).catch(e=>{if(!ctrl.signal.aborted)setActionError(errorMessage(e));});return()=>ctrl.abort();},[params,token]);
 const refresh=()=>{setDetail(null);setRevision(v=>v+1);};
 const open=async(id:number)=>{if(lock.current)return;lock.current=true;setBusy(true);setActionError('');setMail(null);try{const data=await panelRequest<{item:Quote}>('cotizaciones/'+id,token);setDetail(data.item);}catch(e){setActionError(errorMessage(e));}finally{lock.current=false;setBusy(false);}};
 const status=async(value:string)=>{if(!detail||lock.current)return;lock.current=true;setBusy(true);setActionError('');try{const data=await panelRequest<{item:Quote}>('cotizaciones/'+detail.id+'/estado',token,'POST',{estado:value,revision:detail.revision});setDetail(data.item);setRevision(v=>v+1);setNotice('Estado actualizado.');}catch(e){setActionError(errorMessage(e));}finally{lock.current=false;setBusy(false);}};
 // Un fallo de red, un timeout o un 5xx sin cuerpo no prueban que el correo no salió (ver services/mailOutcome.ts): se informa como incierto.
 // Un envío ya registrado exige confirmación explícita. Tras cualquier desenlace se relee el detalle: revisión e historial cambiaron.
 const email=async(confirmed=false)=>{if(!detail||lock.current)return;const id=detail.id,ctrl=new AbortController(),timer=window.setTimeout(()=>ctrl.abort(),25000);
 lock.current=true;setBusy(true);setActionError('');setNotice('');setMail(null);let result:MailResult;
 try{result=mailResultFromSuccess(await panelRequest<unknown>('cotizaciones/'+id+'/correo',token,'POST',{revision:detail.revision,...(confirmed?{confirmar_reenvio:true}:{})},ctrl.signal));}
 catch(e){result=mailResultFromFailure(e instanceof PanelApiError?e:undefined);}
 finally{window.clearTimeout(timer);}
 setMail(result);focusMail.current=true;
 try{const fresh=await panelRequest<{item:Quote}>('cotizaciones/'+id,token);setDetail(current=>current&&current.id===id?fresh.item:current);}catch{/* el detalle se actualiza al reabrirlo */}
 finally{lock.current=false;setBusy(false);}};
 const closeForm=()=>{setCreating(false);setEditing(null);if(params.has('contacto')){const next=new URLSearchParams(params);next.delete('contacto');setParams(next);}};
 return <><div className="hp-heading"><div><p className="hp-kicker">GESTIÓN COMERCIAL</p><h1>Cotizaciones</h1><p>Prepara propuestas, revisa importes y registra su seguimiento.</p></div><div className="hp-actions"><button className="hp-btn hp-btn-primary" onClick={()=>{setEditing(null);setCreating(true)}}>Nueva cotización</button><button className="hp-btn" onClick={refresh} disabled={busy||loading}>Actualizar</button></div></div>
 {notice&&<p role="status" className="hp-notice">{notice}</p>}{(error||actionError)&&<p role="alert" className="hp-error">{error||actionError}</p>}
 <section className="hp-card"><form className="hp-toolbar" onSubmit={e=>{e.preventDefault();setPage(1);setQuery(search.trim())}}><input type="search" aria-label="Buscar cotización" maxLength={100} value={search} onChange={e=>setSearch(e.target.value)}/><button className="hp-btn">Buscar</button><select aria-label="Estado" value={state} onChange={e=>{setState(e.target.value);setPage(1)}}><option value="">Todos los estados</option>{Object.keys(quoteTransitions).map(v=><option key={v}>{v}</option>)}</select></form>
 {loading?<p role="status" className="hp-empty">Cargando cotizaciones…</p>:error?<button className="hp-btn" onClick={refresh}>Reintentar</button>:list?.items.length?<div className="hp-table-wrap"><table className="hp-table"><thead><tr><th>Número</th><th>Cliente</th><th>Estado</th><th>Total</th><th>Acción</th></tr></thead><tbody>{list.items.map(q=><tr key={q.id}><td>{q.numero}</td><td>{q.cliente}</td><td>{q.estado}</td><td>{Number(q.total).toFixed(2)} {q.moneda}</td><td><button className="hp-btn" onClick={()=>void open(q.id)} disabled={busy}>Ver propuesta</button></td></tr>)}</tbody></table></div>:<p className="hp-empty">No hay cotizaciones con estos filtros.</p>}
 <div className="hp-actions"><button className="hp-btn" disabled={page===1||loading} onClick={()=>setPage(v=>v-1)}>Anterior</button><span>Página {page}</span><button className="hp-btn" disabled={loading||!!error||page>=(list?.pagination.pages||0)} onClick={()=>setPage(v=>v+1)}>Siguiente</button></div></section>
 {detail&&!creating&&<PanelDialog title="Detalle de cotización" onClose={()=>setDetail(null)} busy={busy}><QuotePrint quote={detail}/><div className="hp-actions hq-no-print"><button className="hp-btn" onClick={()=>window.print()}>Imprimir / guardar PDF</button>{detail.estado==='borrador'&&<button className="hp-btn" onClick={()=>{setEditing(detail);setCreating(true)}}>Editar borrador</button>}<button className="hp-btn" onClick={()=>{const {id,revision:copyRevision,...copy}=detail;void id;void copyRevision;setEditing(copy);setCreating(true)}}>Preparar copia</button>{detail.email&&['borrador','enviada'].includes(detail.estado)&&<button ref={sendButton} className="hp-btn" disabled={busy} onClick={()=>void email()}>Enviar por correo</button>}
 {(quoteTransitions[detail.estado]||[]).map(v=><button className="hp-btn" disabled={busy} key={v} onClick={()=>void status(v)}>Marcar {v}</button>)}</div>{actionError&&<p role="alert" className="hp-error hq-no-print">{actionError}</p>}{notice&&<p role="status" className="hp-notice hq-no-print">{notice}</p>}
 {mail&&<div role={mail.kind==='aceptado'?'status':'alert'} className={(mail.kind==='aceptado'?'hp-notice':'hp-error')+' hq-no-print'} data-mail-result={mail.kind} ref={mailBox} tabIndex={-1}><p>{mail.message}</p>
 {mail.needsConfirm&&<div className="hp-actions"><button type="button" className="hp-btn hp-btn-primary" disabled={busy} onClick={()=>void email(true)}>Enviar de todos modos</button><button type="button" ref={noSendButton} className="hp-btn" disabled={busy} onClick={dismissMail}>No enviar</button></div>}</div>}
 <section className="hq-no-print"><h3>Historial</h3><ul>{detail.historial.map((h,i)=><li key={i}>{new Date(h.fecha).toLocaleString('es-PE')} · {h.accion} · Administrador #{h.usuario}</li>)}</ul><p>Imprimir o enviar por correo conserva el estado actual. Registra los cambios según la atención realizada.</p></section></PanelDialog>}
 {creating&&<QuoteForm initial={editing||undefined} onClose={closeForm} onSaved={()=>{closeForm();refresh();setNotice('Borrador guardado.')}}/>}</>;
}
