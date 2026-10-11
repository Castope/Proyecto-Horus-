import { MAP_EMBED_URL } from '../siteLinks'

// Embedded map of the business location (single source: siteLinks.ts). The parent decides its size.
export default function LocationMap({ title = 'Ubicación de Horus Group SRL' }: { title?: string }) {
  return <iframe src={MAP_EMBED_URL} title={title} loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" />
}
