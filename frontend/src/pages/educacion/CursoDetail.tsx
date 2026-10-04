import { useEffect } from 'react'
import { Link, Navigate, useLocation, useParams } from 'react-router-dom'
import PageHero from '../../components/PageHero'
import CourseFacts from '../../components/edu/CourseFacts'
import { consultPath, courseName, detailPath, kindLabel } from '../../components/edu/courseText'
import ServiceFeatures from '../../components/tech/ServiceFeatures'
import ServiceMedia from '../../components/tech/ServiceMedia'
import { usePublicResource } from '../../hooks/usePublicResource'
import type { CursoPublico } from '../../types/public'

// Detail of one published course or capacitación. Served at /educacion/cursos/:id and /educacion/capacitaciones/:id;
// a record opened under the wrong path is redirected to its own.
export default function CursoDetail() {
  const { id } = useParams()
  const { pathname } = useLocation()
  const { data, loading, error, reload } = usePublicResource<{ item: CursoPublico }>('cursos/' + encodeURIComponent(id || ''))
  const item = data?.item
  const name = item ? courseName(item) : ''
  useEffect(() => { document.title = (name || 'Detalle') + ' — Horus Group SRL' }, [name])

  if (item && detailPath(item) !== pathname) return <Navigate to={detailPath(item)} replace />
  const back = pathname.startsWith('/educacion/capacitaciones') ? '/educacion/capacitaciones' : '/educacion/cursos'

  return <>
    <PageHero eyebrow={item ? kindLabel(item.tipo) : 'Educación'} title={name || (error ? 'No disponible' : 'Detalle')} />
    <section className="tech-section is-light edu-section" aria-label={name ? 'Detalle de ' + name : 'Detalle'} aria-busy={loading}>
      <div className="container">
        <Link className="tech-link edu-back" to={back}><i className="fas fa-arrow-left" aria-hidden="true" /> Volver a {back.endsWith('capacitaciones') ? 'capacitaciones' : 'cursos'}</Link>
        {error && <div className="tech-state" role="alert">
          <p>{error}</p><button type="button" className="home-button tech-btn" onClick={reload}>Reintentar</button>
        </div>}
        {!error && (loading || !item) && <div className="edu-skeleton edu-skeleton-detail" role="status">
          <span className="tech-sr">Cargando detalle…</span><span aria-hidden="true" /><span aria-hidden="true" />
        </div>}
        {!error && !loading && item && <article className="edu-detail">
          <div className="edu-detail-media tech-media fade-up">
            <ServiceMedia src={item.imagen_url} title={name} priority />
          </div>
          <div className="edu-detail-info fade-up">
            <CourseFacts course={item} label={'Datos de ' + name} />
            <p className="tech-desc edu-detail-desc">{item.descripcion}</p>
            <div className="tech-actions">
              <Link className="home-button tech-btn" to={consultPath(item)}>Solicitar información <i className="fas fa-arrow-right" aria-hidden="true" /></Link>
            </div>
          </div>
          {item.temario?.trim() && <div className="edu-detail-syllabus fade-up">
            <h2>Temario</h2>
            <ServiceFeatures value={item.temario} label={'Temario de ' + name} />
          </div>}
        </article>}
      </div>
    </section>
  </>
}
