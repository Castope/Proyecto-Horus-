import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { METRICS, SLIDES } from './homeContent'
import useReducedMotion from '../../hooks/useReducedMotion'
import AnimatedCounter from './AnimatedCounter'

export default function HomeHero({ conveniosTotal, ready }: { conveniosTotal: number | null; ready: boolean }) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const reducedMotion = useReducedMotion()
  const slides = useRef<HTMLDivElement>(null)
  const zoom = useRef<Animation | null>(null)
  const stopped = paused || hovered || focused || !ready

  // Keep the outgoing photo at its last scale until its next visit.
  useLayoutEffect(() => {
    const images = slides.current?.querySelectorAll('img')
    if (reducedMotion) {
      images?.forEach(image => image.getAnimations().forEach(animation => animation.cancel()))
      zoom.current = null
      return
    }
    if (!ready) return
    const image = images?.[current]
    if (!image) return
    image.getAnimations().forEach(animation => animation.cancel())
    const scale = window.matchMedia('(max-width: 768px)').matches ? 1.015 : 1.035
    const animation = image.animate([{ transform: 'scale(1)' }, { transform: 'scale(' + scale + ')' }],
      { duration: 5800, easing: 'linear', fill: 'forwards' })
    zoom.current = animation
    return () => animation.pause()
  }, [current, ready, reducedMotion])
  useLayoutEffect(() => {
    const animation = zoom.current
    if (!animation) return
    if (stopped) {
      const time = animation.currentTime
      animation.pause()
      if (time !== null) animation.currentTime = time
    } else animation.play()
  }, [stopped, current, ready, reducedMotion])
  useEffect(() => {
    const element = slides.current
    return () => element?.querySelectorAll('img').forEach(image => image.getAnimations().forEach(animation => animation.cancel()))
  }, [])

  useEffect(() => {
    if (stopped || reducedMotion) return
    const id = window.setInterval(() => setCurrent(value => (value + 1) % SLIDES.length), 5000)
    return () => window.clearInterval(id)
  }, [stopped, reducedMotion])

  return <>
    <section className={'home-hero' + (!ready ? ' is-waiting' : '')} aria-labelledby="home-title">
      <div className="home-hero-grid">
        <div className="home-hero-copy">
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
        <div className={'home-carousel' + (paused || hovered || focused ? ' is-paused' : '')} role="region" aria-roledescription="carrusel"
          aria-label="Fotografías de Horus Group"
          onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
          onFocusCapture={() => setFocused(true)}
          onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false) }}>
          <div className="home-slides" ref={slides}>
            {SLIDES.map((slide, index) => <div key={slide.src}
              className={'home-slide' + (index === current ? ' is-active' : '')}
              aria-hidden={index !== current}>
              <div className="home-slide-image"><img src={slide.src} alt={slide.alt} loading={index === 0 ? 'eager' : 'lazy'}
                fetchPriority={index === 0 ? 'high' : 'auto'} decoding="async" /></div>
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
          <div><AnimatedCounter value={metric.lbl === 'Convenios activos' ? conveniosTotal : parseInt(metric.num, 10)} suffix={metric.num.replace(/[0-9]/g, '')} /><p>{metric.lbl}</p></div>
        </article>)}
      </div>
    </section>
  </>
}
