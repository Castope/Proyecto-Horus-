import { useEffect, useState } from 'react'
import useFadeUp from '../../hooks/useFadeUp'

export default function PolicyLayout({ icon, title, subtitle, sections }) {
  useFadeUp()
  const [active, setActive] = useState(0)

  useEffect(() => {
    const handler = () => {
      sections.forEach((_, i) => {
        const el = document.getElementById(`policy-sec-${i}`)
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= 120) setActive(i)
        }
      })
    }
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [sections])

  return (
    <>
      <section className="policy-hero">
        <div className="container policy-hero-inner fade-up">
          <div className="policy-hero-icon"><i className={`fas ${icon}`} /></div>
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </section>

      <section className="policy-body">
        <div className="container policy-layout">

          <aside className="policy-toc">
            <div className="policy-toc-inner">
              <p className="policy-toc-label">Contenido</p>
              <ul>
                {sections.map((s, i) => (
                  <li key={i}>
                    <a
                      href={`#policy-sec-${i}`}
                      className={active === i ? 'active' : ''}
                      onClick={e => { e.preventDefault(); document.getElementById(`policy-sec-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}
                    >
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <article className="policy-content fade-up">
            {sections.map((s, i) => (
              <div key={i} id={`policy-sec-${i}`} className="policy-section">
                <h2>{s.title}</h2>
                {s.content}
              </div>
            ))}
          </article>
        </div>
      </section>
    </>
  )
}
