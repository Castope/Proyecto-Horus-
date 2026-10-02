import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { publicRequest } from '../api';
export default function NewsletterUnsubscribe(){
 const [params]=useSearchParams();const token=params.get('token')||'';
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const unsubscribe=async()=>{if(busy)return;setBusy(true);setError('');try{const r=await publicRequest<{mensaje:string}>('newsletter/unsubscribe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token})});setNotice(r.mensaje)}catch(e){setError(e instanceof Error?e.message:'No se pudo cancelar.')}finally{setBusy(false)}};
 return <section className="public-catalog-detail"><h1>Cancelar suscripción</h1><p>Confirma que deseas dejar de recibir novedades.</p>{token?<button className="btn-coral" disabled={busy||!!notice} onClick={()=>void unsubscribe()}>{busy?'Procesando…':'Dar de baja mi suscripción'}</button>:<p>El enlace está incompleto. Solicita la baja desde Contactos.</p>}{error&&<p role="alert">{error}</p>}{notice&&<p role="status">{notice}</p>}<p><Link to="/contactos?asunto=Baja%20de%20suscripción">Contactar con el equipo</Link></p></section>;
}
