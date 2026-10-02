import ServiceSections from '../../components/ServiceSections'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import useFadeUp from '../../hooks/useFadeUp'

import imgAsesoria from '../../assets/images/asesoramiento/asesoramiento2.jpg'


export default function Asesoramiento() {
  useFadeUp()
  useEffect(() => { document.title = 'Asesoramiento Profesional — Horus Group SRL' }, [])

  return (
    <>
      <section className="ed-hero ed-hero-asesoria">
        <div className="container ed-hero-inner">
          <div className="ed-hero-text fade-up">
            <div className="ed-hero-tag"><i className="fas fa-user-tie" /> Educación</div>
            <h1>Te guío para<br />que llegues<br /><span>más lejos</span></h1>
            <p>Soy el asesoramiento profesional. No te digo qué hacer, te ayudo a encontrar el mejor camino para tu proyecto, empresa o carrera.</p>
            <div className="ed-hero-btns">
              <Link to="/contactos?asunto=Asesoramiento" className="btn-coral"><i className="fas fa-calendar-check" /> Agendar consulta gratis</Link>
              <a href="#ed-detail" className="ed-ghost"><i className="fas fa-arrow-down" /> Ver tipos</a>
            </div>
          </div>
          <div className="ed-hero-visual fade-up">
            <div className="ed-hero-img">
              <img src={imgAsesoria} alt="Asesoramiento Profesional" />
            </div>
            <div className="ed-hero-card">
              <i className="fas fa-quote-left" />
              <p>"El asesoramiento de Horus Group transformó la manera en que gestionamos nuestros programas."</p>
              <span>— Directivo, Colegio de Enfermeros</span>
            </div>
          </div>
        </div>
      </section>

      <ServiceSections category="asesoramiento" />

    </>
  )
}
