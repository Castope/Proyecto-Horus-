# Backend Horus

NestJS, Prisma 6.19 y MySQL. Una base sin contenido devuelve listas vacías y contadores en cero. Usa Node 22.x y npm.

## Preparación

Ejecutar `npm ci`, configurar `.env` y revisar [Prisma](PRISMA.md). Las migraciones se ejecutan explícitamente mediante `npm run db:migrate`, después de verificar y respaldar el destino. `db:init` es exclusivo de una base vacía. Build y arranque no migran MySQL.

`npm run start:dev` usa `dist-dev/`; producción usa `npm run build` y `npm run start:prod`, en `dist/`. Swagger está en `/api/docs`; utiliza Authorize con un token sin añadir Bearer.

## Rutas y contratos

- Registro abierto: `POST /api/admin/register`. Login: `POST /api/admin/login`. Las demás operaciones administrativas y `admin/me` requieren JWT y una cuenta activa.
- Recuperación: `admin/forgot-password` y `admin/reset-password`. El enlace vence en 30 minutos, es de un solo uso y revoca sesiones anteriores. Cambio de contraseña autenticado: `POST admin/password`. Gestión de cuentas: `GET admin/users` y `PUT admin/users/:id`.
- Catálogos `cursos`, `servicios` y `preguntas-frecuentes`: GET público paginado y detalle solo publicados; CRUD administrativo bajo `admin/`. DELETE archiva.
- Catálogo PUT rechaza null y cuerpos vacíos. Para quitar campos opcionales, usar `limpiar`: cursos admiten `imagen_url`, `fecha_inicio`, `temario`, `area`, `certificacion`, `icono`, `modalidad`, `duracion`; servicios admiten `imagen_url`, `alcance`, `nombre_corto`, `destacado`, `dato_principal`, `dato_secundario`, `etiquetas`, `icono`. Modalidad y duración solo se pueden quitar en capacitaciones; un curso exige ambas. No se puede asignar y limpiar el mismo campo.
- Las listas administrativas aceptan `page`, `limit` y filtros; conservan las claves anteriores de respuesta. Si se omite `page`, las listas heredadas mantienen su contrato. El panel siempre solicita páginas.
- Seguimiento: GET/PUT `admin/seguimiento/messages/:id` o `admin/seguimiento/reclamaciones/:id`. PUT exige `revision`, `estado`, `responsable`, `notas` y `respuesta`. Una modificación obsoleta responde 409. POST `correo` envía la respuesta guardada; POST `constancia` reenvía la notificación de registro.
- Las reclamaciones no se borran físicamente desde la API; se archivan mediante seguimiento. Los mensajes con seguimiento o cotizaciones vinculadas están protegidos contra borrado.
- Cotizaciones: `admin/cotizaciones`, detalle, edición de borrador, `/:id/estado` y `/:id/correo`. El backend calcula importes y exige revisión. La impresión para PDF se realiza en el navegador.
- `POST /api/newsletter` exige correo y `consentimiento:true`; reactivar conserva el interés si no se envía uno nuevo. `POST newsletter/unsubscribe` recibe un token firmado. La baja administrativa desactiva la suscripción.
- `POST admin/uploads` recibe multipart `file`, máximo 5 MB, PNG/JPEG/WebP comprobados por firma. GET público `/api/uploads/:filename` sirve el recurso con MIME fijo. En producción se exige `UPLOAD_DIR` sobre un volumen persistente.
- Los formularios públicos tienen cuotas atómicas compartidas en MySQL. Solo se usa la IP validada por Express.

## Diseño original editable

Los catálogos incorporan color, icono y orden de presentación. Los servicios añaden diseño de tarjeta, nombre de pestaña, destacado, dato principal y secundario y características. Las capacitaciones añaden área y certificación. Los catálogos se ordenan por `orden` y luego ID; la agenda mantiene su orden por fecha.

`GET /api/admin/contenido-original` presenta el inventario recuperable sin escribir. `POST /api/admin/contenido-original/:section` acepta `servicios`, `capacitaciones` o `galeria`, con `{ "estado": "publicado" }` o `borrador`. Ambas rutas exigen JWT. La importación es transaccional por sección, omite duplicados y conserva ediciones y estados mediante `origen_original`. El contenido procede de `fb2880b`; no genera ejemplos ni fechas, modalidades o duraciones desconocidas.

Aplicar la migración `20261002-original-design` antes de usar estos campos. `npm run content:restore`, después de compilar y migrar, permite recuperar las tres secciones solo en MySQL local de desarrollo. En otros entornos, utilizar el panel. El comando no modifica ajustes institucionales.

## Correos y ajustes

`MAIL_USER` y `MAIL_PASS` configuran el transporte. Los formularios conservan el registro aunque falle SMTP y responden `correo_enviado:false`; el panel puede reenviar la notificación. El envío explícito de una propuesta/respuesta devuelve error si el correo no pudo entregarse.

Los ajustes públicos exponen solo claves conocidas; leerlos no escribe ejemplos. El sitio utiliza los valores configurados de contacto y pie de página, con el contenido actual como respaldo cuando están vacíos. Los datos institucionales pendientes de confirmación permanecen sin normalizar.

## Comprobación

`node node_modules/typescript/bin/tsc --noEmit --incremental false`, `npm test`, `npm run build` y `npm run test:integration`. Para un entorno con recursos limitados, la suite puede ejecutarse secuencialmente con `node --test --test-concurrency=1 -r ts-node/register test/*.test.ts`.

La biblioteca es interna al panel y todos los administradores conservan sus permisos. Market no incluye tienda ni pagos en esta etapa.
