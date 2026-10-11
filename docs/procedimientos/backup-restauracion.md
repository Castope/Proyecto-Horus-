# Respaldo y restauración de MySQL

Guía operativa de `npm run db:backup`, `npm run db:restore`, `npm run uploads:backup` y `npm run uploads:restore` (desde `backend/`). Todos son comandos **explícitos**: no se ejecutan en la
instalación, la compilación ni el arranque.

## Qué hace cada comando

| Comando | Efecto | Escribe en MySQL |
| --- | --- | --- |
| `npm run db:backup` | Vuelca esquema y datos de la base configurada (`DB_*`) a `backend/.backups/` | **No** (solo lectura) |
| `npm run db:restore -- --file=<respaldo> --verify-only` | Comprueba firma SHA-256 y contenido del archivo | **No** (ni se conecta) |
| `npm run db:restore -- --file=<respaldo> --target=horus_restore_<nombre> --yes` | Crea la base aislada `horus_restore_<nombre>` y carga el respaldo | Solo en esa base nueva |
| `npm run uploads:backup` | Copia los archivos de `UPLOAD_DIR` a `backend/.backups/uploads-AAAAMMDD-HHMMSS/` con manifiesto SHA-256 | **No** (no usa MySQL; solo lee `UPLOAD_DIR`) |
| `npm run uploads:restore -- --from=<instantánea> --verify-only` | Comprueba la instantánea completa | **No** |
| `npm run uploads:restore -- --from=<instantánea> --target=<carpeta> --yes` | Copia los archivos a una carpeta nueva o vacía; nunca sobrescribe | **No** (solo archivos) |

## Respaldo

```
npm run db:backup
npm run db:backup -- --dir=D:\respaldos\horus          # otra carpeta
npm run db:backup -- --include-rate-limits             # incluye las cuotas temporales (normalmente no se necesitan)
```

- Usa `mysql2` y las credenciales de `scripts/database.cjs` (variables `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS`, `DB_SSL`, `DB_SSL_CA`,
  `DB_RSA_PUBLIC_KEY`). **No hace falta instalar `mysqldump`/`mysql`** (la imagen Docker del backend no los incluye) y la contraseña
  nunca viaja por argumentos de línea de comandos ni se escribe en el archivo.
- Abre una transacción `START TRANSACTION WITH CONSISTENT SNAPSHOT, READ ONLY` con aislamiento `REPEATABLE READ`: el volcado es consistente
  entre tablas y **no bloquea** a la aplicación. Si el recuento de una tabla cambia durante el volcado, se aborta en lugar de entregar un
  respaldo incoherente.
- Genera tres archivos con marca de tiempo (`horus-<base>-AAAAMMDD-HHMMSS`):
  - `.sql.gz`: una sentencia por línea (`CREATE TABLE` e `INSERT INTO`; nunca `DROP`).
  - `.sql.gz.sha256`: firma SHA-256 en formato `sha256sum`.
  - `.sql.gz.manifest.json`: tablas, filas, versión del servidor y migraciones aplicadas.
- `rate_limit_buckets` conserva la estructura pero no los datos (las cuotas caducan en minutos).
- Nunca sobrescribe un respaldo existente y borra el archivo parcial si falla.

### Seguridad del archivo

El respaldo **contiene datos personales** (consultas, reclamaciones, suscriptores) y **hashes de contraseñas** de administradores.
`backend/.backups/` está en `.gitignore`, pero además:

1. Cífralo antes de moverlo (por ejemplo, con la herramienta de cifrado aprobada por Horus) y guárdalo fuera del repositorio y del servidor.
2. Restringe el acceso a personas autorizadas y no lo envíes por canales no corporativos.
3. Define con el responsable la retención y la destrucción segura. **[PENDIENTE DE APROBACIÓN]**: retención, ubicación y cifrado oficiales.
4. Los archivos subidos (`UPLOAD_DIR`, imágenes) **no** forman parte del respaldo de la base: respáldalos con `uploads:backup` (sección «Archivos subidos»).

## Restauración

```
npm run db:restore -- --file=backend\.backups\horus-horus_db-20261010-003600.sql.gz --verify-only
npm run db:restore -- --file=backend\.backups\horus-horus_db-20261010-003600.sql.gz --target=horus_restore_prueba1 --yes
```

La firma `.sha256` detecta daños y cambios **accidentales o parciales**, pero no demuestra el origen del archivo: quien pueda reemplazar el respaldo puede reemplazar también su firma. Guarda
el hash en un lugar distinto (por ejemplo, junto al registro de la copia cifrada) si necesitas autenticidad.

Protecciones (todas se comprueban **antes** de escribir):

1. Exige el `.sha256` y que coincida; un archivo modificado, truncado o sin firma se rechaza.
2. Solo se ejecutan `CREATE TABLE`, `INSERT INTO` y unos `SET` fijos, y cada línea se valida **completa**: los `INSERT` solo admiten literales (sin subconsultas ni `SELECT`) y los
   `CREATE TABLE` no admiten `SELECT`, `UNION`, rutas de archivo ni sentencias encadenadas. Cualquier otra sentencia (`DROP`, `GRANT`, `USE`, `DELETE`…) detiene todo.
