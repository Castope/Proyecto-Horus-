# Backend Horus

NestJS + Prisma + MySQL. El catálogo no contiene datos de ejemplo: los registros se crean desde la API administrativa. Una base vacía devuelve listas vacías y contadores en cero.

## Instalacion y esquema

Consulta [la guia de migracion a Prisma](PRISMA.md) antes de activar el cambio sobre una base existente.

1. Ejecutar `npm ci` (genera el cliente Prisma).
2. Configurar `.env` desde `.env.example`; se mantienen DB_* y TLS.
3. Ejecutar `npm run db:check` y revisar cualquier diferencia. Para tablas de catalogo/cotizaciones pendientes, revisar y ejecutar `npm run db:migrate`.
4. Para una base completamente vacia, usar `npm run db:init` antes de `db:migrate`.
5. Ejecutar `npm run start:dev`. Swagger: `http://localhost:3000/api/docs`.

El arranque no sincroniza tablas. Los builds no ejecutan migraciones. Las versiones anteriores en `horus_migrations` se conservan.

## Autenticación

`POST /api/admin/login` continúa devolviendo un JWT. En Swagger usar Authorize con el token.
`POST /api/admin/register` ahora requiere un JWT administrativo: el formulario público de registro anterior dejará de crear cuentas. Todos los administradores actuales conservan los mismos permisos; roles granulares quedan pendientes.

Si no existe ningún administrador, usar `npm run admin:create`. El comando pide nombre y correo y obtiene la contraseña de la variable de entorno temporal `ADMIN_INITIAL_PASSWORD`; no acepta contraseñas como argumento ni las imprime. Establecerla de forma segura en la terminal y retirarla del entorno del shell al terminar. Requiere la tabla `admin_users` existente y no sobrescribe cuentas.

## Catálogo

Para cada recurso `cursos`, `servicios`, `preguntas-frecuentes`:

| Método | Ruta | Uso |
| --- | --- | --- |
| GET | /api/RECURSO | Lista pública, solo publicados |
| GET | /api/RECURSO/:id | Detalle público, 404 si es borrador o archivado |
| GET | /api/admin/RECURSO | Lista administrativa |
| GET | /api/admin/RECURSO/:id | Detalle administrativo |
| POST | /api/admin/RECURSO | Crear (borrador por defecto) |
| PUT | /api/admin/RECURSO/:id | Editar parcialmente o publicar |
| DELETE | /api/admin/RECURSO/:id | Archivar, sin eliminar físicamente |

Listas: `?page=1&limit=20&search=redes`; máximo 100 registros por página. Administración admite `estado=borrador|publicado|archivado`. En rutas públicas no se puede anular el filtro de publicación.

Respuesta: `{ ok: true, items: [...], pagination: { page, limit, total, pages } }`.

- Cursos/capacitaciones: titulo, slug único, descripcion, tipo (curso/capacitacion), modalidad (presencial/virtual/hibrida), duracion; opcionales temario, imagen_url, fecha_inicio ISO 8601 y estado.
- Servicios: titulo, slug único, descripcion, categoria (cableado/camaras/soporte/asesoramiento/otros); opcionales alcance, imagen_url y estado.
- FAQ: pregunta, respuesta, categoria; opcionales orden y estado.
- PUT rechaza cuerpos vacíos y valores null. Las URLs de imagen deben ser HTTP(S). La subida de archivos todavía no está implementada.

`GET /api/admin/stats` conserva sus campos anteriores y agrega `stats.catalogo` con conteos totales, publicados, borradores y archivados por recurso.

## Verificación

- `npm run build`
- `npm test` (pruebas aisladas de validación, publicación, archivado, contadores y protección de rutas; no requieren MySQL).
- Con una base de pruebas: migrar, crear un borrador por API, comprobar su 404 público, publicarlo con PUT y comprobar su aparición; archivarlo y comprobar que desaparece de la consulta pública. Repetir para cada recurso. Verificar 401 sin token en administración y registro, y 409 con slug duplicado.

## Alcance

Esta entrega amplía el backend. Las páginas públicas y el panel aún deben conectarse a estos endpoints; el contenido actual del frontend no se importa automáticamente. Quedan pendientes roles granulares, archivos, seguimiento ampliado de reclamaciones/cotizaciones y recuperación de contraseña. Las pruebas usan sustitutos de base de datos solo dentro de test; el servidor usa Prisma con MySQL real.
