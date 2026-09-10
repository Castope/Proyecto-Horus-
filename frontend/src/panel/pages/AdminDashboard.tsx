import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import logo from '../../assets/images/logo-horus.png';
import { useAdminAuth } from '../context';
import { resources } from '../types/workspace';
import PanelIcon from '../components/PanelIcon';
import PanelOverview from '../components/PanelOverview';
import ResourceManager from '../components/ResourceManager';
import PanelSettings from '../components/PanelSettings';

export default function AdminDashboard() {
  const { user, logout } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const requested = location.pathname === '/admin/messages' ? 'mensajes' : params.get('section') || 'resumen';
  const section = resources[requested] || requested === 'ajustes' ? requested : 'resumen';
  const [menu, setMenu] = useState(false);
  const title = resources[section]?.label || (section === 'ajustes' ? 'Empresa' : 'Resumen');
  useEffect(() => { document.title = title + ' — Panel Horus'; setMenu(false); window.scrollTo(0, 0); }, [title]);
  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setMenu(false); };
    window.addEventListener('keydown', close); return () => window.removeEventListener('keydown', close);
  }, []);
  const go = (value: string, create = false) => {
    navigate(value === 'mensajes' && !create ? '/admin/messages' : '/admin/dashboard?section=' + value + (create ? '&crear=1' : ''));
    setMenu(false);
  };
  const nav = (key: string, text: string, icon: string) => <button key={key} className={'hp-nav-item' + (section === key ? ' is-active' : '')} aria-current={section === key ? 'page' : undefined} onClick={() => go(key)}><PanelIcon name={icon} /><span>{text}</span>{section === key && <span className="hp-nav-dot" />}</button>;
  return <div className="hp-shell">
    <a className="hp-skip" href="#panel-content">Saltar al contenido</a>
    {menu && <button className="hp-menu-overlay" aria-label="Cerrar menú" onClick={() => setMenu(false)} />}
    <aside id="panel-sidebar" className={'hp-sidebar' + (menu ? ' is-open' : '')}>
      <Link className="hp-brand" to="/"><img src={logo} alt="Horus Group" /><div><strong>HORUS<span>GROUP</span></strong><small>Espacio administrativo</small></div></Link>
      <div className="hp-workspace-label"><span className="hp-workspace-mark">H</span><div><strong>Horus Group SRL</strong><small>Tecnología y formación</small></div></div>
      <nav aria-label="Navegación del panel"><p className="hp-nav-label">PRINCIPAL</p>{nav('resumen', 'Resumen', 'home')}
        <p className="hp-nav-label">GESTIÓN DE CONTENIDO</p>{['cursos', 'servicios', 'galeria', 'faq', 'contenido'].map(key => nav(key, resources[key].label, resources[key].icon))}
        <p className="hp-nav-label">ATENCIÓN Y EMPRESA</p>{nav('mensajes', 'Mensajes', 'mail')}{nav('ajustes', 'Información de empresa', 'settings')}</nav>
      <div className="hp-sidebar-bottom"><a href="/" target="_blank" rel="noreferrer"><PanelIcon name="arrow" />Visitar sitio web</a><button onClick={() => { logout(); navigate('/admin/login'); }}><PanelIcon name="logout" />Cerrar sesión</button></div>
      <div className="hp-profile"><span className="hp-avatar">{user?.nombre?.charAt(0).toUpperCase()}</span><div><strong>{user?.nombre}</strong><small>{user?.email}</small></div></div>
    </aside>
    <div className="hp-body"><header className="hp-topbar"><div><button className="hp-icon-btn hp-menu-toggle" aria-label={menu ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={menu} aria-controls="panel-sidebar" onClick={() => setMenu(!menu)}><PanelIcon name="menu" /></button><span className="hp-breadcrumb">Mi espacio <span>/</span> <strong>{title}</strong></span></div><div><span className="hp-date">{new Date().toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })}</span><span className="hp-topbar-divider" /><span className="hp-avatar">{user?.nombre?.charAt(0).toUpperCase()}</span></div></header>
      <main id="panel-content" className="hp-main">{section === 'resumen' ? <PanelOverview go={go} /> : section === 'ajustes' ? <PanelSettings /> :
        <ResourceManager key={section + (params.get('crear') || '')} resource={resources[section]} autoCreate={params.get('crear') === '1'} />}</main>
      <footer className="hp-footer"><span>© {new Date().getFullYear()} Horus Group SRL</span><span>Hecho para conectar tecnología y personas.</span></footer>
    </div>
  </div>;
}
