import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import useFadeUp from '../../hooks/useFadeUp'

import imgCursos from '../../assets/images/galeria/capacitaciones/imagen 1.jpg'

const MODALIDADES = [
  { cls:'regular',  tag:'Tradicional',  icon:'fa-chalkboard-teacher', title:'Presencial',      desc:'Clases en aula con interacción directa con el docente. La experiencia de aprendizaje más completa.', items:['Clases en aula equipada','Práctica en laboratorio','Networking presencial','Certificado impreso'] },
  { cls:'featured', tag:'Más popular',  icon:'fa-laptop-house',       title:'Semipresencial',  desc:'Lo mejor de ambos mundos. Clases presenciales semanales combinadas con sesiones virtuales en vivo.',  items:['Clases presenciales y virtuales','Grabaciones disponibles','Horarios flexibles','Certificado oficial'] },
  { cls:'regular',  tag:'100% Online',  icon:'fa-globe',              title:'Virtual',         desc:'Aprende desde cualquier lugar. Clases en vivo y grabadas disponibles en nuestra plataforma.',          items:['Clases en vivo y grabadas','Plataforma e-learning','Horario completamente flexible','Certificado digital'] },
]

export default function Cursos() {
  useFadeUp()
  useEffect(() => { document.title = 'Cursos — Horus Group SRL' }, [])

  return (
    <>
      <section className="ed-hero ed-hero-cursos">
        <div className="container ed-hero-inner">
          <div className="ed-hero-text fade-up">
            <div className="ed-hero-tag"><i className="fas fa-book-open" /> Educación</div>
            <h1>Aprende a tu<br />ritmo, con<br /><span>certificado real</span></h1>
            <p>Soy los cursos. Presencial, semipresencial o virtual. Tú eliges cómo aprender, yo me adapto a ti.</p>
            <div className="ed-hero-btns">
              <Link to="/contactos" className="btn-coral"><i className="fas fa-book-open" /> Consultar disponibilidad</Link>
              <a href="#ed-detail" className="ed-ghost"><i className="fas fa-arrow-down" /> Ver modalidades</a>
            </div>
          </div>
          <div className="ed-hero-visual fade-up">
            <div className="ed-hero-img"><img src={imgCursos} alt="Cursos" /></div>
            <div className="ed-hero-card">
              <i className="fas fa-star" />
              <p>"3 modalidades de estudio. Todas con la misma calidad y certificación oficial."</p>
              <span>— Horus Group SRL</span>
            </div>
          </div>
        </div>
      </section>

      <section className="ed-modalities" id="ed-detail">
        <div className="container">
          <div className="ed-section-head fade-up">
            <span className="ed-eyebrow">Modalidades</span>
            <h2>Elige cómo<br />quieres aprender</h2>
            <p>Tres formas de estudiar, todas con certificación oficial.</p>
          </div>
          <div className="ed-modalities-grid">
            {MODALIDADES.map(m => (
              <div key={m.title} className={`ed-modality-card ${m.cls} fade-up`}>
                <div className="ed-modality-body">
                  <div className="ed-modality-tag">{m.tag}</div>
                  <div className="ed-modality-icon"><i className={`fas ${m.icon}`} /></div>
                  <h3>{m.title}</h3>
                  <p>{m.desc}</p>
                  <ul className="ed-modality-list">
                    {m.items.map(item => <li key={item}><i className="fas fa-check" />{item}</li>)}
                  </ul>
                  <Link to="/contactos" className="ed-modality-cta">Inscribirme</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
