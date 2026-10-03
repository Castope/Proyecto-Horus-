import CatalogoCursos from '../../components/CatalogoCursos'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'

import imgCap from '../../assets/images/capacitaciones/capacitaciones.jpg'



export default function Capacitaciones() {
  useEffect(() => { document.title = 'Capacitaciones — Horus Group SRL' }, [])

  return (
    <>
      <section className="ed-hero ed-hero-capacitaciones">
        <div className="container ed-hero-inner">
          <div className="ed-hero-text fade-up">
            <div className="ed-hero-tag"><i className="fas fa-chalkboard-teacher" /> Educación</div>
            <h1>Formo<br />profesionales<br /><span>de verdad</span></h1>
            <p>Soy las capacitaciones. No solo te doy un certificado, te doy conocimiento real que puedes aplicar desde el primer día.</p>
            <div className="ed-hero-btns">
              <Link to="/contactos?asunto=Capacitaciones" className="btn-coral"><i className="fas fa-graduation-cap" /> Consultar capacitaciones</Link>
              <a href="#ed-detail" className="ed-ghost"><i className="fas fa-arrow-down" /> Ver programas</a>
            </div>
          </div>
          <div className="ed-hero-visual fade-up">
            <div className="ed-hero-img"><img src={imgCap} alt="Capacitaciones" /></div>
            <div className="ed-hero-card">
              <i className="fas fa-certificate" />
              <p>"Certificación oficial avalada por colegios profesionales reconocidos a nivel nacional."</p>
              <span>— Horus Group SRL</span>
            </div>
          </div>
        </div>
      </section>

      <CatalogoCursos tipo="capacitacion" />
    </>
  )
}
