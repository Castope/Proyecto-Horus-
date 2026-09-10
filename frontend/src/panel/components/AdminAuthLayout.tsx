import { useEffect, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import panelImage from '../../assets/images/videovigilancia/camera.webp';
import logo from '../../assets/images/logo-horus.png';

interface AdminAuthLayoutProps {
  children: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
}

export default function AdminAuthLayout({ children, eyebrow, title, description }: AdminAuthLayoutProps) {
  useEffect(() => {
    document.title = `${title} — Horus Group`;
  }, [title]);

  return (
    <main className="admin-auth">
      <section className="admin-auth__showcase" aria-label="Horus Group">
        <img className="admin-auth__showcase-image" src={panelImage} alt="" />
        <div className="admin-auth__showcase-overlay" />
        <Link className="admin-auth__brand" to="/" aria-label="Ir al inicio de Horus Group">
          <img src={logo} alt="Horus Group" />
        </Link>
        <div className="admin-auth__showcase-content">
          <span className="admin-auth__eyebrow">Espacio de administración</span>
          <h2>Grandes ideas.<br />Todo en <em>un lugar.</em></h2>
          <p>Conecta con tu comunidad y dale vida al contenido de Horus Group.</p>
          <div className="admin-auth__capabilities" aria-label="Funciones del panel">
            <span>Gestión de contenido</span>
            <span>Consultas y mensajes</span>
          </div>
        </div>
        <div className="admin-auth__showcase-footer">
          <span>TECNOLOGÍA + FORMACIÓN</span>
          <span>Horus Group SRL</span>
        </div>
      </section>
      <section className="admin-auth__form-side" aria-labelledby="auth-title">
        <Link className="admin-auth__back" to="/"><span aria-hidden="true">←</span> Volver al sitio web</Link>
        <div className="admin-auth__form-wrap">
          <Link className="admin-auth__mobile-brand" to="/" aria-label="Ir al inicio de Horus Group">
            <img src={logo} alt="Horus Group" />
          </Link>
          <span className="admin-auth__eyebrow admin-auth__eyebrow--dark">{eyebrow}</span>
          <h1 id="auth-title">{title}</h1>
          <p className="admin-auth__description">{description}</p>
          {children}
        </div>
        <p className="admin-auth__footer">© {new Date().getFullYear()} Horus Group SRL <span aria-hidden="true">·</span> Panel administrativo</p>
      </section>
    </main>
  );
}
