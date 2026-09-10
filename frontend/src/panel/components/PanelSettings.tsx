import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useAdminAuth } from '../context';
import { panelRequest, errorMessage } from '../services/panelApi';
import PanelIcon from './PanelIcon';
type Setting = { clave: string; valor: string; descripcion: string; grupo: string };
export default function PanelSettings() {
  const { token } = useAdminAuth();
  const [settings, setSettings] = useState<Setting[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const lock = useRef(false);
  const [reload, setReload] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError('');
    panelRequest<{ settings: Setting[] }>('settings', token!, 'GET', undefined, controller.signal).then(data => {
      setSettings(data.settings); setValues(Object.fromEntries(data.settings.map(s => [s.clave, s.valor])));
    }).catch(err => { if (!controller.signal.aborted) setError(errorMessage(err)); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [token, reload]);
  const save = async (event: FormEvent) => {
    event.preventDefault(); if (lock.current) return; lock.current = true; setSaving(true); setError(''); setNotice('');
    try {
      await panelRequest('settings', token!, 'PUT', { ajustes: values });
      setSettings(previous => previous.map(s => ({ ...s, valor: values[s.clave] })));
      setNotice('La información de la empresa se guardó correctamente.');
    } catch (err) { setError(errorMessage(err)); }
    finally { lock.current = false; setSaving(false); }
  };
  return <><div className="hp-heading"><div><p className="hp-kicker">ADMINISTRACIÓN</p><h1>Información de la empresa</h1><p>Mantén tus datos de contacto y redes actualizados.</p></div><button className="hp-btn" disabled={loading || saving} onClick={() => setReload(n => n + 1)}><PanelIcon name="refresh" />Recargar</button></div>
    {notice && <p className="hp-notice" role="status">{notice}</p>}{error && <p className="hp-error" role="alert">{error}</p>}
    {loading ? <div className="hp-empty" role="status">Cargando configuración…</div> : <form onSubmit={save}>
      {[...new Set(settings.map(s => s.grupo))].map(group => <section className="hp-card hp-settings-card" key={group}><div className="hp-card-heading"><div><p className="hp-kicker">DATOS INSTITUCIONALES</p><h2 className="hp-capitalize">{group}</h2></div><PanelIcon name="settings" /></div><fieldset className="hp-form-grid" disabled={saving}><legend className="hp-sr">{group}</legend>
        {settings.filter(s => s.grupo === group).map(s => <label key={s.clave}>{s.descripcion || s.clave}<input value={values[s.clave] || ''} onChange={e => setValues(prev => ({ ...prev, [s.clave]: e.target.value }))} /></label>)}</fieldset></section>)}
      {settings.length > 0 && <div className="hp-settings-save"><button type="button" className="hp-btn" disabled={saving} onClick={() => setValues(Object.fromEntries(settings.map(s => [s.clave, s.valor])))}>Restablecer cambios</button><button className="hp-btn hp-btn-primary" disabled={saving}>{saving ? 'Guardando…' : 'Guardar configuración'}<PanelIcon name="check" /></button></div>}
      {!settings.length && !error && <div className="hp-empty"><p>No hay ajustes disponibles.</p></div>}
    </form>}
  </>;
}
