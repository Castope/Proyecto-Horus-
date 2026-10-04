import { useId, useState, type SubmitEvent } from 'react'
import { Link } from 'react-router-dom'
import { publicRequest } from '../../api'

// Reuses the public newsletter endpoint (explicit consent, signed unsubscribe link) with the interest "cursos".
export default function NotifyForm() {
  const id = useId()
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    setBusy(true); setError(''); setNotice('')
    try {
      const result = await publicRequest<{ correo_enviado: boolean }>('newsletter', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, interes: 'cursos', consentimiento: consent }),
      })
      setNotice(result.correo_enviado
        ? 'Listo. Te avisaremos cuando haya cursos. Revisa tu correo: incluye el enlace para darte de baja.'
        : 'Listo. Te avisaremos cuando haya cursos. El correo de confirmación no pudo enviarse; puedes pedir la baja desde Contactos.')
      setEmail(''); setConsent(false)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo registrar tu correo. Inténtalo de nuevo.')
    } finally { setBusy(false) }
  }

  return <form className="edu-notify" onSubmit={submit} aria-labelledby={id + '-title'}>
    <h3 id={id + '-title'}>Avísame cuando haya cursos</h3>
    <fieldset disabled={busy}>
      <label htmlFor={id + '-email'}>Correo electrónico</label>
      <input id={id + '-email'} type="email" autoComplete="email" required maxLength={254} value={email} onChange={event => setEmail(event.target.value)} />
      <label className="edu-notify-consent">
        <input type="checkbox" required checked={consent} onChange={event => setConsent(event.target.checked)} />
        <span>Autorizo recibir este aviso y he leído la <Link to="/politicas/privacidad">política de privacidad</Link>.</span>
      </label>
    </fieldset>
    <button className="home-button tech-btn" disabled={busy}>{busy ? 'Registrando…' : 'Avísame'}</button>
    {notice && <p className="edu-notify-ok" role="status">{notice}</p>}
    {error && <p className="edu-notify-error" role="alert">{error}</p>}
  </form>
}
