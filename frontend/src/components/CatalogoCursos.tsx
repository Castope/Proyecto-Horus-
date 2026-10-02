import { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePublicResource } from '../hooks/usePublicResource'
import PublicImage from './PublicImage'
import ProgramCards from './ProgramCards'
import '../styles/original-content.css'
import PublicRequestState from './PublicRequestState'
import type { CursoPublico, PublicList } from '../types/public'
import '../styles/catalogo-publico.css'

const modalidades = { presencial: 'Presencial', virtual: 'Virtual', hibrida: 'Semipresencial' }
const fecha = new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
export default function CatalogoCursos({ tipo }: { tipo?: 'curso' | 'capacitacion' }) {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [modalidad, setModalidad] = useState('')
  const params = new URLSearchParams({ page: String(page), limit: '12' })
  if (tipo) params.set('tipo', tipo)
  if (query) params.set('search', query)
  if (modalidad) params.set('modalidad', modalidad)
  const { data, loading, error, reload } = usePublicResource<PublicList<CursoPublico>>('cursos?' + params)
  return <section className={tipo==='capacitacion'?'ed-programs original-section':'public-catalog'} id={tipo==='capacitacion'?'ed-detail':'catalogo-cursos'} aria-labelledby="catalogo-cursos-title"><div className="container">
    <div className="ed-section-head"><span className="ed-eyebrow">Nuestra oferta educativa</span><h2 id="catalogo-cursos-title">{tipo === 'capacitacion' ? 'Elige tu área de capacitación' : tipo === 'curso' ? 'Cursos publicados' : 'Cursos y capacitaciones'}</h2><p>Consulta las propuestas que te interesan.</p></div>
    <div className="public-catalog-toolbar original-controls">
      <form onSubmit={event => { event.preventDefault(); setPage(1); setQuery(search.trim()) }}>
        <label htmlFor="course-search">Buscar por nombre</label><input id="course-search" type="search" maxLength={100} value={search} onChange={event => setSearch(event.target.value)} /><button>Buscar</button>
      </form>
      <label>Modalidad<select value={modalidad} onChange={event => { setPage(1); setModalidad(event.target.value) }}><option value="">Todas</option>{Object.entries(modalidades).map(([key, name]) => <option key={key} value={key}>{name}</option>)}</select></label>
      <button type="button" onClick={reload} disabled={loading}>Actualizar catálogo</button>
    </div>
    <div aria-busy={loading}><PublicRequestState loading={loading} error={error} reload={reload} />
      {!loading && !error && data && <>
        <p role="status">{data.pagination.total} propuestas publicadas</p>
        {data.items.length ? tipo==='capacitacion' ? <ProgramCards items={data.items}/> : <div className="public-course-grid">{data.items.map(curso => <article key={curso.id} className="public-course-card">
          <div className="public-course-image"><PublicImage src={curso.imagen_url} title={curso.titulo} /></div>
          <div className="public-course-body"><span className="ed-eyebrow">{curso.tipo === 'capacitacion' ? 'Capacitación' : 'Curso'}</span><h3>{curso.titulo}</h3><p className="public-course-description">{curso.descripcion}</p>
          <dl className="public-course-meta"><div><dt>Modalidad</dt><dd>{curso.modalidad?modalidades[curso.modalidad]:'Por confirmar'}</dd></div><div><dt>Duración</dt><dd>{curso.duracion||'Por confirmar'}</dd></div>{curso.fecha_inicio && <div><dt>Inicio</dt><dd>{fecha.format(new Date(curso.fecha_inicio))}</dd></div>}</dl>
          <Link className="public-course-contact" to={'/educacion/cursos/' + curso.id}>Ver información y temario</Link>
          <Link className="public-course-contact" to={'/contactos?asunto=' + encodeURIComponent('Consulta sobre ' + curso.titulo)}>Consultar con el equipo</Link></div>
        </article>)}</div> : <p className="public-catalog-notice">No hay propuestas publicadas con estos filtros.</p>}
      </>}
    </div>
    <nav className="original-pagination" aria-label="Páginas del catálogo"><button disabled={loading || page === 1} onClick={() => setPage(value => value - 1)}>Anterior</button><span>Página {page}</span><button disabled={loading || !!error || page >= (data?.pagination.pages || 0)} onClick={() => setPage(value => value + 1)}>Siguiente</button></nav>
  </div></section>
}
