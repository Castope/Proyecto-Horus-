import { Link } from 'react-router-dom'
import type { CursoPublico } from '../types/public'
import { contentIcon, contentLines, presentationStyle } from './presentation'
export default function ProgramCards({items}:{items:CursoPublico[]}){
 return <div className="ed-prog-grid">{items.map((item,index)=><article className="ed-prog-card" key={item.id} style={presentationStyle(item.color)}>
 <div className="ed-prog-card-bg"/><div className="ed-prog-card-top"><div className="ed-prog-card-icon"><i className={'fas '+contentIcon(item.icono)} aria-hidden="true"/></div><div className="ed-prog-card-num">{String(index+1).padStart(2,'0')}</div></div>
 <div className="ed-prog-card-body">{item.area&&<div className="ed-prog-card-area">{item.area}</div>}<h3>{item.titulo}</h3><p>{item.descripcion}</p>{item.imagen_url&&<img className="public-detail-image" src={item.imagen_url} alt={item.titulo} loading="lazy"/>}<ul className="ed-prog-card-list">{contentLines(item.temario).map(t=><li key={t}><i className="fas fa-check" aria-hidden="true"/>{t}</li>)}</ul>{(item.modalidad||item.duracion)&&<p>{item.modalidad||'Modalidad por confirmar'} · {item.duracion||'Duración por confirmar'}</p>}{item.fecha_inicio&&<p>Inicio publicado: {item.fecha_inicio.slice(0,10)}</p>}</div>
 <div className="ed-prog-card-footer">{item.certificacion&&<div className="ed-prog-card-cert"><i className="fas fa-certificate" aria-hidden="true"/>{item.certificacion}</div>}<Link className="ed-prog-card-btn" to={'/educacion/cursos/'+item.id}>Ver temario <i className="fas fa-arrow-right" aria-hidden="true"/></Link><Link className="original-service-link" to={'/contactos?asunto='+encodeURIComponent('Consulta sobre '+item.titulo)}>Consultar</Link></div>
 </article>)}</div>
}
