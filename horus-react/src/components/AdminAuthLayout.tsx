import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import panelImage from '../assets/images/videovigilancia/camera.webp';
import logo from '../assets/images/logo-horus.png';

interface AdminAuthLayoutProps {
  children: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
}

export default function AdminAuthLayout({ children, eyebrow, title, description }: AdminAuthLayoutProps) {
  return (
    <main className="admin-auth">
      <section className="admin-auth__showcase" aria-label="Horus Group">
        <img className="admin-auth__showcase-image" src={panelImage} alt="Sistema de videovigilancia de Horus Group" />
        <div className="admin-auth__showcase-overlay" />
        <Link className="admin-auth__brand" to="/" aria-label="Ir al inicio de Horus Group"><img src={logo} alt="Horus Group" /></Link>
        <div className="admin-auth__showcase-content">
          <span className="admin-auth__eyebrow">Horus Group</span>
          <h2>Gestión segura, siempre bajo control.</h2>
          <p>Administra el contenido de tu plataforma desde un espacio privado y protegido.</p>
        </div>
        <div className="admin-auth__showcase-footer"><span />Tecnología que protege</div>
      </section>
      <section className="admin-auth__form-side">
        <div className="admin-auth__form-wrap">
          <Link className="admin-auth__mobile-brand" to="/" aria-label="Ir al inicio de Horus Group"><img src={logo} alt="Horus Group" /></Link>
          <span className="admin-auth__eyebrow admin-auth__eyebrow--dark">{eyebrow}</span>
          <h1>{title}</h1>
          <p className="admin-auth__description">{description}</p>
          {children}
        </div>
      </section>
    </main>
  );
}
