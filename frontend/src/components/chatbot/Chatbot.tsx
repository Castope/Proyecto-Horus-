import { useEffect, useRef, useState, type SubmitEvent } from 'react';
import { Link } from 'react-router-dom';
import { chatRequest, type ChatReply, type ChatTurn } from './chatApi';
import './chatbot.css';
import GuidedMenu from './GuidedMenu';
import ChatIcon from './ChatIcon';

const greeting: ChatTurn = {
  role: 'assistant',
  content: '¡Hola! Soy el asistente de Horus. Te ayudo a consultar cursos, servicios y preguntas frecuentes. ¿Qué estás buscando?',
};
const initialContact = { nombre: '', email: '', telefono: '', asunto: '', mensaje: '', consentimiento: false };

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(true);
  const [menuVersion, setMenuVersion] = useState(0);
  const [turns, setTurns] = useState<ChatTurn[]>([greeting]);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [contactOpen, setContactOpen] = useState(false);
  const [contact, setContact] = useState(initialContact);
  const [success, setSuccess] = useState('');
  const [mode, setMode] = useState('Información del catálogo');
  const dialog = useRef<HTMLDialogElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const log = useRef<HTMLDivElement>(null);
  const controller = useRef<AbortController | null>(null);
  const locked = useRef(false);

  useEffect(() => {
    if (open) dialog.current?.showModal();
    else { dialog.current?.close(); }
  }, [open]);
  useEffect(() => {
    if (log.current) log.current.scrollTop = turns.length === 1 ? 0 : log.current.scrollHeight;
  }, [turns, busy, open, menuOpen]);
  useEffect(() => () => controller.current?.abort(), []);
  useEffect(() => {
    if (open && !busy && !contactOpen && !menuOpen) input.current?.focus();
  }, [open, busy, contactOpen, menuOpen]);

  const close = () => { setOpen(false); launcher.current?.focus(); };
  const reset = () => {
    if (locked.current) return;
    setTurns([greeting]); setMessage(''); setError(''); setSuccess('');
    setMenuOpen(true); setMenuVersion(value => value + 1);
    setContact(initialContact); setContactOpen(false); setMode('Información del catálogo');
    input.current?.focus();
  };
  const send = async (text = message) => {
    const question = text.trim();
    if (!question || question.length > 1000 || locked.current) return;
    locked.current = true; setBusy(true); setError(''); setSuccess('');
    setMenuOpen(false);
    const before = turns;
    setTurns(previous => [...previous, { role: 'user', content: question }]);
    setMessage('');
    const abort = new AbortController(); controller.current = abort;
    const timeout = window.setTimeout(() => abort.abort(), 22000);
    try {
      const response = await chatRequest<ChatReply>('message', {
        message: question,
        history: before.slice(1).slice(-6).map(({ role, content }) => ({ role, content })),
      }, abort.signal);
      setTurns(previous => [...previous, { role: 'assistant' as const, content: response.answer, sources: response.sources }].slice(-30));
      setMode(response.mode === 'ia' ? 'Respuesta asistida por IA' : 'Información del catálogo');
    } catch (err) {
      setTurns(before); setMessage(question);
      setError(abort.signal.aborted ? 'La consulta tardó demasiado. Puedes volver a enviarla.' : err instanceof Error ? err.message : 'No se pudo conectar con el servidor.');
    } finally {
      window.clearTimeout(timeout); locked.current = false; setBusy(false); input.current?.focus();
    }
  };
  const startContact = (topic?: string) => {
    setError(''); setSuccess('');
    setContact(previous => ({ ...previous,
      asunto: topic ? ('Consulta: ' + topic).slice(0, 140) : previous.asunto || 'Consulta desde el asistente',
      mensaje: topic ? 'Quisiera información sobre: ' + topic : previous.mensaje || [...turns].reverse().find(turn => turn.role === 'user')?.content || '',
    }));
    setContactOpen(true);
  };
  const submitContact = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (locked.current || !contact.consentimiento) return;
    locked.current = true; setBusy(true); setError('');
    const abort = new AbortController(); controller.current = abort;
    const timeout = window.setTimeout(() => abort.abort(), 22000);
    try {
      const response = await chatRequest<{ ok: boolean; id: number }>('contact', contact, abort.signal);
      setSuccess('Solicitud #' + response.id + ' registrada. El equipo de Horus podrá contactarte.');
      setContact(initialContact); setContactOpen(false);
    } catch (err) {
      setError(abort.signal.aborted ? 'No pudimos confirmar el registro. Consulta con el equipo antes de reenviar.' : err instanceof Error ? err.message : 'No se pudo conectar con el servidor.');
    } finally { window.clearTimeout(timeout); locked.current = false; setBusy(false); }
  };

  return <>
    <button ref={launcher} className="hc-launcher" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-expanded={open} aria-controls="horus-chat">
      <span className="hc-launcher-icon"><ChatIcon name="chat" size={23} /></span><span className="hc-launcher-copy"><strong>Pregúntale a Horus</strong><small>Tu próximo paso empieza aquí</small></span>
    </button>
    <dialog ref={dialog} id="horus-chat" className="hc-dialog" aria-labelledby="hc-title"
      onCancel={event => { event.preventDefault(); close(); }} onClick={event => { if (event.target === dialog.current) {
        const bounds = dialog.current.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) close();
      } }}>
      <div className="hc-shell">
        <header className="hc-header">
          <span className="hc-mark"><ChatIcon name="spark" size={25} /></span>
          <div><h2 id="hc-title">Asistente Horus</h2><p>Tecnología y formación, más cerca</p></div>
          <button type="button" className="hc-close" aria-label="Cerrar chat" onClick={close}><ChatIcon name="close" size={18} /></button>
        </header>
        <div className="hc-toolbar"><span><i aria-hidden="true" />{mode}</span><button onClick={reset} disabled={busy}><ChatIcon name="reset" size={12} />Nueva conversación</button></div>
        {contactOpen ? <div className="hc-contact">
          <button type="button" className="hc-back" onClick={() => { setContactOpen(false); setError(''); }} disabled={busy}>← Volver al chat</button>
          <h3>Hablemos de lo que necesitas</h3><p>Revisa tu consulta y autoriza que nuestro equipo te contacte.</p>
          <form onSubmit={submitContact}>
            <fieldset disabled={busy}>
              <label>Nombre<input autoFocus required minLength={2} maxLength={100} autoComplete="name" value={contact.nombre} onChange={e => setContact({ ...contact, nombre: e.target.value })} /></label>
              <label>Correo<input required type="email" maxLength={254} autoComplete="email" value={contact.email} onChange={e => setContact({ ...contact, email: e.target.value })} /></label>
              <label>Teléfono<input required type="tel" minLength={6} maxLength={30} autoComplete="tel" value={contact.telefono} onChange={e => setContact({ ...contact, telefono: e.target.value })} /></label>
              <label>Asunto<input required minLength={3} maxLength={140} value={contact.asunto} onChange={e => setContact({ ...contact, asunto: e.target.value })} /></label>
              <label>Tu consulta<textarea required minLength={3} maxLength={5000} rows={3} value={contact.mensaje} onChange={e => setContact({ ...contact, mensaje: e.target.value })} /></label>
              <label className="hc-consent"><input type="checkbox" required checked={contact.consentimiento} onChange={e => setContact({ ...contact, consentimiento: e.target.checked })} /><span>Autorizo a Horus a usar estos datos para atender mi consulta. <Link to="/politicas/privacidad" onClick={close}>Ver privacidad</Link>.</span></label>
              <button className="hc-submit" type="submit">{busy ? 'Registrando…' : 'Enviar solicitud'}</button>
            </fieldset>
          </form>
        </div> : <>
          <div ref={log} className="hc-log" role="log" aria-label="Conversación con Horus" aria-live="polite" aria-relevant="additions">
            {turns.length === 1 && <div className="hc-welcome">
              <span className="hc-eyebrow"><ChatIcon name="spark" size={12} />BIENVENIDO A HORUS</span>
              <h3>Una idea, un proyecto.<br /><span>Empecemos por aquí.</span></h3>
              <p>Explora nuestros cursos y soluciones, o cuéntanos qué tienes en mente.</p>
            </div>}
            {(turns.length === 1 ? [] : turns).map((turn, index) => <article key={index} className={'hc-message hc-' + turn.role}>
              <strong>{turn.role === 'assistant' && <ChatIcon name="spark" size={12} />}{turn.role === 'user' ? 'Tú' : 'Horus'}</strong><p>{turn.content}</p>
              {!!turn.sources?.length && <details className="hc-sources"><summary>Información consultada ({turn.sources.length})</summary>
                {turn.sources.map(source => <div key={source.id}><strong>{source.title}</strong><p>{source.text}</p></div>)}
              </details>}
            </article>)}
            {busy && <p className="hc-thinking" role="status"><span className="hc-thinking-dots" aria-hidden="true"><i /><i /><i /></span>Consultando información…</p>}
            {menuOpen && <GuidedMenu key={menuVersion}
              onAnswer={(question, answer) => {
                setTurns(previous => [...previous, { role: 'user' as const, content: question }, answer].slice(-30));
                setMode('Información del catálogo'); setError(''); setSuccess(''); setMenuOpen(false);
              }}
              onContact={startContact}
              onWrite={() => { setMenuOpen(false); input.current?.focus(); }}
            />}
          </div>
          <div className="hc-compose">
            {!menuOpen && <button type="button" className="hc-menu-return" disabled={busy} onClick={() => setMenuOpen(true)}><ChatIcon name="menu" size={13} />Volver al menú</button>}
            <form onSubmit={event => { event.preventDefault(); void send(); }}>
              <label className="hc-sr" htmlFor="hc-question">Escribe tu consulta</label>
              <input ref={input} id="hc-question" placeholder="¿Cómo podemos ayudarte?" value={message} maxLength={1000} disabled={busy} onChange={event => setMessage(event.target.value)} />
              <button type="submit" disabled={busy || !message.trim()} aria-label="Enviar consulta"><ChatIcon name="send" size={18} /></button>
            </form>
            <button className="hc-handoff" onClick={() => startContact()} disabled={busy}><ChatIcon name="person" size={15} />Solicitar atención del equipo<ChatIcon name="arrow" size={13} /></button>
          </div>
        </>}
        {error && <p className="hc-error" role="alert">{error} <Link to="/contactos" onClick={close}>Ir a Contacto</Link></p>}
        {success && <p className="hc-success" role="status">{success}</p>}
        <footer className="hc-footer"><details><summary><ChatIcon name="lock" size={11} />Tu privacidad importa · Ver detalles</summary><p>Evita compartir datos sensibles en el chat. Si la IA está habilitada, OpenAI procesa la consulta y el contexto reciente. <Link to="/politicas/privacidad" onClick={close}>Política de privacidad</Link></p></details></footer>
      </div>
    </dialog>
  </>;
}
