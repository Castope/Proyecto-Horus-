import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useRequestStatus } from '../panel/hooks/useRequestStatus'
import '../styles/catalogo-publico.css'

interface CursoPublico {
  id: number
  titulo: string
  descripcion: string
  tipo: 'curso' | 'capacitacion'
  modalidad: 'presencial' | 'virtual' | 'hibrida'
  duracion: string
  fecha_inicio: string | null
  imagen_url: string | null
  temario: string | null
}

interface CatalogoResponse {
  ok: boolean
  items: CursoPublico[]
  pagination: { page: number; limit: number; total: number; pages: number }
}

const modalidades = { presencial: 'Presencial', virtual: 'Virtual', hibrida: 'Semipresencial' }
const fecha = new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })

function ImagenCurso({ url, titulo }: { url: string | null; titulo: string }) {
  const [fallida, setFallida] = useState<string | null>(null)
  return (
    <div className="public-course-image">
      {url && fallida !== url
        ? <img src={url} alt={titulo} loading="lazy" onError={() => setFallida(url)} />
        : <span><i className="fas fa-book-open" aria-hidden="true" />Sin imagen disponible</span>}
    </div>
  )
}

export default function CatalogoCursos() {
  const [page, setPage] = useState(1)
  const [revision, setRevision] = useState(0)
  const [data, setData] = useState<CatalogoResponse | null>(null)
  const { loading, error, setLoading, setError } = useRequestStatus(`${page}:${revision}`)

  useEffect(() => {
    const controller = new AbortController()
    async function cargar() {
      try {
        const response = await fetch(`/api/cursos?page=${page}&limit=12`, {
          signal: controller.signal, cache: 'no-store',
        })
        if (!response.ok) throw new Error('No se pudo consultar el catálogo.')
        const result: CatalogoResponse = await response.json()
        if (!result.ok || !Array.isArray(result.items) || !result.pagination) {
          throw new Error('Respuesta de catálogo inválida.')
        }
        if (controller.signal.aborted) return
        setData(result)
        setError('')
      } catch {
        if (!controller.signal.aborted) setError('No pudimos cargar los cursos. Inténtalo de nuevo.')
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    void cargar()
    return () => controller.abort()
  }, [page, revision, setError, setLoading])

  function actualizar() {
    setPage(1)
    setRevision(value => value + 1)
  }

  return (
    <section className="public-catalog" id="catalogo-cursos" aria-labelledby="catalogo-cursos-title">
      <div className="container">
        <div className="ed-section-head">
          <span className="ed-eyebrow">Nuestra oferta educativa</span>
          <h2 id="catalogo-cursos-title">Cursos y capacitaciones</h2>
          <p>Conoce las propuestas y consulta la que te interesa.</p>
        </div>
        <div className="public-catalog-toolbar">
          <button type="button" onClick={actualizar} disabled={loading}>Actualizar catálogo</button>
        </div>
        <div aria-busy={loading}>
          {loading && <p className="public-catalog-notice" role="status">Cargando cursos…</p>}
          {!loading && error && <div className="public-catalog-notice" role="alert">
            <p>{error}</p><button type="button" onClick={() => setRevision(value => value + 1)}>Reintentar</button>
          </div>}
          {!loading && !error && data && <>
            <p className="public-catalog-count" role="status">{data.pagination.total} {data.pagination.total === 1 ? 'propuesta publicada' : 'propuestas publicadas'}</p>
            {data.items.length === 0 ? <div className="public-catalog-notice">
              <p>{page === 1 ? 'Por el momento no hay cursos publicados.' : 'No hay cursos en esta página. Actualiza el catálogo para ver los cambios.'}</p>
              <Link to="/contactos">Consultar próximas propuestas</Link>
            </div> : <div className="public-course-grid">
              {data.items.map(curso => <article className="public-course-card" key={curso.id}>
                <ImagenCurso url={curso.imagen_url} titulo={curso.titulo} />
                <div className="public-course-body">
                  <span className="ed-eyebrow">{curso.tipo === 'capacitacion' ? 'Capacitación' : 'Curso'}</span>
                  <h3>{curso.titulo}</h3>
                  <p className="public-course-description">{curso.descripcion}</p>
                  <dl className="public-course-meta">
                    <div><dt>Modalidad</dt><dd>{modalidades[curso.modalidad]}</dd></div>
                    <div><dt>Duración</dt><dd>{curso.duracion}</dd></div>
                    {curso.fecha_inicio && <div><dt>Inicio</dt><dd><time dateTime={curso.fecha_inicio.slice(0, 10)}>{fecha.format(new Date(curso.fecha_inicio))}</time></dd></div>}
                  </dl>
                  {curso.temario && <details><summary>Ver temario</summary><p className="public-course-description">{curso.temario}</p></details>}
                  <Link to="/contactos" className="public-course-contact" aria-label={`Consultar sobre ${curso.titulo}`}>Consultar información <i className="fas fa-arrow-right" aria-hidden="true" /></Link>
                </div>
              </article>)}
            </div>}
          </>}
        </div>
        {(page > 1 || (data?.pagination.pages ?? 0) > 1) && <nav className="public-catalog-pagination" aria-label="Páginas del catálogo">
          <button type="button" disabled={loading || page <= 1} onClick={() => setPage(value => value - 1)}>Anterior</button>
          <span>Página {page}</span>
          <button type="button" disabled={loading || !!error || page >= (data?.pagination.pages ?? 0)} onClick={() => setPage(value => value + 1)}>Siguiente</button>
        </nav>}
      </div>
    </section>
  )
}





