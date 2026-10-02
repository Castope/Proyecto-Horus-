import { useEffect, useRef, useState, type SubmitEvent } from 'react';
import { useAdminAuth } from '../context';
import { panelRequest, errorMessage } from '../services/panelApi';
import type { ConvenioDetalle, ConvenioResponse } from '../../types/convenios';
import PanelDialog from './PanelDialog';
import ImageUpload from './ImageUpload';
import ConvenioPhotosEditor from './ConvenioPhotosEditor';
import PublicImage from '../../components/PublicImage';

export default function ConvenioEditor({ initial, onClose, onSaved }: {
  initial: ConvenioDetalle | null; onClose: () => void; onSaved: () => void;
}) {
  const { token } = useAdminAuth();
  const [item, setItem] = useState(initial);
  const [fields, setFields] = useState(() => ({
    nombre: initial?.nombre || '', sigla: initial?.sigla || '', logo_url: initial?.logo_url || '',
    descripcion_corta: initial?.descripcion_corta || '', descripcion_completa: initial?.descripcion_completa || '',
    informacion_adicional: initial?.informacion_adicional || '', orden: String(initial?.orden || 0), visible: initial?.visible ?? false,
  }));
  const [busy, setBusy] = useState(false), [uploading, setUploading] = useState(false), [photosBusy, setPhotosBusy] = useState(false);
  const [error, setError] = useState(''), [notice, setNotice] = useState('');
  const controller = useRef<AbortController | null>(null);
  const locked = busy || uploading || photosBusy;
  useEffect(() => () => { controller.current?.abort(); controller.current = null; }, []);
  const text = (name: keyof Omit<typeof fields, 'visible'>, value: string) => setFields(v => ({ ...v, [name]: value }));
  const submit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault(); if (locked || controller.current) return;
    const c = new AbortController(); controller.current = c;
    const timeout = window.setTimeout(() => c.abort(), 15000);
    setBusy(true); setError(''); setNotice('');
    try {
      const response = await panelRequest<ConvenioResponse>('convenios' + (item ? '/' + item.id : ''), token, item ? 'PUT' : 'POST',
        { ...fields, orden: Number(fields.orden) }, c.signal);
      if (!c.signal.aborted) { setItem(response.item); setNotice('Convenio guardado. Puedes administrar sus fotografías.'); onSaved(); }
    } catch (e) { if (controller.current === c) setError(c.signal.aborted ? 'La operación tardó demasiado. Revisa el listado antes de reintentar.' : errorMessage(e)); }
    finally { window.clearTimeout(timeout); if (controller.current === c) { controller.current = null; setBusy(false); } }
  };
  return <PanelDialog title={item ? 'Editar convenio' : 'Nuevo convenio'} busy={locked} onClose={onClose}>
    <form className="hp-form hp-convenio-form" onSubmit={submit}>
      <fieldset disabled={locked}>
        <label>Nombre<input name="nombre" required minLength={2} maxLength={160} value={fields.nombre} onChange={e => text('nombre', e.target.value)} /></label>
        <label>Sigla<input name="sigla" maxLength={50} value={fields.sigla} onChange={e => text('sigla', e.target.value)} /></label>
        <label>URL del logo<input name="logo_url" type="url" maxLength={2048} value={fields.logo_url} onChange={e => text('logo_url', e.target.value)} /></label>
        <div className="hp-convenio-logo-field"><span className="hp-convenio-logo"><PublicImage src={fields.logo_url} title="Logo del convenio" /></span>
          <ImageUpload onUploaded={url => text('logo_url', url)} onBusyChange={setUploading} />
          <button type="button" className="hp-btn" onClick={() => text('logo_url', '')}>Quitar logo</button></div>
        <label>Descripción corta<textarea name="descripcion_corta" required minLength={3} maxLength={2000} rows={3} value={fields.descripcion_corta} onChange={e => text('descripcion_corta', e.target.value)} /></label>
        <label>Descripción completa<textarea name="descripcion_completa" maxLength={20000} rows={5} value={fields.descripcion_completa} onChange={e => text('descripcion_completa', e.target.value)} /></label>
        <label>Información adicional<textarea name="informacion_adicional" maxLength={20000} rows={4} value={fields.informacion_adicional} onChange={e => text('informacion_adicional', e.target.value)} /></label>
        <label>Orden<input name="orden" type="number" required min={0} max={1000000} step={1} value={fields.orden} onChange={e => text('orden', e.target.value)} /></label>
        <label><input name="visible" type="checkbox" checked={fields.visible} onChange={e => setFields(v => ({ ...v, visible: e.target.checked }))} />Visible en Home</label>
      </fieldset>
      {error && <p className="hp-error" role="alert">{error}</p>}{notice && <p className="hp-notice" role="status">{notice}</p>}
      <div className="hp-convenio-actions"><button className="hp-btn hp-btn-primary" disabled={locked}>{busy ? 'Guardando…' : 'Guardar convenio'}</button>
        <button type="button" className="hp-btn" disabled={locked} onClick={onClose}>Cerrar</button></div>
    </form>
    {item ? <ConvenioPhotosEditor key={item.id} convenioId={item.id} initialFotos={item.fotos} disabled={busy || uploading}
      onBusyChange={setPhotosBusy} /> : <p>Guarda el convenio para agregar sus fotografías.</p>}
  </PanelDialog>;
}
