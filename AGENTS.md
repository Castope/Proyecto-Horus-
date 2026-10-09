# AGENTS.md — Proyecto Horus

## Propósito y alcance

Esta guía define cómo trabajar en el sitio público, el panel administrativo y la API de Horus Group SRL. Aplica a todo el repositorio; las instrucciones de un `AGENTS.md` más cercano al archivo pueden precisar las de su carpeta. Las instrucciones explícitas del usuario y las del entorno de ejecución tienen prioridad.

El objetivo es entregar cambios completos, verificables y proporcionados a la tarea, conservando los datos y el comportamiento que no se haya solicitado modificar. Market queda fuera del alcance de este proyecto y no debe reintroducirse en el frontend público salvo decisión futura explícita. No añadas compras, pagos ni inscripciones automáticas sin una solicitud explícita.

## Forma de trabajo

- Comunícate en español, con explicaciones concretas. Indica qué cambiaste, cómo lo verificaste y qué limitaciones quedan.
- Antes de editar, revisa `git status --short`, las instrucciones aplicables y el flujo completo afectado: entrada, validación, servicio, persistencia, consumidores y pruebas. Conserva los cambios previos del usuario, incluidos archivos sin seguimiento; no los reviertas, sobrescribas ni incluyas como trabajo propio.
- Investiga la causa de los errores. No los ocultes desactivando validaciones, reglas de lint o pruebas, ni añadiendo `@ts-ignore` o conversiones a `any` sin necesidad.
- Haz el cambio mínimo que resuelva el problema de forma completa. Evita refactorizaciones, formateos masivos y actualizaciones de dependencias ajenas al alcance.
- Continúa con lecturas, cambios reversibles y comprobaciones autorizadas. Pide aclaración solo si falta una decisión relevante que no pueda deducirse del código o de la conversación.
- Para acciones destructivas, cambios en sistemas compartidos o despliegues, comprueba el destino y la autorización existente. Solicita permiso si esa acción no está cubierta. Una revisión de código o documentación no autoriza mantenimiento de MySQL, importaciones ni creación de cuentas.
- No hagas commits, pushes ni despliegues salvo que formen parte de lo solicitado.
- Usa `rg` para localizar código. Adapta los comandos al shell disponible; en PowerShell, evita instrucciones que dependan de Bash y lee texto con `Get-Content -Encoding utf8`.
- Mantén UTF-8 y conserva tildes y caracteres del contenido. Evita cambios de finales de línea en archivos completos.

## Mapa del repositorio

| Ruta | Responsabilidad |
| --- | --- |
| `backend/src/` | API NestJS organizada por módulos de negocio |
| `backend/src/common/` | Validación compartida, guards, paginación, rutas de imágenes y proxies confiables |
| `backend/src/database/` | Cliente Prisma compartido, seguridad de conexión y serialización |
| `backend/src/attention/`, `backend/src/cotizaciones/` | Seguimiento e historial de atención y cotizaciones |
| `backend/src/convenios/`, `backend/src/content-original/` | Convenios y recuperación explícita de contenido original |
| `backend/src/uploads/` | Validación y almacenamiento de imágenes |
| `backend/prisma/schema.prisma` | Modelos Prisma y correspondencia con MySQL |
| `backend/migrations/` | Migraciones SQL versionadas |
| `backend/scripts/` | Generación del cliente, comprobación del esquema y mantenimiento explícito |
| `backend/test/` | Pruebas con Node Test Runner e integración MySQL |
| `frontend/src/pages/`, `frontend/src/components/` | Páginas públicas, componentes, Home y chatbot |
| `frontend/src/panel/` | Páginas, componentes, servicios, contexto y tipos del panel |
| `frontend/src/hooks/`, `frontend/src/context/` | Cargas públicas, accesibilidad y ajustes institucionales |
| `frontend/src/api.ts`, `frontend/src/apiBase.ts` | Cliente público y URL base de la API |
| `frontend/src/contentImages.ts`, `frontend/src/contentUpdates.ts` | Resolución de imágenes y avisos para refrescar contenido |
| `frontend/src/assets/`, `frontend/src/styles/` | Recursos visuales y estilos |
| `frontend/config/`, `frontend/tests/`, `frontend/scripts/` | Configuración de API, pruebas de despliegue y revisión con navegador |
| `tsconfig.json` | Configuración de TypeScript de la raíz para el backend y sus tests |

