import { useEffect, useState } from 'react'
import { usePublicResource } from '../hooks/usePublicResource'
import type { ConvenioList } from '../types/convenios'
import useFadeUp from '../hooks/useFadeUp'
<<<<<<< HEAD

import slide0 from '../assets/images/galeria/capacitaciones/imagen 1.jpg'
import slide1 from '../assets/images/galeria/nuestro servicio tecnico/imagen 1.jpg'
import slide2 from '../assets/images/galeria/colegio de enfermeros/imagen 1.jpg'
import slide3 from '../assets/images/galeria/practicas de primeros auxilios/imagen 1.jpg'

import logoAdministracion from '../assets/images/logos/logo-convenio-administracion.jpg'
import logoEconomistas   from '../assets/images/logos/logo-convenio-economistas.jpg'
import logoEnfermeros    from '../assets/images/logos/logo-convenio-enfermeros.png'
import logoIsam          from '../assets/images/logos/logo-convenio-isam.png'

import imgCableado       from '../assets/images/tecnologias/cableado.jpg'
import imgCapacitaciones from '../assets/images/capacitaciones/Capacítate.jpg'

const SLIDES = [slide0, slide1, slide2, slide3]

const CONVENIOS = [
  { img: logoAdministracion, sigla: 'CORLAD',    nombre: 'Colegio de Administradores', desc: 'Alianza para el desarrollo profesional de administradores con capacitaciones especializadas.' },
  { img: logoEconomistas,    sigla: 'CEC',       nombre: 'Colegio de Economistas',     desc: 'Convenio para la formación continua de economistas con certificaciones en gestión económica.' },
  { img: logoEnfermeros,     sigla: 'CEP/CR XIII', nombre: 'Colegio de Enfermeros - Cajamarca', desc: 'Alianza para capacitaciones en salud y gestión hospitalaria para el personal de enfermería.' },
  { img: logoEnfermeros,     sigla: 'CEP/CR II',  nombre: 'Colegio de Enfermeros - La Libertad', desc: 'Alianza para capacitaciones en salud y gestión hospitalaria para el personal de enfermería.' },
  { img: logoIsam,           sigla: 'ISAM',      nombre: 'Instituto ISAM',             desc: 'Alianza educativa con el ISAM para programas de formación y certificaciones de alto nivel.' },
]
 
const WHY_CARDS = [
  { num: '01', icon: 'fa-medal',          color: '#4F46E5', bg: '#EEF2FF', title: 'Experiencia comprobada',      desc: 'Más de 5 años brindando soluciones tecnológicas y educativas de calidad en Cajamarca, con cientos de clientes satisfechos.', lg: true },
  { num: '02', icon: 'fa-certificate',    color: '#FF6B47', bg: '#FFF1EE', title: 'Certificaciones oficiales',   desc: 'Programas avalados por colegios profesionales reconocidos a nivel nacional.' },
  { num: '03', icon: 'fa-headset',        color: '#059669', bg: '#ECFDF5', title: 'Soporte permanente',          desc: 'Atención personalizada antes, durante y después de cada proyecto o programa.' },
  { num: '04', icon: 'fa-map-marker-alt', color: '#7C3AED', bg: '#F5F3FF', title: 'Presencia local en Cajamarca', desc: 'Somos cajamarquinos. Conocemos las necesidades de la región y trabajamos para su desarrollo.', lg: true },
]

const whyStyle = (color: string, background: string): CSSProperties => ({
  ['--wc' as string]: color,
  ['--wcb' as string]: background,
})
=======
import HomeWelcome from '../components/home/HomeWelcome'
import HomeHero from '../components/home/HomeHero'
import HomeServices from '../components/home/HomeServices'
import HomeConvenios from '../components/home/HomeConvenios'
import HomeHighlights from '../components/home/HomeHighlights'
import HomeLocation from '../components/home/HomeLocation'
import '../styles/home-redesign.css'
>>>>>>> origin/main

export default function Home() {
  const [page, setPage] = useState(1)
  const convenios = usePublicResource<ConvenioList>('convenios?page=' + page + '&limit=6')
  useFadeUp()
  useEffect(() => { document.title = 'Horus Group SRL — Tecnología y Educación en Cajamarca' }, [])

  return <div className="home-page">
    <HomeWelcome />
    <HomeHero conveniosTotal={!convenios.loading && !convenios.error ? convenios.data?.pagination.total ?? null : null} />
    <HomeServices />
    <HomeConvenios resource={convenios} page={page} onPage={setPage} />
    <HomeHighlights />
    <HomeLocation />
  </div>
}
