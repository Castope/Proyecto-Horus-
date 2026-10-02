import { useState } from 'react'
import logoHorus from '../../assets/images/logo-horus.png'
import PublicImage from '../PublicImage'
import HomeConvenioDialog from './HomeConvenioDialog'
import type { ConvenioResource } from '../../types/convenios'

export default function HomeConvenios({ resource, page, onPage }: {
  resource: ConvenioResource; page: number; onPage: (page: number) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null)
  const { data, loading, error, reload } = resource
  return <section className="home-convenios" aria-labelledby="home-convenios-title">
    <div className="container">
      <div className="home-section-head fade-up">
        <span className="home-eyebrow">Alianzas</span>
        <h2 id="home-convenios-title">Convenios que respaldan tu certificación</h2>
        <p>Conoce nuestras alianzas institucionales y sus actividades.</p>
      </div>
      {loading ? <p role="status" className="home-conv-notice">Cargando convenios…</p> :
        error ? <div role="alert" className="home-conv-notice"><p>{error}</p><button className="home-button" onClick={reload}>Reintentar convenios</button></div> :
        !data?.items.length ? <div className="home-conv-notice" role="status"><p>No hay convenios visibles en este momento.</p>
          {page > 1 && <button className="home-button" onClick={() => onPage(1)}>Volver al inicio de convenios</button>}</div> :
        <div className="home-conv-grid">
          <div className="home-conv-brand">
            <img src={logoHorus} alt="Horus Group" width="588" height="425" loading="lazy" />
            <span>Horus Group SRL</span><span className="home-conv-brand-caption">Tecnología y Educación</span>
          </div>
          {data.items.map(convenio => <button type="button" key={convenio.id}
            className="home-conv-card" onClick={() => setSelected(convenio.id)} aria-haspopup="dialog">
            <span className="home-conv-logo"><PublicImage src={convenio.logo_url} title={'Logo de ' + convenio.nombre} /></span>
            {convenio.sigla && <span className="home-conv-sigla">{convenio.sigla}</span>}
            <span className="home-conv-name">{convenio.nombre}</span>
            <span className="home-conv-description">{convenio.descripcion_corta}</span>
            <span className="home-conv-more">Conocer convenio <i className="fas fa-arrow-right" aria-hidden="true" /></span>
          </button>)}
        </div>}
      {!loading && !error && data && data.pagination.pages > 1 && <nav className="home-conv-pagination" aria-label="Páginas de convenios">
        <button className="home-button home-button-outline" disabled={page <= 1} onClick={() => onPage(page - 1)}>Anterior</button>
        <span>Página {page} de {data.pagination.pages}</span>
        <button className="home-button home-button-outline" disabled={page >= data.pagination.pages} onClick={() => onPage(page + 1)}>Siguiente</button>
      </nav>}
    </div>
    {selected !== null && <HomeConvenioDialog key={selected} id={selected} onClose={() => setSelected(null)} />}
  </section>
}
