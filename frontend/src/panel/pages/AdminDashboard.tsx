import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import HorusBrand from '../components/HorusBrand';
import { useAdminAuth } from '../context';
import { resources } from '../types/workspace';
import PanelIcon from '../components/PanelIcon';
import PanelOverview from '../components/PanelOverview';
import ResourceManager from '../components/ResourceManager';
import PanelSettings from '../components/PanelSettings';
import MessageInbox from '../components/workspace/MessageInbox';
import CommunityRecords from '../components/workspace/CommunityRecords';
import PanelAccounts from '../components/PanelAccounts';
import PanelQuotes from '../components/PanelQuotes';
import '../styles/workspace.css';

const mobileQuery = '(max-width: 760px)';
const subscribeToViewport = (callback: () => void) => {
  const query = window.matchMedia(mobileQuery);
  query.addEventListener('change', callback);
  return () => query.removeEventListener('change', callback);
};

export default function AdminDashboard() {
  const { user, logout } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const requested = location.pathname === '/admin/messages' ? 'mensajes' : params.get('section') || 'resumen';
  const section = resources[requested] || ['ajustes', 'newsletter', 'reclamaciones', 'cotizaciones', 'cuentas'].includes(requested) ? requested : 'resumen';
  const [menuLocation, setMenuLocation] = useState<string | null>(null);
  const menu = menuLocation === location.key;
  const mobile = useSyncExternalStore(subscribeToViewport, () => window.matchMedia(mobileQuery).matches, () => false);
  const sidebarRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!menu || !mobile) return;
    const sidebar = sidebarRef.current;
    const trigger = menuButtonRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    sidebar?.querySelector<HTMLElement>('a, button')?.focus();
    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const elements = sidebar?.querySelectorAll<HTMLElement>('a[href], button:not(:disabled)');
      if (!elements?.length) return;
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', trapFocus);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', trapFocus);
      trigger?.focus();
    };
  }, [menu, mobile]);
  const title = resources[section]?.label || (section === 'cuentas' ? 'Cuentas y acceso' : section === 'cotizaciones' ? 'Cotizaciones' : section === 'ajustes' ? 'Empresa' : section === 'newsletter' ? 'Suscripciones' : section === 'reclamaciones' ? 'Reclamaciones' : 'Resumen');
  useEffect(() => { document.title = title + ' — Panel Horus'; window.scrollTo(0, 0); }, [title]);
  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setMenuLocation(null); };
    window.addEventListener('keydown', close); return () => window.removeEventListener('keydown', close);
  }, []);
  const go = (value: string, create = false) => {
    navigate(value === 'mensajes' && !create ? '/admin/messages' : '/admin/dashboard?section=' + value + (create ? '&crear=1' : ''));
    setMenuLocation(null);
  };
  const nav = (key: string, text: string, icon: string) => <button key={key} className={'hp-nav-item' + (section === key ? ' is-active' : '')} aria-current={section === key ? 'page' : undefined} onClick={() => go(key)}><PanelIcon name={icon} /><span>{text}</span>{section === key && <span className="hp-nav-dot" />}</button>;
  return <div className="hp-shell">
    <a className="hp-skip" href="#panel-content">Saltar al contenido</a>
    {menu && <button className="hp-menu-overlay" aria-label="Cerrar menú" onClick={() => setMenuLocation(null)} />}
    <aside ref={sidebarRef} inert={mobile && !menu} id="panel-sidebar" className={'hp-sidebar' + (menu ? ' is-open' : '')}>
      <div className="hp-brand-row"><Link className="hp-brand" to="/" aria-label="Ir al inicio de Horus Group"><HorusBrand light /></Link><button className="hp-sidebar-close" aria-label="Cerrar menú" onClick={() => setMenuLocation(null)}><PanelIcon name="close" /></button></div>
      <div className="hp-workspace-label"><span className="hp-workspace-mark"><PanelIcon name="shield" size={18} /></span><div><strong>Panel de administración</strong><small>Tu espacio de trabajo</small></div></div>
      <nav aria-label="Navegación del panel"><p className="hp-nav-label">PRINCIPAL</p>{nav('resumen', 'Resumen', 'home')}
        <p className="hp-nav-label">GESTIÓN DE CONTENIDO</p>{['cursos', 'servicios', 'galeria', 'faq', 'contenido'].map(key => nav(key, resources[key].label, resources[key].icon))}
        <p className="hp-nav-label">ATENCIÓN Y EMPRESA</p>{nav('mensajes', 'Mensajes', 'mail')}{nav('cotizaciones', 'Cotizaciones', 'file')}{nav('newsletter', 'Suscripciones', 'user')}{nav('reclamaciones', 'Reclamaciones', 'file')}{nav('ajustes', 'Información de empresa', 'settings')}{nav('cuentas', 'Cuentas y acceso', 'user')}</nav>
      <div className="hp-sidebar-bottom"><Link to="/admin/register"><PanelIcon name="user-plus" />Crear administrador</Link><a href="/" target="_blank" rel="noreferrer"><PanelIcon name="arrow" />Visitar sitio web</a><button onClick={() => { logout(); navigate('/admin/login'); }}><PanelIcon name="logout" />Cerrar sesión</button></div>
      <div className="hp-profile"><span className="hp-avatar">{user?.nombre?.charAt(0).toUpperCase()}</span><div><strong>{user?.nombre}</strong><small>{user?.email}</small></div></div>
    </aside>
    <div className="hp-body" inert={mobile && menu}><header className="hp-topbar"><div><button ref={menuButtonRef} className="hp-icon-btn hp-menu-toggle" aria-label={menu ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={menu} aria-controls="panel-sidebar" onClick={() => setMenuLocation(menu ? null : location.key)}><PanelIcon name="menu" /></button><span className="hp-breadcrumb">Mi espacio <span>/</span> <strong>{title}</strong></span></div><div><span className="hp-date"><PanelIcon name="calendar" size={16} />{new Date().toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })}</span><span className="hp-topbar-divider" /><span className="hp-avatar">{user?.nombre?.charAt(0).toUpperCase()}</span></div></header>
      <main id="panel-content" className="hp-main" tabIndex={-1}>{section === 'resumen' ? <PanelOverview go={go} /> : section === 'cuentas' ? <PanelAccounts /> : section === 'cotizaciones' ? <PanelQuotes /> : section === 'ajustes' ? <PanelSettings /> : section === 'newsletter' || section === 'reclamaciones' ? <CommunityRecords key={section} kind={section} /> : section === 'mensajes' && params.get('crear') !== '1' && params.get('vista') !== 'tabla' ? <MessageInbox /> :
        <ResourceManager key={section + (params.get('crear') || '') + (params.get('estado') || '') + (params.get('vista') || '')} resource={resources[section]} autoCreate={params.get('crear') === '1'} />}</main>
      <footer className="hp-footer"><span>© {new Date().getFullYear()} Horus Group SRL</span><span>Hecho para conectar tecnología y personas.</span></footer>
    </div>
  </div>;
}
