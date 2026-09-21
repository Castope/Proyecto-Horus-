import { useEffect, useRef, useState } from 'react';
import type { ChatTurn } from './chatApi';
import ChatIcon from './ChatIcon';

type Section = 'cursos' | 'servicios' | 'preguntas-frecuentes';
type Item = { id: number; titulo?: string; pregunta?: string; categoria?: string; descripcion?: string; respuesta?: string; temario?: string; modalidad?: string; duracion?: string; fecha_inicio?: string; alcance?: string };
type Action = 'descripcion' | 'temario' | 'modalidad' | 'fecha' | 'alcance' | 'respuesta';
const titles: Record<Section, string> = { cursos: 'Cursos y capacitaciones', servicios: 'Servicios tecnológicos', 'preguntas-frecuentes': 'Preguntas frecuentes' };
const text = (value?: string) => value?.replace(/<[^>]*>/g, '').trim() || 'Este dato todavía no está publicado. Puedes solicitar información al equipo.';

async function get<T>(path: string, signal: AbortSignal): Promise<T> {
  const response = await fetch('/api/' + path, { signal, cache: 'no-store' });
  if (!response.ok) throw new Error(response.status === 404 ? 'Este contenido ya no está publicado. Vuelve a cargar las opciones.' : 'No pudimos consultar el catálogo. Vuelve a intentar.');
  return response.json();
}

