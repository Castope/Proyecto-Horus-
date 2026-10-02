import imgCamera from '../assets/images/videovigilancia/camera.webp'
import type { ServicioPublico } from '../types/public'

export default function ServiceVisual({ item }: { item: ServicioPublico }) {
 switch(item.presentacion){
 case 'camara': return <div className="cam-service-visual cam-visual-cctv">
                <div className="cam-visual-screen">
                  <div className="cam-visual-feed">
                    <img src={item.imagen_url || imgCamera} alt="CCTV HD" loading="lazy" />
                    <div className="cam-visual-scan" />
                    <div className="cam-visual-brackets"><span /></div>
                    <div className="cam-visual-live"><span />EN VIVO</div>
                  </div>
                </div>
              </div>
 case 'alertas': return <div className="cam-service-visual cam-visual-alert">
                <div className="cam-visual-notifs">
                  <div className="cam-visual-notif cvn-1"><div className="cvn-icon cvn-red"><i className="fas fa-shield-alt" /></div><div className="cvn-body"><strong>Movimiento detectado</strong><span>CAM 01 · Entrada principal</span></div><span className="cvn-time">ahora</span></div>
                  <div className="cam-visual-notif cvn-2"><div className="cvn-icon cvn-orange"><i className="fas fa-video" /></div><div className="cvn-body"><strong>Grabación iniciada</strong><span>CAM 01 · 4 seg de duración</span></div><span className="cvn-time">ahora</span></div>
                  <div className="cam-visual-notif cvn-3"><div className="cvn-icon cvn-green"><i className="fas fa-check" /></div><div className="cvn-body"><strong>Sistema activo</strong><span>4 cámaras en línea</span></div><span className="cvn-time">5 min</span></div>
                </div>
              </div>
 case 'nube': return <div className="cam-service-visual cam-visual-cloud">
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
 case 'app': return <div className="cam-service-visual cam-visual-app">
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
 case 'mantenimiento': return <div className="sop-card-visual">
                <div className="sop-maint-cycle">
                  <div className="sop-cycle-ring" /><div className="sop-cycle-ring sop-cycle-ring-2" />
                  <div className="sop-cycle-center"><i className="fas fa-tools" /></div>
                  {['Revisión','Limpieza','Diagnóstico','Reporte'].map((s,i) => (
                    <div key={s} className={`sop-cycle-step sop-cs-${i+1}`}><div className="sop-cs-dot" /><span>{s}</span></div>
                  ))}
                </div>
              </div>
 case 'software': return <div className="sop-card-visual">
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
 case 'redes': return <div className="sop-card-visual">
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
 case 'emergencia': return <div className="sop-card-visual">
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
 default: return item.imagen_url ? <div className="original-service-image"><img src={item.imagen_url} alt="" loading="lazy" /></div> : null
 }
}
