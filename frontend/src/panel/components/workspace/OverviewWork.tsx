import { Link } from 'react-router-dom';
import type { DashboardStats } from '../../types/workspace';
import PanelIcon from '../PanelIcon';

export default function OverviewWork({ data }: { data: DashboardStats }) {
  const messages = data.stats.mensajes;
  const types = [['cursos', 'Cursos', 'cursos'], ['servicios', 'Servicios', 'servicios'], ['preguntas-frecuentes', 'Preguntas frecuentes', 'faq']];
  return <section className="hw-work">
    <div><p className="hp-kicker">SIGUIENTE PASO</p><h2>Tu trabajo pendiente</h2><p>Accede directamente a lo que necesita atención.</p></div>
    <div className="hw-work-grid">
      <Link to="/admin/messages?estado=nuevo"><span className="hw-work-icon"><PanelIcon name="mail" /></span><div><strong>{messages.nuevos} consultas por atender</strong><small>Revisa los mensajes nuevos</small></div><PanelIcon name="arrow" /></Link>
      <Link to="/admin/messages?estado=en_proceso"><span className="hw-work-icon"><PanelIcon name="check" /></span><div><strong>{messages.enProceso} en seguimiento</strong><small>Continúa la atención iniciada</small></div><PanelIcon name="arrow" /></Link>
      <Link to="/admin/dashboard?section=cursos&vista=agenda"><span className="hw-work-icon"><PanelIcon name="calendar" /></span><div><strong>Revisar agenda de cursos</strong><small>Fechas próximas y cursos por programar</small></div><PanelIcon name="arrow" /></Link>
    </div>
    <div className="hw-review"><strong>Contenido por revisar</strong>{types.map(([key, title, section]) => <Link key={key} to={'/admin/dashboard?section=' + section + '&estado=borrador'}>{title}<span>{data.stats.catalogo[key]?.borradores || 0} borradores</span><PanelIcon name="arrow" size={14} /></Link>)}</div>
  </section>;
}
