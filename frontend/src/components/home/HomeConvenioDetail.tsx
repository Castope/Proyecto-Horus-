import { useEffect, useRef } from 'react'
import { usePublicResource } from '../../hooks/usePublicResource'
import type { ConvenioResponse } from '../../types/convenios'
import PublicImage from '../PublicImage'
import HomeConvenioGallery from './HomeConvenioGallery'

export default function HomeConvenioDetail({ id, onClose, inline = false }: { id: number; onClose: () => void; inline?: boolean }) {
  const closeButton = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (inline) closeButton.current?.focus({ preventScroll: true })
  }, [inline])
  const { data, loading, error, reload } = usePublicResource<ConvenioResponse>('convenios/' + id)
  const item = !loading && !error ? data?.item : null
  return <>
    <div className="home-dialog-header">
      <button ref={closeButton} type="button" id="convClose" aria-label="Cerrar información del convenio" onClick={onClose}>
        <i className="fas fa-times" aria-hidden="true" />
      </button>
      {item && <>
        <div className={'home-conv-feature' + (!item.fotos.length ? ' is-logo' : '')}>
          <PublicImage src={item.fotos[0]?.imagen_url || item.logo_url} title={item.fotos.length ? item.nombre : 'Logo de ' + item.nombre} />
        </div>
        {item.sigla && <span className="home-eyebrow">{item.sigla}</span>}
      </>}
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
  </>
}
