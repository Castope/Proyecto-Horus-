import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import logoHorus from '../../assets/images/logo-horus.png'

const NAV_ITEMS = [
  { href: 'recoleccion',    icon: 'fa-database',     label: 'Qué información recolectamos' },
  { href: 'uso',            icon: 'fa-shield-alt',   label: 'Qué hacemos con tu info' },
  { href: 'consentimiento', icon: 'fa-check-circle', label: 'Consentimiento' },
  { href: 'tiempo',         icon: 'fa-clock',        label: 'Cuánto tiempo conservamos' },
  { href: 'derechos',       icon: 'fa-user-shield',  label: 'Tus derechos' },
  { href: 'modificaciones', icon: 'fa-sync-alt',     label: 'Modificaciones' },
  { href: 'terceros',       icon: 'fa-users',        label: 'Datos con terceros' },
  { href: 'contacto-pp',    icon: 'fa-headset',      label: 'Contacto' },
]

export default function PoliticasPrivacidad() {
  const [active, setActive] = useState('recoleccion')

  useEffect(() => {
    document.title = 'Políticas de Privacidad — Horus Group SRL'
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

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <>
      <section className="pp-hero">
        <div className="pp-hero-inner">
          <div className="pp-breadcrumb"><i className="fas fa-shield-alt" /> Políticas › Privacidad</div>
          <h1>Políticas de Privacidad</h1>
          <p>Protegemos tu información personal con los más altos estándares de seguridad.</p>
        </div>
      </section>

      <div className="pp-layout">
        <aside className="pp-sidebar">
          <div className="pp-sidebar-title"><i className="fas fa-list-ul" style={{ marginRight: 6, color: '#4F46E5' }} />Contenido</div>
          <nav className="pp-sidebar-nav">
            {NAV_ITEMS.map(item => (
              <a key={item.href} href={`#${item.href}`} className={active === item.href ? 'active' : ''}
                onClick={e => { e.preventDefault(); scrollTo(item.href) }}>
                <i className={`fas ${item.icon}`} />{item.label}
              </a>
            ))}
          </nav>
        </aside>

        <main className="pp-content">
          <div className="pp-intro">
            <p>La presente <strong>"POLÍTICA DE PRIVACIDAD"</strong> tiene por finalidad informar cómo <strong>Horus Group-Cajamarca SRL</strong> trata la información personal de todos los usuarios que visiten e interactúen en nuestro sitio web o al utilizar los diferentes servicios que brindamos.</p>
            <p>El usuario declara haber leído y aceptado de manera previa y expresa la POLÍTICA sujetándose a todas sus disposiciones.</p>
          </div>

          <section className="pp-section" id="recoleccion">
            <div className="pp-section-header"><div className="pp-section-icon indigo"><i className="fas fa-database" /></div><h2>¿Qué información recolectamos o recopilamos?</h2></div>
            <p>El usuario puede navegar en LA PÁGINA de manera libre sin necesidad de registrarse. Sin embargo, para acceder a algunos servicios se requerirá el registro del usuario a través de un formulario con sus datos personales.</p>
            <div className="pp-alert pp-alert-info">
              <i className="fas fa-info-circle" />
              <div>
                <p><strong>Los datos personales del usuario que se solicitan son:</strong></p>
                <ul className="pp-list" style={{ marginTop: 8 }}>
                  <li>Nombres y Apellidos</li>
                  <li>Correo Electrónico</li>
                  <li>Número de Celular</li>
                  <li>Otros necesarios para el registro o servicio que corresponda</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="pp-section" id="uso">
            <div className="pp-section-header"><div className="pp-section-icon coral"><i className="fas fa-shield-alt" /></div><h2>¿Qué hacemos con tu información?</h2></div>
            <p>Los datos personales proporcionados a través de LA PÁGINA quedan incorporados en nuestro banco de datos y podrán ser utilizados para:</p>
            <ul className="pp-list">
              <li>Desarrollo de acciones comerciales.</li>
              <li>La remisión vía correo electrónico de publicidad.</li>
              <li>Información personalizada o general de cursos, talleres, diplomados y/o servicios de LA PÁGINA.</li>
            </ul>
            <p>A través de la presente POLÍTICA DE PRIVACIDAD, el usuario da su consentimiento expreso para la inclusión de sus datos personales en el mencionado banco de datos.</p>
          </section>

          <section className="pp-section" id="consentimiento">
            <div className="pp-section-header"><div className="pp-section-icon green"><i className="fas fa-check-circle" /></div><h2>Consentimiento</h2></div>
            <p>Los usuarios darán su consentimiento explícito del tratamiento de sus datos personales cuando seleccionen el botón y/o enlace de <strong>"Registrarse"</strong> o <strong>"Suscribirse"</strong>.</p>
            <div className="pp-alert pp-alert-info">
              <i className="fas fa-hand-paper" />
              <p>Si luego de haber aceptado cambias de opinión, puedes anular tu consentimiento en cualquier momento contactándonos a <a href="mailto:horusgroupcajamarca@gmail.com">horusgroupcajamarca@gmail.com</a></p>
            </div>
          </section>

          <section className="pp-section" id="tiempo">
            <div className="pp-section-header"><div className="pp-section-icon indigo"><i className="fas fa-clock" /></div><h2>¿Cuánto tiempo conservamos tus datos?</h2></div>
            <p>Los Datos Personales que son almacenados, utilizados o transmitidos permanecerán en el banco de datos de LA PÁGINA durante el tiempo que sea necesario para cumplir los fines previstos en la presente Política o hasta el momento en que usted decida eliminarlos.</p>
          </section>

          <section className="pp-section" id="derechos">
            <div className="pp-section-header"><div className="pp-section-icon coral"><i className="fas fa-user-shield" /></div><h2>Derechos de acceso, rectificación, cancelación y oposición</h2></div>
            <p>El Usuario tiene derecho de acceso, rectificación, oposición y/o cancelación de su información personal comunicándose con LA PÁGINA al correo electrónico:</p>
            <div className="pp-contact-box"><i className="fas fa-envelope" /><a href="mailto:horusgroupcajamarca@gmail.com">horusgroupcajamarca@gmail.com</a></div>
            <div className="pp-derechos-grid">
              {[
                { icon: 'fa-eye',       title: 'Acceso',       desc: 'Conocer qué datos personales tenemos sobre ti' },
                { icon: 'fa-edit',      title: 'Rectificación', desc: 'Corregir datos inexactos o incompletos' },
                { icon: 'fa-trash-alt', title: 'Cancelación',  desc: 'Eliminar tus datos de nuestros registros' },
                { icon: 'fa-ban',       title: 'Oposición',    desc: 'Oponerte al tratamiento de tus datos' },
              ].map(d => (
                <div key={d.title} className="pp-derecho-card">
                  <div className="pp-derecho-icon"><i className={`fas ${d.icon}`} /></div>
                  <h4>{d.title}</h4>
                  <p>{d.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="pp-section" id="modificaciones">
            <div className="pp-section-header"><div className="pp-section-icon indigo"><i className="fas fa-sync-alt" /></div><h2>Modificaciones a nuestras Políticas de Privacidad</h2></div>
            <p>LA PÁGINA se reserva el derecho de modificar, rectificar, alterar, agregar o eliminar cualquier punto del presente escrito en cualquier momento y sin previo aviso, siendo su responsabilidad el mantenerse informado del mismo para una adecuada administración de su información.</p>
          </section>

          <section className="pp-section" id="terceros">
            <div className="pp-section-header"><div className="pp-section-icon coral"><i className="fas fa-users" /></div><h2>¿Compartiremos tus datos con terceros?</h2></div>
            <div className="pp-alert pp-alert-green">
              <i className="fas fa-lock" />
              <p><strong>Protegemos la información que recabamos</strong> estableciendo las medidas de seguridad técnicas y administrativas señaladas en las normas legales, de forma que la información queda protegida contra el acceso, la indisponibilidad, la divulgación o el uso no autorizado.</p>
            </div>
            <ul className="pp-list">
              <li>Los datos que compartimos son siempre <strong>datos anonimizados</strong> — no compartiremos datos de contacto como correo electrónico o número de teléfono.</li>
              <li>Si nuestro negocio entra en una empresa conjunta, compra otra empresa o se fusiona con otra entidad comercial, tus datos personales podrían ser divulgados o transferidos a la empresa de destino.</li>
              <li>En estas circunstancias, siempre informaremos a las entidades correspondientes de que solo deben usar tus datos personales para los fines descritos en esta Política de Privacidad.</li>
            </ul>
          </section>

          <section className="pp-section" id="contacto-pp">
            <div className="pp-section-header"><div className="pp-section-icon green"><i className="fas fa-headset" /></div><h2>Contacto</h2></div>
            <p>Para cualquier consulta sobre nuestras Políticas de Privacidad, puedes contactarnos al correo electrónico:</p>
            <div className="pp-contact-box"><i className="fas fa-envelope" /><a href="mailto:horusgroupcajamarca@gmail.com">horusgroupcajamarca@gmail.com</a></div>
            <div className="pp-firma">
              <img src={logoHorus} alt="Horus Group" />
              <div><p><strong>Asesoría Legal</strong></p><p>Horus Group-Cajamarca SRL</p></div>
            </div>
          </section>

          <div className="pp-cta">
            <h3>¿Tienes dudas sobre tu privacidad?</h3>
            <p>Estamos comprometidos con la protección de tus datos personales. Contáctanos para cualquier consulta.</p>
            <div className="pp-cta-btns">
              <a href="mailto:horusgroupcajamarca@gmail.com" className="pp-btn-white"><i className="fas fa-envelope" /> Contactar</a>
              <Link to="/preguntas-frecuentes" className="pp-btn-outline-white"><i className="fas fa-question-circle" /> Preguntas Frecuentes</Link>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
