# Sesión administrativa (frontend)

Resumen de cómo el panel gestiona la sesión. No describe el backend (JWT de 8 h con `session_version`).

## Modelo
- El token vive en `localStorage` (`horus-admin-token`). `AdminAuthProvider` ([AdminAuthContext.tsx](src/panel/context/AdminAuthContext.tsx)) lo guarda y la identidad (`user`) solo se acepta tras `POST /admin/login` o `GET /admin/me`. Tener un token no autoriza el panel: `isAuthenticated = token && user`.
- `activeToken` (ref) es la sesión activa leída de forma síncrona. Toda respuesta o aviso se compara contra ella.

## Sincronización entre pestañas
- El evento `storage` (y `visibilitychange` como respaldo) compara `localStorage` con la sesión activa:
  - token eliminado → esta pestaña cierra sesión y vuelve al login;
  - token nuevo o distinto → se adopta, se descarta la identidad anterior y se revalida con `/admin/me`.
- Los cambios que vienen de otra pestaña **nunca** escriben en `localStorage` (sin bucles). Cerrar o iniciar sesión sí escribe, de forma síncrona y antes de renderizar.
- **Modo en memoria:** si el navegador bloquea `localStorage` la sesión funciona en esa pestaña, pero **no se sincroniza** con otras; cada pestaña conserva su propia sesión hasta que caduque o se cierre.
- No se guardan contraseñas ni datos personales para sincronizar: solo el token que ya existía.

## 401 de sesiones antiguas
- `panelRequest` e `ImageUpload` avisan con `reportExpiredSession(token)` ([sessionEvents.ts](src/panel/context/sessionEvents.ts)): el aviso lleva el token **de esa petición**.
- El contexto cierra la sesión solo si ese token sigue siendo el activo. Un 401 de un token anterior, o de una petición sin sesión, se ignora. Un aviso sin token se trata como "revalida con `/admin/me`", no como cierre.
- Al cerrar por 401, solo se borra de `localStorage` si allí sigue el mismo token (no se destruye una sesión más nueva iniciada en otra pestaña).
- `/admin/me` se cancela al cambiar de token y su resultado se descarta si la sesión activa ya es otra.

## Timeouts y cancelación
| Flujo | Límite | Al salir de la pantalla |
|---|---|---|
| Login | 20 s | se cancela; un login tardío no autentica |
| Solicitar enlace | 20 s | se cancela |
| Restablecer contraseña | 20 s | se cancela |
| Cambiar contraseña (Ajustes) | 20 s | se cancela |
| `/admin/me` | 15 s | se cancela |

Cada formulario usa un candado síncrono (`useRef`): doble clic, Enter repetido o `requestSubmit` repetido producen como máximo una petición mientras hay una pendiente.

## Operaciones de contraseña con resultado incierto
Un timeout, una red caída o una respuesta ilegible **no** demuestran que el servidor no aplicó el cambio. En restablecer y cambiar contraseña el mensaje recomienda comprobar el estado (iniciar sesión con la nueva contraseña) antes de repetir, no afirma que la contraseña siga igual y **no hay reintentos automáticos**. Los mensajes están en [authErrors.ts](src/panel/services/authErrors.ts); nunca se muestra texto del backend.

## Trabajo no guardado (estado actual)
Los formularios de gestión guardan su borrador solo en el estado del componente. Se pierde cuando:
1. **La sesión caduca o el servidor responde 401** (`expire` → login): `AdminRoute` redirige y el panel se desmonta.
2. **Otra pestaña inicia sesión** (incluso con la misma cuenta, que emite un token nuevo): esta pestaña adopta el token y muestra "Cargando panel…" mientras revalida, lo que desmonta el panel.
3. **Reintentar la validación de sesión** tras un fallo de red (`checking`).
4. **Cerrar sesión** a propósito o recargar la página.

Tras reautenticarse se abre siempre `/admin/dashboard`: la ruta original no se conserva (`AdminRoute` redirige sin estado y el login no lo lee).

### Propuesta para una etapa posterior (no implementada)
- **Conservar la ruta:** `AdminRoute` redirige con `state={{ from: location }}`; el login vuelve a esa ruta solo si es una ruta `/admin/...` del mismo origen.
- **No desmontar al revalidar:** al adoptar un token nuevo con el panel ya abierto, mantener el panel visible y revalidar en segundo plano; solo si `/admin/me` devuelve otra identidad o un 401 se sustituye o se cierra.
- **Borradores seguros:** guardar en `sessionStorage` (no `localStorage`) únicamente el contenido editorial en edición —nunca contraseñas ni datos personales de clientes—, asociado al id de cuenta, con caducidad corta, restaurable tras volver a entrar con la misma cuenta y borrado al cerrar sesión de forma explícita.
- **Aviso previo:** mostrar un aviso antes de que expire la sesión (el JWT dura 8 h) para que se pueda guardar.
