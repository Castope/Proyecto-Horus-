import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import logoHorus from '../assets/images/logo-horus.png'

const NAV_ITEMS = [
  { label: 'Inicio',    to: '/' },
  { label: 'Nosotros',  to: '/quienes-somos' },
  {
    label: 'Tecnologías',
    children: [
      { label: 'Cableado Estructurado', to: '/tecnologias/cableado-estructurado', icon: 'fa-network-wired' },
      { label: 'Cámaras de Seguridad',  to: '/tecnologias/camaras-seguridad',     icon: 'fa-video' },
      { label: 'Soporte y Mantenimiento', to: '/tecnologias/soporte-mantenimiento', icon: 'fa-tools' },
    ],
  },
  {
    label: 'Educación',
    children: [
      { label: 'Asesoramiento',  to: '/educacion/asesoramiento',  icon: 'fa-user-tie' },
      { label: 'Capacitaciones', to: '/educacion/capacitaciones', icon: 'fa-chalkboard-teacher' },
      { label: 'Cursos',         to: '/educacion/cursos',         icon: 'fa-book-open' },
    ],
  },
  { label: 'Galería',  to: '/galeria' },
  { label: 'Market',   to: '/market' },
]

export default function Navbar() {
  const [scrolled,    setScrolled]    = useState(false)
  const [menuOpen,    setMenuOpen]    = useState(false)
  const [openDrop,    setOpenDrop]    = useState(null)
  const { pathname } = useLocation()
  const navRef = useRef(null)

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMenuOpen(false); setOpenDrop(null) }, [pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const toggleDrop = (label) =>
    setOpenDrop(prev => (prev === label ? null : label))

  return (
    <header className={`nav${scrolled ? ' scrolled' : ''}`} ref={navRef}>
      <div className="nav-inner">
        <Link to="/" className="nav-logo">
          <img src={logoHorus} alt="Horus Group" />
          <span>Horus Group SRL</span>
        </Link>

        <div
          className={`nav-overlay${menuOpen ? ' show' : ''}`}
          onClick={() => setMenuOpen(false)}
        />

        <ul className={`nav-links${menuOpen ? ' open' : ''}`}>
          {NAV_ITEMS.map(item =>
            item.children ? (
              <li
                key={item.label}
                className={`nav-drop${openDrop === item.label ? ' open' : ''}`}
              >
                <a
                  href="#"
                  onClick={e => { e.preventDefault(); toggleDrop(item.label) }}
                >
                  {item.label}
                </a>
                <ul className="dropdown">
                  {item.children.map(child => (
                    <li key={child.to}>
                      <NavLink to={child.to}>
                        <i className={`fas ${child.icon}`} />
                        {child.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </li>
            ) : (
              <li key={item.to}>
                <NavLink to={item.to}>{item.label}</NavLink>
              </li>
            )
          )}
          <li>
            <NavLink to="/contactos" className="nav-cta">Contáctanos</NavLink>
          </li>
        </ul>

        <button
          className={`nav-toggle${menuOpen ? ' open' : ''}`}
          aria-label="Menú"
          onClick={() => setMenuOpen(prev => !prev)}
        >
          <span /><span /><span />
        </button>
      </div>
    </header>
  )
}
