import { useEffect, useRef, type ReactNode } from 'react';
import PanelIcon from './PanelIcon';
export default function PanelDialog({ title, children, onClose, busy = false }: { title: string; children: ReactNode; onClose: () => void; busy?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    ref.current?.showModal();
    return () => { ref.current?.close(); previous?.focus(); };
  }, []);
  return <dialog ref={ref} className="hp-dialog" aria-labelledby="panel-dialog-title"
    onCancel={e => { e.preventDefault(); if (!busy) onClose(); }}>
    <header><div><p className="hp-kicker">HORUS / ADMINISTRACIÓN</p><h2 id="panel-dialog-title">{title}</h2></div>
      <button type="button" className="hp-icon-btn" aria-label="Cerrar ventana" onClick={onClose} disabled={busy}><PanelIcon name="close" /></button></header>
    {children}
  </dialog>;
}
