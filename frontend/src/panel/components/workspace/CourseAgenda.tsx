import { useState } from 'react';
import type { Row } from '../../types/workspace';
import { label } from '../../types/workspace';
import { useCollection, dateLabel } from './useCollection';
import PanelIcon from '../PanelIcon';

export default function CourseAgenda({ revision, onOpen }: { revision: number; onOpen: (row: Row) => void }) {
  const { rows, loading, error } = useCollection('cursos', true, revision);
  const [period, setPeriod] = useState('upcoming');
  const [state, setState] = useState('');
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const day = (row: Row) => row.fecha_inicio ? new Date(String(row.fecha_inicio).slice(0, 10) + 'T00:00:00').getTime() : NaN;
  const current = rows.filter(row => row.estado !== 'archivado');
  const upcoming = current.filter(row => day(row) >= today.getTime());
  const unplanned = current.filter(row => !Number.isFinite(day(row)));
  const visible = current.filter(row => (!state || row.estado === state) && (period === 'unscheduled' ? !Number.isFinite(day(row)) : period === 'past' ? day(row) < today.getTime() : day(row) >= today.getTime()))
    .sort((a, b) => (day(a) || 0) - (day(b) || 0));
  if (loading) return <div className="hp-empty" role="status">Cargando agenda…</div>;
  if (error) return <p className="hp-error" role="alert">{error} Usa Actualizar para volver a consultar.</p>;
  return <div className="hw-agenda">
    <div className="hw-insights"><article><PanelIcon name="calendar" /><strong>{upcoming.length}</strong><span>Inicios próximos</span></article><article><PanelIcon name="help" /><strong>{unplanned.length}</strong><span>Por programar</span></article><article><PanelIcon name="book" /><strong>{current.length}</strong><span>Cursos sin archivar</span></article></div>
    <div className="hw-agenda-toolbar"><div className="hw-tabs" aria-label="Periodo de agenda">{[['upcoming', 'Próximos'], ['unscheduled', 'Sin fecha'], ['past', 'Fechas pasadas']].map(([value, name]) => <button key={value} aria-pressed={period === value} onClick={() => setPeriod(value)}>{name}</button>)}</div>
      <label className="hw-select">Publicación<select value={state} onChange={e => setState(e.target.value)}><option value="">Todos</option><option value="publicado">Publicados</option><option value="borrador">Borradores</option></select></label></div>
    <p className="hw-caption">Fechas del catálogo completo. No incluyen cupos, inscripciones ni confirmación de apertura.</p>
    {visible.length ? <div className="hw-timeline">{visible.map(row => <button key={row.id} onClick={() => onOpen(row)}><span className="hw-date-tile"><PanelIcon name="calendar" size={21} /><small>{dateLabel(row.fecha_inicio, true)}</small></span>
      <span className="hw-timeline-info"><strong>{String(row.titulo)}</strong><small>{label(row.modalidad)} · {String(row.duracion || '')}</small></span><span className={'hp-badge hp-state-' + row.estado}>{label(row.estado)}</span><PanelIcon name="edit" size={16} /></button>)}</div> : <div className="hp-empty hp-empty-compact"><PanelIcon name="calendar" size={30} /><h3>No hay cursos en esta vista</h3><p>Revisa otro periodo o asigna una fecha desde la ficha del curso.</p></div>}
  </div>;
}
