import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { usePublicResource } from '../../hooks/usePublicResource'
import type { PublicList, FaqPublica } from '../../types/public'
import PublicRequestState from '../../components/PublicRequestState'
export default function PreguntasFrecuentes() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const { data, loading, error, reload } = usePublicResource<PublicList<FaqPublica>>('preguntas-frecuentes?' + new URLSearchParams({ page: String(page), limit: '20', ...(query ? { search: query } : {}) }))
  useEffect(() => { document.title = 'Preguntas frecuentes — Horus Group SRL' }, [])
  return <><section className="faq-hero"><div className="faq-hero-inner"><h1>Preguntas frecuentes</h1><p>Respuestas publicadas por el equipo de Horus.</p></div></section>
    <div className="faq-layout"><form className="public-catalog-toolbar" onSubmit={event => { event.preventDefault(); setPage(1); setQuery(search.trim()) }}><label>Buscar pregunta<input type="search" maxLength={100} value={search} onChange={event => setSearch(event.target.value)} /></label><button>Buscar</button><button type="button" onClick={reload} disabled={loading}>Actualizar</button></form>
      <PublicRequestState loading={loading} error={error} reload={reload} />
      {!loading && !error && data && (data.items.length ? data.items.map(item => <details className="faq-item public-faq" key={item.id}><summary>{item.pregunta}<small>{item.categoria}</small></summary><p className="public-course-description">{item.respuesta}</p></details>) : <p>No hay preguntas publicadas con estos filtros.</p>)}
      <nav className="public-catalog-pagination" aria-label="Páginas de preguntas"><button disabled={loading || page === 1} onClick={() => setPage(value => value - 1)}>Anterior</button><span>Página {page}</span><button disabled={loading || !!error || page >= (data?.pagination.pages || 0)} onClick={() => setPage(value => value + 1)}>Siguiente</button></nav>
      <Link to="/contactos" className="btn-coral">Consultar con el equipo</Link>
    </div></>
}
