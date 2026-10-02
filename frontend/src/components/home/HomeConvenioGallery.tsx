import { useRef, useState } from 'react'
import PublicImage from '../PublicImage'
import type { ConvenioFoto } from '../../types/convenios'

export default function HomeConvenioGallery({ fotos, nombre }: { fotos: ConvenioFoto[]; nombre: string }) {
  const [index, setIndex] = useState(0)
  const touch = useRef<{ x: number; y: number } | null>(null)
  if (!fotos.length) return null
  const move = (step: number) => setIndex(value => (value + step + fotos.length) % fotos.length)
  return <section className="home-conv-gallery" role="region" aria-roledescription={fotos.length > 1 ? 'carrusel' : undefined}
    aria-label={'Fotografías de ' + nombre} tabIndex={fotos.length > 1 ? 0 : undefined}
    onKeyDown={event => {
      if (fotos.length < 2 || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return
      event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1)
    }}
    onTouchStart={event => { const t = event.touches[0]; touch.current = { x: t.clientX, y: t.clientY } }}
    onTouchEnd={event => {
      const t = event.changedTouches[0], start = touch.current
      touch.current = null
      if (!start || fotos.length < 2) return
      const dx = t.clientX - start.x, dy = t.clientY - start.y
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) move(dx < 0 ? 1 : -1)
    }}>
    <h4>Fotografías del convenio</h4>
    <figure className="home-conv-photo">
      <PublicImage key={fotos[index].id} src={fotos[index].imagen_url} title={nombre + ' — fotografía ' + (index + 1)} />
      <figcaption aria-live="polite">Fotografía {index + 1} de {fotos.length}</figcaption>
    </figure>
    {fotos.length > 1 && <div className="home-conv-gallery-controls">
      <button type="button" className="home-button home-button-outline" aria-label="Fotografía anterior" onClick={() => move(-1)}>
        <i className="fas fa-chevron-left" aria-hidden="true" /> Anterior</button>
      <button type="button" className="home-button home-button-outline" aria-label="Fotografía siguiente" onClick={() => move(1)}>
        Siguiente <i className="fas fa-chevron-right" aria-hidden="true" /></button>
    </div>}
  </section>
}
