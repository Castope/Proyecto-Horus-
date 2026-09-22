# Cambio de Sequelize a Prisma

El backend usa Prisma 6.19.0 con el adaptador MariaDB/MySQL, compatible con CommonJS y las variables DB_* actuales. Las rutas HTTP, JWT y nombres de tablas y columnas se conservan. El cliente se genera durante instalación y compilación; esos pasos no modifican MySQL.

## Base existente

1. Respaldar la base y probar primero sobre una copia.
2. Ejecutar npm ci y npm run build con Node 22.
3. Ejecutar npm run db:check. Es una consulta de solo lectura que compara tablas, columnas, tipos, nulabilidad e índices únicos con el esquema esperado.
4. Si faltan tablas de catálogo o cotizaciones, revisar los SQL de migrations/ y ejecutar npm run db:migrate en la base elegida. Conserva las versiones de horus_migrations y el bloqueo MySQL anterior. No altera tablas existentes ni copia o elimina registros.
5. Repetir npm run db:check; cualquier otra diferencia necesita revisión antes de desplegar.
6. Arrancar con npm run start:dev o npm run start:prod.

En la base local revisada faltaba cotizaciones; las demás tablas coincidían en las comprobaciones anteriores. Durante el cambio no se ejecutaron migraciones sobre esa base.

## Base nueva

Crear una base vacía y configurar DB_HOST, DB_PORT, DB_NAME, DB_USER y DB_PASS. Ejecutar npm run db:init, npm run db:migrate y, si corresponde, npm run admin:create. La inicialización rechaza bases que ya tengan tablas. DB_SYNC ya no crea tablas al iniciar.

## Conexión y despliegue

- Se mantienen DB_SSL y DB_SSL_CA (PEM con saltos de línea o `\\n`); la validación del certificado sigue activa.
- El servidor usa un cliente compartido y hasta dos conexiones, en UTC.
- DATABASE_URL solo aparece en el esquema para las herramientas de Prisma. El comando de generación proporciona una URL ficticia sin abrir conexión. La aplicación y los scripts usan DB_*.
- No ejecutar prisma db push ni prisma migrate reset sobre una base existente.
- Las migraciones siguen siendo SQL versionado con horus_migrations; no se ha cambiado a Prisma Migrate. Adoptar ese motor sería un paso separado con una línea base validada contra la base real.
- Las migraciones MySQL DDL no son transaccionales. Ante un fallo de inicialización parcial, revisar las tablas creadas antes de reintentar.
- Prisma devuelve objetos planos. La API convierte DATE a YYYY-MM-DD y DECIMAL a cadenas de dos decimales al leer cotizaciones, como el controlador MySQL anterior. Al crear o recalcular importes se conservan los valores numéricos de la respuesta anterior.
- Cotizaciones usa una transacción y actualización condicionada por id/revision; una edición concurrente obsoleta responde 409 y no sobrescribe el historial.

## Verificación y límites

npm run test:integration compila y crea una base temporal horus_prisma_test_<UUID> en el servidor configurado. Prueba escrituras, autenticación, catálogo, serialización, concurrencia y migraciones repetidas, y la elimina al terminar. Requiere permisos CREATE/DROP DATABASE y no escribe en la base configurada original.

npm test conserva las comprobaciones existentes. Antes del cambio había 25 pruebas aprobadas y 16 fallidas en backend-regressions.test.ts. Después del cambio: 26 aprobadas y 15 fallidas; pasa ahora el caso del teléfono opcional en mensajes administrativos. Las 7 pruebas de integración MySQL pasan. Verificación local ejecutada con Node 24; el proyecto declara Node 22 para despliegue.

Esos fallos anteriores incluyen validación, correos y comportamiento de ajustes; esta migración no los oculta ni desactiva.

Para revertir el código, volver a la versión anterior e instalar su lockfile. No hay transformación de registros que deshacer; conservar tablas y el historial de migraciones. Verificar también una copia de la base de producción y su conexión TLS antes de desplegar.
