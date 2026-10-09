import { useEffect, useId, useRef, useState, type SubmitEvent } from 'react';
import { useAdminAuth } from '../context';
import { PanelApiError, panelRequest, errorMessage } from '../services/panelApi';
import { useRequestStatus } from '../hooks/useRequestStatus';
import { useUnsavedChanges } from '../unsaved/unsavedContext';
import { useLatest } from '../hooks/useLatest';
import { mailResultFromFailure, mailResultFromSuccess, type MailResult } from '../services/mailOutcome';
import { ATTENTION_FIELDS, FIELD_LABELS, isOlderThan, reconcile, valuesOf, type AttentionField, type AttentionValues } from '../services/attentionMerge';
type SendInfo = { estado: string; fecha: string; intento: string } | null;
type Attention = AttentionValues & { revision: number; historial: { accion: string; usuario: number; fecha: string }[]; envios?: { respuesta: SendInfo; constancia: SendInfo } };
type MailAction = 'send' | 'receipt';
const MAIL_TIMEOUT_MS = 25_000; // más que el límite del proveedor en el servidor: cortar antes no prueba que el correo no salió
const SEND_STATE: Record<string, string> = { iniciado: 'envío iniciado, sin resultado', aceptado: 'aceptado por el proveedor (no confirma la entrega)', fallido: 'no se pudo enviar', incierto: 'no se pudo confirmar si salió' };
// Banner único (sin avisos duplicados): 'comparing' mientras se compara tras un 409; 'conflict' y 'compare-error' exigen una acción antes de guardar.
type Banner = { kind: 'comparing' | 'conflict' | 'merged' | 'compare-error'; text: string };
const COMPARE_TIMEOUT_MS = 15_000;
const SAVE_TIMEOUT_MS = 15_000;
const stateText = (value: string) => value.replace('_', ' ');

