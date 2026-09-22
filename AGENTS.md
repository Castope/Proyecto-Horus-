# AGENTS.md — Proyecto Horus

## Propósito y alcance

Esta guía define cómo trabajar en el sitio público, el panel administrativo y la API de Horus Group SRL. Aplica a todo el repositorio; las instrucciones de un `AGENTS.md` más cercano al archivo pueden precisar las de su carpeta. Las instrucciones explícitas del usuario y las del entorno de ejecución tienen prioridad.

El objetivo es entregar cambios completos, verificables y proporcionados a la tarea, conservando los datos y el comportamiento que no se haya solicitado modificar.

## Forma de trabajo

- Comunícate en español, con explicaciones concretas. Indica qué cambiaste, cómo lo verificaste y qué limitaciones quedan.
- Antes de editar, revisa `git status --short`, las instrucciones aplicables y el flujo completo afectado. Conserva los cambios previos del usuario.
- Investiga la causa de los errores. No los ocultes desactivando validaciones, reglas de lint o pruebas, ni añadiendo `@ts-ignore` o conversiones a `any` sin necesidad.
- Haz el cambio mínimo que resuelva el problema de forma completa. Evita refactorizaciones, formateos masivos y actualizaciones de dependencias ajenas al alcance.
- Continúa con lecturas, cambios reversibles y comprobaciones autorizadas. Pide aclaración solo si falta una decisión relevante que no pueda deducirse del código o de la conversación.
- Para acciones destructivas, cambios en sistemas compartidos o despliegues, comprueba el destino y la autorización existente. Solicita permiso si esa acción no está cubierta.
- No hagas commits, pushes ni despliegues salvo que formen parte de lo solicitado.
- Usa `rg` para localizar código. Adapta los comandos al shell disponible; en PowerShell, evita instrucciones que dependan de Bash.
- Mantén UTF-8 y conserva tildes y caracteres del contenido. Evita cambios de finales de línea en archivos completos.

## Mapa del repositorio

| Ruta | Responsabilidad |
| --- | --- |
| `backend/src/` | API NestJS organizada por módulos de negocio |
| `backend/src/common/` | Validación compartida, guards y decoradores |
| `backend/src/database/` | Cliente Prisma compartido y serialización |
| `backend/prisma/schema.prisma` | Modelos Prisma y correspondencia con MySQL |
| `backend/migrations/` | Migraciones SQL versionadas |
| `backend/scripts/` | Generación del cliente, comprobación del esquema e inicialización |
| `backend/test/` | Pruebas con Node Test Runner e integración MySQL |
| `frontend/src/pages/` | Páginas públicas |
| `frontend/src/components/` | Componentes públicos y chatbot |
| `frontend/src/panel/` | Páginas, componentes, servicios, contexto y tipos del panel |
| `frontend/src/assets/`, `frontend/src/styles/` | Recursos visuales y estilos |
| `tsconfig.json` | Configuración de TypeScript de la raíz para el backend y sus tests |

Hay dos paquetes npm independientes, cada uno con su `package-lock.json`. No existe un paquete npm en la raíz.

## Entorno y comandos

Usa npm y respeta los lockfiles. El backend declara Node.js 22.x; verifica la versión y los requisitos de las dependencias antes de instalar. Ejecuta cada comando desde la carpeta indicada.

| Carpeta | Comando | Uso |
| --- | --- | --- |
| `backend/` | `npm ci` | Instalación reproducible; también genera Prisma mediante postinstall |
| `backend/` | `npm run start:dev` | Desarrollo de la API |
| `backend/` | `node node_modules/typescript/bin/tsc --noEmit --incremental false` | Revisar tipos, incluidos los tests, sin generar archivos |
| `backend/` | `npm test` | Pruebas aisladas, sin requerir MySQL |
| `backend/` | `npm run build` | Generar Prisma y compilar NestJS |
| `backend/` | `npm run prisma:generate` | Regenerar el cliente Prisma |
| `backend/` | `npm run db:check` | Comparar el esquema MySQL mediante consultas de lectura |
| `backend/` | `npm run test:integration` | Compilar y probar con una base MySQL temporal |
| `frontend/` | `npm ci` | Instalación reproducible |
| `frontend/` | `npm run dev` | Desarrollo con Vite |
| `frontend/` | `npm run check` | Comprobar TypeScript |
| `frontend/` | `npm run lint` | Comprobar ESLint, TypeScript y reglas de React |
| `frontend/` | `npm run build` | Comprobar tipos y generar el frontend |
| `frontend/` | `npm run preview` | Revisar el frontend compilado |