Hay dos paquetes npm independientes, cada uno con su `package-lock.json`. No existe un paquete npm en la raíz. Ejecuta las comprobaciones con la configuración de cada paquete; el `tsconfig.json` de la raíz no comprueba el frontend.

El despliegue en Railway se documenta en [RAILWAY.md](RAILWAY.md). Cada paquete tiene su `Dockerfile` y `.dockerignore`; `frontend/Caddyfile` sirve React y redirige `/api` al backend privado mediante `BACKEND_UPSTREAM`. La inicialización de MySQL es explícita, fuera de la compilación y del arranque.

## Entorno y comandos

Usa npm y respeta los lockfiles. Ambos paquetes declaran Node.js 22.x; verifica la versión y los requisitos de las dependencias antes de instalar. Ejecuta cada comando desde la carpeta indicada. No instales dependencias si las existentes permiten realizar la tarea.

### Desarrollo y comprobaciones

| Carpeta | Comando | Uso |
| --- | --- | --- |
| `backend/` | `npm ci` | Instalación reproducible; también genera Prisma mediante postinstall |
| `backend/` | `npm run start:dev` | Desarrollo de la API; compila en `dist-dev/` |
| `backend/` | `node node_modules/typescript/bin/tsc --noEmit --incremental false` | Revisar tipos, incluidos los tests, sin generar archivos |
| `backend/` | `npm test` | Pruebas aisladas, sin requerir MySQL |
| `backend/` | `npm run build` | Generar Prisma y compilar NestJS |
| `backend/` | `npm run prisma:generate` | Regenerar el cliente Prisma sin conexión a MySQL |
| `backend/` | `npm run db:check` | Comparar el esquema MySQL mediante consultas de lectura |
| `backend/` | `npm run test:integration` | Compilar y probar creando/eliminando una base MySQL temporal; revisar el destino antes |
| `frontend/` | `npm ci` | Instalación reproducible |
| `frontend/` | `npm run dev` | Desarrollo con Vite |
| `frontend/` | `npm run check` | Comprobar TypeScript |
| `frontend/` | `npm run lint` | Comprobar ESLint y reglas de React/TypeScript; no sustituye la revisión de tipos |
| `frontend/` | `npm run build` | Comprobar tipos y generar el frontend |
| `frontend/` | `npm run preview` | Revisar el frontend compilado |
| `frontend/` | `npm run test:deploy` | Probar la URL de API y las reescrituras de rutas de despliegue |
| `frontend/` | `npm run test:errors`, `test:return-path`, `test:list-records`, `test:attention-merge` | Pruebas unitarias de módulos puros, sin navegador: mensajes de error públicos, ruta de retorno tras iniciar sesión, lectura de listas y CSV, y fusión del seguimiento de atención |

El backend separa las salidas de compilación: `npm start`, `start:dev` y `start:debug` usan `tsconfig.dev.json` y `dist-dev/`, incluida su caché incremental. `npm run build` y `start:prod` usan `dist/`. Mantén esta separación: una compilación limpia no debe borrar los módulos de un servidor de desarrollo en ejecución.

Si la suite del backend agota recursos o tiempos por compilaciones simultáneas, verifica el fallo y usa `node --test --test-concurrency=1 -r ./test/isolate-env.cjs -r ts-node/register test/*.test.ts` desde `backend/`. Es el mismo comando que `npm test` con la concurrencia reducida: conserva la precarga `test/isolate-env.cjs`, que impide que `@prisma/client` cargue `backend/.env` (credenciales reales) en las pruebas. No la omitas ni ejecutes archivos de prueba sueltos sin ella salvo con un entorno explícitamente ficticio. No cambies expectativas o límites para ocultar un fallo de comportamiento.

