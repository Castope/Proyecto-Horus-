import { useEffect, useState, useSyncExternalStore } from 'react'
import { Link } from 'react-router-dom'
import { METRICS, SLIDES } from './homeContent'

const subscribeMotion = (callback: () => void) => {
  const media = window.matchMedia('(prefers-reduced-motion: reduce)')
  media.addEventListener('change', callback)
  return () => media.removeEventListener('change', callback)
}

export default function HomeHero({ conveniosTotal }: { conveniosTotal: number | null }) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const reducedMotion = useSyncExternalStore(subscribeMotion,
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches, () => false)

  useEffect(() => {
    if (paused || hovered || focused || reducedMotion) return
    const id = window.setInterval(() => setCurrent(value => (value + 1) % SLIDES.length), 5000)
    return () => window.clearInterval(id)
  }, [paused, hovered, focused, reducedMotion])

  return <>
    <section className="home-hero" aria-labelledby="home-title">
      <div className="home-hero-grid">
        <div className="home-hero-copy fade-up">
          <span className="home-eyebrow">Cajamarca, Perú — Tecnología y Educación</span>
          <h1 id="home-title">Soluciones que <span>impulsan</span> tu crecimiento</h1>
          <p>Infraestructura tecnológica de primer nivel y formación profesional certificada.
            Más de 400 personas y decenas de empresas ya confían en nosotros.</p>
          <div className="home-hero-actions">
            <Link to="/contactos" className="home-button">
              <i className="fas fa-paper-plane" aria-hidden="true" /> Solicitar información
            </Link>
            <a href="#ix-services" className="home-button home-button-outline">
              Ver servicios <i className="fas fa-arrow-down" aria-hidden="true" />
            </a>
          </div>
        </div>
        <div className="home-carousel" role="region" aria-roledescription="carrusel"
          aria-label="Fotografías de Horus Group"
          onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
          onFocusCapture={() => setFocused(true)}
          onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false) }}>
          <div className="home-slides">
            {SLIDES.map((slide, index) => <div key={slide.src}
              className={'home-slide' + (index === current ? ' is-active' : '')}
              aria-hidden={index !== current}>
              <img src={slide.src} alt={slide.alt} loading={index === 0 ? 'eager' : 'lazy'}
                fetchPriority={index === 0 ? 'high' : 'auto'} decoding="async" />
            </div>)}
          </div>
          <div className="home-carousel-controls">
            <button type="button" className="home-carousel-arrow" aria-label="Imagen anterior"
              onClick={() => setCurrent(value => (value - 1 + SLIDES.length) % SLIDES.length)}>
              <i className="fas fa-chevron-left" aria-hidden="true" />
            </button>
            <div className="home-carousel-dots">
              {SLIDES.map((slide, index) => <button type="button" key={slide.src}
                aria-label={'Ver imagen ' + (index + 1)} aria-pressed={index === current}
                onClick={() => setCurrent(index)}><span /></button>)}
            </div>
            <button type="button" className="home-carousel-arrow" aria-label="Imagen siguiente"
              onClick={() => setCurrent(value => (value + 1) % SLIDES.length)}>
              <i className="fas fa-chevron-right" aria-hidden="true" />
            </button>
            {!reducedMotion && <button type="button" className="home-carousel-pause"
              aria-label={paused ? 'Reanudar carrusel' : 'Pausar carrusel'} aria-pressed={paused}
              onClick={() => setPaused(value => !value)}>
              <i className={'fas ' + (paused ? 'fa-play' : 'fa-pause')} aria-hidden="true" />
            </button>}
          </div>
          <p className="home-carousel-caption" aria-live={paused || focused || reducedMotion ? 'polite' : 'off'}>
            <span>{String(current + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}</span>
            {SLIDES[current].alt}
          </p>
        </div>
      </div>
    </section>
    <section className="home-metrics" aria-label="Horus Group en cifras">
      <div className="container home-metrics-grid">
        {METRICS.map(metric => <article key={metric.lbl} className="home-metric fade-up">
          <span className="home-metric-icon"><i className={'fas ' + metric.icon} aria-hidden="true" /></span>
          <div><strong>{metric.lbl === 'Convenios activos' ? conveniosTotal ?? '—' : metric.num}</strong><p>{metric.lbl}</p></div>
        </article>)}
      </div>
    </section>
  </>
}
