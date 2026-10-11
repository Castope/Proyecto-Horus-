import { useEffect, useState } from 'react';
import { useAdminAuth } from '../context';
import { panelRequest, errorMessage } from '../services/panelApi';
import { useRequestStatus } from '../hooks/useRequestStatus';
type Account={id:number;nombre:string;email:string;activo:boolean};
export default function PanelAccounts(){
 const {token,user}=useAdminAuth();const [revision,setRevision]=useState(0),[users,setUsers]=useState<Account[]>([]);
 const {loading,error,setLoading,setError}=useRequestStatus(String(revision));
 const [busy,setBusy]=useState(false),[actionError,setActionError]=useState(''),[notice,setNotice]=useState('');
 useEffect(()=>{const c=new AbortController();let live=true;void panelRequest<{users:Account[]}>('users',token,'GET',undefined,c.signal).then(r=>{if(live)setUsers(r.users)}).catch(e=>{if(live)setError(errorMessage(e))}).finally(()=>{if(live)setLoading(false)});return()=>{live=false;c.abort()};},[token,revision,setLoading,setError]);
 const status=async(a:Account)=>{if(busy)return;setBusy(true);setActionError('');try{const r=await panelRequest<{mensaje:string}>('users/'+a.id,token,'PUT',{activo:!a.activo});setNotice(r.mensaje);setRevision(v=>v+1)}catch(e){setActionError(errorMessage(e))}finally{setBusy(false)}};
 return <><div className="hp-heading"><div><h1>Cuentas y acceso</h1><p>Administra las cuentas del panel.</p></div><button className="hp-btn" onClick={()=>setRevision(v=>v+1)} disabled={loading||busy}>Actualizar</button></div>{(error||actionError)&&<p role="alert" className="hp-error">{error||actionError}</p>}{notice&&<p role="status" className="hp-notice">{notice}</p>}<section className="hp-card"><h2>Administradores</h2>{loading?<p role="status">Cargando cuentas…</p>:!error&&<div className="hp-table-wrap"><table className="hp-table"><thead><tr><th>Nombre</th><th>Correo</th><th>Estado</th><th>Acción</th></tr></thead><tbody>{users.map(a=><tr key={a.id}><td>{a.nombre}</td><td>{a.email}</td><td>{a.activo?'Activa':'Inactiva'}</td><td><button className="hp-btn" disabled={busy||a.id===user?.id} onClick={()=>void status(a)}>{a.activo?'Desactivar':'Activar'}</button></td></tr>)}</tbody></table></div>}<p>Todos los administradores conservan los permisos del panel. Al desactivar una cuenta se revocan sus sesiones.</p></section></>;
}
