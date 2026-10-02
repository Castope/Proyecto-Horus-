import { Link } from 'react-router-dom'
import { useCompanySetting } from '../../context/companySettings'

export default function HomeLocation() {
  const setting = useCompanySetting()
  return (
    <section className="home-location">
      <div className="container">
        <div className="home-location-grid">
          <div className="home-location-info fade-up">
            <span className="home-eyebrow">Dónde estamos</span>
            <h2>Visítanos en Cajamarca</h2>
            <p>Estamos en el corazón de Cajamarca, listos para atenderte.</p>
            <div className="home-loc-items">
              <div className="home-loc-item">
                <div className="home-loc-icon"><i aria-hidden="true" className="fas fa-map-marker-alt" /></div>
                <div><strong>Dirección</strong><span>{setting('direccion', 'Jr. Jose Gálvez #322, Cajamarca')}</span></div>
              </div>
              <div className="home-loc-item">
                <div className="home-loc-icon"><i aria-hidden="true" className="fas fa-clock" /></div>
                <div><strong>Horario</strong><span>{setting('horario_atencion', 'Horario por confirmar')}</span></div>
              </div>
              <div className="home-loc-item">
                <div className="home-loc-icon"><i aria-hidden="true" className="fas fa-phone" /></div>
                <div><strong>Teléfono</strong><span>{setting('telefono_principal', '+51 927 582 305')}</span></div>
              </div>
            </div>
            <Link to="/contactos" className="home-button">
              <i aria-hidden="true" className="fas fa-paper-plane" /> Contáctanos
            </Link>
          </div>
          <div className="home-location-map fade-up">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d989.6682159535815!2d-78.5107197!3d-7.1637652!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x91b25b809bf9b7e3%3A0x70d5a58b14aa7eff!2sPlazuela%20Bolognesi!5e0!3m2!1ses-419!2spe!4v1772667902105!5m2!1ses-419!2spe"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación Horus Group"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
