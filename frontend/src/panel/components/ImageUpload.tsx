import { useEffect, useRef, useState } from 'react';
import { API_BASE } from '../../apiBase';
import { useAdminAuth } from '../context';

export default function ImageUpload({ onUploaded, multiple = false, disabled = false, onBusyChange }: {
  onUploaded: (url: string) => void | Promise<void>; multiple?: boolean; disabled?: boolean; onBusyChange?: (busy: boolean) => void;
}) {
  const { token } = useAdminAuth();
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  const controller = useRef<AbortController | null>(null), input = useRef<HTMLInputElement>(null);
  useEffect(() => () => { controller.current?.abort(); controller.current = null; }, []);
  const upload = async (files: File[]) => {
    if (!files.length || disabled || controller.current) return;
    if (files.some(file => file.size > 5 * 1024 * 1024)) { setError('La imagen supera los 5 MB.'); if (input.current) input.current.value = ''; return; }
    const c = new AbortController(); controller.current = c;
    setBusy(true); onBusyChange?.(true); setError('');
    try {
      for (const file of files) {
        const timeout = window.setTimeout(() => c.abort(), 30000);
        try {
          const body = new FormData(); body.append('file', file);
          const response = await fetch(API_BASE + '/admin/uploads', { method: 'POST', headers: { Authorization: 'Bearer ' + token }, body, signal: c.signal });
          if (response.status === 401) window.dispatchEvent(new Event('horus:session-expired'));
          const data = await response.json() as { path?: string; message?: string | string[] };
          if (!response.ok || !data.path) throw new Error(Array.isArray(data.message) ? data.message.join(' · ') : data.message || 'No se pudo subir la imagen.');
          if (c.signal.aborted || controller.current !== c) return;
          await onUploaded(new URL(API_BASE + data.path, window.location.origin).href);
          if (c.signal.aborted || controller.current !== c) return;
        } finally { window.clearTimeout(timeout); }
      }
    } catch (e) {
      if (controller.current === c) setError((c.signal.aborted ? 'La carga tardó demasiado.' : e instanceof Error ? e.message : 'No se pudo subir la imagen.') +
        (multiple ? ' Las fotografías ya agregadas se conservaron.' : ''));
    } finally {
      if (controller.current === c) { controller.current = null; setBusy(false); onBusyChange?.(false); if (input.current) input.current.value = ''; }
    }
  };
  return <span><input ref={input} type="file" accept="image/png,image/jpeg,image/webp" multiple={multiple}
    aria-label={multiple ? 'Subir fotografías PNG, JPEG o WebP' : 'Subir imagen PNG, JPEG o WebP'} disabled={busy || disabled}
    onChange={e => void upload(Array.from(e.target.files || []).slice(0, multiple ? undefined : 1))} />
    {busy && <span role="status">{multiple ? 'Subiendo fotografías…' : 'Subiendo imagen…'}</span>}
    {error && <span role="alert">{error}</span>}
    <small>{multiple ? 'Hasta 5 MB por foto. Se guardan al completar cada carga.' : 'Hasta 5 MB. Elige la imagen, espera la carga y guarda el registro.'}</small></span>;
}
