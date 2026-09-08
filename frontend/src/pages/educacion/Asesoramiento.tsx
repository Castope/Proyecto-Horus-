import { useEffect } from 'react'
import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import useFadeUp from '../../hooks/useFadeUp'

import imgAsesoria from '../../assets/images/asesoramiento/asesoramiento2.jpg'

const typeStyle = (color: string, background: string): CSSProperties => ({
  ['--tc' as string]: color,
  ['--tcb' as string]: background,
})

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
              <Link to="/contactos" className="btn-coral"><i className="fas fa-calendar-check" /> Agendar consulta gratis</Link>
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

      <section className="ed-types" id="ed-detail">
        <div className="container">
          <div className="ed-section-head fade-up">
            <span className="ed-eyebrow">Tipos de asesoramiento</span>
            <h2>¿En qué área<br />puedo ayudarte?</h2>
          </div>
          <div className="ed-types-grid">
            {[
              { color:'#4F46E5', bg:'#EEF2FF', icon:'fa-graduation-cap', title:'Asesoramiento Educativo',   desc:'Tesis, trabajos de grado, diseño curricular y evaluación de programas académicos con metodología rigurosa.', items:['Metodología de investigación','Estructura y redacción','Acompañamiento continuo'] },
              { color:'#FF6B47', bg:'#FFF1EE', icon:'fa-briefcase',       title:'Asesoramiento Empresarial', desc:'Estrategia, gestión financiera, liderazgo y optimización de procesos para que tu organización crezca.',     items:['Plan estratégico','Gestión de equipos','Resultados medibles'] },
              { color:'#059669', bg:'#ECFDF5', icon:'fa-balance-scale',   title:'Asesoramiento Legal',       desc:'Orientación jurídica especializada para personas, empresas e instituciones que necesitan seguridad legal.',  items:['Asesoría especializada','Documentación legal','Respaldo profesional'] },
            ].map(t => (
              <div key={t.title} className="ed-type-card fade-up" style={typeStyle(t.color, t.bg)}>
                <div className="ed-type-icon"><i className={`fas ${t.icon}`} /></div>
                <h3>{t.title}</h3>
                <p>{t.desc}</p>
                <ul className="ed-type-list">
                  {t.items.map(item => <li key={item}><i className="fas fa-check" />{item}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ed-benefits">
        <div className="container">
          <div className="ed-section-head fade-up">
            <span className="ed-eyebrow">Por qué elegirnos</span>
            <h2>Lo que nos hace<br />diferentes</h2>
          </div>
          <div className="ed-benefits-grid">
            {[
              { n:'01', icon:'fa-user-check',  title:'Consultores especializados', desc:'Equipo con formación académica y experiencia práctica en gestión institucional y empresarial.' },
              { n:'02', icon:'fa-puzzle-piece', title:'Soluciones a medida',        desc:'Cada propuesta es diseñada específicamente para las necesidades y contexto de tu organización.' },
              { n:'03', icon:'fa-chart-bar',   title:'Resultados medibles',        desc:'Establecemos indicadores claros y hacemos seguimiento continuo para garantizar el impacto real.' },
              { n:'04', icon:'fa-handshake',   title:'Acompañamiento real',        desc:'No solo entregamos un informe: te acompañamos en la implementación y ajuste de las soluciones.' },
            ].map(b => (
              <div key={b.n} className="ed-benefit fade-up">
                <div className="ed-benefit-num">{b.n}</div>
                <div className="ed-benefit-icon"><i className={`fas ${b.icon}`} /></div>
                <h3>{b.title}</h3>
                <p>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