La API usa el prefijo `/api` y el puerto 3000 por defecto. Swagger se publica en `/api/docs` solo en desarrollo; en producción está apagado salvo `SWAGGER_ENABLED=true`, que además exige HTTPS y una cuenta de administrador activa (nunca credenciales en la URL). El healthcheck público es `/api/health`. Vite redirige las peticiones locales de `/api` al backend mediante `frontend/vite.config.js`. Para otra API, `VITE_API_BASE_URL` debe incluir `/api`; conserva su validación en `frontend/config/api-config.js`. Estas variables se incorporan al build del frontend.

### Mantenimiento explícito

Estos comandos se ejecutan desde `backend/` únicamente cuando la tarea cubra la operación y se haya comprobado el destino.

| Comando | Condición y efecto |
| --- | --- |
| `npm run db:init` | Exclusivamente para una base vacía; crea el esquema inicial |
| `npm run db:migrate` | Aplica las migraciones pendientes al destino configurado |
| `npm run admin:create` | Crea una cuenta real; es el proceso controlado para el primer administrador |
| `npm run content:restore` | Recupera contenido original en MySQL local de desarrollo, tras build y migraciones |
| `npm run convenios:import -- --preview` | Requiere build del backend; muestra el inventario sin conectar a MySQL ni escribir archivos |
| `npm run convenios:import -- --apply --api-base=http://localhost:3000/api` | Importa convenios y logos en MySQL local de desarrollo; ajusta la URL pública al destino real |

No ejecutes inicialización, migraciones, importaciones ni creación de usuarios como parte de la instalación, compilación, arranque o revisión rutinaria de tipos. La instalación/build solo genera el cliente Prisma.

## Backend: convenciones y contratos

- Mantén la organización por módulos: controladores para HTTP, DTOs para entradas y servicios para reglas de negocio. Reutiliza `PrismaService`; evita crear clientes por petición.
- Usa `createValidationPipe()` de `backend/src/common/validation.ts`. La conversión implícita está desactivada: convierte explícitamente parámetros numéricos de query con `@Type(() => Number)` cuando corresponda.
- Distingue campos omitidos de valores `null`. Las actualizaciones de catálogo, galería, convenios y contenido deben rechazar cuerpos vacíos y valores inválidos antes de consultar o escribir. Conserva las formas de limpiar campos propias de cada recurso.
- Normaliza nombres y correos donde corresponda. Conserva los espacios de las contraseñas y su validación del límite de bytes UTF-8 para bcrypt.
- Conserva los contratos existentes de rutas, paginación, claves de respuesta y estados HTTP. Revisa los consumidores del frontend antes de modificarlos. Las listas heredadas conservan su respuesta cuando se omite `page`; el frontend debe solicitar páginas. Solo una exportación explícita recorre todos los resultados.
- Traduce conflictos de unicidad a HTTP 409 mediante la utilidad compartida. No expongas consultas SQL, credenciales, trazas ni mensajes internos en respuestas públicas.
- Escapa datos del usuario al construir HTML para correos. Las pruebas deben sustituir el envío real. El proveedor se elige de forma explícita con `MAIL_PROVIDER` (`resend` o `gmail`), sin alternativa automática entre ellos. Sus variables, la diferencia entre mensaje aceptado y entregado, los envíos de resultado incierto (que no se reintentan) y las restricciones de envío —sin dominio verificado, Resend solo entrega a la cuenta titular— están en [backend/MAIL.md](backend/MAIL.md).
- Mantén la compatibilidad de fechas de calendario y valores decimales; reutiliza la serialización existente y evita conversiones que cambien el día por zona horaria.

### Catálogo y contenido compartido

