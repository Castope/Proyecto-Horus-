import { useEffect, useState } from 'react'
import { usePublicResource } from '../hooks/usePublicResource'
import type { ConvenioList } from '../types/convenios'
import useFadeUp from '../hooks/useFadeUp'
import HomeWelcome from '../components/home/HomeWelcome'
import HomeHero from '../components/home/HomeHero'
import HomeServices from '../components/home/HomeServices'
import HomeConvenios from '../components/home/HomeConvenios'
import HomeHighlights from '../components/home/HomeHighlights'
import HomeLocation from '../components/home/HomeLocation'
import '../styles/home-redesign.css'

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
