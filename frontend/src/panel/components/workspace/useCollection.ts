import { useRequestStatus } from '../../hooks/useRequestStatus';
import { useEffect, useState } from 'react';
import { useAdminAuth } from '../../context';
import { panelRequest, errorMessage } from '../../services/panelApi';
import type { Row } from '../../types/workspace';
export interface CollectionResponse { items?:Row[];messages?:Row[];subscribers?:Row[];reclamaciones?:Row[];pagination?:{total:number;pages:number};metrics?:Record<string,number>;interests?:string[] }
export const collectionRows=(data:CollectionResponse)=>data.items||data.messages||data.subscribers||data.reclamaciones||[];
export function useCollection(endpoint:string,catalog=false,revision=0,params='page=1&limit=20'){
 const {token}=useAdminAuth();const [data,setData]=useState<CollectionResponse>({});
 const {loading,error,setLoading,setError}=useRequestStatus(JSON.stringify([token,endpoint,catalog,revision,params]));
 useEffect(()=>{const c=new AbortController();let live=true;const timeout=window.setTimeout(()=>c.abort(),15000);
 void panelRequest<CollectionResponse>(endpoint+'?'+params,token,'GET',undefined,c.signal).then(r=>{if(live)setData(r)}).catch(e=>{if(live)setError(c.signal.aborted?'La consulta tardó demasiado. Reintenta la carga.':errorMessage(e))}).finally(()=>{window.clearTimeout(timeout);if(live)setLoading(false)});
 return()=>{live=false;c.abort();window.clearTimeout(timeout)};
 },[token,endpoint,catalog,revision,params,setLoading,setError]);
 return{rows:collectionRows(data),loading,error,total:data.pagination?.total||0,pages:data.pagination?.pages||0,metrics:data.metrics||{},interests:data.interests||[]};
}
export const dateLabel=(value:unknown,calendarDate=false)=>{
 const raw=calendarDate&&value?String(value).slice(0,10)+'T12:00:00':String(value);
 if(!value||Number.isNaN(new Date(raw).getTime()))return'Sin fecha';
 return new Date(raw).toLocaleDateString('es-PE',{day:'numeric',month:'short',year:'numeric'});
};
export const plainText=(value:unknown)=>String(value??'').replace(/<[^>]*>/g,'');
