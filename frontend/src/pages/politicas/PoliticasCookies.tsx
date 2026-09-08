import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import logoHorus from '../../assets/images/logo-horus.png'

const NAV_ITEMS = [
  { href: 'introduccion',  icon: 'fa-info-circle',   label: '1. Introducción' },
  { href: 'que-son',       icon: 'fa-question-circle', label: '2. ¿Qué son las cookies?' },
  { href: 'para-que',      icon: 'fa-bullseye',       label: '3. ¿Para qué sirven?' },
  { href: 'tipos',         icon: 'fa-list-ul',        label: '4. Tipos de cookies' },
  { href: 'cookies-horus', icon: 'fa-server',         label: '5. Cookies que usamos' },
  { href: 'gestion',       icon: 'fa-tasks',          label: '6. Gestión de cookies' },
  { href: 'deshabilitar',  icon: 'fa-power-off',      label: '7. Si se deshabilitan' },
  { href: 'consultas',     icon: 'fa-comments',       label: '8. Consultas' },
  { href: 'vigencia',      icon: 'fa-calendar-alt',   label: '9. Vigencia' },
]

export default function PoliticasCookies() {
  const [active, setActive] = useState('introduccion')
  const contentRef = useRef(null)

  useEffect(() => {
    document.title = 'Políticas de Cookies — Horus Group SRL'
  }, [])

  useEffect(() => {
    const handler = () => {
      NAV_ITEMS.forEach(({ href }) => {
        const el = document.getElementById(href)
        if (el && window.scrollY >= el.offsetTop - 120) setActive(href)
      })
    }
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <section className="pc-hero">
        <div className="pc-hero-inner">
          <div className="pc-breadcrumb">
            <i className="fas fa-cookie-bite" /> Políticas › Cookies
          </div>
          <h1>Políticas de Cookies</h1>
          <p>Información sobre el uso de cookies en nuestro sitio web y cómo gestionarlas para proteger tu privacidad.</p>
        </div>
      </section>

      <div className="pc-layout">
        <aside className="pc-sidebar">
          <div className="pc-sidebar-title"><i className="fas fa-list-ul" style={{ marginRight: 6, color: '#4F46E5' }} />Contenido</div>
          <nav className="pc-sidebar-nav">
            {NAV_ITEMS.map(item => (
              <a key={item.href} href={`#${item.href}`} className={active === item.href ? 'active' : ''}
                onClick={e => { e.preventDefault(); scrollTo(item.href) }}>
                <i className={`fas ${item.icon}`} />{item.label}
              </a>
            ))}
          </nav>
        </aside>
        <main className="pc-content" ref={contentRef}>
          <section className="pc-section" id="introduccion">
            <div className="pc-section-header">
              <div className="pc-section-icon indigo"><i className="fas fa-info-circle" /></div>
              <h2>1. Introducción</h2>
            </div>
            <p>Horus Group-Cajamarca SRL describe en el presente documento la <strong>"Política de Cookies"</strong> que regula el sitio web con el objetivo de garantizar la privacidad del usuario, que en adelante se le llamará <strong>"EL USUARIO"</strong>.</p>
            <div className="pc-alert pc-alert-info">
              <i className="fas fa-map-marker-alt" />
              <p>El sitio web es propiedad de la empresa <strong>Horus Group-Cajamarca SRL</strong>, con domicilio en el <strong>Jr. José Gálvez Nro. 322 – Provincia y Departamento de Cajamarca</strong>.</p>
            </div>
            <p>Informamos a "EL USUARIO" que en nuestro sitio web utilizamos <strong>cookies propias</strong>.</p>
            <ul className="pc-list">
              <li>Estas cookies permiten a Horus Group-Cajamarca SRL facilitar el uso y navegación del sitio web.</li>
              <li>Garantizar el acceso a determinadas funcionalidades del sitio.</li>
              <li>Nos ayudan a mejorar la calidad del sitio web de acuerdo con los hábitos y estilos de navegación de "EL USUARIO".</li>
            </ul>
          </section>
          <section className="pc-section" id="que-son">
            <div className="pc-section-header">
              <div className="pc-section-icon coral"><i className="fas fa-question-circle" /></div>
              <h2>2. ¿Qué son las cookies?</h2>
            </div>
            <p>Las cookies son pequeños archivos de texto que los sitios web guardan en tu computadora o dispositivo móvil cuando los visitas. Estos archivos permiten que el sitio web recuerde información sobre tu visita, como:</p>
            <div className="pc-cookies-grid">
              {[
                { icon: 'fa-language',     label: 'Preferencias de idioma' },
                { icon: 'fa-user-check',   label: 'Estado de inicio de sesión' },
                { icon: 'fa-shopping-cart', label: 'Artículos en tu carrito' },
                { icon: 'fa-cog',          label: 'Configuraciones personalizadas' },
              ].map(c => (
                <div key={c.label} className="pc-cookie-card">
                  <i className={`fas ${c.icon}`} />
                  <p>{c.label}</p>
                </div>
              ))}
            </div>
          </section>
          <section className="pc-section" id="para-que">
            <div className="pc-section-header">
              <div className="pc-section-icon indigo"><i className="fas fa-bullseye" /></div>
              <h2>3. ¿Para qué sirven las cookies?</h2>
            </div>
            <p>Las cookies sirven para reconocer el dispositivo de "EL USUARIO" cuando vuelven a visitar el sitio web, facilitándole su uso recordando sus preferencias y configuración de navegación.</p>
            <ul className="pc-list">
              <li>Reconocer el dispositivo de "EL USUARIO" cuando vuelven a visitar el sitio web.</li>
              <li>Recordar preferencias y configuración de navegación (idioma, país, etc.).</li>
              <li>Mejorar los servicios que ofrecemos.</li>
              <li>Recopilar información estadística que nos permite entender cómo "EL USUARIO" utiliza este sitio.</li>
              <li>Mejorar la estructura y contenidos del sitio web.</li>
            </ul>
            <div className="pc-alert pc-alert-green">
              <i className="fas fa-shield-alt" />
              <div>
                <p><strong>Seguridad y privacidad:</strong> Las cookies se asocian únicamente a un usuario anónimo y su dispositivo de acceso a Internet y no proporcionan referencias que permitan deducir datos personales de "EL USUARIO". Las cookies no pueden dañar su dispositivo y además son muy útiles, puesto que nos ayudan a identificar y resolver errores.</p>
              </div>
            </div>
            <h3>Acciones disponibles para el usuario:</h3>
            <div className="pc-actions-grid">
              {[
                { cls: 'green',  icon: 'fa-check-circle',  title: 'Aceptar',               desc: 'No se volverá a visualizar este aviso durante la presente sesión.' },
                { cls: 'coral',  icon: 'fa-times-circle',  title: 'Cerrar',                desc: 'Se oculta el aviso pero se volverá a mostrar al acceder a otra página.' },
                { cls: 'indigo', icon: 'fa-sliders-h',     title: 'Modificar configuración', desc: 'Podrá modificar la configuración de su navegación.' },
              ].map(a => (
                <div key={a.title} className="pc-action-card">
                  <div className={`pc-action-icon ${a.cls}`}><i className={`fas ${a.icon}`} /></div>
                  <h4>{a.title}</h4>
                  <p>{a.desc}</p>
                </div>
              ))}
            </div>
          </section>
          <section className="pc-section" id="tipos">
            <div className="pc-section-header">
              <div className="pc-section-icon coral"><i className="fas fa-list-ul" /></div>
              <h2>4. Tipos de cookies</h2>
            </div>
            <div className="pc-subsection">
              <h3><span className="pc-num">A</span> Según la entidad que las gestione</h3>
              <div className="pc-type-box">
                <div className="pc-type-box-header"><i className="fas fa-home" /><h4>Cookies propias</h4></div>
                <p>Son aquellas que se envían al dispositivo de acceso a Internet del Usuario desde el sitio web gestionada por el propio titular del sitio y desde el que se presta el servicio solicitado por "EL USUARIO".</p>
              </div>
              <div className="pc-type-box">
                <div className="pc-type-box-header"><i className="fas fa-external-link-alt" /><h4>Cookies de terceros</h4></div>
                <p>Son aquellas que se envían al dispositivo de acceso a Internet de "EL USUARIO" desde el sitio web pero que no es gestionado por el titular del sitio, sino por otra entidad que trata los datos obtenidos mediante las cookies.</p>
              </div>
            </div>
            <div className="pc-subsection">
              <h3><span className="pc-num">B</span> Según el plazo de tiempo</h3>
              <div className="pc-type-box">
                <div className="pc-type-box-header"><i className="fas fa-clock" /><h4>Cookies de sesión</h4></div>
                <p>Son un tipo de cookies diseñadas para recoger y almacenar datos mientras "EL USUARIO" accede al sitio web. Se suelen utilizar para almacenar información que sólo interesa conservar para la prestación del servicio solicitado en una sola ocasión.</p>
              </div>
              <div className="pc-type-box">
                <div className="pc-type-box-header"><i className="fas fa-history" /><h4>Cookies persistentes</h4></div>
                <p>Son un tipo de cookies en la que los datos siguen almacenados en el dispositivo de acceso a Internet de "EL USUARIO" y pueden ser accedidas y tratadas durante un periodo definido por el responsable de la cookie, que puede ir de unos minutos a varios años.</p>
              </div>
            </div>
            <div className="pc-subsection">
              <h3><span className="pc-num">C</span> Según la finalidad</h3>
              <div className="pc-finalidades-grid">
                {[
                  { icon: 'fa-tools',         title: 'Técnicas',      desc: 'Imprescindibles para el correcto funcionamiento del sitio web.' },
                  { icon: 'fa-puzzle-piece',  title: 'Funcionales',   desc: 'Permiten acceder al servicio con características predefinidas según el dispositivo.' },
                  { icon: 'fa-map-marked-alt', title: 'Geolocalización', desc: 'Utilizadas para averiguar en qué país se encuentra. Totalmente anónima.' },
                  { icon: 'fa-chart-line',    title: 'Analíticas',    desc: 'Permiten el seguimiento y análisis del comportamiento para introducir mejoras.' },
                  { icon: 'fa-ad',            title: 'Publicitarias', desc: 'Permiten la gestión eficaz de espacios publicitarios.' },
                  { icon: 'fa-bullhorn',      title: 'Comportamental', desc: 'Almacenan información del comportamiento para mostrar publicidad personalizada.' },
                  { icon: 'fa-user-plus',     title: 'Registro',      desc: 'Se generan una vez que "EL USUARIO" se ha registrado o abierto sesión.' },
                ].map(f => (
                  <div key={f.title} className="pc-finalidad-card">
                    <div className="pc-finalidad-icon"><i className={`fas ${f.icon}`} /></div>
                    <h4>{f.title}</h4>
                    <p>{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
          <section className="pc-section" id="cookies-horus">
            <div className="pc-section-header">
              <div className="pc-section-icon indigo"><i className="fas fa-server" /></div>
              <h2>5. Tipos de cookies que utiliza Horus Group-Cajamarca SRL</h2>
            </div>
            <div className="pc-alert pc-alert-info"><i className="fas fa-info-circle" /><p>Las cookies siguientes no identifican personalmente a "EL USUARIO", sólo proporcionan información estadística anónima sobre la navegación en este sitio web.</p></div>
            {[
              { icon: 'fa-cogs',               title: 'Cookies técnicas',                    badge: 'Propias o de tercero', badgeCls: '', desc: 'Son estrictamente necesarias para que "EL USUARIO" pueda navegar por el sitio web y utilizar sus funciones.', permanencia: 'Cookies de sesión y persistentes', finalidades: ['Identificar la sesión', 'Acceso al sitio privado', 'Gestión del pago', 'Controlar el fraude', 'Habilitar contenidos dinámicos'] },
              { icon: 'fa-chart-bar',           title: 'Cookies analíticas',                  badge: 'Propias', badgeCls: 'pc-badge-green', desc: 'Recopilan información agregada y anonimizada sobre cómo se utiliza el sitio web para mejorar sus funciones y navegación.', permanencia: 'Cookies de sesión o persistentes', finalidades: ['Estadísticas de uso', 'Número de visitas y fuentes de tráfico', 'Velocidad de las búsquedas'] },
              { icon: 'fa-sliders-h',           title: 'Cookies funcionales',                 badge: 'Propias', badgeCls: 'pc-badge-green', desc: 'Permiten almacenar información sobre las preferencias de "EL USUARIO".', permanencia: 'Cookies persistentes', finalidades: ['La página web podrá recordar y brindar funciones personalizadas'] },
              { icon: 'fa-envelope-open-text',  title: 'Cookies de comunicaciones comerciales', badge: 'Propias o de tercero', badgeCls: '', desc: 'Almacenan información del comportamiento de "EL USUARIO" para ofrecer comunicaciones comerciales personalizadas.', permanencia: 'Cookies persistentes', finalidades: ['Mostrar anuncios de interés', 'Limitar la cantidad de veces que se ve un anuncio', 'Medir la efectividad de campañas publicitarias'] },
            ].map(c => (
              <div key={c.title} className="pc-detail-box">
                <div className="pc-detail-header">
                  <i className={`fas ${c.icon}`} />
                  <h3>{c.title}</h3>
                  <span className={`pc-badge ${c.badgeCls}`}>{c.badge}</span>
                </div>
                <p>{c.desc}</p>
                <div className="pc-detail-meta">
                  <div className="pc-detail-meta-item"><strong>Permanencia:</strong> {c.permanencia}</div>
                  <div className="pc-detail-meta-item"><strong>Finalidades:</strong>
                    <ul>{c.finalidades.map(f => <li key={f}>{f}</li>)}</ul>
                  </div>
                </div>
              </div>
            ))}
          </section>
          <section className="pc-section" id="gestion">
            <div className="pc-section-header">
              <div className="pc-section-icon coral"><i className="fas fa-tasks" /></div>
              <h2>6. Gestión de cookies</h2>
            </div>
            <p>Horus Group-Cajamarca SRL asume un compromiso sobre el uso de cookies, en consecuencia, otorga a "EL USUARIO" acceso a información para que pueda comprender qué tipo de cookies se utiliza en este sitio web y la razón de ello.</p>
            <ul className="pc-list">
              <li>Si "EL USUARIO" acepta dichas cookies, permite la mejora del sitio web para ofrecerle un acceso óptimo y un servicio más eficaz y personalizado.</li>
              <li>"EL USUARIO" puede configurar su navegador para establecer que solo los sitios web de confianza puedan gestionar cookies.</li>
              <li>Si "EL USUARIO" decide no autorizar el tratamiento, solo usaríamos las cookies técnicas y analíticas, puesto que son imprescindibles para la navegación.</li>
              <li>En caso de seguir navegando por nuestro sitio web sin denegar su autorización implica que acepta su uso.</li>
            </ul>
            <div className="pc-alert pc-alert-warn">
              <i className="fas fa-exclamation-triangle" />
              <div><p><strong>Importante:</strong> En caso "EL USUARIO" rechace o borre las cookies de navegación del sitio web, Horus Group-Cajamarca SRL no mantendrá sus preferencias y algunas características de las páginas no estarán operativas.</p></div>
            </div>
            <h3>Configuración de navegadores:</h3>
            <div className="pc-browsers-grid">
              {[
                { icon: 'fa-internet-explorer', cls: '', name: 'Internet Explorer', desc: 'Herramientas → Opciones de Internet → Privacidad → Configuración', url: 'https://support.microsoft.com', label: 'Soporte de Microsoft' },
                { icon: 'fa-safari',            cls: '', name: 'Safari',            desc: 'Preferencias → Seguridad', url: 'https://support.apple.com', label: 'Soporte de Apple' },
                { icon: 'fa-firefox',           cls: '', name: 'Firefox',           desc: 'Herramientas → Opciones → Privacidad → Historial → Configuración Personalizada', url: 'https://support.mozilla.org', label: 'Soporte de Mozilla' },
                { icon: 'fa-chrome',            cls: '', name: 'Chrome',            desc: 'Configuración → Mostrar opciones avanzadas → Privacidad → Configuración de contenido', url: 'https://support.google.com', label: 'Soporte de Google' },
              ].map(b => (
                <div key={b.name} className="pc-browser-card">
                  <i className={`fab ${b.icon}`} />
                  <h4>{b.name}</h4>
                  <p>{b.desc}</p>
                  <a href={b.url} target="_blank" rel="noreferrer">{b.label}</a>
                </div>
              ))}
            </div>
          </section>
          <section className="pc-section" id="deshabilitar">
            <div className="pc-section-header">
              <div className="pc-section-icon indigo"><i className="fas fa-power-off" /></div>
              <h2>7. ¿Qué ocurre si se deshabilitan las cookies?</h2>
            </div>
            <p>En caso de que se deshabiliten las Cookies:</p>
            <ul className="pc-list">
              <li>No podremos mantener sus preferencias.</li>
              <li>Algunas funcionalidades de los Servicios de Horus Group-Cajamarca SRL podrían quedar inoperativas.</li>
              <li>No pudiendo ofrecerle servicios personalizados.</li>
            </ul>
          </section>
          <section className="pc-section" id="consultas">
            <div className="pc-section-header">
              <div className="pc-section-icon coral"><i className="fas fa-comments" /></div>
              <h2>8. Consultas</h2>
            </div>
            <p>Para realizar cualquier tipo de consulta respecto a esta política puede dirigirse a la siguiente dirección de correo electrónico:</p>
            <div className="pc-contact-box"><i className="fas fa-envelope" /><a href="mailto:horusgroupcajamarca@gmail.com">horusgroupcajamarca@gmail.com</a></div>
          </section>
          <section className="pc-section" id="vigencia">
            <div className="pc-section-header">
              <div className="pc-section-icon indigo"><i className="fas fa-calendar-alt" /></div>
              <h2>9. Vigencia y modificación de la presente política de cookies</h2>
            </div>
            <p>Horus Group-Cajamarca SRL puede modificar esta Política de Cookies en función de exigencias legislativas, reglamentarias, jurisprudenciales o con la finalidad de adaptarla a las instrucciones dictadas por la Autoridad Nacional de Protección de Datos Personales.</p>
            <div className="pc-alert pc-alert-info"><i className="fas fa-sync-alt" /><p>Dado que dicha política puede ser actualizada periódicamente, sugerimos a "EL USUARIO" que la revise de forma regular en nuestro sitio web.</p></div>
            <div className="pc-firma">
              <img src={logoHorus} alt="Horus Group" />
              <div><p><strong>Horus Group-Cajamarca SRL</strong></p><p>Jr. José Gálvez Nro. 322 – Cajamarca</p></div>
            </div>
          </section>
          <div className="pc-cta">
            <h3>¿Necesitas más información?</h3>
            <p>Estamos disponibles para resolver cualquier duda sobre nuestra política de cookies.</p>
            <div className="pc-cta-btns">
              <a href="mailto:horusgroupcajamarca@gmail.com" className="pc-btn-white"><i className="fas fa-envelope" /> Contactar</a>
              <Link to="/preguntas-frecuentes" className="pc-btn-outline-white"><i className="fas fa-question-circle" /> Preguntas Frecuentes</Link>
            </div>
          </div>

        </main>
      </div>
    </>
  )
}
