import { useState, useEffect, useCallback } from 'react'
import useFadeUp from '../hooks/useFadeUp'
import galeriaData from '../data/galeriaData'

const FILTERS = [
  { key: 'all',                label: 'Todos',              icon: 'fa-th' },
  { key: 'capacitaciones',     label: 'Capacitaciones',     icon: 'fa-chalkboard-teacher' },
  { key: 'servicio-tecnico',   label: 'Servicio Técnico',   icon: 'fa-tools' },
  { key: 'colegio-enfermeros', label: 'Colegio Enfermeros', icon: 'fa-heartbeat' },
  { key: 'colegio-abogados',   label: 'Colegio Abogados',   icon: 'fa-balance-scale' },
  { key: 'isam',               label: 'ISAM',               icon: 'fa-university' },
  { key: 'primeros-auxilios',  label: 'Primeros Auxilios',  icon: 'fa-first-aid' },
]

const bycat = (cat) => galeriaData.filter(i => i.cat === cat)

export default function Galeria() {
  useFadeUp()
  const [active,   setActive]   = useState('all')
  const [lightbox, setLightbox] = useState(null)

  useEffect(() => {
    document.title = 'Galería — Horus Group SRL'
  }, [])

  const filtered = active === 'all' ? galeriaData : galeriaData.filter(i => i.cat === active)

  const stripTop    = [...bycat('capacitaciones').slice(0, 4),   ...bycat('colegio-enfermeros').slice(0, 4)]
  const stripBottom = [...bycat('servicio-tecnico').slice(0, 4), ...bycat('colegio-abogados').slice(0, 4)]

  const lbPrev = useCallback(() =>
    setLightbox(p => ({ idx: (p.idx - 1 + filtered.length) % filtered.length }))
  , [filtered.length])

  const lbNext = useCallback(() =>
    setLightbox(p => ({ idx: (p.idx + 1) % filtered.length }))
  , [filtered.length])

  useEffect(() => {
    if (!lightbox) return
    const h = e => {
      if (e.key === 'ArrowLeft')  lbPrev()
      if (e.key === 'ArrowRight') lbNext()
      if (e.key === 'Escape')     setLightbox(null)
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [lightbox, lbPrev, lbNext])

  const lbItem = lightbox !== null ? filtered[lightbox.idx] : null

  return (
    <>
      <section className="gl-hero">
        <div className="gl-strip gl-strip-top">
          <div className="gl-strip-track">
            {[...stripTop, ...stripTop].map((item, i) => (
              <div key={i} className="gl-strip-img" style={{ backgroundImage: `url(${item.url})` }} />
            ))}
          </div>
        </div>
        <div className="gl-strip gl-strip-bottom">
          <div className="gl-strip-track gl-strip-reverse">
            {[...stripBottom, ...stripBottom].map((item, i) => (
              <div key={i} className="gl-strip-img" style={{ backgroundImage: `url(${item.url})` }} />
            ))}
          </div>
        </div>
        <div className="gl-hero-overlay" />
        <div className="gl-hero-center">
          <div className="gl-hero-eyebrow"><i className="fas fa-images" /> Galería de momentos</div>
          <h1>Nuestro trabajo<br />en <span>imágenes</span></h1>
          <p>Capacitaciones, proyectos técnicos, eventos y los momentos que hacen que valga la pena lo que hacemos.</p>
          <a href="#galeria" className="gl-hero-scroll"><i className="fas fa-chevron-down" /></a>
        </div>
      </section>

      <section className="gl-main" id="galeria">
        <div className="gl-filters-wrap">
          <div className="container">
            <div className="gl-filters-row">
              <div className="gl-filters-left">
                <span className="gl-filters-label"><i className="fas fa-sliders-h" /> Filtrar</span>
                <div className="gl-filters">
                  {FILTERS.map(f => (
                    <button
                      key={f.key}
                      className={`gf-btn${active === f.key ? ' active' : ''}`}
                      onClick={() => setActive(f.key)}
                    >
                      <i className={`fas ${f.icon}`} /> {f.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="gl-count-badge">{filtered.length} fotos</div>
            </div>
          </div>
        </div>

        <div className="container">
          <div className="gl-grid">
            {filtered.map((item, idx) => (
              <div key={idx} className="gl-item" onClick={() => setLightbox({ idx })}>
                <img src={item.url} alt={item.title} loading="lazy" />
                <div className="gl-item-overlay">
                  <div className="gl-item-info">
                    <span className="gl-item-cat">{item.label}</span>
                  </div>
                  <div className="gl-item-zoom"><i className="fas fa-expand" /></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {lbItem && (
        <div className="gl-lightbox open" role="dialog" aria-modal="true">
          <div className="gl-lb-overlay" onClick={() => setLightbox(null)} />
          <div className="gl-lb-box">
            <button className="gl-lb-close" onClick={() => setLightbox(null)}><i className="fas fa-times" /></button>
            <button className="gl-lb-nav gl-lb-prev" onClick={lbPrev}><i className="fas fa-chevron-left" /></button>
            <button className="gl-lb-nav gl-lb-next" onClick={lbNext}><i className="fas fa-chevron-right" /></button>
            <div className="gl-lb-img-wrap">
              <img src={lbItem.url} alt={lbItem.title} />
            </div>
            <div className="gl-lb-info">
              <span className="gl-lb-title">{lbItem.title}</span>
              <span className="gl-lb-cat">{lbItem.label}</span>
              <span className="gl-lb-counter">{lightbox.idx + 1} / {filtered.length}</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
