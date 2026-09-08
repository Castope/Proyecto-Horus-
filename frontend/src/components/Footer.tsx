import { Link } from 'react-router-dom'
import logoHorus from '../assets/images/logo-horus.png'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="ix-footer-top">

          <div className="ix-footer-brand">
            <img src={logoHorus} alt="Horus Group" />
            <div className="ix-footer-name">Horus Group SRL</div>
            <div className="ix-footer-ruc">RUC: 20611010977</div>
            <p>Tecnología y formación profesional de calidad en Cajamarca, Perú.</p>
          </div>

          <div className="ix-footer-col">
            <h5 className="ix-footer-heading">Políticas</h5>
            <ul className="ix-footer-list">
              <li><Link to="/politicas/cookies">Políticas de Cookies</Link></li>
              <li><Link to="/politicas/devolucion">Políticas de Devolución</Link></li>
              <li><Link to="/politicas/privacidad">Políticas de Privacidad</Link></li>
              <li><Link to="/preguntas-frecuentes">Preguntas Frecuentes</Link></li>
            </ul>
          </div>

          <div className="ix-footer-col">
            <h5 className="ix-footer-heading">Contacto</h5>
            <ul className="footer-contact">
              <li><i className="fas fa-phone" />+51 927 582 305</li>
              <li><i className="fas fa-envelope" />horusgroupcajamarca@gmail.com</li>
              <li><i className="fas fa-map-marker-alt" />Jr. Jose Gálvez #322, Cajamarca</li>
            </ul>
          </div>

          <div className="ix-footer-col">
            <h5 className="ix-footer-heading">Síguenos</h5>
            <div className="ix-footer-social">
              <a href="https://www.facebook.com/share/174BEdCReB/" target="_blank" rel="noreferrer" className="ix-social-item">
                <span className="ix-social-icon ix-social-fb"><i className="fab fa-facebook-f" /></span>
                <span>Facebook</span>
              </a>
              <a href="https://wa.me/51927582305" target="_blank" rel="noreferrer" className="ix-social-item">
                <span className="ix-social-icon ix-social-wa"><i className="fab fa-whatsapp" /></span>
                <span>WhatsApp</span>
              </a>
              <a href="#" className="ix-social-item">
                <span className="ix-social-icon ix-social-yt"><i className="fab fa-youtube" /></span>
                <span>YouTube</span>
              </a>
            </div>
          </div>

        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Horus Group SRL. Todos los derechos reservados.</p>
          <Link to="/libro-reclamaciones" className="footer-libro-link">
            <i className="fas fa-book-open" /> Libro de Reclamaciones
          </Link>
        </div>
      </div>
    </footer>
  )
}
