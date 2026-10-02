import { useEffect, useRef, useState } from 'react'
import { usePublicResource } from '../../hooks/usePublicResource'
import type { ConvenioResponse } from '../../types/convenios'
import PublicImage from '../PublicImage'
import HomeConvenioGallery from './HomeConvenioGallery'

export default function HomeConvenioDialog({ id, onClose }: { id: number; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const trigger = useRef<HTMLElement | null>(null)
  const timer = useRef<number | undefined>(undefined)
  const [closing, setClosing] = useState(false)
  const { data, loading, error, reload } = usePublicResource<ConvenioResponse>('convenios/' + id)
  const item = !loading && !error ? data?.item : null
  useEffect(() => {
    if (!trigger.current && document.activeElement instanceof HTMLElement) trigger.current = document.activeElement
    const element = dialog.current
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    element?.showModal()
    return () => {
      window.clearTimeout(timer.current)
      element?.close()
      document.body.style.overflow = overflow
      if (trigger.current?.isConnected) trigger.current.focus()
    }
  }, [])
  const close = () => {
    if (closing) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { onClose(); return }
    setClosing(true)
    timer.current = window.setTimeout(onClose, 160)
  }
  return <dialog ref={dialog} id="convModal" className={'home-convenio-dialog' + (closing ? ' is-closing' : '')}
    aria-labelledby="convNombre" onCancel={event => { event.preventDefault(); close() }}
    onClick={event => {
      if (event.target !== event.currentTarget) return
      const rect = event.currentTarget.getBoundingClientRect()
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) close()
    }}>
    <div className="home-dialog-header">
      <button type="button" id="convClose" aria-label="Cerrar información del convenio" onClick={close}>
        <i className="fas fa-times" aria-hidden="true" />
      </button>
      {item && <><div className="home-conv-logo"><PublicImage src={item.logo_url} title={'Logo de ' + item.nombre} /></div>
        {item.sigla && <span className="home-eyebrow">{item.sigla}</span>}</>}
      <h3 id="convNombre">{item?.nombre || 'Información del convenio'}</h3>
    </div>
    <div className="home-dialog-body">
      {loading ? <p role="status">Cargando información…</p> :
        error ? <div role="alert"><p>{error}</p><button className="home-button" onClick={reload}>Reintentar información</button></div> :
        item && <>
          <span className="home-dialog-status"><i className="fas fa-handshake" aria-hidden="true" /> Convenio activo</span>
          <p id="convDesc">{item.descripcion_completa?.trim() || item.descripcion_corta}</p>
          {item.informacion_adicional?.trim() && <section className="home-conv-additional" aria-labelledby="convAdditional">
            <h4 id="convAdditional">Información adicional</h4><p>{item.informacion_adicional}</p></section>}
          {!!item.fotos.length && <HomeConvenioGallery key={item.fotos.map(f => f.id + ':' + f.orden + ':' + f.imagen_url).join(',')} fotos={item.fotos} nombre={item.nombre} />}
        </>}
    </div>
  </dialog>
}
