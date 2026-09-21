import type { Resource } from '../../types/workspace';
import { label } from '../../types/workspace';
import { ResourceImage } from './ResourceCards';
import { plainText } from './useCollection';
export default function ResourcePreview({ resource, values }: { resource: Resource; values: Record<string, unknown> }) {
  const state = values.activo !== undefined ? (values.activo === true || values.activo === 'activo' ? 'activo' : 'inactivo') : String(values.estado || 'borrador');
  return <aside className="hw-preview" aria-label="Vista previa del contenido">
    {resource.fields.some(field => field.key === 'imagen_url') && <div className="hw-preview-cover"><ResourceImage value={values.imagen_url} title={String(values[resource.title] || 'Vista previa')} /></div>}
    <div className="hw-preview-body"><span className={'hp-badge hp-state-' + state}>{label(state)}</span><h3>{String(values[resource.title] || 'Título del contenido')}</h3>
      <p>{plainText(values.respuesta || values.descripcion || values.mensaje) || 'La descripción aparecerá aquí.'}</p>
      {!!values.modalidad && <div className="hw-facts"><span>{label(values.modalidad)}</span><span>{String(values.duracion || 'Sin duración')}</span></div>}
      <small className="hw-caption">Vista previa editorial. Los cambios se aplican al guardar.</small>
    </div>
  </aside>;
}
