import { useState, useEffect, useRef, useSyncExternalStore } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import logoHorus from '../assets/images/logo-horus.png'
import useReducedMotion from '../hooks/useReducedMotion'

const NAV_ITEMS = [
  { label: 'Inicio',    to: '/' },
  { label: 'Quiénes somos', to: '/quienes-somos' },
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
]

const subscribeViewport = (callback: () => void) => { const media = window.matchMedia('(max-width: 1024px)'); media.addEventListener('change', callback); return () => media.removeEventListener('change', callback); }
export default function Navbar() {
  const [scrolled,    setScrolled]    = useState(false)
  const [menuPath, setMenuPath] = useState<string | null>(null)
  const [drop, setDrop] = useState<{ path: string; label: string } | null>(null)
  const [closingDrop, setClosingDrop] = useState<{ path: string; label: string } | null>(null)
  const reducedMotion = useReducedMotion()
  const { pathname } = useLocation()
  const navRef = useRef<HTMLElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const menuOpen = menuPath === pathname
  const openDrop = drop?.path === pathname ? drop.label : null
  const mobile = useSyncExternalStore(subscribeViewport, () => window.matchMedia('(max-width: 1024px)').matches, () => false)


  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    const initial = window.requestAnimationFrame(onScroll)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { window.cancelAnimationFrame(initial); window.removeEventListener('scroll', onScroll) }
  }, [])

  useEffect(() => {
    if (!menuOpen || !mobile) return
    const trigger = toggleRef.current
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    listRef.current?.querySelector<HTMLElement>('a,button')?.focus()
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !event.defaultPrevented) { setMenuPath(null); return }
      if (event.key !== 'Tab') return
      const links = Array.from(listRef.current?.querySelectorAll<HTMLElement>('a,button') || []).filter(el => el.getClientRects().length && !el.closest('[inert]'))
      const first=links[0], last=links[links.length-1]
      if (event.shiftKey && document.activeElement === first) {event.preventDefault(); toggleRef.current?.focus()}
      else if (!event.shiftKey && document.activeElement === last) {event.preventDefault(); toggleRef.current?.focus()}
      else if (document.activeElement === toggleRef.current) {event.preventDefault(); (event.shiftKey ? last : first)?.focus()}
    }
    document.addEventListener('keydown',keydown)
    return () => {document.body.style.overflow=previous;document.removeEventListener('keydown',keydown);trigger?.focus()}
  }, [menuOpen,mobile])

  useEffect(() => {
    if (!closingDrop) return
    const timer = window.setTimeout(() => setClosingDrop(null), reducedMotion ? 0 : 200)
    return () => window.clearTimeout(timer)
  }, [closingDrop, reducedMotion])

  const toggleDrop = (label: string) => {
    if (mobile && !reducedMotion && openDrop) setClosingDrop({ path: pathname, label: openDrop })
    else setClosingDrop(null)
    setDrop(openDrop === label ? null : { path: pathname, label })
  }

  return (
    <header className={`nav${scrolled ? ' scrolled' : ''}`} ref={navRef}>
      <div className="nav-inner">
        <Link to="/" className="nav-logo">
          <img src={logoHorus} alt="Horus Group" />
          <span>Horus Group SRL</span>
        </Link>

        <div
          className={`nav-overlay${menuOpen ? ' show' : ''}`}
          onClick={() => setMenuPath(null)}
        />

        <ul ref={listRef} id="public-navigation" inert={mobile && !menuOpen} className={`nav-links${menuOpen ? ' open' : ''}`}>
          {NAV_ITEMS.map(item =>
            item.children ? (
              <li
                key={item.label}
                className={`nav-drop${openDrop === item.label ? ' open' : ''}${closingDrop?.path === pathname && closingDrop.label === item.label && openDrop !== item.label ? ' is-closing' : ''}`}
                onKeyDown={event => {
                  if (event.key !== 'Escape' || openDrop !== item.label) return
                  event.preventDefault(); event.stopPropagation()
                  toggleDrop(item.label)
                  event.currentTarget.querySelector('button')?.focus()
                }}
              >
                <button type="button" aria-expanded={openDrop === item.label} aria-controls={"drop-"+item.label} onClick={() => toggleDrop(item.label)}>
                  {item.label}
                </button>
                <ul id={"drop-"+item.label} className="dropdown" inert={mobile && openDrop !== item.label}>
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
          ref={toggleRef}
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"} aria-expanded={menuOpen} aria-controls="public-navigation"
          onClick={() => setMenuPath(menuOpen ? null : pathname)}
        >
          <span /><span /><span />
        </button>
      </div>
    </header>
  )
}