La API usa el prefijo `/api` y el puerto 3000 por defecto. Swagger se publica en `/api/docs`. Vite redirige las peticiones locales de `/api` al backend mediante `frontend/vite.config.js`.

## Backend: convenciones y contratos

- Mantén la organización por módulos: controladores para HTTP, DTOs para entradas y servicios para reglas de negocio. Reutiliza `PrismaService`; evita crear clientes por petición.
- Usa `createValidationPipe()` de `backend/src/common/validation.ts`. La conversión implícita está desactivada: convierte explícitamente parámetros numéricos de query con `@Type(() => Number)` cuando corresponda.
- Distingue campos omitidos de valores `null`. Las actualizaciones de catálogo, galería y contenido deben rechazar cuerpos vacíos y valores inválidos antes de consultar o escribir.
- Normaliza nombres y correos donde corresponda. Conserva los espacios de las contraseñas y su validación del límite de bytes UTF-8 para bcrypt.
- Conserva los contratos existentes de rutas, paginación, claves de respuesta y estados HTTP. Revisa los consumidores del frontend antes de modificarlos.
- Traduce conflictos de unicidad a HTTP 409 mediante la utilidad compartida. No expongas consultas SQL, credenciales, trazas ni mensajes internos en respuestas públicas.
- Escapa datos del usuario al construir HTML para correos. Las pruebas deben sustituir el envío real.
- Mantén la compatibilidad de fechas de calendario y valores decimales; reutiliza la serialización existente y evita conversiones que cambien el día por zona horaria.

### Reglas de negocio que deben preservarse

- El catálogo público solo devuelve registros publicados. Los parámetros del cliente no pueden habilitar borradores ni archivados.
- El borrado de catálogo archiva el registro. No lo reemplaces por eliminación física.
- La galería pública excluye elementos inactivos.
- Una base sin contenido devuelve listas vacías y contadores en cero. No insertes datos de ejemplo ni inventes resultados para completar pantallas.
- Los ajustes públicos exponen únicamente claves conocidas. Leer ajustes no debe escribir valores de muestra; los cambios relacionados se guardan en una transacción.
- Las suscripciones conservan su unicidad por correo y el interés existente al reactivarse si no se proporciona otro.
- Las cotizaciones conservan cálculos monetarios, transiciones de estado, historial y control de concurrencia mediante `revision`.
- El chatbot consulta contenido publicado y no inventa disponibilidad, precios ni datos de contacto. Conserva los límites de entrada, el control de frecuencia y el consentimiento para registrar contactos.

## Prisma y base de datos

El proyecto utiliza Prisma con `engineType = "client"`, el adaptador MariaDB/MySQL y migraciones SQL propias. Consulta `backend/PRISMA.md` y los scripts antes de intervenir en el esquema.

- La conexión de la aplicación y los scripts usa variables `DB_*`. El script de generación proporciona una `DATABASE_URL` ficticia y no necesita conectarse a MySQL.
- Mantén alineadas las versiones de `prisma`, `@prisma/client` y `@prisma/adapter-mariadb`.
- Para construir errores Prisma en tests, usa la misma clase que el runtime del cliente. Con la configuración actual, importa `PrismaClientKnownRequestError` desde `@prisma/client/runtime/client`.
- Si cambias modelos, revisa tanto `schema.prisma` como el SQL correspondiente y regenera el cliente. No edites archivos generados en `node_modules` ni en `dist`.
- Añade nuevas migraciones sin reescribir las ya aplicadas. Regístralas en la lista `versions` de `backend/scripts/migrate.cjs`; crear el archivo SQL por sí solo no lo ejecuta.
- El ejecutor actual separa sentencias por punto y coma. No introduzcas procedimientos o SQL que requieran otro parser sin adaptar y verificar ese ejecutor.
- `npm run db:init` es exclusivamente para una base vacía. `npm run db:migrate` modifica el esquema del destino configurado. `npm run admin:create` crea una cuenta real.
- No ejecutes inicialización, migraciones ni creación de usuarios como parte de una compilación, del arranque o de una revisión rutinaria de tipos.
- No uses `prisma db push`, `prisma migrate reset` ni borrados de datos para resolver discrepancias del esquema existente.
- Antes de pruebas de integración, verifica que el servidor configurado sea local o esté destinado a pruebas. El script crea y elimina `horus_prisma_test_<UUID>` y requiere permisos CREATE/DROP DATABASE.

