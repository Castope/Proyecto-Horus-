import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 'var(--nav-h)', textAlign: 'center', padding: '120px 24px' }}>
      <div>
        <div style={{ fontSize: '6rem', fontWeight: 900, color: 'var(--indigo)', lineHeight: 1, marginBottom: 16 }}>404</div>
        <h1 style={{ fontWeight: 800, fontSize: '1.8rem', marginBottom: 12 }}>Página no encontrada</h1>
        <p style={{ color: 'var(--gray-600)', marginBottom: 32, maxWidth: 400, margin: '0 auto 32px' }}>
          La página que buscas no existe o fue movida.
        </p>
        <Link to="/" className="btn-coral">
          <i className="fas fa-home" /> Volver al inicio
        </Link>
      </div>
    </section>
  )
}
