import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const CATEGORIAS = [
  {
    icon: 'fa-certificate', color: '#4F46E5', title: 'Certificados y Diplomas',
    items: [
      { n: '01', q: '¿Qué pasa si perdí mi certificado y/o diploma y quiero solicitar uno nuevo?', a: 'Puedes solicitar una reimpresión de tu certificado o diploma contactándonos directamente por correo electrónico o WhatsApp. Es posible que apliquen costos administrativos según el tipo de documento.' },
    ],
  },
  {
    icon: 'fa-book-open', color: '#FF6B47', title: 'Cursos y Evaluaciones',
    items: [
      { n: '02', q: '¿Cuáles son las fechas para rendir las evaluaciones de cursos asincrónicos?', a: 'Las evaluaciones de cursos grabados se rinden en fechas fijas que comunicamos mensualmente por correo y redes sociales. Contáctanos para conocer el próximo calendario.' },
      { n: '03', q: 'Si el curso es presencial o semipresencial y no fui a la parte práctica, ¿qué hago?', a: 'Debes comunicarte con nosotros antes de la siguiente sesión práctica para coordinar un proceso de recuperación o reprogramación, sujeto a disponibilidad.' },
    ],
  },
  {
    icon: 'fa-shopping-bag', color: '#059669', title: 'Compras y Pagos',
    items: [
      { n: '04', q: 'Compré un producto en la web y todavía no me llega, ¿qué debo hacer?', a: 'Escríbenos con tu número de pedido al correo o WhatsApp. Verificaremos el estado de tu envío y te daremos una solución en menos de 24 horas hábiles.' },
      { n: '05', q: '¿Emiten comprobantes de pago?', a: 'Sí, emitimos boletas y facturas electrónicas. Al momento de tu compra puedes indicar si necesitas factura con los datos de tu empresa.' },
      { n: '06', q: '¿Qué medios de pago aceptan?', a: 'Aceptamos transferencias bancarias, Yape, Plin, tarjetas de crédito/débito y pago en efectivo en nuestra sede de Cajamarca.' },
    ],
  },
  {
    icon: 'fa-headset', color: '#7C3AED', title: 'Atención Personalizada',
    items: [
      { n: '07', q: '¿Deseas una atención más personalizada?', a: 'Contáctanos directamente por WhatsApp o agenda una reunión virtual con uno de nuestros asesores. Estamos disponibles de lunes a viernes de 8am a 6pm.' },
    ],
  },
]

export default function PreguntasFrecuentes() {
  const [open, setOpen] = useState(null)

  useEffect(() => {
    document.title = 'Preguntas Frecuentes — Horus Group SRL'
  }, [])

  const toggle = (id) => setOpen(prev => prev === id ? null : id)

  return (
    <>
      <section className="faq-hero">
        <div className="faq-hero-inner">
          <div className="faq-breadcrumb"><i className="fas fa-question-circle" /> Soporte › FAQ</div>
          <h1>Preguntas Frecuentes</h1>
          <p>Encuentra respuestas rápidas a las dudas más comunes sobre nuestros servicios.</p>
        </div>
      </section>

      <div className="faq-layout">
        {CATEGORIAS.map(cat => (
          <div key={cat.title}>
            <div className="faq-cat">
              <div className="faq-cat-icon" style={{ background: cat.color }}>
                <i className={`fas ${cat.icon}`} />
              </div>
              <h2>{cat.title}</h2>
            </div>

            {cat.items.map(item => {
              const id = item.n
              const isOpen = open === id
              return (
                <div key={id} className={`faq-item${isOpen ? ' open' : ''}`}>
                  <div className="faq-question" onClick={() => toggle(id)}>
                    <div className="faq-question-number">{item.n}</div>
                    <div className="faq-question-text">{item.q}</div>
                    <div className="faq-toggle-icon">
                      <i className={`fas ${isOpen ? 'fa-minus' : 'fa-plus'}`} />
                    </div>
                  </div>
                  <div className="faq-answer">
                    <div className="faq-answer-inner">{item.a}</div>
                  </div>
                </div>
              )
            })}
          </div>
        ))}

        <div className="faq-cta-box">
          <h3>¿No encontraste lo que buscabas?</h3>
          <p>Nuestro equipo está disponible para resolver cualquier consulta de forma personalizada.</p>
          <div className="faq-cta-btns">
            <a href="https://wa.me/51927582305" className="faq-btn-white" target="_blank" rel="noreferrer">
              <i className="fab fa-whatsapp" /> Escribir por WhatsApp
            </a>
            <Link to="/contactos" className="faq-btn-outline">
              <i className="fas fa-envelope" /> Enviar un mensaje
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
