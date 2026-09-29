# Despliegue de Horus en Railway

El repositorio contiene dos paquetes npm independientes. Desplegar tres servicios dentro del mismo proyecto y entorno de Railway: `frontend`, `backend` y `MySQL`. El navegador accede al frontend por HTTPS; Caddy envía `/api` y `/api/*` al backend por la red privada, conservando las rutas actuales. MySQL debe tener un volumen persistente.

Los Dockerfiles usan Node 22, los lockfiles existentes y generación de Prisma sin conexión a MySQL. El backend ejecuta `dist/main.js` con dependencias de producción. No se ejecutan migraciones ni se crean cuentas durante la compilación o el arranque. Los contextos Docker excluyen archivos de entorno, dependencias locales y compilaciones previas.

## 1. Crear y configurar los servicios

Conectar el mismo repositorio de GitHub a ambos servicios de aplicación. Configurar antes del primer despliegue:

| Ajuste | backend | frontend |
| --- | --- | --- |
| Root Directory | `/backend` | `/frontend` |
| Builder | Dockerfile detectado automáticamente | Dockerfile detectado automáticamente |
| Build Command personalizado | Vacío | Vacío |
| Start Command personalizado | Vacío; usa el CMD de la imagen | Vacío; usa el CMD de la imagen |
| Pre-Deploy Command | Vacío inicialmente | Vacío |
| Healthcheck Path | `/api/docs` | `/healthz` |
| Puerto | `3000` | `8080` |
| Dominio público | No es necesario | Generar dominio HTTPS con puerto de destino `8080` |

El healthcheck del frontend comprueba su servidor estático; no comprueba MySQL ni el proxy. `/api/docs` comprueba que NestJS terminó de arrancar, pero no valida el esquema completo. Verificar la API y la base por separado al final.

Mantener los servicios en la misma región. El dominio privado predeterminado del backend se asume `backend.railway.internal`; confirmar el valor real en Networking. No hace falta configurar `railway.json`: Railway detecta cada Dockerfile desde su Root Directory.

## 2. Variables

En `frontend`:

```dotenv
PORT=8080
BACKEND_UPSTREAM=backend.railway.internal:3000
```

`BACKEND_UPSTREAM` es host y puerto internos, sin rutas. Si el servicio tiene otro nombre o puerto, actualizarlo. No usar `localhost`. No hace falta `VITE_API_URL`: las llamadas existentes usan `/api` y Caddy las redirige.

En `backend`, usar las referencias de Railway al servicio llamado exactamente `MySQL`:

```dotenv
NODE_ENV=production
PORT=3000
DB_HOST=${{MySQL.MYSQLHOST}}
DB_PORT=${{MySQL.MYSQLPORT}}
DB_NAME=${{MySQL.MYSQLDATABASE}}
DB_USER=${{MySQL.MYSQLUSER}}
DB_PASS=${{MySQL.MYSQLPASSWORD}}
DB_SYNC=false
DB_SSL=false
JWT_SECRET=REEMPLAZAR_POR_UN_SECRETO_ALEATORIO_DE_AL_MENOS_32_CARACTERES
CORS_ORIGINS=https://TU-FRONTEND.up.railway.app
```

Sustituir los ejemplos de JWT y dominio antes de desplegar. `CORS_ORIGINS` debe contener el origen HTTPS real, sin ruta ni barra final. Si hay varios dominios, separarlos por comas. El nombre de servicio de las referencias distingue el servicio configurado: adaptarlo si no se llama `MySQL`.

`DB_SSL=false` corresponde a una conexión privada a MySQL sin TLS configurado. Para un proveedor que exija TLS, usar `DB_SSL=true` y, si corresponde, `DB_SSL_CA`; se mantiene la verificación del certificado. La aplicación y los scripts usan `DB_*`, no `DATABASE_URL`.

Para envío de correos, configurar `MAIL_USER` y `MAIL_PASS` según el transporte existente. No copiar credenciales al repositorio ni al frontend. Confirmar que el plan y la red elegidos permiten la conexión SMTP utilizada por la aplicación.

## 3. Preparar MySQL explícitamente

Estos comandos escriben en la base seleccionada. Comprobar `DB_HOST` y `DB_NAME` y respaldar los datos si ya existen. Ejecutarlos desde `/app` en una terminal SSH del contenedor `backend` de Railway, que tiene acceso a la red privada y a sus variables. No ejecutar estos pasos contra la base local por accidente.

Para una base completamente vacía, ejecutar en este orden y detenerse ante cualquier fallo:

```sh
npm run db:init
npm run db:migrate
npm run db:check
```

`db:init` rechaza bases con tablas. Las operaciones DDL de MySQL no son transaccionales: si falla parcialmente, revisar las tablas antes de reintentar. No borrar datos para forzar la inicialización.

Para una base existente, omitir `db:init`: revisar primero `npm run db:check`, aplicar `npm run db:migrate` si corresponden las migraciones pendientes y volver a comprobar el esquema. Consultar `backend/PRISMA.md` para discrepancias adicionales. Una base nueva no importa automáticamente el contenido de la base local.

Tras preparar la base, se puede configurar `npm run db:migrate` como Pre-Deploy Command del backend para futuros despliegues, si se desea aplicar automáticamente las migraciones revisadas. No configurar `db:init` como paso recurrente. Los scripts están incluidos en la imagen de producción.

Para el primer administrador, configurar temporalmente `ADMIN_INITIAL_PASSWORD` y ejecutar `npm run admin:create` en una terminal interactiva del backend. El script solicita nombre y correo. Retirar la variable al terminar; no utilizar este comando en un pre-deploy automático.

