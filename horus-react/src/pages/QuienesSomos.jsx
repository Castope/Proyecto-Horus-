import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import useFadeUp from '../hooks/useFadeUp'

import photoMain     from '../assets/images/somos/marco 2.png'
import photoMarco    from '../assets/images/somos/marco 2.png'
import photoMilagros from '../assets/images/somos/milagros.jpeg'
import photoMonica   from '../assets/images/somos/monica.jpeg'
import photoCarlos   from '../assets/images/somos/persona2.png'
import photoAna      from '../assets/images/somos/Persona4.jpeg'
import photologo3 from '../assets/images/somos/logo 3.jpeg'

function NtdCard({ img, name, role, bio, featured, index, open, onToggle }) {
  const [hovered, setHovered] = useState(false)
  const [pos, setPos] = useState({ x: 50, y: 50 })

  const handleMove = e => {
    const rect = e.currentTarget.getBoundingClientRect()
    setPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    })
  }

  return (
    <div
      className={`ntd-card${featured ? ' ntd-featured' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={handleMove}
      onClick={onToggle}
      style={{ cursor: 'pointer' }}
    >
      {hovered && (
        <div className="ntd-spotlight" style={{
          background: `radial-gradient(200px circle at ${pos.x}% ${pos.y}%, rgba(201,168,76,.12) 0%, transparent 70%)`
        }} />
      )}
      <span className="ntd-num">0{index}</span>
      <div className="ntd-photo-wrap">
        <img src={img} alt={name} className="ntd-photo" />
        {featured && <div className="ntd-crown"><i className="fas fa-crown" /></div>}
      </div>
      <div className="ntd-info">
        <p className="ntd-role">{role}</p>
        <h4 className="ntd-name">{name}</h4>
        {open && <p className="ntd-bio">{bio}</p>}
        <div className="ntd-toggle-hint"><i className={`fas fa-chevron-${open ? 'up' : 'down'}`} /></div>
      </div>
      <div className="ntd-socials">
        <a href="https://www.facebook.com/share/174BEdCReB/" target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}>
          <i className="fab fa-facebook-f" />
        </a>
        <a href="https://wa.me/51927582305" target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}>
          <i className="fab fa-whatsapp" />
        </a>
      </div>
      <div className="ntd-line" />
    </div>
  )
}

export default function QuienesSomos() {
  useFadeUp()
  useEffect(() => { document.title = 'Nosotros — Horus Group SRL' }, [])
  const [openIndex, setOpenIndex] = useState(null)

  const members = [
    { img: photoMarco,    name: 'Marco Alvarez',     role: 'Fundador & Director General', featured: true, bio: 'Profesional de Economía de la Universidad Nacional de Cajamarca. Experiencia en manejo de personal, trabajo en equipo. Docente en institutos de educación superior en los cursos de sociedad y economía, proyectos de investigación, taller de competencias profesionales entre otros.' },
    { img: photoMilagros, name: 'Milagros Villegas', role: 'Secretaria',                  bio: 'Profesional de enfermería técnica, con experiencia en ventas y trato al cliente entre otros.' },
    { img: photoMonica,   name: 'Mònica Monzòn',    role: 'Coordinadora Institucional',  bio: 'Profesional de Enfermería por la Universidad Nacional de Cajamarca. Maestra en Ciencias con mención en Salud Ocupacional y Ambiental por la Universidad Privada Antenor Orrego - Trujillo. Actualmente labora en el Hospital Regional Docente de Cajamarca en la unidad de cuidados intensivos (UCI).' },
    { img: photoCarlos,   name: 'Humberto Camacho',  role: 'Administrativo',              bio: 'Responsable de la organización interna y coordinación operativa de la empresa.' },
    { img: photoAna,      name: 'Karen Tàvara',      role: 'Asesora Legal',               bio: 'Profesional en Derecho por la Universidad Privada Antonio Guillermo Urrelo. Con sólida experiencia en el ejercicio legal y en la docencia. Ha desempeñado funciones como abogada en diversas instituciones públicas.' },
  ]

  return (
    <>
      <section className="ns-intro">
        <div className="container ns-intro-wrap">
          <div className="ns-left fade-up">
            <div className="ns-photo-stack">  
              <img className="ns-photo-main" src={photoMain} alt="Horus Group" />
              <img className="ns-photo-sec"  src={photologo3 }  alt="Equipo" />
              <div className="ns-photo-badge">
                <i className="fas fa-map-marker-alt" />
                <span>Cajamarca, Perú</span>
              </div>
            </div>
            <div className="ns-quick-facts">
              <div className="ns-qf"><span>2019</span><p>Año de fundación</p></div>
              <div className="ns-qf"><span>400+</span><p>Personas formadas</p></div>
              <div className="ns-qf"><span>6</span><p>Convenios activos</p></div>
            </div>
          </div>
          <div className="ns-right fade-up">
            <div className="ns-intro-label">Hola, somos</div>
            <h1 className="ns-intro-title">Horus Group <span>SRL</span></h1>
            <div className="ns-intro-body">
              <p className="ns-intro-lead">Una empresa cajamarquina que nació con una idea simple: que la tecnología y la educación de calidad no deberán ser privilegio de las grandes ciudades.</p>
              <p>Desde 2019 trabajamos cada día para llevar soluciones tecnológicas reales y formación profesional certificada a empresas, instituciones y personas de nuestra región.</p>
              <p>No somos una multinacional. Somos tu vecino, tu aliado local, el equipo que conoce Cajamarca porque vivimos aquí.</p>
            </div>
            <Link to="/contactos" className="btn-coral ns-intro-cta">
              <i className="fas fa-paper-plane" /> Hablemos
            </Link>
          </div>
        </div>
      </section>

      <section className="ns-beliefs">
        <div className="container">
          <div className="ns-beliefs-header fade-up">
            <span className="ns-chip">Nuestros valores</span>
            <h2>Esto es lo que<br />creemos</h2>
          </div>
          <div className="ns-beliefs-list">
            {[
              { n:'01', icon:'fa-medal',          color:'#4F46E5', bg:'#EEF2FF', title:'Creemos en la excelencia sin excusas',         desc:'Cada proyecto, cada capacitación, cada instalación técnica debe ser lo mejor que podemos dar. No hay términos medios cuando se trata de la confianza de nuestros clientes.' },
              { n:'02', icon:'fa-handshake',       color:'#FF6B47', bg:'#FFF1EE', title:'Creemos que la confianza se gana con hechos',   desc:'No prometemos lo que no podemos cumplir. Somos transparentes, puntuales y honestos. Si decimos que lo hacemos, lo hacemos.' },
              { n:'03', icon:'fa-graduation-cap',  color:'#059669', bg:'#ECFDF5', title:'Creemos en el poder de la educación local',    desc:'Cajamarca tiene profesionales brillantes que merecen formación de primer nivel. Por eso trabajamos con los mejores colegios profesionales de la región.' },
              { n:'04', icon:'fa-lightbulb',       color:'#7C3AED', bg:'#F5F3FF', title:'Creemos que la tecnología debe ser accesible', desc:'Las soluciones tecnológicas de calidad no son solo para las grandes empresas. Trabajamos para que cualquier negocio o institución en Cajamarca pueda acceder a ellas.' },
            ].map(b => (
              <div key={b.n} className="ns-belief fade-up">
                <div className="ns-belief-num">{b.n}</div>
                <div className="ns-belief-content">
                  <h3>{b.title}</h3>
                  <p>{b.desc}</p>
                </div>
                <div className="ns-belief-icon" style={{ color: b.color, background: b.bg }}>
                  <i className={`fas ${b.icon}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ns-purpose">
        <div className="container ns-purpose-grid">
          <div className="ns-purpose-card ns-mission fade-up">
            <div className="ns-purpose-icon-top"><i className="fas fa-bullseye" /></div>
            <div className="ns-purpose-tag">Nuestra Misión</div>
            <p className="ns-purpose-text">Impulsar el desarrollo de Cajamarca brindando tecnología innovadora y formación profesional de calidad, con compromiso, excelencia y responsabilidad social.</p>
            <div className="ns-purpose-deco" />
          </div>
          <div className="ns-purpose-card ns-vision fade-up">
            <div className="ns-purpose-icon-top ns-icon-vision"><i className="fas fa-eye" /></div>
            <div className="ns-purpose-tag">Nuestra Visión</div>
            <p className="ns-purpose-text">Ser la empresa líder en tecnología y educación profesional en la región Cajamarca para el 2030, reconocida por su impacto positivo en la comunidad.</p>
            <div className="ns-purpose-deco" />
          </div>
        </div>
      </section>

      <section className="ns-team-dark">
        <div className="container">
          <div className="ntd-header fade-up">
            <div className="ntd-header-left">
              <span className="ntd-eyebrow"><span className="ntd-dot" />El equipo</span>
              <h2 className="ntd-title">Las personas que<br />hacen posible <em>todo</em></h2>
            </div>
            <p className="ntd-subtitle">No somos logos ni cargos. Somos personas reales con un compromiso genuino con Cajamarca y con cada cliente.</p>
          </div>
          <div className="ntd-grid">
            {members.map((m, i) => (
              <NtdCard
                key={m.name} {...m} index={i + 1}
                open={openIndex === i}
                onToggle={() => setOpenIndex(openIndex === i ? null : i)}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
