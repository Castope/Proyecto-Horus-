import ServiceSections from '../../components/ServiceSections'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function SoporteMantenimiento() {
  useEffect(() => { document.title = 'Soporte y Mantenimiento — Horus Group SRL' }, [])

  return (
    <>
      <section className="sop-hero">
        <div className="container">
          <div className="sop-hero-inner">
            <div className="sop-hero-text fade-up">
              <div className="eyebrow"><i className="fas fa-headset" /> Soporte Técnico Profesional</div>
              <h1>Estoy cuando<br />algo <span>falla</span></h1>
              <p>Respuesta rápida, solución definitiva. Nuestro equipo técnico está disponible para resolver cualquier problema de hardware, software o redes en tu empresa.</p>
              <div className="sop-hero-btns">
                <Link to="/contactos?asunto=Soporte%20y%20mantenimiento" className="btn-coral"><i className="fas fa-headset" /> Soporte ahora</Link>
                <a href="#servicios" className="btn-ghost"><i className="fas fa-tools" /> Ver servicios</a>
              </div>
              <div className="sop-specs">
                <div className="sop-spec-pill"><i className="fas fa-clock" /> Respuesta en 2h</div>
                <div className="sop-spec-pill"><i className="fas fa-star" /> 98% satisfacción</div>
                <div className="sop-spec-pill"><i className="fas fa-tools" /> Técnico certificado</div>
              </div>
            </div>

            <div className="sop-diagram fade-up" aria-hidden="true">
              <div className="sop-orbit" />
              <div className="sop-orbit sop-orbit-2" />
              <div className="sop-center"><div className="sop-center-icon"><i className="fas fa-headset" /></div></div>
              <div className="sop-float-card sop-fc-1"><i className="fas fa-tools" /><span>Mantenimiento</span></div>
              <div className="sop-float-card sop-fc-2"><i className="fas fa-laptop-code" /><span>Software</span></div>
              <div className="sop-float-card sop-fc-3"><i className="fas fa-network-wired" /><span>Redes</span></div>
              <div className="sop-float-card sop-fc-4"><i className="fas fa-bolt" /><span>Emergencias</span></div>
            </div>
          </div>
        </div>
      </section>

      <ServiceSections category="soporte" />
    </>
  )
}