3. El destino debe llamarse `horus_restore_<nombre>` (minúsculas, números y guion bajo) y **nunca** puede ser la base de `DB_NAME`.
4. El destino no debe existir o debe estar **vacío**: si ya tiene tablas, se aborta. El script no ejecuta `DROP`.
5. En un servidor que no sea local exige `ALLOW_RESTORE_DB=true` además de un destino aislado autorizado.
6. Sin `--yes` solo informa de lo que haría.
7. Valida el manifiesto (nombres de tabla seguros y firma coincidente) y, al terminar, compara el recuento de cada tabla. El manifiesto no se firma por separado.

La restauración **no** sobrescribe la base de producción. Para recuperarla tras un incidente:

1. Restaura en `horus_restore_<nombre>` y revisa los datos (recuentos, consultas de prueba).
2. Decide con el responsable cómo promover esos datos (cambiar `DB_NAME` del backend a la base restaurada, o copiar tablas concretas con
   una intervención manual y autorizada). Esa promoción **no** está automatizada a propósito.
3. Elimina manualmente la base temporal cuando ya no se necesite.
4. Si el esquema del respaldo es anterior a las migraciones actuales, ejecuta `npm run db:migrate` **sobre la base restaurada** (comprobando
   antes `DB_NAME`) y después `npm run db:check`.

## Archivos subidos (`UPLOAD_DIR`)

La base guarda solo la **ruta** de cada imagen (`/uploads/<uuid>.png|jpg|webp`); el archivo vive en el volumen de `UPLOAD_DIR`. Sin una copia de los archivos, restaurar solo la base deja imágenes rotas.

```
npm run uploads:backup                                                # origen: --source, o UPLOAD_DIR, o ./uploads; destino: backend/.backups
npm run uploads:backup -- --source=/data/uploads --dir=/data/backups  # en el contenedor: carpeta de respaldos en un volumen persistente
```

- Crea `uploads-AAAAMMDD-HHMMSS/` (misma marca que `db:backup`, para emparejar ambas copias) con `files/<ruta>`, `manifest.json` (ruta, bytes y SHA-256 por archivo, más lo omitido) y `manifest.json.sha256`. Al terminar **relee y verifica** lo escrito; si falla, retira la instantánea parcial que creó.
- **No borra ni modifica nada del origen.** Los archivos subidos son de escritura única (`wx`, nombre UUID), así que copiarlos con la API en marcha es seguro. Un archivo que desaparezca durante la copia se anota en el manifiesto (`vanished`).
- **Se excluyen** (y se listan en `excluded`, sin eliminarlos): temporales y de sistema (`*.tmp`, `*.part`, `*.partial`, `*.crdownload`, `*~`, archivos que empiezan por punto, `Thumbs.db`). Los enlaces simbólicos y los nombres no admitidos se omiten y se listan en `skipped`: revísalos. Los archivos que genera la aplicación (nombre UUID con extensión `png`, `jpg` o `webp`) siempre se respaldan. Un nombre fuera del patrón `A-Z a-z 0-9 . _ -` (con espacios, tildes o ñ) **no se respalda**: queda en `skipped` con el motivo «nombre no admitido» y el comando termina con éxito; la aplicación no genera esos nombres, así que solo aparecerían si alguien copió archivos a mano en `UPLOAD_DIR`. Cualquier otro nombre válido se respalda, aunque no sea un UUID.
- **Origen sin archivos:** si no hay nada que respaldar (carpeta vacía, solo temporales u omitidos) el comando falla y no crea instantánea, porque suele indicar un `--source` o `UPLOAD_DIR` equivocado. Si el origen está vacío a propósito, añade `--allow-empty` (`npm run uploads:backup -- --allow-empty`). Una ruta inexistente falla siempre.
- La carpeta de respaldos no puede estar dentro de `UPLOAD_DIR`. Las imágenes del sitio no contienen datos personales por diseño, pero revísalas antes de compartir una copia.

```
npm run uploads:restore -- --from=backend/.backups/uploads-20261010-153045 --verify-only
npm run uploads:restore -- --from=backend/.backups/uploads-20261010-153045 --target=<carpeta-nueva-o-vacia> --yes
```

Protecciones (antes de escribir nada se verifica **toda** la instantánea; si algo falla, no se escribe):

1. Firma del manifiesto, existencia, tamaño y SHA-256 de cada archivo; rutas del manifiesto validadas (nada de `..`, rutas absolutas ni barras invertidas).
2. El destino debe **no existir o estar vacío**. Con `--only-missing` puede contener archivos: solo se copian los que falten, los idénticos se omiten y los **distintos se dejan intactos** y se informan como conflicto (código de salida 1). Nunca se sobrescribe.
3. El destino no puede estar dentro del respaldo ni contenerlo. Si es la carpeta en uso (`UPLOAD_DIR`) se exige además `--allow-upload-dir`.
4. Sin `--yes` solo informa de lo que haría. Cada archivo copiado se vuelve a comprobar contra su firma.
5. Un fallo a medias no revierte lo ya copiado (solo se crearon archivos nuevos): repite con `--only-missing`.

