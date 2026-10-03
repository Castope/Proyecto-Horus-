import ServiceSections from '../../components/ServiceSections'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'



export default function CamarasSeguridad() {
  useEffect(() => { document.title = 'Cámaras de Seguridad — Horus Group SRL' }, [])

  return (
    <>
      <section className="cam-hero">
        <div className="container">
          <div className="cam-hero-inner">
            <div className="cam-hero-text fade-up">
              <div className="eyebrow"><i className="fas fa-video" /> Videovigilancia Profesional</div>
              <h1>Te cuido cuando<br />tú no <span>puedes</span></h1>
              <p>Sistemas de seguridad inteligentes que protegen lo que más importa. Monitoreo continuo, alertas en tiempo real y evidencia cuando la necesitas.</p>
              <div className="cam-hero-btns">
                <Link to="/contactos?asunto=C%C3%A1maras%20de%20seguridad" className="btn-coral"><i className="fas fa-shield-alt" /> Proteger mi negocio</Link>
                <a href="#soluciones" className="btn-ghost"><i className="fas fa-eye" /> Ver soluciones</a>
              </div>
              <div className="cam-specs">
                <div className="cam-spec-pill"><i className="fas fa-clock" /> Monitoreo 24/7</div>
                <div className="cam-spec-pill"><i className="fas fa-mobile-alt" /> App móvil incluida</div>
                <div className="cam-spec-pill"><i className="fas fa-shield-alt" /> Garantía 2 años</div>
              </div>
            </div>

            <div className="cam-monitor fade-up">
              <div className="cam-screen">
                <div className="cam-screen-header">
                  <div className="cam-screen-dots">
                    <span className="dot dot-red" /><span className="dot dot-yellow" /><span className="dot dot-green" />
                  </div>
                  <div className="cam-screen-title"><i className="fas fa-video" /> Centro de Monitoreo</div>
                  <div className="cam-rec"><span className="cam-rec-dot" /> REC</div>
                </div>
                <div className="cam-grid-view">
                  {['CAM 01 — Entrada','CAM 02 — Oficina','CAM 03 — Almacén','CAM 04 — Exterior'].map(label => (
                    <div key={label} className="cam-feed">
                      <div className="cam-feed-label">{label}</div>
                      <div className="cam-feed-scan" />
                      <div className="cam-feed-brackets"><span /></div>
                    </div>
                  ))}
                </div>
                <div className="cam-status-bar">
                  <div className="cam-status-item"><div className="cam-pulse-dot" /><span>4 cámaras activas</span></div>
                  <div className="cam-status-item"><i className="fas fa-hdd" /><span>Grabando</span></div>
                  <div className="cam-status-item"><i className="fas fa-wifi" /><span>Conectado</span></div>
                </div>
              </div>
              <div className="cam-alert-badge">
                <i className="fas fa-bell" />
                <div>
                  <div className="cam-alert-title">Movimiento detectado</div>
                  <div className="cam-alert-sub">CAM 01 — Hace 2 min</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ServiceSections category="camaras" />
    </>
  )
}