- El catálogo público solo devuelve registros publicados y la galería pública excluye elementos inactivos. Los parámetros del cliente no pueden habilitar borradores, archivados o elementos ocultos.
- El borrado de cursos y preguntas frecuentes archiva el registro; no lo reemplaces por eliminación física. Por decisión explícita del proyecto, los **servicios** sí se eliminan definitivamente (`DELETE /api/admin/servicios/:id`, con confirmación en el panel); su estado `archivado` sigue disponible desde Editar.
- Catálogo admite `limpiar` para quitar campos opcionales conocidos sin aceptar `null`. No se puede asignar y limpiar el mismo campo. La agenda usa `periodo` y paginación. Los programas de capacitación pueden omitir modalidad/duración; los cursos las exigen.
- Las categorías de servicios son `cableado`, `camaras`, `soporte` y `asesoramiento`. Conserva la correspondencia entre DTOs, servicio, enum Prisma, SQL y filtros del frontend; no reintroduzcas `otros` como alternativa automática.
- El contenido administrable es compartido en MySQL; las cuentas nuevas no crean inventarios propios. El token de sesión y el marcador local de refresco no son fuentes de contenido. La página pública debe funcionar aunque el navegador bloquee storage.
- Una base sin contenido devuelve listas vacías y contadores en cero. No insertes datos de ejemplo ni inventes resultados para completar pantallas.
- Los ajustes públicos exponen únicamente claves conocidas. Leer ajustes no debe escribir valores de muestra; los cambios relacionados se guardan en una transacción.
- El diseño original usa metadatos del catálogo y fotos activas; las lecturas nunca importan contenido. `backend/src/content-original/` ofrece recuperación explícita autenticada e idempotente que conserva ediciones y estados, incluidos archivados e inactivos.

### Convenios

- `Convenio` y `ConvenioFoto` son independientes de la galería. La API pública impone `visible=true` y devuelve 404 para detalles ocultos; la creación mantiene `visible=false` por defecto.
- Conserva las listas `{ ok, items, pagination: { page, limit, total, pages } }` y los detalles `{ ok, item }`. Las listas no cargan fotos ni textos completos; el detalle incluye fotos en una sola petición. Convenios y fotos se ordenan por `orden` e `id`; `origen_local` es interno.
- Los campos opcionales de texto/logo admiten cadena vacía para limpiar y rechazan `null`. Valida que cada foto pertenezca al convenio indicado y conserva la reordenación múltiple en transacción.
- Eliminar un convenio borra sus registros de fotos por cascada. Retirar fotos o convenios no borra archivos físicos de uploads, que pueden compartirse.
- La importación inicial es explícita e idempotente por `origen_local`: conserva íntegramente los convenios existentes y no inventa fotografías ni descripciones. Consulta [backend/CONVENIOS.md](backend/CONVENIOS.md) y el importador antes de intervenir.

### Atención, suscripciones y chatbot

- `backend/src/attention/` guarda seguimiento de consultas y reclamaciones con estado, responsable, notas, respuesta, historial y `revision`. Un cambio obsoleto responde 409. Las reclamaciones y los mensajes con seguimiento/cotizaciones se conservan.
- En Mensajes, el estado administrativo proviene del seguimiento identificado por `messages` y `registro_id`; sin seguimiento conserva `Contacto.estado`. `attention/message-state.ts` comparte las consultas de listado, filtros previos a paginación, detalle y estadísticas. Las métricas de mensajes son globales, distinguen archivados de atendidos y conservan el total con archivados. El PUT heredado admite tres estados y se serializa con el primer seguimiento bloqueando la fila de Contacto. Consulta [backend/D4-ESTADOS.md](backend/D4-ESTADOS.md).
- Las cotizaciones conservan cálculos monetarios, transiciones de estado, historial y control de concurrencia mediante `revision`.
- Newsletter exige consentimiento explícito en HTTP y proporciona baja mediante token firmado. La baja desactiva; las suscripciones conservan su unicidad por correo y el interés existente al reactivarse si no se proporciona otro.
- El chatbot consulta contenido publicado y no inventa disponibilidad, precios ni datos de contacto. Conserva los límites de entrada, el control de frecuencia y el consentimiento para registrar contactos.
- Las cuotas públicas se comparten en MySQL mediante `rate_limit_buckets` y el guard global; conserva la IP validada por Express.

## Prisma y base de datos

