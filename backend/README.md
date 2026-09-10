# Backend Horus

NestJS + Sequelize + MySQL. El catálogo no contiene datos de ejemplo: los registros se crean desde la API administrativa. Una base vacía devuelve listas vacías y contadores en cero.

## Instalación y esquema

1. Ejecutar `npm ci`.
2. Configurar `.env` a partir de `.env.example`, conservando tus credenciales locales.
3. En una instalación existente, ejecutar `npm run db:migrate`: crea las tablas `cursos`, `servicios`, `preguntas_frecuentes` y el registro `horus_migrations`. No cambia las tablas anteriores ni inserta contenido.
4. Ejecutar `npm run start:dev`. Swagger: `http://localhost:3000/api/docs`.

La migración requiere que la base de datos ya exista. Para una instalación nueva sin las tablas anteriores, inicializarlas en desarrollo con `DB_SYNC=true` al arrancar una vez; después volver a `DB_SYNC=false`. La sincronización solo crea tablas faltantes, nunca usa alter, y está desactivada en producción. El esquema anterior aún necesita una migración base antes de desplegar una instalación completamente nueva en producción.

Las migraciones MySQL DDL no ofrecen rollback transaccional; respaldar la base antes de desplegar. El comando usa un bloqueo de migración y registra la versión después de crear las tablas. Volver a ejecutarlo no inserta registros de negocio.

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

Esta entrega amplía el backend. Las páginas públicas y el panel aún deben conectarse a estos endpoints; el contenido actual del frontend no se importa automáticamente. Quedan pendientes roles granulares, archivos, seguimiento ampliado de reclamaciones/cotizaciones y recuperación de contraseña. Las pruebas usan sustitutos de base de datos solo dentro de test; el servidor usa modelos MySQL reales.
