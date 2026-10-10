# Integración continua (GitHub Actions)

Archivo: [.github/workflows/ci.yml](../../.github/workflows/ci.yml). Se ejecuta en `push` a `main` y `anderson`, en cada `pull_request` y a demanda (`workflow_dispatch`).
**Solo comprueba**: no despliega, no usa secretos de producción, no se conecta a Railway ni a la base real y no envía correo ni llama a IA (las pruebas usan dobles).

> **Estado: sin ejecutar todavía en GitHub.** Nada de lo siguiente equivale a una ejecución remota satisfactoria; hasta que exista una, la CI **no está validada**.
>
> Comprobado en local (2026-10-10):
> - El YAML se analizó con `js-yaml` 4.1 (solo sintaxis y estructura: **no** valida el esquema de GitHub Actions ni expresiones como `if:`; no había `actionlint` disponible).
> - Cada `npm run` del workflow existe en el `package.json` del paquete correspondiente (comprobación automática) y los `needs` apuntan a trabajos existentes.
> - Los comandos de `backend` y `frontend` se ejecutaron en local con **Node 24.19**; la CI usa 22.x. Bajo **Node 22.23** (imagen Docker del backend, repositorio montado de solo lectura) se comprobó: las 8 suites unitarias del frontend (46 pruebas), `tsc --noEmit` del backend y 32 pruebas del backend (las cinco suites añadidas en esta tarea: uploads, migraciones, idempotencia, retención y reclamaciones). **No** se ejecutó la suite completa del backend bajo Node 22 (inviable por la lentitud del montaje desde Windows) ni `build`.
> - `test:integration` pasó 17/17 contra un MySQL 8.4.11 desechable arrancado con los mismos argumentos que el trabajo `integration` (`--mysql-native-password=ON --authentication-policy=mysql_native_password`) y usuario root; el contenedor, la espera, el puerto 3306 y el entorno de Linux del runner **no** se reprodujeron.
> - Sin ejecutar: el YAML en un runner, la caché de `setup-node`, `docker run` en el runner, los smokes en Linux y la compilación bajo la carga de un runner (`build-output` tiene un límite de 10 s y ya falló una vez por carga local).

| Trabajo | Qué ejecuta (scripts reales de cada `package.json`) | Notas |
| --- | --- | --- |
| `backend` | `npm ci` · `tsc --noEmit` · pruebas en serie con la precarga `test/isolate-env.cjs` · `npm run build` | En serie para evitar la intermitencia por compilaciones simultáneas de `build-output`. Incluye `test/migrations.test.ts` (orden y seguridad de las migraciones SQL) |
| `frontend` | `npm ci` · `check` · `lint` · `test:deploy`, `test:errors`, `test:return-path`, `test:list-records`, `test:attention-merge`, `test:mail-outcome`, `test:message-export`, `test:notify` · `build` | Node 22.x, como declaran los `engines` |
| `integration` | MySQL 8.4 efímero en el runner (`docker run`, solo `127.0.0.1`, contraseña de un solo uso que no es un secreto) y `npm run test:integration` | Crea y elimina solo `horus_prisma_test_<UUID>`; aplica `db:init` + `db:migrate` (dos veces) + `db:check`, lo que valida el orden real de las migraciones en una base vacía. **`continue-on-error: true` hace que, si falla, el trabajo se muestre como correcto**: un fallo de migraciones, de `db:check`, de la idempotencia o del arranque de MySQL **no pone rojo** el commit ni el PR (solo queda en el registro del trabajo). Hasta tener una ejecución verde en GitHub, no tomar el check verde de `integration` como prueba; revisar su registro |
| `smokes` | Solo con `workflow_dispatch` y la casilla `smokes`: `smoke:auth`, `smoke:unsaved`, `smoke:panel-sections`, `smoke:panel-toasts`, `smoke:quote-origin`, `smoke:chatbot`, `smoke-home`, `smoke-global-content`, `smoke-ui` | Necesitan Chrome/Chromium y no se han probado en un runner Linux (`smoke-kit.cjs` no pasa `--no-sandbox`). Por eso no corren en cada push |

## Qué no cubre

- Los demás `smoke:*` (mensajes, adjuntos de correo, responsive, etc.): se ejecutan en local según la tabla de `AGENTS.md`.
- La base real: `db:check` y `db:migrate` contra Railway los ejecuta el responsable (`RAILWAY.md`). Una CI verde no demuestra que el despliegue esté listo.
- Correo, IA y APIs públicas reales.

## Equivalente en local

```
cd backend  && npm ci && node node_modules/typescript/bin/tsc --noEmit --incremental false && node --test --test-concurrency=1 -r ./test/isolate-env.cjs -r ts-node/register test/*.test.ts && npm run build
cd frontend && npm ci && npm run check && npm run lint && npm run build
```