El proyecto utiliza Prisma con `engineType = "client"`, el adaptador MariaDB/MySQL y migraciones SQL propias. Consulta [backend/PRISMA.md](backend/PRISMA.md) y los scripts antes de intervenir en el esquema.

- La conexión de la aplicación y los scripts usa variables `DB_*`. El script de generación proporciona una `DATABASE_URL` ficticia y no necesita conectarse a MySQL.
- Mantén alineadas las versiones de `prisma`, `@prisma/client` y `@prisma/adapter-mariadb`.
- Para construir errores Prisma en tests, usa la misma clase que el runtime del cliente. Con la configuración actual, importa `PrismaClientKnownRequestError` desde `@prisma/client/runtime/client`.
- Si cambias modelos, revisa tanto `schema.prisma` como el SQL correspondiente y regenera el cliente. No edites archivos generados en `node_modules`, `dist` ni `dist-dev`.
- Añade nuevas migraciones sin reescribir las ya aplicadas. Regístralas en la lista `versions` de `backend/scripts/migrate.cjs`; crear el archivo SQL por sí solo no lo ejecuta.
- El ejecutor actual separa sentencias por punto y coma. No introduzcas procedimientos o SQL que requieran otro parser sin adaptar y verificar ese ejecutor.
- MySQL DDL no es transaccional. Si falla una migración parcialmente, revisa los cambios ya aplicados y `horus_migrations` antes de reintentar; no presupongas una reversión completa.
- No uses `prisma db push`, `prisma migrate reset` ni borrados de datos para resolver discrepancias del esquema existente.
- Antes de pruebas de integración, verifica que el servidor configurado sea local o esté destinado a pruebas. El script crea y elimina únicamente `horus_prisma_test_<UUID>`, requiere permisos CREATE/DROP DATABASE y no migra la base original configurada.
- Un destino remoto de pruebas autorizado exige `ALLOW_INTEGRATION_DB=true`. Esa variable no constituye autorización para una base compartida. La integración comprueba persistencia entre administradores y tras reiniciar la API en la base temporal.

## Frontend: componentes y experiencia de usuario

- Usa React y TypeScript siguiendo los patrones y estilos de la zona modificada. Conserva la identidad visual, el diseño adaptable y los textos en español. Revisa el orden de estilos en `frontend/src/main.tsx` y los imports de la página antes de cambiar reglas compartidas; limita los selectores a la zona afectada.
- Reutiliza componentes del panel, tipos de recursos y clientes HTTP existentes: `publicRequest` para lecturas públicas y `panelRequest` para llamadas administrativas.
- Conserva el manejo centralizado de HTTP 401 y la expiración de sesión. No trates la presencia de un token como prueba suficiente de autorización. Un fallo temporal al consultar `/api/admin/me` ofrece reintento sin borrar la sesión; HTTP 401 la cierra.
- Usa tipos concretos y `import type` cuando corresponda. Para envío de formularios usa `SubmitEvent<HTMLFormElement>`; evita `FormEvent`, obsoleto en los tipos instalados.
- Inicializa formularios al crearlos y actualiza estado desde eventos o resultados asíncronos. No añadas efectos solo para copiar props a estado.
- En cargas remotas, cancela peticiones y evita que una respuesta obsoleta sobrescriba la vista actual. Reutiliza `usePublicResource` y `useRequestStatus` cuando encajen con el flujo.
- Mantén separados los exports de componentes y los de hooks/contextos para que Fast Refresh funcione correctamente.
- Incluye estados de carga, vacío, error y éxito. Evita envíos duplicados y conserva los datos del formulario si falla una operación.
- Usa HTML semántico, labels, navegación por teclado y foco adecuado en diálogos. No uses únicamente el color para comunicar un estado. Respeta `prefers-reduced-motion` y limpia listeners, timers y bloqueos de scroll al cerrar o desmontar.
- Conserva el refresco de contenido mediante `contentUpdates.ts`: eventos en el mismo documento y un marcador de storage para otras pestañas del mismo origen. Otros navegadores reciben los cambios al cargar o actualizar; no presupongas sincronización remota en tiempo real.
- Las rutas de uploads del proxy se conservan como `/api/uploads/<archivo>`. Reutiliza `contentImages.ts` para resolverlas contra la API configurada, incluidos enlaces antiguos de loopback, sin escribir en MySQL ni alterar enlaces externos. Para validarlas en backend, reutiliza `common/image-path.ts`.
- Home comparte la lista paginada de convenios entre la sección y la estadística, que usa `pagination.total`. Conserva el detalle integrado en escritorio y el diálogo en móvil, con carga, reintento, teclado, retorno de foco y fotos independientes de la galería.
- La bienvenida de Home es breve, aparece al entrar inicialmente por esa página y no espera imágenes/API ni bloquea scroll, foco o navegación. Conserva su comportamiento con movimiento reducido.
- En cambios visuales o de interacción, revisa escritorio y móvil y los estados afectados si hay un navegador disponible. Si no los verificaste, indícalo.

