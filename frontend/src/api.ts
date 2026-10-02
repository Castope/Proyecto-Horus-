import { API_BASE } from './apiBase'

export class PublicApiError extends Error {
  constructor(message: string, public status: number, public details: string[] = []) { super(message) }
}
export async function publicRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(API_BASE + '/' + path, options)
  const data = await response.json().catch(() => null)
  if (!response.ok || data?.ok === false) {
    const details = data?.mensaje || data?.message
    const messages: string[] = Array.isArray(details) ? details : [typeof details === 'string' ? details : 'No se pudo completar la solicitud.']
    throw new PublicApiError(messages.join(' · '), response.status, messages)
  }
  if (!data) throw new PublicApiError('El servidor devolvió una respuesta inválida.', response.status)
  return data as T
}
type SavedResponse = { ok: boolean; mensaje: string; id: number; numero_reclamo?: string; correo_enviado?: boolean }
export const enviarContacto = (datos: object) => publicRequest<SavedResponse>('contacto', {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(datos),
})
export const registrarReclamo = (datos: object) => publicRequest<SavedResponse>('reclamaciones', {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(datos),
})
