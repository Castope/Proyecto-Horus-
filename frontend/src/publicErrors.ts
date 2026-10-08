// Mensajes en español para los fallos de las consultas públicas. El visitante nunca ve el texto original del navegador
// ("Failed to fetch") ni el del backend ("Internal server error", "Cannot GET...", detalles de validación o de SQL):
// el fallo se clasifica por código HTTP o por tipo de error y se sustituye por un mensaje fijo.
// Sin importaciones y sin sintaxis que no sea "borrable" para poder probarlo con `node --test` (tests/public-errors.test.mjs).

export type PublicErrorKind = 'network' | 'timeout' | 'notFound' | 'badRequest' | 'forbidden' | 'tooMany' | 'server' | 'unknown'

export const PUBLIC_ERROR_TEXTS: Record<PublicErrorKind, string> = {
  network: 'No pudimos conectarnos con el servidor. Comprueba tu conexión e inténtalo nuevamente.',
  timeout: 'La solicitud tardó demasiado. Inténtalo nuevamente.',
  notFound: 'El contenido que buscas no está disponible.',
  badRequest: 'No pudimos procesar la solicitud. Inténtalo nuevamente.',
  forbidden: 'No tienes acceso a este contenido.',
  tooMany: 'Has realizado demasiadas solicitudes. Espera un momento e inténtalo nuevamente.',
  server: 'Ocurrió un problema al cargar el contenido. Inténtalo más tarde.',
  unknown: 'No pudimos cargar esta información en este momento.',
}

// Reintentar solo tiene sentido si el fallo puede ser pasajero; un contenido inexistente o una solicitud inválida no cambian.
export const RETRYABLE_ERRORS: PublicErrorKind[] = ['network', 'timeout', 'tooMany', 'server', 'unknown']

// `timedOut` lo indica quien canceló la petición por tiempo (AbortController propio). Los errores del API traen `status`.
export function classifyPublicError(error: unknown, timedOut = false): PublicErrorKind {
  if (timedOut) return 'timeout'
  const status = (error as { status?: unknown } | null)?.status
  if (typeof status === 'number') {
    if (status === 404 || status === 410) return 'notFound'
    if (status === 408 || status === 504) return 'timeout'
    if (status === 400 || status === 422) return 'badRequest'
    if (status === 401 || status === 403) return 'forbidden'
    if (status === 429) return 'tooMany'
    if (status >= 500) return 'server'
    if (status >= 200 && status < 300) return 'server' // respuesta correcta pero ilegible: falla del servidor, no de la red
    return 'unknown'
  }
  if ((error as { name?: unknown } | null)?.name === 'AbortError') return 'timeout'
  if (error instanceof TypeError) return 'network' // fetch rechaza con TypeError cuando no hay conexión
  return 'unknown'
}

export const publicErrorMessage = (error: unknown, timedOut = false): string => PUBLIC_ERROR_TEXTS[classifyPublicError(error, timedOut)]
