import { useEffect, useState } from 'react'
import { CONTENT_CHANGE_EVENT, CONTENT_CHANGE_KEY } from '../contentUpdates'
import { publicRequest } from '../api'
import { useRequestStatus } from '../panel/hooks/useRequestStatus'

export function usePublicResource<T>(path: string) {
  const [revision, setRevision] = useState(0)
  const [result, setResult] = useState<{ path: string; data: T } | null>(null)
  const { loading, error, setLoading, setError } = useRequestStatus(path + ':' + revision)
  useEffect(()=>{
    const resource=path.split(/[/?]/)[0]
    const matches=(value:string)=>value===resource||value==='contenido-original'
    const local=(event:Event)=>{if(matches((event as CustomEvent<string>).detail))setRevision(v=>v+1)}
    const other=(event:StorageEvent)=>{if(event.key!==CONTENT_CHANGE_KEY||!event.newValue)return;try{const value=JSON.parse(event.newValue) as {resource?:string};if(value.resource&&matches(value.resource))setRevision(v=>v+1)}catch{/* Ignora marcadores inválidos. */}}
    window.addEventListener(CONTENT_CHANGE_EVENT,local);window.addEventListener('storage',other)
    return()=>{window.removeEventListener(CONTENT_CHANGE_EVENT,local);window.removeEventListener('storage',other)}
  },[path])
  useEffect(() => {
    const controller = new AbortController()
    let current = true
    const timeout = window.setTimeout(() => controller.abort(), 15000)
    publicRequest<T>(path, { signal: controller.signal, cache: 'no-store' })
      .then(data => { if (current) setResult({ path, data }) })
      .catch(error => { if (current) setError(controller.signal.aborted ? 'La consulta tardó demasiado. Vuelve a intentar.' : error instanceof Error ? error.message : 'No se pudo conectar con el servidor.') })
      .finally(() => { window.clearTimeout(timeout); if (current) setLoading(false) })
    return () => { current = false; controller.abort(); window.clearTimeout(timeout) }
  }, [path, revision, setLoading, setError])
  return { data: result?.path === path ? result.data : null, loading, error, reload: () => setRevision(value => value + 1) }
}
