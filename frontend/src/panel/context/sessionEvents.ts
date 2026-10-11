// Aviso de que el servidor rechazó (HTTP 401) una petición autenticada. El evento lleva el token con el que se
// hizo la petición: el contexto solo cierra la sesión si ese token sigue siendo el de la sesión activa, de modo que
// un error tardío de una sesión anterior no cierra la sesión nueva.
export const SESSION_EXPIRED_EVENT = 'horus:session-expired'

export function reportExpiredSession(token: string | null | undefined) {
  window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT, { detail: { token: token ?? null } }))
}
