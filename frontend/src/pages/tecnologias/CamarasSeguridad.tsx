import { useEffect } from 'react'
import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import useFadeUp from '../../hooks/useFadeUp'

import imgCamera from '../../assets/images/videovigilancia/camera.webp'

const iconStyle = (color: string, background: string): CSSProperties => ({
  ['--c' as string]: color,
  ['--cb' as string]: background,
})

export default function CamarasSeguridad() {
  useFadeUp()
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
                <Link to="/contactos" className="btn-coral"><i className="fas fa-shield-alt" /> Proteger mi negocio</Link>
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

      <section className="cam-solutions" id="soluciones">
        <div className="container">
          <div className="cam-sol-header fade-up">
            <div className="eyebrow"><i className="fas fa-shield-alt" /> Lo que incluye</div>
            <h2>Seguridad completa,<br />de principio a <span>fin</span></h2>
            <p>Cada solución está diseñada para proteger lo que más importa. Sin complicaciones, sin letra chica.</p>
          </div>

          <div className="cam-services">
            <div className="cam-service fade-up">
              <div className="cam-service-left">
                <div className="cam-service-num">01</div>
                <div className="cam-service-icon" style={iconStyle('#4F46E5', '#EEF2FF')}><i className="fas fa-video" /></div>
                <div className="cam-service-text">
                  <h3>Cámaras HD con Visión Nocturna</h3>
                  <p>Instalamos cámaras de alta definición que graban con total claridad de día y de noche, hasta 50 metros en oscuridad completa. Resistentes al agua y al polvo.</p>
                  <div className="cam-service-tags"><span>Full HD 1080p</span><span>Visión nocturna 50m</span><span>IP66 resistente</span></div>
                </div>
              </div>
              <div className="cam-service-visual cam-visual-cctv">
                <div className="cam-visual-screen">
                  <div className="cam-visual-feed">
                    <img src={imgCamera} alt="CCTV HD" loading="lazy" />
                    <div className="cam-visual-scan" />
                    <div className="cam-visual-brackets"><span /></div>
                    <div className="cam-visual-live"><span />EN VIVO</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="cam-service cam-service-alt fade-up">
              <div className="cam-service-left">
                <div className="cam-service-num">02</div>
                <div className="cam-service-icon" style={iconStyle('#FF6B47', '#FFF1EE')}><i className="fas fa-bell" /></div>
                <div className="cam-service-text">
                  <h3>Alertas al Instante en tu Celular</h3>
                  <p>Cuando la cámara detecta movimiento, recibes una notificación en tu teléfono en segundos. No necesitas estar mirando la pantalla — el sistema trabaja por ti.</p>
                  <div className="cam-service-tags"><span>Detección por IA</span><span>Push en segundos</span><span>iOS y Android</span></div>
                </div>
              </div>
              <div className="cam-service-visual cam-visual-alert">
                <div className="cam-visual-notifs">
                  <div className="cam-visual-notif cvn-1"><div className="cvn-icon cvn-red"><i className="fas fa-shield-alt" /></div><div className="cvn-body"><strong>Movimiento detectado</strong><span>CAM 01 · Entrada principal</span></div><span className="cvn-time">ahora</span></div>
                  <div className="cam-visual-notif cvn-2"><div className="cvn-icon cvn-orange"><i className="fas fa-video" /></div><div className="cvn-body"><strong>Grabación iniciada</strong><span>CAM 01 · 4 seg de duración</span></div><span className="cvn-time">ahora</span></div>
                  <div className="cam-visual-notif cvn-3"><div className="cvn-icon cvn-green"><i className="fas fa-check" /></div><div className="cvn-body"><strong>Sistema activo</strong><span>4 cámaras en línea</span></div><span className="cvn-time">5 min</span></div>
                </div>
              </div>
            </div>

            <div className="cam-service fade-up">
              <div className="cam-service-left">
                <div className="cam-service-num">03</div>
                <div className="cam-service-icon" style={iconStyle('#059669', '#ECFDF5')}><i className="fas fa-cloud" /></div>
                <div className="cam-service-text">
                  <h3>Grabación en la Nube 24/7</h3>
                  <p>Todo queda grabado y guardado de forma segura en la nube. Puedes revisar lo que pasó hace 30 días desde tu celular o computadora, en cualquier momento.</p>
                  <div className="cam-service-tags"><span>30 días de historial</span><span>Encriptado AES-256</span><span>Acceso global</span></div>
                </div>
              </div>
              <div className="cam-service-visual cam-visual-cloud">
                <div className="cam-cloud-ui">
                  <div className="cam-cloud-ring-wrap">
                    <svg viewBox="0 0 120 120" fill="none">
                      <circle cx="60" cy="60" r="50" stroke="rgba(5,150,105,.15)" strokeWidth="8"/>
                      <circle cx="60" cy="60" r="50" stroke="#059669" strokeWidth="8" strokeDasharray="314" strokeDashoffset="78" strokeLinecap="round" transform="rotate(-90 60 60)"/>
                    </svg>
                    <div className="cam-cloud-ring-label"><strong>75%</strong><span>usado</span></div>
                  </div>
                  <div className="cam-cloud-stats">
                    <div className="cam-cloud-stat-item"><i className="fas fa-hdd" /><div><strong>750 GB</strong><span>almacenado</span></div></div>
                    <div className="cam-cloud-stat-item"><i className="fas fa-calendar-alt" /><div><strong>30 días</strong><span>historial</span></div></div>
                    <div className="cam-cloud-stat-item"><i className="fas fa-lock" /><div><strong>AES-256</strong><span>encriptado</span></div></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="cam-service cam-service-alt fade-up">
              <div className="cam-service-left">
                <div className="cam-service-num">04</div>
                <div className="cam-service-icon" style={iconStyle('#7C3AED', '#F5F3FF')}><i className="fas fa-mobile-alt" /></div>
                <div className="cam-service-text">
                  <h3>Control Remoto desde tu App</h3>
                  <p>Ve todas tus cámaras en vivo, mueve las cámaras PTZ, revisa grabaciones pasadas y gestiona alertas — todo desde la palma de tu mano, donde estés en el mundo.</p>
                  <div className="cam-service-tags"><span>Vista en vivo</span><span>Control PTZ</span><span>Multidispositivo</span></div>
                </div>
              </div>
              <div className="cam-service-visual cam-visual-app">
                <div className="cam-app-ui">
                  <div className="cam-app-ui-bar"><div className="cam-app-ui-dot" /><span>Horus Cam</span><i className="fas fa-wifi" /></div>
                  <div className="cam-app-ui-grid">
                    {['cauf1','cauf2','cauf3','cauf4'].map((cls,i) => (
                      <div key={cls} className={`cam-app-ui-feed ${cls}`}><span>CAM 0{i+1}</span><div className="cam-app-ui-scan" /></div>
                    ))}
                  </div>
                  <div className="cam-app-ui-nav">
                    <i className="fas fa-home" /><i className="fas fa-video cam-app-ui-active" /><i className="fas fa-bell" /><i className="fas fa-cog" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
