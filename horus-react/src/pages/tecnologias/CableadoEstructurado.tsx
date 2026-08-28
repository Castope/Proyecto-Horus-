import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import useFadeUp from '../../hooks/useFadeUp'

import cat1 from '../../assets/images/tecnologias/categoria1.jpg'
import cat2 from '../../assets/images/tecnologias/categoria2.webp'
import cat3 from '../../assets/images/tecnologias/categoria3.webp'
import cat4 from '../../assets/images/tecnologias/categoria4.jpg'

const TABS = [
  { id:'cat1', label:'Cat 1-3 Básico',           icon:'fa-plug' },
  { id:'cat2', label:'Cat 5e-6 Empresarial',      icon:'fa-network-wired' },
  { id:'cat3', label:'Cat 6A-7 Alto Rendimiento', icon:'fa-tachometer-alt' },
  { id:'cat4', label:'Fibra Velocidad de Luz',    icon:'fa-circle-notch' },
]

const PANELS = [
  { id:'cat1', img:cat1, badge:'Instalación residencial', speed:'10',  unit:'Mbps máximos',    title:'Cableado Básico Cat 1-3',           desc:'Ideal para instalaciones residenciales y pequeñas oficinas con necesidades de conectividad básica. Perfecto para telefonía, sistemas de alarma y redes de baja demanda.', tags:['Residencial','Telefonía','Alarmas','Bajo costo'] },
  { id:'cat2', img:cat2, badge:'Estándar empresarial',    speed:'1',   unit:'Gbps garantizados', title:'Cableado Empresarial Cat 5e / Cat 6', desc:'El estándar de la industria para oficinas y empresas medianas. Soporta Gigabit Ethernet con excelente relación costo-beneficio. Certificado para PoE y VoIP.', tags:['Gigabit','PoE','VoIP','Oficinas'] },
  { id:'cat3', img:cat3, badge:'Alto rendimiento',        speed:'10',  unit:'Gbps de capacidad', title:'Alto Rendimiento Cat 6A / Cat 7',    desc:'Para empresas que exigen lo mejor. Soporta 10 Gigabit Ethernet con blindaje total contra interferencias. Ideal para centros de datos, hospitales y entornos críticos.', tags:['10 Gbps','Blindado','Data Center','PoE++'] },
  { id:'cat4', img:cat4, badge:'Máxima velocidad',        speed:'40',  unit:'Gbps y más',        title:'Fibra Óptica — Velocidad de Luz',    desc:'La tecnología más avanzada para infraestructuras críticas. Inmune a interferencias electromagnéticas, con alcances de hasta 80 km sin repetidores. El futuro de las redes.', tags:['40+ Gbps','Larga distancia','Sin EMI','Futuro-proof'] },
]

export default function CableadoEstructurado() {
  useFadeUp()
  const [active, setActive] = useState('cat1')
  useEffect(() => { document.title = 'Cableado Estructurado — Horus Group SRL' }, [])

  const panel = PANELS.find(p => p.id === active)

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
                <Link to="/contactos" className="btn-coral"><i className="fas fa-phone" /> Solicitar cotización</Link>
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

      <section className="cable-categories" id="categorias">
        <div className="container">
          <div className="section-title fade-up">
            <div className="eyebrow"><i className="fas fa-layer-group" /> Nuestras Categorías</div>
            <h2>Soluciones para cada necesidad</h2>
            <p>Desde instalaciones básicas hasta infraestructura de alto rendimiento para centros de datos.</p>
          </div>

          <div className="cable-tabs fade-up">
            {TABS.map(t => (
              <button key={t.id} className={`cable-tab${active === t.id ? ' active' : ''}`} onClick={() => setActive(t.id)}>
                <i className={`fas ${t.icon}`} /> {t.label}
              </button>
            ))}
          </div>

          <div className="cable-panels">
            <div className="cable-panel active">
              <div className="panel-img">
                <img src={panel.img} alt={panel.title} loading="lazy" />
                <div className="panel-img-badge">{panel.badge}</div>
              </div>
              <div className="panel-info">
                <div className="panel-speed">{panel.speed}</div>
                <div className="panel-speed-label">{panel.unit}</div>
                <h3>{panel.title}</h3>
                <p>{panel.desc}</p>
                <div className="panel-tags">
                  {panel.tags.map(tag => <span key={tag} className="panel-tag">{tag}</span>)}
                </div>
                <Link to="/contactos" className="btn-coral">
                  <i className="fas fa-arrow-right" /> Solicitar instalación
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
