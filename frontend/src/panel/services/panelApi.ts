import { notifyContentChange } from '../../contentUpdates';
import { API_BASE } from '../../apiBase';
import { resolveContentImages } from '../../contentImages';
import { reportExpiredSession } from '../context/sessionEvents';
export class PanelApiError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

export async function panelRequest<T>(path: string, token: string | null, method = 'GET', body?: unknown, signal?: AbortSignal): Promise<T> {
  const response = await fetch(API_BASE + '/admin/' + path, {
    method, signal, cache: 'no-store',
    headers: { ...(token ? { Authorization: 'Bearer ' + token } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await response.json().catch(() => null);
  if (response.status === 401) reportExpiredSession(token); // con el token de ESTA petición: una sesión nueva no se cierra por un 401 antiguo
  if (!response.ok || data?.ok === false) {
    const detail = data?.mensaje || data?.message;
    throw new PanelApiError(Array.isArray(detail) ? detail.join(' · ') : detail || 'No se pudo completar la operación (' + response.status + ').', response.status);
  }
  if (!data) throw new PanelApiError('El servidor devolvió una respuesta inválida.', response.status);
  if(method!=='GET')notifyContentChange(path.split(/[/?]/)[0]);
  return resolveContentImages(data) as T;
}

export const errorMessage = (error: unknown) => error instanceof Error ? error.message : 'No se pudo conectar con el servidor.';
