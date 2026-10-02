import { useEffect, useRef, useState } from 'react';
import { API_BASE } from '../../apiBase';
import { useAdminAuth } from '../context';
export default function ImageUpload({onUploaded}:{onUploaded:(url:string)=>void}){
 const {token}=useAdminAuth();const [busy,setBusy]=useState(false),[error,setError]=useState('');const controller=useRef<AbortController|null>(null),input=useRef<HTMLInputElement>(null);
 useEffect(()=>()=>{controller.current?.abort();controller.current=null;},[]);
 const upload=async(file:File|undefined)=>{if(!file||busy)return;if(file.size>5*1024*1024){setError('La imagen supera los 5 MB.');return;}setBusy(true);setError('');const c=new AbortController();controller.current=c;const timeout=window.setTimeout(()=>c.abort(),30000);
 try{const body=new FormData();body.append('file',file);const response=await fetch(API_BASE+'/admin/uploads',{method:'POST',headers:{Authorization:'Bearer '+token},body,signal:c.signal});if(response.status===401)window.dispatchEvent(new Event('horus:session-expired'));const data=await response.json() as {path?:string;message?:string|string[]};if(!response.ok||!data.path)throw new Error(Array.isArray(data.message)?data.message.join(' · '):data.message||'No se pudo subir la imagen.');if(!c.signal.aborted)onUploaded(new URL(API_BASE+data.path,window.location.origin).href);}
 catch(e){if(controller.current===c)setError(e instanceof Error?e.message:'No se pudo subir la imagen.');}finally{window.clearTimeout(timeout);if(controller.current===c){setBusy(false);if(input.current)input.current.value='';}}};
 return <span><input ref={input} type="file" accept="image/png,image/jpeg,image/webp" aria-label="Subir imagen PNG, JPEG o WebP" disabled={busy} onChange={e=>void upload(e.target.files?.[0])}/>{busy&&<span role="status">Subiendo imagen…</span>}{error&&<span role="alert">{error}</span>}<small>Hasta 5 MB. Elige la imagen, espera la carga y guarda el registro.</small></span>;
}