## 4. Comprobación final

- Frontend: abrir el dominio HTTPS y recargar `/educacion/cursos` y `/admin/login`. El panel está en `/admin/dashboard`; `/panel` no es una ruta de la aplicación.
- Proxy: abrir `/api/docs` desde el dominio del frontend. Si devuelve 502, revisar el dominio privado, el puerto y los logs del backend.
- API: comprobar `/api/cursos` y `/api/servicios`; una base vacía debe devolver listas vacías reales. La página `/educacion/cursos` consulta `/api/cursos` y muestra cursos y capacitaciones publicados, con paginación, estados de carga/error/vacío y reintento. Comprobar que los borradores y archivados no aparezcan; tras publicar o editar, recargar la página o pulsar Actualizar catálogo. Esta integración no conecta automáticamente las demás páginas públicas.
- Panel: comprobar login, expiración de sesión y las operaciones necesarias con una cuenta autorizada.
- Formularios y chatbot: probar estados de éxito/error y el envío de correo con datos de prueba controlados.
- MySQL: confirmar que `db:check` pasa y configurar respaldos del volumen antes de recibir datos reales.

El registro administrativo está abierto en `/admin/register` y `POST /api/admin/register`, sin requerir una sesión previa. Tras registrarse, un visitante vuelve a `/admin/login`. `admin:create` sigue disponible como alternativa para crear una cuenta. El panel y las demás operaciones administrativas requieren una sesión válida.

El chatbot usa la IP validada por Express. Configurar `TRUSTED_PROXY_CIDRS` en cada servicio como se indica abajo; no usar `*`, `true`, cantidades de saltos ni rangos /0. Los límites permanecen en memoria por instancia: para varias réplicas, usar un almacenamiento compartido antes de escalarlas.

## Comprobaciones locales

Con Docker disponible, desde la raíz:

```sh
docker build -t horus-backend ./backend
docker build -t horus-frontend ./frontend
docker run --rm --entrypoint caddy horus-frontend validate --config /etc/caddy/Caddyfile --adapter caddyfile
```

El dominio `backend.railway.internal` solo se resuelve en Railway. Para una prueba local del proxy, proporcionar un `BACKEND_UPSTREAM` accesible desde el contenedor. Las compilaciones no necesitan credenciales de producción.

## MySQL después de un reinicio

Para MySQL 8 con `caching_sha2_password`, usar TLS verificado (`DB_SSL=true`, `DB_SSL_CA` si corresponde) o fijar `DB_RSA_PUBLIC_KEY` cuando se utilice la red privada sin TLS. La clave debe ser la clave pública RSA del servidor, obtenida de su administrador por un canal confiable; nunca copiar la privada. Se aceptan PEM multilínea o saltos literales `\n`. No se habilita `allowPublicKeyRetrieval`.

En el MySQL de prueba Docker, la clave pública está en `/var/lib/mysql/public_key.pem`. En Railway, confirmar la ruta efectiva con el administrador de MySQL; establecer su contenido como variable del backend. Conservarla mientras el servidor conserve su clave y actualizarla después de una rotación. El backend y los scripts usan el mismo validador y clave fijada.

La API ejecuta una consulta de lectura al iniciar y no abre el puerto si no puede conectar. Probar reiniciando MySQL y luego el backend, sin ejecutar previamente migraciones o `db:check` que calienten la caché de autenticación. Si se usa RSA sin TLS, la clave protege la autenticación; el tráfico SQL no queda cifrado. Usar esta opción solo en una red privada confiable.

## IP del visitante y proxies

- Backend: `TRUSTED_PROXY_CIDRS` contiene únicamente las IPs o los CIDRs confiables por los que llega Caddy. Acepta comas o espacios. Mantener la API sin dominio público. En Docker de prueba puede usarse la IP exacta del contenedor frontend.
- Frontend: `TRUSTED_PROXY_CIDRS` contiene únicamente los rangos de los proxies de entrada confirmados por el proveedor, separados por espacios. Caddy utiliza `X-Real-IP` y después `X-Forwarded-For` solo desde esos orígenes, y reemplaza la cabecera enviada al backend con una única IP validada. Para acceso local directo no se debe confiar en cabeceras del navegador; el valor predeterminado solo contempla loopback.
- Railway documenta `X-Real-IP` en su entrada HTTP, pero no se debe adivinar un rango confiable ni confiar en todo Internet. Confirmar con el proveedor los orígenes de entrada aplicables al proyecto antes de fijar los CIDRs. Si no se configura la confianza, se conserva la cuota por dirección del proxy como comportamiento seguro, sin aceptar cabeceras arbitrarias.
- Verificar con dos clientes distintos que sus cuotas sean independientes y que cambiar manualmente `X-Forwarded-For` no evite el límite. Mantener una réplica hasta incorporar contadores compartidos si se requiere escalado horizontal.

## Referencias

- Dockerfiles: https://docs.railway.com/builds/dockerfiles
- Monorepos: https://docs.railway.com/deployments/monorepo
- React Router y proxy con Caddy: https://docs.railway.com/guides/spa-routing-configuration
- Pre-deploy: https://docs.railway.com/deployments/pre-deploy-command

- Cabeceras de entrada de Railway: https://docs.railway.com/networking/public-networking/specs-and-limits
- Proxies confiables en Caddy: https://caddyserver.com/docs/caddyfile/options#trusted-proxies
