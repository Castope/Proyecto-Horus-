import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import useFadeUp from '../../hooks/useFadeUp'

export default function SoporteMantenimiento() {
  useFadeUp()
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
                <Link to="/contactos" className="btn-coral"><i className="fas fa-headset" /> Soporte ahora</Link>
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

      <section className="sop-services" id="servicios">
        <div className="container">
          <div className="sop-sec-header fade-up">
            <div className="eyebrow"><i className="fas fa-cogs" /> Nuestros Servicios</div>
            <h2>Todo lo que tu empresa<br />necesita para <span>funcionar</span></h2>
            <p>Cubrimos cada aspecto del soporte tecnológico para que tu negocio nunca se detenga.</p>
          </div>

          <div className="sop-cards">
            <div className="sop-card sop-card-indigo fade-up">
              <div className="sop-card-num">01</div>
              <div className="sop-card-visual">
                <div className="sop-maint-cycle">
                  <div className="sop-cycle-ring" /><div className="sop-cycle-ring sop-cycle-ring-2" />
                  <div className="sop-cycle-center"><i className="fas fa-tools" /></div>
                  {['Revisión','Limpieza','Diagnóstico','Reporte'].map((s,i) => (
                    <div key={s} className={`sop-cycle-step sop-cs-${i+1}`}><div className="sop-cs-dot" /><span>{s}</span></div>
                  ))}
                </div>
              </div>
              <div className="sop-card-body">
                <div className="sop-card-icon"><i className="fas fa-tools" /></div>
                <h3>Mantenimiento Preventivo</h3>
                <p>Revisiones periódicas programadas para mantener tu infraestructura en óptimas condiciones. Antes de que algo falle, ya lo revisamos.</p>
                <div className="sop-card-tags"><span>Mensual</span><span>Trimestral</span><span>Hardware</span></div>
              </div>
            </div>

            <div className="sop-card sop-card-coral fade-up">
              <div className="sop-card-num">02</div>
              <div className="sop-card-visual">
                <div className="sop-terminal">
                  <div className="sop-terminal-bar">
                    <span className="sop-tb-dot sop-tb-red" /><span className="sop-tb-dot sop-tb-yellow" /><span className="sop-tb-dot sop-tb-green" />
                    <span className="sop-tb-title">sistema.exe</span>
                  </div>
                  <div className="sop-terminal-body">
                    <div className="sop-tl sop-tl-1"><span className="sop-tl-prompt">$</span> diagnostico --sistema</div>
                    <div className="sop-tl sop-tl-2"><span className="sop-tl-ok">✓</span> Windows actualizado</div>
                    <div className="sop-tl sop-tl-3"><span className="sop-tl-ok">✓</span> Antivirus activo</div>
                    <div className="sop-tl sop-tl-4"><span className="sop-tl-warn">!</span> Driver pendiente</div>
                    <div className="sop-tl sop-tl-5"><span className="sop-tl-prompt">$</span> reparar --auto<span className="sop-cursor" /></div>
                  </div>
                </div>
              </div>
              <div className="sop-card-body">
                <div className="sop-card-icon"><i className="fas fa-laptop-code" /></div>
                <h3>Soporte de Software</h3>
                <p>Instalación, configuración y actualización de sistemas operativos, aplicaciones empresariales y software especializado. Errores resueltos.</p>
                <div className="sop-card-tags"><span>Windows</span><span>Linux</span><span>Antivirus</span></div>
              </div>
            </div>

            <div className="sop-card sop-card-green fade-up">
              <div className="sop-card-num">03</div>
              <div className="sop-card-visual">
                <div className="sop-net-diagram">
                  <svg viewBox="0 0 200 160" fill="none" aria-hidden="true">
                    <line x1="100" y1="80" x2="100" y2="20"  stroke="rgba(5,150,105,.4)" strokeWidth="1.5" strokeDasharray="4 3"/>
                    <line x1="100" y1="80" x2="160" y2="80"  stroke="rgba(5,150,105,.4)" strokeWidth="1.5" strokeDasharray="4 3"/>
                    <line x1="100" y1="80" x2="100" y2="140" stroke="rgba(5,150,105,.4)" strokeWidth="1.5" strokeDasharray="4 3"/>
                    <line x1="100" y1="80" x2="40"  y2="80"  stroke="rgba(5,150,105,.4)" strokeWidth="1.5" strokeDasharray="4 3"/>
                  </svg>
                  <div className="sop-net-center"><i className="fas fa-network-wired" /></div>
                  <div className="sop-net-node sop-nn-top"><i className="fas fa-desktop" /><span>PC</span></div>
                  <div className="sop-net-node sop-nn-right"><i className="fas fa-wifi" /><span>WiFi</span></div>
                  <div className="sop-net-node sop-nn-bottom"><i className="fas fa-print" /><span>Impresora</span></div>
                  <div className="sop-net-node sop-nn-left"><i className="fas fa-server" /><span>Servidor</span></div>
                  <div className="sop-packet sop-pkt-1" /><div className="sop-packet sop-pkt-2" /><div className="sop-packet sop-pkt-3" />
                </div>
              </div>
              <div className="sop-card-body">
                <div className="sop-card-icon"><i className="fas fa-network-wired" /></div>
                <h3>Soporte de Redes</h3>
                <p>Diagnóstico y resolución de problemas de conectividad, configuración de routers, switches y seguridad perimetral de tu red empresarial.</p>
                <div className="sop-card-tags"><span>LAN / WAN</span><span>WiFi</span><span>Firewall</span></div>
              </div>
            </div>

            <div className="sop-card sop-card-dark fade-up">
              <div className="sop-card-num">04</div>
              <div className="sop-card-visual">
                <div className="sop-response-ui">
                  <div className="sop-resp-ring"><div className="sop-resp-pulse" /><div className="sop-resp-icon"><i className="fas fa-bolt" /></div></div>
                  <div className="sop-resp-stats">
                    <div className="sop-resp-stat"><strong>&lt; 2h</strong><span>Tiempo de respuesta</span></div>
                    <div className="sop-resp-divider" />
                    <div className="sop-resp-stat"><strong>98%</strong><span>Resolución exitosa</span></div>
                  </div>
                  <div className="sop-resp-bar-wrap">
                    <div className="sop-resp-bar-label"><span>Urgencia</span><span className="sop-resp-bar-val">CRÍTICA</span></div>
                    <div className="sop-resp-bar"><div className="sop-resp-bar-fill" /></div>
                  </div>
                </div>
              </div>
              <div className="sop-card-body">
                <div className="sop-card-icon"><i className="fas fa-bolt" /></div>
                <h3>Atención de Emergencias</h3>
                <p>Cuando algo falla y no puede esperar, estamos ahí. Respuesta prioritaria para fallas críticas que afectan la operación de tu empresa.</p>
                <div className="sop-card-tags"><span>Prioritario</span><span>Rápido</span><span>Garantizado</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
