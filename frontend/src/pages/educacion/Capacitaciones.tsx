import { useEffect } from 'react'
import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import useFadeUp from '../../hooks/useFadeUp'

import imgCap from '../../assets/images/capacitaciones/capacitaciones.jpg'

const cardStyle = (color: string, background: string, dark: string): CSSProperties => ({
  ['--pc' as string]: color,
  ['--pcb' as string]: background,
  ['--pcd' as string]: dark,
})

const PROGRAMAS = [
  { color:'#4F46E5', bg:'#EEF2FF', dark:'#3730a3', icon:'fa-heartbeat',   n:'01', area:'Salud',          title:'Salud y Primeros Auxilios',    desc:'Para enfermeros, obstetras y personal médico. Prácticas de primeros auxilios y RCP certificadas.', items:['Primeros auxilios avanzados','RCP y desfibrilación','Atención de emergencias'], cert:'Colegio de Enfermeros' },
  { color:'#FF6B47', bg:'#FFF1EE', dark:'#c2410c', icon:'fa-balance-scale', n:'02', area:'Derecho',        title:'Derecho y Gestión Legal',      desc:'Actualización jurídica para abogados. Temas de actualidad legal, procesal y gestión de casos.',    items:['Derecho procesal actualizado','Ética profesional','Gestión de casos'],          cert:'Colegio de Abogados' },
  { color:'#059669', bg:'#ECFDF5', dark:'#047857', icon:'fa-chart-pie',    n:'03', area:'Administración', title:'Administración y Economía',    desc:'Para administradores y economistas: gestión financiera, análisis económico y herramientas de gestión.', items:['Gestión financiera empresarial','Análisis económico','Herramientas de gestión'], cert:'CORLAD y CEC' },
  { color:'#7C3AED', bg:'#F5F3FF', dark:'#6d28d9', icon:'fa-laptop',       n:'04', area:'Tecnología',     title:'Tecnología e Informática',     desc:'Herramientas digitales, ofimática avanzada, ciberseguridad y transformación digital para profesionales.', items:['Ofimática avanzada','Ciberseguridad básica','Transformación digital'],          cert:'Horus Group SRL' },
]

export default function Capacitaciones() {
  useFadeUp()
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
              <Link to="/contactos" className="btn-coral"><i className="fas fa-graduation-cap" /> Inscribirme ahora</Link>
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

      <section className="ed-programs" id="ed-detail">
        <div className="container">
          <div className="ed-section-head fade-up">
            <span className="ed-eyebrow">Programas</span>
            <h2>Elige tu área<br />de capacitación</h2>
            <p className="ed-section-sub">Certificaciones oficiales avaladas por colegios profesionales reconocidos a nivel nacional.</p>
          </div>
          <div className="ed-prog-grid">
            {PROGRAMAS.map(p => (
              <div key={p.n} className="ed-prog-card fade-up" style={cardStyle(p.color, p.bg, p.dark)}>
                <div className="ed-prog-card-bg" />
                <div className="ed-prog-card-top">
                  <div className="ed-prog-card-icon"><i className={`fas ${p.icon}`} /></div>
                  <div className="ed-prog-card-num">{p.n}</div>
                </div>
                <div className="ed-prog-card-body">
                  <div className="ed-prog-card-area">{p.area}</div>
                  <h3>{p.title}</h3>
                  <p>{p.desc}</p>
                  <ul className="ed-prog-card-list">
                    {p.items.map(item => <li key={item}><i className="fas fa-check-circle" />{item}</li>)}
                  </ul>
                </div>
                <div className="ed-prog-card-footer">
                  <div className="ed-prog-card-cert"><i className="fas fa-award" /> {p.cert}</div>
                  <Link to="/contactos" className="ed-prog-card-btn">Inscribirme <i className="fas fa-arrow-right" /></Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
