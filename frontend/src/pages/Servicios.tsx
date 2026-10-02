import { useEffect } from 'react'
import CatalogoServicios from '../components/CatalogoServicios'
export default function Servicios() {
  useEffect(() => { document.title = 'Servicios — Horus Group SRL' }, [])
  return <><section className="ed-hero"><div className="container"><h1>Servicios de Horus</h1><p>Consulta nuestra oferta publicada y solicita información al equipo.</p></div></section><CatalogoServicios /></>
}
