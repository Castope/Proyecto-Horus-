import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import logoHorus from '../../assets/images/logo-horus.png'

const NAV_ITEMS = [
  { href: 'intro-pd',       icon: 'fa-info-circle',   label: 'Introducción' },
  { href: 'educacion-pd',   icon: 'fa-graduation-cap', label: 'A. Educación' },
  { href: 'equipos-pd',     icon: 'fa-shopping-cart', label: 'B. Compra y Garantía' },
  { href: 'modif-pd',       icon: 'fa-edit',          label: 'Modificaciones' },
  { href: 'atencion-pd',    icon: 'fa-headset',       label: 'Atención al usuario' },
]

export default function PoliticasDevolucion() {
  const [active, setActive] = useState('intro-pd')

  useEffect(() => {
    document.title = 'Políticas de Devolución — Horus Group SRL'
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
      <section className="pd-hero">
        <div className="pd-hero-inner">
          <div className="pd-breadcrumb"><i className="fas fa-undo-alt" /> Políticas › Devolución</div>
          <h1>Políticas de Devolución</h1>
          <p>Conoce nuestros términos y condiciones para devoluciones y garantías de productos y servicios.</p>
        </div>
      </section>

      <div className="pd-layout">
        <aside className="pd-sidebar">
          <div className="pd-sidebar-title"><i className="fas fa-list-ul" style={{ marginRight: 6, color: '#4F46E5' }} />Contenido</div>
          <nav className="pd-sidebar-nav">
            {NAV_ITEMS.map(item => (
              <a key={item.href} href={`#${item.href}`} className={active === item.href ? 'active' : ''}
                onClick={e => { e.preventDefault(); scrollTo(item.href) }}>
                <i className={`fas ${item.icon}`} />{item.label}
              </a>
            ))}
          </nav>
        </aside>

        <main className="pd-content">
          <div className="pd-intro" id="intro-pd">
            Al acceder y utilizar este sitio web, usted está aceptando todos los términos y condiciones. Si no está de acuerdo con alguna parte, puede desistir de la utilización de este sitio web o de alguno de los servicios que brindamos por la empresa <strong>Horus Group SRL</strong>.
          </div>

          <section className="pd-section" id="educacion-pd">
            <div className="pd-section-header">
              <div className="pd-section-icon indigo"><i className="fas fa-graduation-cap" /></div>
              <h2>A. EDUCACIÓN — Talleres, capacitaciones, cursos, diplomados</h2>
            </div>
            <p>La empresa de Telecomunicaciones y Capacitaciones Profesionales Horus Group-Cajamarca S.R.L. se compromete en ofrecer una satisfacción garantizada en todos talleres, cursos de actualización, capacitaciones y/o diplomados que se realice, por ello se realizará la devolución del monto pagado solo en el caso de que amerite.</p>
            <p>Todas las solicitudes serán recibidas y atendidas por nuestro equipo de Asistencia Legal a través de nuestro correo electrónico <a href="mailto:horusgroupcajamarca@gmail.com">horusgroupcajamarca@gmail.com</a></p>

            <div className="pd-subsection">
              <div className="pd-subsection-title"><span className="pd-num">1</span> Circunstancia para solicitar la devolución de dinero</div>
              <p>Casos fortuitos o de fuerza mayor que impidan el asistir a la clase teórica y/o práctica, cursos de actualización, talleres, capacitaciones y otros con características distintas a las ofrecidas, incumplimiento en los días de capacitación.</p>
            </div>

            <div className="pd-subsection">
              <div className="pd-subsection-title"><span className="pd-num">2</span> Consideraciones que se debe tener en cuenta</div>
              <ul className="pd-list">
                <li>Puedes solicitar la devolución del dinero cancelado en un plazo máximo de <strong>1 día calendario</strong> desde la fecha en la cual te inscribiste y como máximo hasta la fecha en la cual se dará la clase teórica y/o práctica. Pasado este día, ya no tienes opción a solicitar la devolución.</li>
                <li>Al momento de solicitar la devolución, el correo electrónico debe contener los <strong>medios probatorios</strong> que acrediten la situación expuesta.</li>
                <li>No se aceptará la devolución de ser que no se adjunten los medios probatorios en el correo electrónico.</li>
                <li>Si ya asististe a la clase teórica, <strong>no puedes solicitar la devolución</strong> de tu dinero.</li>
              </ul>
            </div>

            <div className="pd-subsection">
              <div className="pd-subsection-title"><span className="pd-num">3</span> Canales para realizar el cambio o devolución</div>
              <p>Todas las solicitudes serán recibidas y atendidas por nuestro equipo de Asistencia Legal a través de nuestro correo electrónico:</p>
              <div className="pd-contact-box"><i className="fas fa-envelope" /><a href="mailto:horusgroupcajamarca@gmail.com">horusgroupcajamarca@gmail.com</a></div>
            </div>

            <div className="pd-subsection">
              <div className="pd-subsection-title"><span className="pd-num">4</span> Consideraciones para la solicitud de devolución de dinero</div>
              <ul className="pd-list">
                <li>Puedes solicitar la <strong>devolución íntegra</strong> del dinero.</li>
                <li>En el correo electrónico, debes indicar tus datos personales, DNI, medio de pago y comprobante del mismo, así como el taller, curso, capacitación o diplomado al cual te inscribiste y la fecha de este.</li>
              </ul>
            </div>

            <div className="pd-subsection">
              <div className="pd-subsection-title"><span className="pd-num">5</span> Pasos para solicitudes de devolución</div>
              <div className="pd-steps">
                <div className="pd-step">
                  <div className="pd-step-num">1</div>
                  <div className="pd-step-body">
                    <h4>Envía tu solicitud</h4>
                    <p>Comunicarte mediante correo electrónico a <a href="mailto:horusgroupcajamarca@gmail.com">horusgroupcajamarca@gmail.com</a> adjuntando tus medios probatorios.</p>
                    <ul><li><strong>ASUNTO:</strong> DEVOLUCIÓN DE DINERO</li><li><strong>DESTINATARIO:</strong> Abog. Luz Karen Tavara Camacho</li></ul>
                  </div>
                </div>
                <div className="pd-step">
                  <div className="pd-step-num">2</div>
                  <div className="pd-step-body">
                    <h4>Espera la respuesta</h4>
                    <p>En un plazo de <strong>2 días hábiles</strong> recibirás una respuesta por parte del equipo de Asistencia Legal.</p>
                  </div>
                </div>
                <div className="pd-step">
                  <div className="pd-step-num">3</div>
                  <div className="pd-step-body">
                    <h4>Recibe tu devolución</h4>
                    <p>De ser que proceda la devolución del dinero, nos pondremos en contacto contigo para comunicarte el modo de esta.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pd-subsection">
              <div className="pd-subsection-title"><span className="pd-num">6</span> Tiempo de devolución de dinero</div>
              <p>Se efectuará después de haberse aprobado la solicitud de devolución. El tiempo aproximado es <strong>2 (dos) días hábiles</strong> posteriores a la aprobación.</p>
            </div>

            <div className="pd-subsection">
              <div className="pd-subsection-title"><span className="pd-num">7</span> Resguardo de los certificados</div>
              <ul className="pd-list">
                <li>Los certificados que no se recojan por parte del participante en la ceremonia de entrega quedarán bajo resguardo de la empresa HORUS GROUP SRL.</li>
                <li>El tiempo de resguardo garantizado por parte la empresa es de <strong>1 mes</strong>, luego de ese tiempo la empresa no se responsabiliza por el deterioro o pérdida de este.</li>
                <li>Para la entrega del certificado pasada la fecha de ceremonia, el participante deberá ponerse en contacto con la empresa a través del número de WhatsApp <strong>942 956 207</strong> (coordinadora institucional).</li>
              </ul>
            </div>
          </section>

          <section className="pd-section" id="equipos-pd">
            <div className="pd-section-header">
              <div className="pd-section-icon coral"><i className="fas fa-shopping-cart" /></div>
              <h2>B. COMPRA Y GARANTÍA DE EQUIPOS</h2>
            </div>

            <div className="pd-subsection">
              <div className="pd-subsection-title"><span className="pd-num">1</span> Términos de Compra, Prohibiciones y Limitaciones</div>
              <ul className="pd-list">
                <li>Toda orden de compra realizada a través de nuestro sitio web se rige por estos términos.</li>
                <li>Para realizar una orden de compra tiene obligatoriamente que registrar o crear su cuenta en nuestro sitio web y ser <strong>mayor de 18 años de edad</strong>.</li>
                <li>El precio de los pedidos podrá cambiar debido a cuestiones fuera de nuestro control tales como asuntos normativos, impuestos, cargos de aduana o cambios en costo de envíos.</li>
                <li>La empresa Horus Group-Cajamarca se reserva derecho y puede cancelar la cuenta de acceso de cualquier usuario si detectamos algún acto de fraude o mala fe.</li>
              </ul>
            </div>

            <div className="pd-subsection">
              <div className="pd-subsection-title"><span className="pd-num">2</span> Pasos para la realización de compra</div>
              <div className="pd-steps-compra">
                {['Regístrese en el sitio web (mayor de 18 años)', 'Seleccione el producto o servicio', 'Agregue al carrito de compras', 'Llene los datos necesarios', 'Revise que todos los datos estén correctos', 'Si tiene alguna duda, comunicarse con nosotros', 'Realizar el pago correspondiente', 'Verificar su correo electrónico', 'Esperar los plazos establecidos', 'Si no llega su producto, comunicarse con nosotros'].map((s, i) => (
                  <div key={i} className="pd-step-compra"><span>{i + 1}</span>{s}</div>
                ))}
              </div>
            </div>

            <div className="pd-subsection">
              <div className="pd-subsection-title"><span className="pd-num">3</span> Precios, impuestos y gastos de envío</div>
              <ul className="pd-list">
                <li>Los precios incluyen el <strong>Impuesto General a las Ventas (I.G.V.)</strong></li>
                <li>El costo de los gastos de envío será de acuerdo al transportista donde se envíe la mercadería.</li>
                <li>El usuario es responsable de proporcionar una dirección de entrega precisa y completa.</li>
                <li>En ningún caso se podrá realizar envíos de productos sin que se realice la verificación del pago.</li>
              </ul>
            </div>

            <div className="pd-subsection">
              <div className="pd-subsection-title"><span className="pd-num">4</span> Condiciones de pago</div>
              <p>El pago se realizará en el momento de la compra. Aceptamos las siguientes formas de pago:</p>
              <div className="pd-metodos">
                {[{ icon: 'fa-university', label: 'Depósitos' }, { icon: 'fa-exchange-alt', label: 'Transferencias bancarias' }, { icon: 'fa-mobile-alt', label: 'Yape' }, { icon: 'fa-mobile-alt', label: 'Plin' }].map(m => (
                  <div key={m.label} className="pd-metodo"><i className={`fas ${m.icon}`} />{m.label}</div>
                ))}
              </div>
            </div>

            <div className="pd-subsection">
              <div className="pd-subsection-title"><span className="pd-num">5</span> Plazo de envío de productos</div>
              <ul className="pd-list">
                <li>Para envíos dentro de la ciudad o región de Cajamarca: <strong>1 a 5 días hábiles</strong> previa coordinación.</li>
                <li>Para envíos fuera de la región de Cajamarca: <strong>5 a 7 días hábiles</strong> previa coordinación.</li>
              </ul>
            </div>

            <div className="pd-subsection">
              <div className="pd-subsection-title"><span className="pd-num">6</span> Devoluciones o reposiciones</div>
              <div className="pd-alert pd-alert-info"><i className="fas fa-info-circle" /><p><strong>Cambio o sustitución del producto:</strong> Para que se considere un cambio o sustitución por el mismo producto, procederá siempre y cuando exista algún defecto de fabricación determinado por nuestro equipo de soporte HORUS GROUP SRL.</p></div>
              <ul className="pd-list">
                <li>El usuario tendrá que enviar el producto sin golpes o rasguños en su empaque original incluyendo todos los accesorios, manuales u otros que hayan sido incluidos en el momento de la compra.</li>
                <li>El producto será cambiado después de la verificación de las fallas de fabricación, en un plazo máximo de <strong>25 días hábiles</strong>.</li>
                <li>En el caso de no contar con stock disponible, la empresa HORUS GROUP SRL emitirá una nota de crédito por el precio del producto comprado.</li>
                <li>No se aceptarán cambios ni devoluciones por incompatibilidad con productos de otros fabricantes.</li>
                <li>No se aceptarán devoluciones de productos personalizados o productos que hayan sido usados.</li>
              </ul>
            </div>

            <div className="pd-subsection">
              <div className="pd-subsection-title"><span className="pd-num">7</span> Garantías sobre los productos</div>
              <ul className="pd-list">
                <li>La garantía de los productos es única y exclusivamente al cliente o usuario que realizó la compra.</li>
                <li>Horario de atención: <strong>lunes a viernes de 9:00 am a 6:00 pm</strong> y <strong>sábados de 9:00 am a 1:00 pm</strong>.</li>
                <li>La garantía no cubre accesorios de los equipos tales como cables, fuentes de poder, puertos de entrada y salida, conectores, ni consumibles que se desgasten por el uso.</li>
                <li>La garantía no incluye ningún tipo de instalación de software o firmware.</li>
                <li>La garantía no cubre daños producidos por transporte de terceros.</li>
                <li>Todos los equipos en garantía que no son reclamados hasta en un máximo de <strong>2 meses</strong> luego de su entrega, serán declarados en abandono.</li>
              </ul>
            </div>

            <div className="pd-subsection">
              <div className="pd-subsection-title"><span className="pd-num">8</span> Externalidades</div>
              <ul className="pd-list">
                <li>El cumplimiento de las obligaciones por parte de HORUS GROUP SRL puede ser suspendida en caso de algún evento fortuito o de fuerza mayor.</li>
                <li>Tales externalidades pueden ser: disturbios sociales, huelgas de cualquier naturaleza, feriados no laborables fortuitos, entre otros.</li>
                <li>La empresa HORUS GROUP SRL informará al cliente dentro de <strong>1 a 3 días</strong> anteriores o posteriores a su ocurrencia.</li>
                <li>Si dicha suspensión se prolonga más allá de <strong>20 días</strong>, el cliente tendrá la posibilidad de rescindir el pedido en curso.</li>
              </ul>
            </div>
          </section>

          <section className="pd-section" id="modif-pd">
            <div className="pd-section-header">
              <div className="pd-section-icon green"><i className="fas fa-edit" /></div>
              <h2>Modificación en los términos y condiciones de uso</h2>
            </div>
            <p>Horus Group-Cajamarca SRL podrá modificar, adicionar, eliminar y/o actualizar las políticas de devolución en cualquier momento, por cualquier razón y/o sin previo aviso, los cuales seguirán siendo de obligatoriedad el cumplimiento de estas desde el momento de su publicación.</p>
          </section>

          <section className="pd-section" id="atencion-pd">
            <div className="pd-section-header">
              <div className="pd-section-icon coral"><i className="fas fa-headset" /></div>
              <h2>Atención al usuario</h2>
            </div>
            <p>Para cualquier aclaración o duda sobre los Términos y Condiciones comunicarse al correo electrónico:</p>
            <div className="pd-contact-box"><i className="fas fa-envelope" /><a href="mailto:horusgroupcajamarca@gmail.com">horusgroupcajamarca@gmail.com</a></div>
            <div className="pd-firma">
              <img src={logoHorus} alt="Horus Group" />
              <div><p><strong>Asesoría Legal</strong></p><p>Horus Group-Cajamarca SRL</p></div>
            </div>
          </section>

          <div className="pd-cta">
            <h3>¿Tienes alguna consulta?</h3>
            <p>Nuestro equipo legal está disponible para resolver cualquier duda sobre nuestras políticas.</p>
            <div className="pd-cta-btns">
              <a href="mailto:horusgroupcajamarca@gmail.com" className="pd-btn-white"><i className="fas fa-envelope" /> Contactar Asesoría Legal</a>
              <Link to="/preguntas-frecuentes" className="pd-btn-outline-white"><i className="fas fa-question-circle" /> Preguntas Frecuentes</Link>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
