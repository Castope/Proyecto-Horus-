import { useState, useEffect } from 'react'
import logoHorus from '../assets/images/logo-horus.png'

export default function Loader() {
  const [pct, setPct]       = useState(0)
  const [hidden, setHidden] = useState(false)
  const [exit, setExit]     = useState(false)

  useEffect(() => {
    const steps = [
      { target: 25,  delay: 300 },
      { target: 55,  delay: 700 },
      { target: 80,  delay: 1200 },
      { target: 100, delay: 1800 },
    ]
    const timers = steps.map(({ target, delay }) =>
      setTimeout(() => setPct(target), delay)
    )
    const exitTimer = setTimeout(() => setExit(true),  2900)
    const hideTimer = setTimeout(() => setHidden(true), 3500)
    return () => [...timers, exitTimer, hideTimer].forEach(clearTimeout)
  }, [])

  if (hidden) return null

  return (
    <div className={`ld-root${exit ? ' ld-exit' : ''}`}>
      <div className="ld-bg" />
      <div className="ld-top-line" />
      <div className="ld-bottom-line" />

      <div className="ld-corner ld-corner-tl" />
      <div className="ld-corner ld-corner-tr" />
      <div className="ld-corner ld-corner-bl" />
      <div className="ld-corner ld-corner-br" />

      <div className="ld-center">
        <div className="ld-logo-wrap">
          <div className="ld-halo" />
          <div className="ld-ring" />
          <div className="ld-ring ld-ring-2" />
          <img src={logoHorus} alt="Horus Group" className="ld-logo" />
        </div>

        <div className="ld-brand">
          <span className="ld-brand-main">HORUS GROUP</span>
          <span className="ld-brand-srl">SRL</span>
        </div>

        <div className="ld-divider" />
        <p className="ld-tagline">Tecnología &amp; Educación · Cajamarca</p>

        <div className="ld-bar-track">
          <div className="ld-bar-fill" style={{ width: `${pct}%` }} />
        </div>
        <span className="ld-pct">{pct}%</span>
      </div>
    </div>
  )
}