## Recuperación completa y coherente (base + archivos)

Un respaldo útil es el **par** base + archivos de la misma ventana:

1. **Copia:** ejecuta `db:backup` y **después** `uploads:backup`, seguidos y con el mismo destino. La base solo referencia archivos que ya existían cuando se copió y los archivos no se borran, así que la copia de archivos (posterior) los contiene todos; una imagen subida entre ambas copias solo puede *sobrar* (sin consecuencias). En el orden inverso, la base podría referenciar una imagen que la copia de archivos no tiene. Anota ambos nombres (las marcas difieren unos segundos).
2. **Verifica** ambas: `db:restore -- --file=… --verify-only` y `uploads:restore -- --from=… --verify-only`.
3. **Ensayo en aislado** (sin tocar producción): `db:restore` en `horus_restore_<nombre>` y `uploads:restore` en una carpeta temporal nueva; compara recuentos con el manifiesto de cada copia y abre algunas imágenes de la carpeta restaurada.
4. **Recuperación real** tras una pérdida (decisión y ejecución del responsable, con el backend detenido o en mantenimiento): restaura la base como en la sección anterior y promuévela; restaura los archivos en el volumen vacío de `UPLOAD_DIR` (`--allow-upload-dir`; si el volumen conserva algunos archivos, `--only-missing`); aplica `db:migrate` y `db:check` si el respaldo es anterior al esquema actual; comprueba en el panel y en el sitio que las imágenes cargan.

Estos comandos están probados con **dobles y carpetas temporales** (`test/backup-lib.test.ts`, `test/uploads-backup.test.ts`). **No se ha realizado un simulacro completo** con MySQL real, el volumen real ni los datos de producción.

## Medidas que no se resuelven con código (pendientes de decisión del responsable)

| Medida | Estado |
| --- | --- |
| Cifrado de las copias (herramienta, gestión de claves, quién custodia la clave) | **[PENDIENTE]** Los comandos no cifran |
| Almacenamiento externo (proveedor, región, coste) y copia fuera del servidor/volumen | **[PENDIENTE]** No se eligió proveedor ni se creó credencial alguna |
| Automatizar la copia y su subida al almacenamiento externo (frecuencia, tarea programada en el entorno real) | **[PENDIENTE]** Hoy todo es manual |
| Control de accesos a las copias (quién lee, quién restaura, registro de accesos) | **[PENDIENTE]** |
| Política de retención y destrucción segura de copias (cuántas, cuánto tiempo) | **[PENDIENTE]** Alinear con la política de privacidad |
| Alerta si falla o no se ejecuta una copia | **[PENDIENTE]** |
| Simulacro completo de recuperación (base + archivos) con registro de resultado y tiempos | **[PENDIENTE]** Ver el ensayo anterior |
| Copias propias del proveedor (Railway) como segunda línea | **[PENDIENTE]** Confirmar que están activas y cómo se restauran |

## Requisitos del usuario de MySQL

- En el contenedor del backend (`/app` pertenece a root y el proceso corre como `node`) la carpeta por defecto `.backups` **no es escribible**: usa `--dir=<volumen persistente>`.
- Respaldo: `SELECT` y `SHOW VIEW` sobre la base (permisos de lectura; el usuario de la aplicación ya los tiene).
- Restauración: `CREATE`, `INSERT`, `ALTER` e índices sobre `horus_restore_*`. Si el usuario no puede `CREATE DATABASE`, crea la base vacía
  con un administrador y vuelve a ejecutar el comando.

## Qué probar antes de depender de este procedimiento

- [ ] Ejecutar `db:backup` en el entorno real y comprobar el tamaño y los recuentos del manifiesto.
- [ ] Restaurar en una base `horus_restore_*` y revisar los datos.
- [ ] Practicar la recuperación completa (base + `uploads:backup`/`uploads:restore`, incluido el cifrado) al menos una vez.
- [ ] Definir la frecuencia (diaria/semanal), el responsable y la alerta si falla. **[PENDIENTE DE APROBACIÓN]**
- [ ] Mantener también los respaldos del propio proveedor (Railway) como segunda línea.

## Limitaciones conocidas

- El volcado se pagina por clave primaria con `LIMIT/OFFSET`, adecuado para el tamaño actual; para bases muy grandes convendría un volcado por rangos.
- No incluye vistas, procedimientos, disparadores ni usuarios/privilegios de MySQL (el esquema actual no los usa).
- Una restauración parcial por tabla no está soportada.
- La prueba de ida y vuelta contra un MySQL real (`db:backup` → `db:restore`) debe ejecutarse con autorización en un destino de pruebas.
