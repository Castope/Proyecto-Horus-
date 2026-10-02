import { useEffect, useRef, useState } from 'react'
import { usePublicResource } from '../hooks/usePublicResource'
import PublicRequestState from '../components/PublicRequestState'
import PublicImage from '../components/PublicImage'
import type { GaleriaPublica, PublicList } from '../types/public'
import '../styles/original-content.css'

const categoryNames:Record<string,string>={capacitaciones:'Capacitaciones','servicio-tecnico':'Servicio Técnico','colegio-enfermeros':'Colegio Enfermeros','colegio-abogados':'Colegio Abogados',isam:'ISAM','primeros-auxilios':'Primeros Auxilios'}
const categoryLabel=(key:string)=>categoryNames[key]||key.replace(/-/g,' ')

function Lightbox({ items, initial, close }: { items: GaleriaPublica[]; initial: number; close: () => void }) {
  const [index, setIndex] = useState(initial)
  const ref = useRef<HTMLDialogElement>(null)
  const item = items[index]
  const move = (offset: number) => setIndex(value => (value + offset + items.length) % items.length)
  useEffect(() => {
    const previous = document.activeElement as HTMLElement
    const dialog = ref.current
    dialog?.showModal()
    return () => { dialog?.close(); previous?.focus() }
  }, [])
  return <dialog ref={ref} className="gl-lightbox open public-lightbox" aria-label={item.titulo} onCancel={event => { event.preventDefault(); close() }} onKeyDown={event => { if (event.key === 'ArrowLeft') move(-1); if (event.key === 'ArrowRight') move(1) }}>
    <div className="gl-lb-box"><button className="gl-lb-close" aria-label="Cerrar imagen" onClick={close}>×</button>
      <button className="gl-lb-nav gl-lb-prev" aria-label="Imagen anterior" onClick={() => move(-1)}>‹</button><button className="gl-lb-nav gl-lb-next" aria-label="Imagen siguiente" onClick={() => move(1)}>›</button>
      <div className="gl-lb-img-wrap"><PublicImage src={item.imagen_url} title={item.titulo} /></div><div className="gl-lb-info"><strong className="gl-lb-title">{item.titulo}</strong><span className="gl-lb-cat">{categoryLabel(item.categoria)}</span><span>{index + 1} / {items.length}</span></div>{item.descripcion && <p>{item.descripcion}</p>}
    </div>
  </dialog>
}
export default function Galeria() {
  const [category, setCategory] = useState('')
  const [page, setPage] = useState(1)
  const [lightbox, setLightbox] = useState<number | null>(null)
  const params = new URLSearchParams({ page: String(page), limit: '24', ...(category ? { categoria: category } : {}) })
  const { data, loading, error, reload } = usePublicResource<PublicList<GaleriaPublica> & { categorias: string[] }>('galeria?' + params)
  const {data:hero}=usePublicResource<PublicList<GaleriaPublica>>('galeria?page=1&limit=16')
  const heroImages=hero?.items||[],top=heroImages.slice(0,8),bottom=heroImages.length>8?heroImages.slice(8,16):[...top].reverse()
  useEffect(() => { document.title = 'Galería — Horus Group SRL' }, [])
  return <><section className="gl-hero">{[[top,'top'],[bottom,'bottom']].map(([entries,position])=>{const images=entries as GaleriaPublica[];return images.length>0&&<div key={String(position)} className={'gl-strip gl-strip-'+position} aria-hidden="true"><div className={'gl-strip-track'+(position==='bottom'?' gl-strip-reverse':'')}>{[...images,...images].map((item,index)=><div className="gl-strip-img" key={item.id+'-'+index}><img src={item.imagen_url} alt="" loading="lazy"/></div>)}</div></div>})}<div className="gl-hero-overlay"/><div className="gl-hero-center"><div className="gl-hero-eyebrow"><i className="fas fa-images" aria-hidden="true"/>Galería de momentos</div><h1>Nuestro trabajo<br/>en <span>imágenes</span></h1><p>Capacitaciones, proyectos técnicos, eventos y los momentos que hacen que valga la pena lo que hacemos.</p><a href="#galeria" className="gl-hero-scroll" aria-label="Ver fotografías"><i className="fas fa-chevron-down" aria-hidden="true"/></a></div></section>
    <section className="gl-main" id="galeria"><div className="container">
      <div className="gl-filters-row"><div className="gl-filters-left"><span className="gl-filters-label"><i className="fas fa-sliders-h" aria-hidden="true"/>Filtrar</span><div className="gl-filters" aria-label="Categorías de fotografías">{['',...new Set([category,...(data?.categorias||[])].filter(Boolean))].map(value=><button type="button" key={value} className={'gf-btn'+(value===category?' active':'')} aria-pressed={value===category} onClick={()=>{setCategory(value);setPage(1);setLightbox(null)}}>{value?categoryLabel(value):'Todos'}</button>)}</div></div><div className="gl-filter-actions"><span className="gl-count-badge">{data?.pagination.total??0} fotos</span><button className="gf-btn" disabled={loading} onClick={()=>{setLightbox(null);reload()}}>Actualizar galería</button></div></div>
      <PublicRequestState loading={loading} error={error} reload={reload} />
      {!loading && !error && data && <><p role="status">{data.pagination.total} imágenes</p>{data.items.length ? <div className="gl-grid">{data.items.map((item, index) => <button type="button" className="gl-item" key={item.id} aria-label={'Ampliar ' + item.titulo} onClick={() => setLightbox(index)}>
        <PublicImage src={item.imagen_url} title={item.titulo} /><span className="gl-item-overlay"><span className="gl-item-cat">{categoryLabel(item.categoria)}</span><span className="gl-item-title">{item.titulo}</span></span>
      </button>)}</div> : <p>No hay imágenes publicadas en esta categoría.</p>}</>}
      <nav className="original-pagination" aria-label="Páginas de galería"><button disabled={loading || page === 1} onClick={() => { setLightbox(null); setPage(value => value - 1) }}>Anterior</button><span>Página {page}</span><button disabled={loading || !!error || page >= (data?.pagination.pages || 0)} onClick={() => { setLightbox(null); setPage(value => value + 1) }}>Siguiente</button></nav>
    </div></section>{!loading && !error && data && lightbox !== null && data.items[lightbox] && <Lightbox items={data.items} initial={lightbox} close={() => setLightbox(null)} />}</>
}
