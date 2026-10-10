import { notifyContentChange } from '../../contentUpdates';
import { API_BASE } from '../../apiBase';
import { resolveContentImages } from '../../contentImages';
import { reportExpiredSession } from '../context/sessionEvents';
export const SERVER_FAILURE = 'El servidor no pudo completar la operación. Inténtalo de nuevo en unos minutos.';
export class PanelApiError extends Error {
  // `body`: cuerpo JSON de la respuesta de error, para que los envíos de correo lean el resultado estructurado (envio, motivo, item).
  constructor(message: string, public status: number, public body?: unknown) { super(message); }
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
    // Un 500 es un fallo interno no controlado («Internal server error»): su texto es técnico y nunca se muestra. Las excepciones deliberadas del
    // backend (400/409, 503 «el correo no está disponible», etc.) traen un mensaje pensado para la persona y se conservan.
    const technical = response.status === 500 || /^internal server error\b/i.test(String(detail ?? ''));
    const message = technical ? SERVER_FAILURE : Array.isArray(detail) ? detail.join(' · ') : detail || 'No se pudo completar la operación (' + response.status + ').';
    throw new PanelApiError(message, response.status, data);
  }
  if (!data) throw new PanelApiError('El servidor devolvió una respuesta inválida.', response.status);
  if(method!=='GET')notifyContentChange(path.split(/[/?]/)[0]);
  return resolveContentImages(data) as T;
}

// TypeError es el fallo de red de fetch ("Failed to fetch"): su texto es técnico y está en inglés.
export const errorMessage = (error: unknown) => error instanceof Error && !(error instanceof TypeError) ? error.message : 'No se pudo conectar con el servidor.';
