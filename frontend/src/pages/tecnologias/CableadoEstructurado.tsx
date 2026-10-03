import ServiceSections from '../../components/ServiceSections'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function CableadoEstructurado() {
  useEffect(() => { document.title = 'Cableado Estructurado — Horus Group SRL' }, [])


  return (
    <>
      <section className="cable-hero">
        <div className="container">
          <div className="cable-hero-inner">
            <div className="cable-hero-text fade-up">
              <div className="eyebrow"><i className="fas fa-network-wired" /> Cableado Estructurado</div>
              <h1>Conecto tu empresa<br />con el <span>mundo</span></h1>
              <p>Infraestructura de red certificada que garantiza velocidad, estabilidad y escalabilidad para tu negocio. Instalamos la columna vertebral digital que tu empresa necesita.</p>
              <div className="cable-hero-btns">
                <Link to="/contactos?asunto=Cableado%20estructurado" className="btn-coral"><i className="fas fa-phone" /> Solicitar cotización</Link>
                <a href="#categorias" className="btn-ghost"><i className="fas fa-layer-group" /> Ver categorías</a>
              </div>
              <div className="cable-specs">
                <div className="cable-spec-pill"><i className="fas fa-bolt" /> Hasta 40 Gbps</div>
                <div className="cable-spec-pill"><i className="fas fa-certificate" /> Certificado ANSI/TIA</div>
                <div className="cable-spec-pill"><i className="fas fa-shield-alt" /> Garantía 15 años</div>
              </div>
            </div>

            <div className="cable-diagram fade-up">
              <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <line x1="200" y1="200" x2="200" y2="48" />
                <line x1="200" y1="200" x2="352" y2="200" />
                <line x1="200" y1="200" x2="200" y2="352" />
                <line x1="200" y1="200" x2="48"  y2="200" />
              </svg>
              <div className="diag-packet diag-packet-1" />
              <div className="diag-packet diag-packet-2" />
              <div className="diag-packet diag-packet-3" />
              <div className="diag-packet diag-packet-4" />
              <div className="diag-node diag-center"><div className="diag-node-icon"><i className="fas fa-server" /></div><div className="diag-node-label">Servidor</div></div>
              <div className="diag-node diag-n1"><div className="diag-node-icon"><i className="fas fa-desktop" /></div><div className="diag-node-label">Workstation</div></div>
              <div className="diag-node diag-n2"><div className="diag-node-icon"><i className="fas fa-wifi" /></div><div className="diag-node-label">Access Point</div></div>
              <div className="diag-node diag-n3"><div className="diag-node-icon"><i className="fas fa-print" /></div><div className="diag-node-label">Impresora</div></div>
              <div className="diag-node diag-n4"><div className="diag-node-icon"><i className="fas fa-phone-alt" /></div><div className="diag-node-label">VoIP</div></div>
            </div>
          </div>
        </div>
      </section>

      <ServiceSections category="cableado" />
    </>
  )
}
