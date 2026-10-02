import { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePublicResource } from '../hooks/usePublicResource'
import type { PublicList, ServicioPublico } from '../types/public'
import PublicRequestState from './PublicRequestState'
import '../styles/catalogo-publico.css'

export default function CatalogoServicios({ categoria }: { categoria?: string }) {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const params = new URLSearchParams({ page: String(page), limit: '12' })
  if (categoria) params.set('categoria', categoria)
  if (query) params.set('search', query)
  const { data, loading, error, reload } = usePublicResource<PublicList<ServicioPublico>>('servicios?' + params)
  return <section className="public-catalog"><div className="container"><h2>Servicios publicados</h2>
    <form className="public-catalog-toolbar" onSubmit={event => { event.preventDefault(); setPage(1); setQuery(search.trim()) }}><label>Buscar servicio<input type="search" value={search} maxLength={100} onChange={event => setSearch(event.target.value)} /></label><button>Buscar</button><button type="button" onClick={reload} disabled={loading}>Actualizar</button></form>
    <PublicRequestState loading={loading} error={error} reload={reload} />
    {!loading && !error && data && (data.items.length ? <div className="public-course-grid">{data.items.map(item => <article className="public-course-card" key={item.id}>
      {item.imagen_url && <div className="public-course-image"><img src={item.imagen_url} alt={item.titulo} loading="lazy" /></div>}
      <div className="public-course-body"><h3>{item.titulo}</h3><p className="public-course-description">{item.descripcion}</p><Link className="public-course-contact" to={'/tecnologias/servicios/' + item.id}>Ver alcance y consultar</Link></div>
    </article>)}</div> : <p className="public-catalog-notice">No hay servicios publicados con estos filtros.</p>)}
    <nav className="public-catalog-pagination" aria-label="Páginas de servicios"><button disabled={loading || page === 1} onClick={() => setPage(value => value - 1)}>Anterior</button><span>Página {page}</span><button disabled={loading || !!error || page >= (data?.pagination.pages || 0)} onClick={() => setPage(value => value + 1)}>Siguiente</button></nav>
  </div></section>
}