## Frontend: componentes y experiencia de usuario

- Usa React y TypeScript siguiendo los patrones y estilos de la zona modificada. Conserva la identidad visual, el diseño adaptable y los textos en español.
- Reutiliza componentes del panel, tipos de recursos y clientes HTTP existentes, especialmente `panelRequest` para llamadas administrativas.
- Conserva el manejo centralizado de HTTP 401 y la expiración de sesión. No trates la presencia de un token como prueba suficiente de autorización.
- Usa tipos concretos y `import type` cuando corresponda. Para envío de formularios usa `SubmitEvent<HTMLFormElement>`; evita `FormEvent`, obsoleto en los tipos instalados.
- Inicializa formularios al crearlos y actualiza estado desde eventos o resultados asíncronos. No añadas efectos solo para copiar props a estado.
- En cargas remotas, cancela peticiones y evita que una respuesta obsoleta sobrescriba la vista actual. Reutiliza `useRequestStatus` cuando encaje con el flujo.
- Mantén separados los exports de componentes y los de hooks/contextos para que Fast Refresh funcione correctamente.
- Incluye estados de carga, vacío, error y éxito. Evita envíos duplicados y conserva los datos del formulario si falla una operación.
- Usa HTML semántico, labels, navegación por teclado y foco adecuado en diálogos. No uses únicamente el color para comunicar un estado.
- En cambios visuales o de interacción, revisa escritorio y móvil y los estados afectados si hay un navegador disponible. Si no los verificaste, indícalo.

## Seguridad, configuración y dependencias

- Nunca publiques valores de `.env`, tokens, contraseñas, certificados privados o datos personales en código, logs, pruebas o respuestas. Documenta nombres de variables y ejemplos ficticios.
- Conserva la validación de configuración en `deployment.config.ts`, los orígenes CORS exactos y la verificación TLS.
- No retires guards ni alteres el acceso a rutas como efecto secundario de otra corrección.
- Hay una discrepancia documental: `backend/README.md` describe el registro como protegido, pero `AuthController.register` y el test de catálogo actualmente lo mantienen público. No cambies esta política incidentalmente; si la tarea trata de acceso, resuelve explícitamente el comportamiento esperado y alinea código, pruebas y documentación.
- Inspecciona las versiones instaladas antes de atribuir errores a una API. No mezcles soluciones de versiones distintas.
- Añade dependencias solo con una necesidad concreta y actualiza el lockfile correspondiente. Evita `npm audit fix --force` y saltos de versión mayor sin revisar compatibilidad y alcance.

## Verificación y criterio de entrega

Elige comprobaciones según el cambio y amplía la verificación solo si hay dependencias afectadas, fallos o incertidumbres relevantes.

| Cambio | Verificación esperada |
| --- | --- |
| Documentación | Rutas, comandos, coherencia con el código y diff |
| Backend | Tipos y pruebas relevantes; build si cambia código compilado o configuración |
| Frontend | `npm run check`, `npm run lint` y build para cambios de aplicación o configuración |
| Esquema, consultas o transacciones | Cliente regenerado cuando corresponda y pruebas de integración en un destino de pruebas |
| API compartida | Backend y consumidores del frontend |
| Interacción visual | Revisión del flujo, estados y accesibilidad cuando sea posible |

- Añade pruebas de regresión cuando un fallo de comportamiento lo justifique. Comprueba resultados observables, no una copia de la implementación.
- En tests con decoradores, carga `reflect-metadata` antes de importar clases que lo necesiten.
- Los tests del backend deben estar incluidos en `backend/tsconfig.json` para el editor y excluidos de la compilación de producción mediante `tsconfig.build.json`.
- No cambies las expectativas de una prueba únicamente para volverla verde. Si quedó obsoleta, explica qué contrato cambió y conserva la cobertura pertinente.
- Revisa `git diff --check`, el diff final y los archivos nuevos. Excluye secretos, archivos generados y cambios accidentales.
- Reporta comprobaciones realmente ejecutadas y su resultado. Distingue fallos del código de bloqueos del entorno; no presentes como verificado lo que no pudiste ejecutar.
- No es necesario ejecutar builds o suites de pruebas por un cambio exclusivamente documental.

## Mantenimiento de esta guía

Actualiza esta guía cuando cambien comandos, arquitectura, migraciones o contratos importantes. Los READMEs y planes pueden contener notas históricas: contrasta sus afirmaciones con la implementación y las pruebas. Evita registrar aquí cifras temporales de pruebas, vulnerabilidades o estados de despliegue.
