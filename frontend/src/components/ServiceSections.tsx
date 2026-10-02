import { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePublicResource } from '../hooks/usePublicResource'
import type { PublicList, ServicioPublico } from '../types/public'
import PublicImage from './PublicImage'
import PublicRequestState from './PublicRequestState'
import ServiceVisual from './ServiceVisual'
import { contentIcon, contentLines, presentationStyle } from './presentation'
import '../styles/original-content.css'

type Category='cableado'|'camaras'|'soporte'|'asesoramiento'
const definitions={
 cableado:{className:'cable-categories',eyebrow:'Nuestras Categorías',title:'Soluciones para cada necesidad',description:'Desde instalaciones básicas hasta infraestructura de alto rendimiento para centros de datos.'},
 camaras:{className:'cam-solutions',eyebrow:'Lo que incluye',title:'Seguridad completa, de principio a fin',description:'Cada solución está diseñada para proteger lo que más importa.'},
 soporte:{className:'sop-services',eyebrow:'Nuestros Servicios',title:'Todo lo que tu empresa necesita para funcionar',description:'Cubrimos cada aspecto del soporte tecnológico para que tu negocio nunca se detenga.'},
 asesoramiento:{className:'ed-types',eyebrow:'Tipos de asesoramiento',title:'¿En qué área puedo ayudarte?',description:''},
}
const contact=(item:ServicioPublico)=>'/contactos?asunto='+encodeURIComponent('Consulta sobre '+item.titulo)
function CablePanels({items}:{items:ServicioPublico[]}){
 const [selected,setSelected]=useState<number|null>(null)
 const item=items.find(x=>x.id===selected)||items[0]
 if(!item)return null
 return <><div className="cable-tabs" role="tablist" aria-label="Categorías de cableado">{items.map((p,index)=><button type="button" role="tab" key={p.id} id={'cable-tab-'+p.id} aria-controls={'cable-panel-'+p.id} aria-selected={p.id===item.id} tabIndex={p.id===item.id?0:-1} className={'cable-tab'+(p.id===item.id?' active':'')} onClick={()=>setSelected(p.id)} onKeyDown={event=>{
  const next=event.key==='ArrowRight'?(index+1)%items.length:event.key==='ArrowLeft'?(index-1+items.length)%items.length:event.key==='Home'?0:event.key==='End'?items.length-1:-1
  if(next<0)return;event.preventDefault();setSelected(items[next].id);document.getElementById('cable-tab-'+items[next].id)?.focus()
 }}><i className={'fas '+contentIcon(p.icono)} aria-hidden="true"/>{p.nombre_corto||p.titulo}</button>)}</div>
 <div className="cable-panels"><div className="cable-panel active" role="tabpanel" id={'cable-panel-'+item.id} aria-labelledby={'cable-tab-'+item.id} tabIndex={0}>
 <div className="panel-img"><PublicImage src={item.imagen_url} title={item.titulo}/>{item.destacado&&<div className="panel-img-badge">{item.destacado}</div>}</div>
 <div className="panel-info">{item.dato_principal&&<div className="panel-speed">{item.dato_principal}</div>}{item.dato_secundario&&<div className="panel-speed-label">{item.dato_secundario}</div>}<h3>{item.titulo}</h3><p>{item.descripcion}</p><div className="panel-tags">{contentLines(item.etiquetas).map(t=><span className="panel-tag" key={t}>{t}</span>)}</div>
 <Link to={contact(item)} className="btn-coral"><i className="fas fa-arrow-right" aria-hidden="true"/>Solicitar instalación</Link><Link className="original-service-link" to={'/tecnologias/servicios/'+item.id}>Ver alcance</Link></div></div></div></>
}
function CameraCards({items}:{items:ServicioPublico[]}){
 return <div className="cam-services">{items.map((item,index)=><article className={'cam-service'+(index%2?' cam-service-alt':'')} key={item.id} style={presentationStyle(item.color)}><div className="cam-service-left">
 <div className="cam-service-num">{String(index+1).padStart(2,'0')}</div><div className="cam-service-icon" style={presentationStyle(item.color)}><i className={'fas '+contentIcon(item.icono)} aria-hidden="true"/></div><div className="cam-service-text"><h3>{item.titulo}</h3><p>{item.descripcion}</p><div className="cam-service-tags">{contentLines(item.etiquetas).map(t=><span key={t}>{t}</span>)}</div><Link className="original-service-link" to={'/tecnologias/servicios/'+item.id}>Ver alcance y consultar →</Link></div></div><div className="original-service-art" aria-hidden="true"><ServiceVisual item={item}/></div></article>)}</div>
}
function SupportCards({items}:{items:ServicioPublico[]}){
 const colors:Record<string,string>={verde:'green',oscuro:'dark',coral:'coral',indigo:'indigo',violeta:'indigo'}
 return <div className="sop-cards">{items.map((item,index)=><article className={'sop-card sop-card-'+(colors[item.color||'']||'indigo')} key={item.id}><div className="sop-card-num">{String(index+1).padStart(2,'0')}</div><div aria-hidden="true"><ServiceVisual item={item}/></div><div className="sop-card-body"><div className="sop-card-icon"><i className={'fas '+contentIcon(item.icono)} aria-hidden="true"/></div><h3>{item.titulo}</h3><p>{item.descripcion}</p><div className="sop-card-tags">{contentLines(item.etiquetas).map(t=><span key={t}>{t}</span>)}</div><Link className="original-service-link" to={'/tecnologias/servicios/'+item.id}>Ver alcance y consultar →</Link></div></article>)}</div>
}
function AdviceCards({items}:{items:ServicioPublico[]}){
 return <div className="ed-types-grid">{items.filter(x=>x.presentacion!=='beneficio').map(item=><article className="ed-type-card" key={item.id} style={presentationStyle(item.color)}><div className="ed-type-icon"><i className={'fas '+contentIcon(item.icono)} aria-hidden="true"/></div><h3>{item.titulo}</h3><p>{item.descripcion}</p><ul className="ed-type-list">{contentLines(item.alcance).map(t=><li key={t}><i className="fas fa-check" aria-hidden="true"/>{t}</li>)}</ul><Link className="original-service-link" to={contact(item)}>Solicitar asesoramiento →</Link></article>)}</div>
}
export default function ServiceSections({category}:{category:Category}){
 const [page,setPage]=useState(1),[search,setSearch]=useState(''),[query,setQuery]=useState('')
 const params=new URLSearchParams({page:String(page),limit:'12',categoria:category,...(query?{search:query}:{})})
 const {data,loading,error,reload}=usePublicResource<PublicList<ServicioPublico>>('servicios?'+params)
 const definition=definitions[category],items=data?.items||[],benefits=items.filter(x=>x.presentacion==='beneficio')
 return <><section className={definition.className+' original-section'} id={category==='cableado'?'categorias':category==='camaras'?'soluciones':category==='soporte'?'servicios':'ed-detail'}><div className="container">
 <div className={category==='cableado'?'section-title':category==='camaras'?'cam-sol-header':category==='soporte'?'sop-sec-header':'ed-section-head'}><div className="eyebrow">{definition.eyebrow}</div><h2>{definition.title}</h2>{definition.description&&<p>{definition.description}</p>}</div>
 <div className="original-controls"><details><summary>Buscar en esta sección</summary><form onSubmit={e=>{e.preventDefault();setPage(1);setQuery(search.trim())}}><label htmlFor={'search-'+category}>Nombre</label><input id={'search-'+category} type="search" value={search} maxLength={100} onChange={e=>setSearch(e.target.value)}/><button>Buscar</button></form></details><button type="button" disabled={loading} onClick={reload}>Actualizar</button></div>
 <PublicRequestState loading={loading} error={error} reload={reload}/>
 {!loading&&!error&&(items.length?category==='cableado'?<CablePanels items={items}/>:category==='camaras'?<CameraCards items={items}/>:category==='soporte'?<SupportCards items={items}/>:<AdviceCards items={items}/>:<p className="original-empty">No hay servicios publicados en esta sección.</p>)}
 {!!data&&data.pagination.pages>1&&<nav className="original-pagination" aria-label="Páginas de servicios"><button disabled={loading||page===1} onClick={()=>setPage(v=>v-1)}>Anterior</button><span>Página {page}</span><button disabled={loading||!!error||page>=data.pagination.pages} onClick={()=>setPage(v=>v+1)}>Siguiente</button></nav>}
 </div></section>
 {!loading&&!error&&category==='asesoramiento'&&benefits.length>0&&<section className="ed-benefits"><div className="container"><div className="ed-section-head"><span className="ed-eyebrow">Por qué elegirnos</span><h2>Lo que nos hace<br/>diferentes</h2></div><div className="ed-benefits-grid">{benefits.map((item,index)=><article className="ed-benefit" key={item.id}><div className="ed-benefit-num">{String(index+1).padStart(2,'0')}</div><div className="ed-benefit-icon"><i className={'fas '+contentIcon(item.icono)} aria-hidden="true"/></div><h3>{item.titulo}</h3><p>{item.descripcion}</p></article>)}</div></div></section>}
 </>
}