## Seguridad, configuración y dependencias

- Nunca publiques valores de `.env`, tokens, contraseñas, certificados privados o datos personales en código, logs, pruebas o respuestas. Documenta nombres de variables y ejemplos ficticios. Las variables `VITE_*` son públicas; no contienen secretos.
- Conserva la validación de configuración en `backend/src/deployment.config.ts`, los orígenes CORS exactos y la verificación TLS. Para MySQL sin TLS, `DB_RSA_PUBLIC_KEY` permite fijar una clave pública RSA confiable; nunca activar recuperación indiscriminada de claves. La API comprueba `SELECT 1` antes de escuchar. `TRUSTED_PROXY_CIDRS` enumera proxies explícitos; Caddy reemplaza X-Forwarded-For con la IP validada antes de enviarla a la API.
- No retires guards ni alteres el acceso a rutas como efecto secundario de otra corrección.
- No hay registro público de administradores. `POST /api/admin/register` exige una sesión de administrador válida (JWT, cuenta activa) y no devuelve token; `/admin/register` en el frontend redirige a `/admin/login`. El primer administrador se crea con `npm run admin:create`. No reabras el registro sin una decisión explícita ni expongas la gestión de cuentas en el panel sin pedirlo. Conserva la validación de datos, contraseñas y correos únicos, y el manejo centralizado de HTTP 401.
- Las sesiones llevan `session_version`. Cambiar contraseña o desactivar una cuenta revoca sesiones. Conserva los permisos existentes de los administradores.
- `backend/src/uploads/` permite PNG/JPEG/WebP de hasta 5 MB con comprobación de firma. En producción, `UPLOAD_DIR` requiere almacenamiento persistente, compartido si hay varias instancias; no incluyas archivos subidos en Git ni Docker.
- Inspecciona las versiones instaladas antes de atribuir errores a una API. No mezcles soluciones de versiones distintas.
- Añade dependencias solo con una necesidad concreta y actualiza el lockfile correspondiente. Evita `npm audit fix --force` y saltos de versión mayor sin revisar compatibilidad y alcance.

## Verificación y criterio de entrega

Elige comprobaciones según el cambio y amplía la verificación solo si hay dependencias afectadas, fallos o incertidumbres relevantes.

| Cambio | Verificación esperada |
| --- | --- |
| Documentación | Rutas, comandos, coherencia con el código y diff; no requiere builds ni suites de aplicación |
| Backend | Tipos y pruebas relevantes; build si cambia código compilado o configuración |
| Frontend | `npm run check`, `npm run lint` y `npm run build` para cambios de aplicación o configuración |
| Configuración de API, proxy o despliegue | `npm run test:deploy` del frontend y pruebas relevantes de configuración/seguridad del backend |
| Esquema, consultas o transacciones | Cliente regenerado cuando corresponda y pruebas de integración en un destino de pruebas |
| API compartida | Backend y consumidores del frontend |
| Interacción visual | Revisión del flujo, estados y accesibilidad en escritorio/móvil cuando sea posible |