export default function GuidedMenu({ onAnswer, onContact, onWrite }: {
  onAnswer: (question: string, answer: ChatTurn) => void;
  onContact: (topic?: string) => void;
  onWrite: () => void;
}) {
  const [section, setSection] = useState<Section | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [category, setCategory] = useState('');
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const actionController = useRef<AbortController | null>(null);
  const actionLock = useRef(false);

  useEffect(() => () => actionController.current?.abort(), []);
  useEffect(() => {
    if (!section) return;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);
    let current = true;
    setLoading(true); setError(''); setItems([]); setSelected(''); setCategory('');
    const load = async () => {
      const records: Item[] = [];
      let page = 1;
      let pages = 1;
      do {
        const data = await get<{ items: Item[]; pagination: { pages: number } }>(section + '?limit=100&page=' + page, controller.signal);
        records.push(...data.items); pages = data.pagination.pages; page++;
      } while (page <= pages);
      if (current) setItems([...new Map(records.map(item => [item.id, item])).values()]);
    };
    void load().catch(err => {
      if (current) setError(controller.signal.aborted ? 'La consulta tardó demasiado. Vuelve a intentar.' : err.message);
    }).finally(() => { window.clearTimeout(timeout); if (current) setLoading(false); });
    return () => { current = false; controller.abort(); window.clearTimeout(timeout); };
  }, [section, reload]);

  const selectedItem = items.find(item => String(item.id) === selected);
  const name = (item: Item) => item.titulo || item.pregunta || 'Sin título';
  const selectSection = (value: Section | null) => {
    actionController.current?.abort(); actionController.current = null; actionLock.current = false; setBusy(false);
    setItems([]); setSelected(''); setCategory(''); setError(''); setSection(value);
  };
  const answer = async (action: Action, label: string) => {
    if (!section || !selectedItem || actionLock.current) return;
    actionLock.current = true; setBusy(true); setError('');
    const controller = new AbortController(); actionController.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 15000);
    try {
      // Recheck publication and current data on every action, even if the menu is old.
      const { item } = await get<{ item: Item }>(section + '/' + selectedItem.id, controller.signal);
      if (controller.signal.aborted) return;
      let content: string;
      if (action === 'modalidad') {
        const modalities: Record<string, string> = { virtual: 'Virtual', presencial: 'Presencial', hibrida: 'Híbrida' };
        content = 'Modalidad: ' + (modalities[item.modalidad || ''] || text(item.modalidad)) + '\nDuración: ' + text(item.duracion);
      } else if (action === 'fecha') {
        content = item.fecha_inicio ? 'Fecha de inicio publicada: ' + item.fecha_inicio.slice(0, 10) + '.\nConsulta con el equipo si la convocatoria sigue abierta; esta fecha no confirma cupos.' : 'No hay fecha de inicio publicada. Solicita información al equipo.';
      } else content = text(item[action]);
      const title = name(item);
      onAnswer(label + ': ' + title, { role: 'assistant', content: (title + '\n\n' + content).slice(0, 4000),
        sources: [{ id: section + '-' + item.id, title, text: content }] });
    } catch (err) {
      if (actionController.current === controller) setError(controller.signal.aborted ? 'La consulta tardó demasiado. Vuelve a intentar.' : err instanceof Error ? err.message : 'No se pudo consultar el contenido.');
    } finally {
      window.clearTimeout(timeout);
      if (actionController.current === controller) { actionLock.current = false; setBusy(false); }
    }
  };

  return <section className="hc-guide" aria-label="Opciones del asistente">
    <div className="hc-guide-heading"><strong>{section ? titles[section] : 'Elige una opción para comenzar'}</strong>
      {section && <button type="button" onClick={() => selectSection(null)}>← Menú</button>}</div>
    {!section ? <div className="hc-guide-options">
      {(Object.keys(titles) as Section[]).map(key => <button type="button" key={key} onClick={() => selectSection(key)}><span className={'hc-option-icon hc-option-' + key}><ChatIcon name={key === 'cursos' ? 'book' : key === 'servicios' ? 'tools' : 'help'} size={18} /></span>
        <span className="hc-option-copy"><strong>{titles[key]}</strong><small>{key === 'cursos' ? 'Aprende algo nuevo' : key === 'servicios' ? 'Impulsa tu proyecto' : 'Resuelve tus dudas'}</small></span>
        <span className="hc-option-arrow"><ChatIcon name="arrow" size={14} /></span></button>)}
      <button type="button" onClick={() => onContact()}><span className="hc-option-icon hc-option-contact"><ChatIcon name="person" size={18} /></span><span className="hc-option-copy"><strong>Hablar con el equipo</strong><small>Te ayudamos a dar el paso</small></span><span className="hc-option-arrow"><ChatIcon name="arrow" size={14} /></span></button>
      <button type="button" className="hc-option-write" onClick={onWrite}><span>¿Tienes otra consulta? Escríbenos</span><ChatIcon name="chat" size={15} /></button>
    </div> : <>
      {loading ? <p role="status">Cargando opciones publicadas…</p> : !error && !items.length ? <p>No hay opciones publicadas por ahora. Puedes escribir tu consulta o solicitar atención.</p> : null}
      {!!items.length && <fieldset disabled={loading || busy}>
        {section === 'preguntas-frecuentes' && <label>Categoría
          <select value={category} onChange={event => { setCategory(event.target.value); setSelected(''); }}>
            <option value="">Todas las categorías</option>
            {[...new Set(items.map(item => item.categoria || 'General'))].sort().map(value => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>}
        <label>{section === 'cursos' ? 'Selecciona un curso o capacitación' : section === 'servicios' ? 'Selecciona un servicio' : 'Selecciona una pregunta'}
          <select value={selected} onChange={event => setSelected(event.target.value)}>
            <option value="">Elige una opción</option>
            {items.filter(item => !category || (item.categoria || 'General') === category).map(item => <option key={item.id} value={item.id}>{name(item)}</option>)}
          </select>
        </label>
        {selectedItem && <div className="hc-guide-actions">
          {section === 'cursos' && <>
            <button type="button" onClick={() => void answer('temario', 'Ver temario')}>Ver temario</button>
            <button type="button" onClick={() => void answer('modalidad', 'Modalidad y duración')}>Modalidad y duración</button>
            <button type="button" onClick={() => void answer('fecha', 'Fecha de inicio')}>Fecha de inicio</button>
          </>}
          {section === 'servicios' && <>
            <button type="button" onClick={() => void answer('descripcion', 'Conocer servicio')}>Conocer servicio</button>
            <button type="button" onClick={() => void answer('alcance', 'Ver alcance')}>Ver alcance</button>
          </>}
          {section === 'preguntas-frecuentes' && <button type="button" onClick={() => void answer('respuesta', 'Ver respuesta')}>Ver respuesta</button>}
          <button type="button" onClick={() => onContact(name(selectedItem))}>Solicitar información</button>
        </div>}
      </fieldset>}
      {busy && <p role="status">Consultando información…</p>}
      {error && <p className="hc-guide-error" role="alert">{error} <button type="button" onClick={() => setReload(value => value + 1)} disabled={loading || busy}>Recargar opciones</button></p>}
      <button type="button" className="hc-back" onClick={onWrite}>Prefiero escribir mi consulta</button>
    </>}
  </section>;
}
