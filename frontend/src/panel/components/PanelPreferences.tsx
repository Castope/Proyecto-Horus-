import { useState, type SubmitEvent } from 'react';
import { useAdminAuth } from '../context';
import { panelRequest, errorMessage } from '../services/panelApi';
import PanelIcon from './PanelIcon';

// "Ajustes": for now only the signed-in administrator's password.
export default function PanelPreferences() {
  const { token, logout } = useAdminAuth();
  const [busy, setBusy] = useState(false), [actionError, setActionError] = useState('');
  const [current, setCurrent] = useState(''), [password, setPassword] = useState(''), [confirm, setConfirm] = useState('');
  const submit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault(); if (busy) return; setActionError('');
    if (password !== confirm) { setActionError('Las contraseñas no coinciden.'); return; }
    setBusy(true);
    try { await panelRequest('password', token, 'POST', { current_password: current, password }); logout(); }
    catch (error) { setActionError(errorMessage(error)); }
    finally { setBusy(false); }
  };
  return <>
    <div className="hp-heading"><div><p className="hp-kicker">ESPACIO DE TRABAJO</p><h1>Ajustes</h1><p>Configura las preferencias de tu cuenta y del panel.</p></div></div>
    <section className="hp-card hp-password-card" aria-labelledby="password-title">
      <div className="hp-card-heading"><div><h2 id="password-title">Cambiar contraseña</h2></div><PanelIcon name="lock" /></div>
      {actionError && <p role="alert" className="hp-error">{actionError}</p>}
      <form className="hp-form" onSubmit={submit}>
        <fieldset disabled={busy}>
          <label>Contraseña actual<input type="password" required value={current} autoComplete="current-password" onChange={e => setCurrent(e.target.value)} /></label>
          <label>Nueva contraseña<input type="password" required minLength={8} maxLength={72} value={password} autoComplete="new-password" onChange={e => setPassword(e.target.value)} /></label>
          <label>Repite la nueva contraseña<input type="password" required value={confirm} autoComplete="new-password" onChange={e => setConfirm(e.target.value)} /></label>
        </fieldset>
        <p className="hp-form-hint">El cambio cierra las sesiones actuales; luego tendrás que iniciar sesión.</p>
        <button className="hp-btn hp-btn-primary" disabled={busy}>{busy ? 'Actualizando…' : 'Actualizar contraseña'}</button>
      </form>
    </section>
  </>;
}