### Revisión con navegador

Ejecuta estos scripts desde `frontend/`. Usan Edge/Chromium con perfiles temporales y fixtures HTTP aislados; no utilizan la base real ni envían correo SMTP.

| Comando | Preparación y cobertura |
| --- | --- |
| `node scripts/smoke-ui.cjs` | Build de backend y frontend; flujos públicos y del panel, contenido original, sesión, diálogos y escritorio/móvil |
| `node scripts/smoke-home.cjs` | Build del frontend; Home, bienvenida, movimiento reducido y convenios públicos/administrativos |
| `node scripts/smoke-global-content.cjs` | Build del frontend; dos contextos de navegador aislados y una visita con storage bloqueado |
| `npm run smoke:auth` | Build previo; sesión administrativa: login, recuperación y restablecimiento, pestañas, 401 antiguos, timeouts y doble envío |
| `npm run smoke:unsaved` | Compila antes; protección de cambios sin guardar, caducidad y cambio de sesión, ruta de retorno y avisos |
| `npm run smoke:messages-table`, `smoke:message-detail` | Compilan antes; tabla de Mensajes (totales, paginación, CSV) y detalle independiente de la bandeja (`?id=`, filtros, errores) |
| `npm run smoke:attention-conflicts` | Compila antes; concurrencia del seguimiento: conflictos entre administradores, HTTP 409 y reclamaciones |

Los cuatro `smoke:*` que compilan antes comprueban además que `dist/` no esté desactualizado respecto a `src/` y bloquean, antes de enviarla, cualquier petición a un origen distinto del servidor simulado. Con `smoke:auth` y los `node scripts/smoke-*.cjs` compila antes tú. Los smokes de navegador se ejecutan en serie; `smoke:auth` y los cuatro anteriores cierran el árbol completo de procesos de Edge al terminar.

`SMOKE_BROWSER` permite escoger el ejecutable de Edge/Chromium. `SMOKE_SCREENSHOTS` permite guardar capturas de `smoke-ui.cjs` y `smoke-home.cjs` en un directorio elegido; no las añadas a Git salvo solicitud. Los fixtures verifican interacción; la persistencia real se comprueba con la integración MySQL y la entrega SMTP requiere verificación en el destino correspondiente.

### Antes de entregar

- Añade pruebas de regresión cuando un fallo de comportamiento lo justifique. Comprueba resultados observables, no una copia de la implementación.
- En tests con decoradores, carga `reflect-metadata` antes de importar clases que lo necesiten.
- Los tests del backend deben estar incluidos en `backend/tsconfig.json` para el editor y excluidos de la compilación de producción mediante `tsconfig.build.json`.
- No cambies las expectativas de una prueba únicamente para volverla verde. Si quedó obsoleta, explica qué contrato cambió y conserva la cobertura pertinente.
- Revisa `git diff --check`, el diff final, los archivos nuevos y `git status --short`. Excluye secretos, archivos generados y cambios accidentales; distingue tus cambios de los que ya existían.
- Reporta comprobaciones realmente ejecutadas y su resultado. Distingue fallos del código de bloqueos del entorno; no presentes como verificado lo que no pudiste ejecutar.

## Mantenimiento de esta guía

Actualiza esta guía cuando cambien comandos, arquitectura, migraciones o contratos importantes. Contrasta las instrucciones con `package.json`, configuración, implementación y pruebas. Los READMEs y planes pueden contener notas históricas: no conviertas sus pendientes en tareas autorizadas ni registres aquí cifras temporales de pruebas, vulnerabilidades o estados de despliegue.

Para ampliar un flujo, consulta su documentación específica: [README.md](README.md), [backend/README.md](backend/README.md), [frontend/README.md](frontend/README.md), [frontend/PANEL-Y-CHATBOT.md](frontend/PANEL-Y-CHATBOT.md) y [backend/CHATBOT.md](backend/CHATBOT.md), [backend/MAIL.md](backend/MAIL.md). Mantén esta guía como instrucciones operativas y evita duplicar inventarios o procedimientos extensos.
