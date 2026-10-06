import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { usePublicResource } from '../hooks/usePublicResource'
import PublicRequestState from '../components/PublicRequestState'
import type { CursoPublico, ServicioPublico } from '../types/public'

const SERVICE_SECTIONS: Record<string, string> = {
  cableado: '/tecnologias/cableado-estructurado', camaras: '/tecnologias/camaras-seguridad',
  soporte: '/tecnologias/soporte-mantenimiento', asesoramiento: '/educacion/asesoramiento',
}

export default function CatalogoDetail({ kind }: { kind: 'cursos' | 'servicios' }) {
  const { id } = useParams()
  const { data, loading, error, reload } = usePublicResource<{ item: CursoPublico | ServicioPublico }>(kind + '/' + encodeURIComponent(id || ''))
  const item = data?.item
  useEffect(() => { document.title = (item?.titulo || 'Detalle del catálogo') + ' — Horus Group SRL' }, [item?.titulo])
  return <section className="public-catalog public-catalog-detail"><div className="container"><Link to={kind === 'cursos' ? item && 'tipo' in item && item.tipo === 'capacitacion' ? '/educacion/capacitaciones' : '/educacion/cursos' : item && 'categoria' in item && SERVICE_SECTIONS[item.categoria] || '/tecnologias/cableado-estructurado'}>← Volver al catálogo</Link>
    <PublicRequestState loading={loading} error={error} reload={reload} />
    {!loading && !error && item && <article className="public-course-body"><h1>{item.titulo}</h1>{item.imagen_url && <img className="public-detail-image" src={item.imagen_url} alt={item.titulo} />}<p className="public-course-description">{item.descripcion}</p>
      {'duracion' in item && <><p>Duración: {item.duracion||'Por confirmar'} · Modalidad: {item.modalidad||'Por confirmar'}</p>{item.fecha_inicio && <p>Fecha publicada: {item.fecha_inicio.slice(0, 10)}. Consulta la vigencia de la convocatoria con el equipo.</p>}{item.temario && <><h2>Temario</h2><p className="public-course-description">{item.temario}</p></>}</>}
      {'alcance' in item && item.alcance && <><h2>Alcance</h2><p className="public-course-description">{item.alcance}</p></>}
      <Link className="btn-coral" to={'/contactos?asunto=' + encodeURIComponent('Consulta sobre ' + item.titulo)}>Solicitar información</Link>
    </article>}
  </div></section>
}
