import { API_BASE } from '../../apiBase';
export class PanelApiError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

export async function panelRequest<T>(path: string, token: string, method = 'GET', body?: unknown, signal?: AbortSignal): Promise<T> {
  const response = await fetch(API_BASE + '/admin/' + path, {
    method, signal,
    headers: { Authorization: 'Bearer ' + token, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await response.json().catch(() => null);
  if (response.status === 401) window.dispatchEvent(new Event('horus:session-expired'));
  if (!response.ok || data?.ok === false) {
    const detail = data?.mensaje || data?.message;
    throw new PanelApiError(Array.isArray(detail) ? detail.join(' · ') : detail || 'No se pudo completar la operación (' + response.status + ').', response.status);
  }
  if (!data) throw new Error('El servidor devolvió una respuesta inválida.');
  return data as T;
}

export const errorMessage = (error: unknown) => error instanceof Error ? error.message : 'No se pudo conectar con el servidor.';