// Tres versiones: `base` (última del servidor que se aceptó como punto de partida), `form` (el borrador local) y la versión fresca del servidor.
// Nunca se adopta una revisión nueva sin comparar qué cambió (ver services/attentionMerge.ts): un campo cambiado por ambas partes con valores distintos
// es un conflicto y exige elegir; el guardado siempre usa la revisión de la última versión comparada, así que el servidor sigue rechazando (409) cualquier
// cambio ajeno posterior en vez de pisarlo.
export default function AttentionEditor({ resource, id, onSaved, onPendingChange, syncKey = 0, stateOnly = false }: { resource: 'messages' | 'reclamaciones'; id: number; onSaved?: (item: { estado: string }, changed?: boolean) => void; onPendingChange?: (pending: boolean) => void; syncKey?: number; stateOnly?: boolean }) {
  const { token } = useAdminAuth(); const latestToken = useLatest(token);
  const conflictId = useId();
  const [reload, setReload] = useState(0);
  const [base, setBase] = useState<Attention | null>(null);
  const [form, setForm] = useState<AttentionValues | null>(null);
  const [pending, setPending] = useState<AttentionField[]>([]); // campos con conflicto aún sin resolver
  const [banner, setBanner] = useState<Banner | null>(null);
  const [comparing, setComparing] = useState(false);
  const [busy, setBusy] = useState(false), [actionError, setActionError] = useState(''), [notice, setNotice] = useState('');
  const [mail, setMail] = useState<(MailResult & { action: MailAction }) | null>(null);
  const baseRef = useLatest(base), formRef = useLatest(form);
  const lock = useRef(false); // un solo envío a la vez, incluso con dobles clics
  const lifetime = useRef({ active: false });
  const sequence = useRef(0), comparison = useRef<AbortController | null>(null), synced = useRef(syncKey);
  const bannerBox = useRef<HTMLDivElement>(null), saveButton = useRef<HTMLButtonElement>(null), conflictBox = useRef<HTMLElement>(null);
  const path = 'seguimiento/' + resource + '/' + id, pathRef = useLatest(path);
  const mailBox = useRef<HTMLDivElement>(null), noSendButton = useRef<HTMLButtonElement>(null), sendButton = useRef<HTMLButtonElement>(null), receiptButton = useRef<HTMLButtonElement>(null);
  const { loading, error, setLoading, setError } = useRequestStatus(resource + id + ':' + reload);

  // Hay cambios cuando el borrador difiere de la base. Un campo en conflicto deja de serlo si ya coincide con el del servidor.
  const dirty = !!form && !!base && ATTENTION_FIELDS.some(key => form[key] !== base[key]);
  const conflicts = pending.filter(key => form && base && form[key] !== base[key]);
  const confirmLeave = useUnsavedChanges(dirty, (resource === 'messages' ? 'seguimiento de la consulta #' : 'seguimiento de la reclamación #') + id + (conflicts.length ? ' (con conflictos)' : ''));
  const blocked = conflicts.length > 0 || banner?.kind === 'compare-error' || comparing;

  useEffect(() => {
    const instance = { active: true }; lifetime.current = instance;
    return () => { instance.active = false; comparison.current?.abort(); };
  }, []);

  // Carga inicial (o «Recargar seguimiento», que la persona confirmó): reemplaza base y borrador.
  useEffect(() => {
    const c = new AbortController(); let live = true;
    void panelRequest<{ item: Attention }>(path, latestToken.current, 'GET', undefined, c.signal).then(r => { if (live) { setBase(r.item); setForm(valuesOf(r.item)); setPending([]); setBanner(null); } })
      .catch(e => { if (live) setError(errorMessage(e)); }).finally(() => { if (live) setLoading(false); });
    return () => { live = false; c.abort(); };
  }, [path, latestToken, reload, setLoading, setError]);

  // Compara el servidor con la base y el borrador. `reason`: 'sync' (otra pantalla cambió algo, p. ej. una acción rápida), 'conflict' (el PUT devolvió 409) o 'retry'.
  const compareWithServer = (reason: 'sync' | 'conflict' | 'retry') => {
    const instance = lifetime.current, requestPath = path;
    const mine = ++sequence.current; comparison.current?.abort();
    const controller = new AbortController(); comparison.current = controller;
    const timer = window.setTimeout(() => controller.abort(), COMPARE_TIMEOUT_MS);
    setComparing(true);
    if (reason !== 'sync') setBanner({ kind: 'comparing', text: 'Otro administrador actualizó este seguimiento. Estamos comparando sus cambios con tu borrador; no se pierde nada.' });
    panelRequest<{ item: Attention }>(path, latestToken.current, 'GET', undefined, controller.signal).then(response => {
      if (!instance.active || mine !== sequence.current || pathRef.current !== requestPath) return; // edición desmontada, comparación más reciente u otro registro
      const currentBase = baseRef.current, currentForm = formRef.current;
      if (!currentBase || !currentForm) return;
      if (isOlderThan(response.item, currentBase)) { if (reason !== 'sync') setBanner(null); return; } // respuesta fuera de orden: más antigua que lo ya aceptado
      const result = reconcile(valuesOf(currentBase), currentForm, valuesOf(response.item));
      setBase(response.item); setForm(result.merged); // la base pasa a la versión fresca: guardar usará SU revisión
      setPending(previous => [...new Set([...previous.filter(key => result.merged[key] !== response.item[key]), ...result.conflicts])]);
      if (result.conflicts.length) setBanner({ kind: 'conflict', text: 'Otro administrador actualizó este seguimiento. En los campos marcados tu borrador y la versión del servidor son distintos: elige qué versión conservar antes de guardar.' });
      else setBanner(reason === 'sync' ? null : { kind: 'merged', text: 'Se incorporaron los cambios de otro administrador y se conservó tu borrador. Revisa el seguimiento y vuelve a guardar.' });
    }).catch(() => {
      if (!instance.active || mine !== sequence.current) return;
      // Sin la versión fresca no se puede comparar: el borrador se conserva y no se permite guardar con una revisión que no se ha comparado.
      if (reason !== 'sync') setBanner({ kind: 'compare-error', text: 'No pudimos comprobar los cambios de otro administrador, así que todavía no se puede resolver el conflicto. Tu borrador se conserva; vuelve a intentar la comparación.' });
    }).finally(() => { window.clearTimeout(timer); if (instance.active && mine === sequence.current) setComparing(false); });
  };
  const compareRef = useLatest(compareWithServer);
  // Un cambio de `syncKey` (p. ej. el estado se actualizó desde una acción rápida) compara en segundo plano SIN reconstruir el editor ni borrar lo escrito.
  useEffect(() => { if (synced.current === syncKey) return; synced.current = syncKey; compareRef.current('sync'); }, [syncKey, compareRef]);
  // Foco: el banner que exige una acción lo recibe al aparecer; al resolver el último conflicto el foco pasa a «Guardar seguimiento».
  useEffect(() => { if (banner && (banner.kind === 'conflict' || banner.kind === 'compare-error')) bannerBox.current?.focus(); }, [banner]);

  const resolve = (key: AttentionField, choice: 'mine' | 'theirs') => {
    if (choice === 'theirs' && base) setForm(current => current && { ...current, [key]: base[key] });
    setPending(previous => previous.filter(item => item !== key));
    window.setTimeout(() => (conflictBox.current?.querySelector<HTMLElement>('.hp-conflict-field button') ?? saveButton.current)?.focus(), 0);
  };
  // Foco del resultado de un envío: con confirmación pendiente va a la opción segura («No enviar»); si no, al aviso (los botones se deshabilitaron
  // mientras se enviaba y el foco habría caído al <body>).
  useEffect(() => { if (mail) (mail.needsConfirm ? noSendButton.current : mailBox.current)?.focus(); }, [mail]);
  const dismissMail = () => { const action = mail?.action; setMail(null); window.setTimeout(() => (action === 'send' ? sendButton.current : receiptButton.current)?.focus(), 0); };
  const conflictOf409 =(err: unknown) => err instanceof PanelApiError && err.status === 409;
  const save = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form || !base || lock.current || blocked) return;
    // La tabla heredada reutiliza revisión y fusión D3. Revisar sin editar no crea seguimiento ni reabre casos.
    if (stateOnly && !dirty) { onSaved?.(base, false); return; }
    const instance = lifetime.current, controller = new AbortController();
    let timedOut = false;
    const timer = stateOnly ? window.setTimeout(() => { timedOut = true; controller.abort(); }, SAVE_TIMEOUT_MS) : undefined;
    lock.current = true; setBusy(true); onPendingChange?.(true); setActionError(''); setNotice('');
    try {
      const r = await panelRequest<{ item: Attention }>(path, token, 'PUT', { ...form, revision: base.revision }, controller.signal);
      if (!instance.active) return;
      setBase(r.item); setForm(valuesOf(r.item)); setPending([]); setBanner(null); setNotice('Seguimiento guardado.'); onSaved?.(r.item, true);
    } catch (err) {
      if (!instance.active) return;
      // 409 = la revisión quedó obsoleta: el borrador no se toca, no se repite el PUT y se compara con la versión fresca antes de permitir otro guardado.
      if (conflictOf409(err)) compareWithServer('conflict'); else setActionError(timedOut ? 'No pudimos confirmar si se guardó el cambio. Tu borrador se conserva; comprueba el estado guardado antes de reintentar.' : errorMessage(err));
    } finally { window.clearTimeout(timer); lock.current = false; if (instance.active) { setBusy(false); onPendingChange?.(false); } }
  };
  // Envío manual de correo. El resultado se interpreta con services/mailOutcome.ts: un fallo de red, un timeout o un 5xx sin cuerpo NO significan
  // «no se envió» (se muestra como incierto y no se invita a reintentar); un envío ya registrado exige una confirmación explícita (`confirmar_reenvio`).
  // Tras cualquier desenlace se compara en segundo plano con el servidor: la revisión y el historial cambiaron al registrar el intento.
  const runMail = async (action: MailAction, confirmed = false) => {
    if (!base || lock.current) return;
    const instance = lifetime.current, controller = new AbortController(), startedPath = path;
    const timer = window.setTimeout(() => controller.abort(), MAIL_TIMEOUT_MS);
    lock.current = true; setBusy(true); setActionError(''); setNotice(''); setMail(null);
    let result: MailResult;
    try {
      const data = await panelRequest<unknown>(path + (action === 'send' ? '/correo' : '/constancia'), token, 'POST', { ...(action === 'send' ? { revision: base.revision } : {}), ...(confirmed ? { confirmar_reenvio: true } : {}) }, controller.signal);
      result = mailResultFromSuccess(data);
    } catch (err) { result = mailResultFromFailure(err instanceof PanelApiError ? err : undefined); }
    finally { window.clearTimeout(timer); lock.current = false; if (instance.active) setBusy(false); }
    if (!instance.active || pathRef.current !== startedPath) return; // otro registro ocupa ya este editor: la respuesta tardía no le pertenece
    setMail({ ...result, action });
    compareWithServer(result.kind === 'obsoleto' ? 'conflict' : 'sync');
  };
  const receipt = () => runMail('receipt'), send = () => runMail('send');
  const show = (key: AttentionField, value: string) => value.trim() ? (key === 'estado' ? stateText(value) : value) : '(vacío)';
  const flagged = (key: AttentionField) => conflicts.includes(key) ? { 'aria-invalid': true as const, 'aria-describedby': conflictId } : {};

  return <section className="hp-card"><h3>{stateOnly ? 'Estado de atención' : 'Seguimiento de atención'}</h3>
    <button className="hp-btn" disabled={busy || loading} onClick={() => confirmLeave(() => setReload(v => v + 1))}>Recargar seguimiento</button>
    {loading ? <p role="status">Cargando seguimiento…</p> : error ? <p role="alert" className="hp-error">{error}</p> : form && base && <form onSubmit={save} className="hp-form" aria-busy={busy}>
      {stateOnly && busy && <p role="status">Guardando cambios…</p>}
      {banner && <div ref={bannerBox} tabIndex={-1} role={banner.kind === 'conflict' || banner.kind === 'compare-error' ? 'alert' : 'status'} className={'hp-conflict-banner is-' + banner.kind}>
        <p>{banner.text}</p>{banner.kind === 'compare-error' && <button type="button" className="hp-btn" disabled={comparing} onClick={() => compareWithServer('retry')}>Reintentar comparación</button>}
      </div>}
      {conflicts.length > 0 && <section ref={conflictBox} className="hp-conflicts" aria-labelledby={conflictId}>
        <h4 id={conflictId}>Resuelve {conflicts.length === 1 ? 'el conflicto' : 'los ' + conflicts.length + ' conflictos'} para poder guardar</h4>
        {conflicts.map(key => <div key={key} className="hp-conflict-field" role="group" aria-labelledby={conflictId + '-' + key}>
          <h5 id={conflictId + '-' + key}>{FIELD_LABELS[key]}</h5>
          <div className="hp-conflict-versions">
            <div><strong>Tu versión</strong><pre>{show(key, form[key])}</pre></div>
            <div><strong>Versión del servidor</strong><pre>{show(key, base[key])}</pre></div>
          </div>
          <div className="hp-actions"><button type="button" className="hp-btn" onClick={() => resolve(key, 'mine')}>Conservar mi versión</button><button type="button" className="hp-btn" onClick={() => resolve(key, 'theirs')}>Usar la del servidor</button></div>
        </div>)}
      </section>}
      <fieldset disabled={busy}>
        <label>Estado<select value={form.estado} {...flagged('estado')} onChange={e => setForm({ ...form, estado: e.target.value })}>{['nuevo', 'en_proceso', 'atendido', 'archivado'].map(v => <option key={v} value={v}>{stateText(v)}</option>)}</select></label>
        {!stateOnly && <><label>Responsable<input value={form.responsable} maxLength={100} {...flagged('responsable')} onChange={e => setForm({ ...form, responsable: e.target.value })} /></label>
        <label>Notas internas<textarea value={form.notas} maxLength={10000} {...flagged('notas')} onChange={e => setForm({ ...form, notas: e.target.value })} /></label>
        <label>Respuesta al cliente<textarea value={form.respuesta} maxLength={10000} {...flagged('respuesta')} onChange={e => setForm({ ...form, respuesta: e.target.value })} /></label></>}
      </fieldset>
      {actionError && <p role="alert" className="hp-error">{actionError}</p>}{notice && <p role="status" className="hp-notice">{notice}</p>}
      {mail && <div role={mail.kind === 'aceptado' ? 'status' : 'alert'} className={mail.kind === 'aceptado' ? 'hp-notice' : 'hp-error'} data-mail-result={mail.kind} ref={mailBox} tabIndex={-1}>
        <p>{mail.message}</p>
        {mail.needsConfirm && <div className="hp-actions"><button type="button" className="hp-btn hp-btn-primary" disabled={busy} onClick={() => void runMail(mail.action, true)}>Enviar de todos modos</button>
          <button type="button" ref={noSendButton} className="hp-btn" disabled={busy} onClick={dismissMail}>No enviar</button></div>}
      </div>}
      <div className="hp-actions">{!stateOnly && <button type="button" ref={receiptButton} className="hp-btn" disabled={busy} onClick={() => void receipt()}>Reenviar constancia / notificación</button>}
        <button ref={saveButton} className="hp-btn hp-btn-primary" disabled={busy || blocked} aria-describedby={blocked ? conflictId + '-why' : undefined}>{stateOnly ? 'Guardar cambios' : 'Guardar seguimiento'}</button>
        {!stateOnly && <button type="button" ref={sendButton} className="hp-btn" disabled={busy || !base.respuesta} onClick={() => void send()}>Enviar respuesta guardada</button>}</div>
      {blocked && <p id={conflictId + '-why'} className="hp-form-hint">{comparing ? 'Comparando con la versión del servidor…' : conflicts.length ? 'Elige una versión en cada conflicto para poder guardar.' : 'Reintenta la comparación para poder guardar.'}</p>}
      {dirty && <p className="hp-form-hint">Tienes cambios sin guardar.{!stateOnly && ' El correo enviaría la última respuesta guardada, no lo que ves ahora.'}</p>}
      {!stateOnly && <><p>El correo envía la última respuesta guardada. Conserva tus cambios antes de enviarla.</p>
      {(['respuesta', 'constancia'] as const).map(kind => base.envios?.[kind] && <p key={kind} className="hp-form-hint" data-mail-state={kind}>{kind === 'respuesta' ? 'Último envío de la respuesta' : 'Última constancia a la persona'}: {SEND_STATE[base.envios[kind].estado] ?? base.envios[kind].estado} · {new Date(base.envios[kind].fecha).toLocaleString('es-PE')}</p>)}
      <h4>Historial</h4>{base.historial.length ? <ul>{base.historial.map((h, i) => <li key={i}>{new Date(h.fecha).toLocaleString('es-PE')} · {h.accion} · Administrador #{h.usuario}</li>)}</ul> : <p>Aún no hay cambios de seguimiento.</p>}</>}
    </form>}</section>;
}
