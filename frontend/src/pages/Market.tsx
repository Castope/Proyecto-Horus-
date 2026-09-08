import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import useFadeUp from '../hooks/useFadeUp'
import logoHorus from '../assets/images/logo-horus.png'

export default function Market() {
  useFadeUp()
  useEffect(() => { document.title = 'Horus Market — Próximamente' }, [])

  return (
    <section className="mkt-hero">
      <div className="mkt-particles">
        {[...Array(8)].map((_, i) => <span key={i} />)}
      </div>

      <div className="mkt-content fade-up">
        <div className="mkt-logo-wrap">
          <img src={logoHorus} alt="Horus Market" />
        </div>
        <div className="mkt-tag">
          <span className="mkt-dot" />
          En construcción
        </div>
        <h1>Horus <span>Market</span></h1>
        <p>Estamos construyendo algo increíble. Pronto podrás adquirir cursos, materiales educativos y productos tecnológicos directamente desde nuestra tienda online.</p>

        <div className="mkt-pills">
          <div className="mkt-pill"><i className="fas fa-graduation-cap" /><span>Cursos online</span></div>
          <div className="mkt-pill"><i className="fas fa-book" /><span>Material educativo</span></div>
          <div className="mkt-pill"><i className="fas fa-microchip" /><span>Productos tecnológicos</span></div>
          <div className="mkt-pill"><i className="fas fa-certificate" /><span>Certificaciones</span></div>
        </div>

        <div className="mkt-actions">
          <Link to="/contactos" className="btn-coral">
            <i className="fas fa-bell" /> Notificarme cuando esté listo
          </Link>
          <Link to="/" className="mkt-back">
            <i className="fas fa-arrow-left" /> Volver al inicio
          </Link>
        </div>
      </div>
    </section>
  )
}
