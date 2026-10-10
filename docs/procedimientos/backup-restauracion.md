# Respaldo y restauración de MySQL

Guía operativa de `npm run db:backup` y `npm run db:restore` (desde `backend/`). Ambos son comandos **explícitos**: no se ejecutan en la
instalación, la compilación ni el arranque.

## Qué hace cada comando

| Comando | Efecto | Escribe en MySQL |
| --- | --- | --- |
| `npm run db:backup` | Vuelca esquema y datos de la base configurada (`DB_*`) a `backend/.backups/` | **No** (solo lectura) |
| `npm run db:restore -- --file=<respaldo> --verify-only` | Comprueba firma SHA-256 y contenido del archivo | **No** (ni se conecta) |
| `npm run db:restore -- --file=<respaldo> --target=horus_restore_<nombre> --yes` | Crea la base aislada `horus_restore_<nombre>` y carga el respaldo | Solo en esa base nueva |

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
4. Los archivos subidos (`UPLOAD_DIR`, imágenes) **no** forman parte del respaldo de la base: respáldalos aparte.

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

## Requisitos del usuario de MySQL

- En el contenedor del backend (`/app` pertenece a root y el proceso corre como `node`) la carpeta por defecto `.backups` **no es escribible**: usa `--dir=<volumen persistente>`.
- Respaldo: `SELECT` y `SHOW VIEW` sobre la base (permisos de lectura; el usuario de la aplicación ya los tiene).
- Restauración: `CREATE`, `INSERT`, `ALTER` e índices sobre `horus_restore_*`. Si el usuario no puede `CREATE DATABASE`, crea la base vacía
  con un administrador y vuelve a ejecutar el comando.

## Qué probar antes de depender de este procedimiento

- [ ] Ejecutar `db:backup` en el entorno real y comprobar el tamaño y los recuentos del manifiesto.
- [ ] Restaurar en una base `horus_restore_*` y revisar los datos.
- [ ] Practicar la recuperación completa (incluido el cifrado y la copia de los uploads) al menos una vez.
- [ ] Definir la frecuencia (diaria/semanal), el responsable y la alerta si falla. **[PENDIENTE DE APROBACIÓN]**
- [ ] Mantener también los respaldos del propio proveedor (Railway) como segunda línea.

## Limitaciones conocidas

- El volcado se pagina por clave primaria con `LIMIT/OFFSET`, adecuado para el tamaño actual; para bases muy grandes convendría un volcado por rangos.
- No incluye vistas, procedimientos, disparadores ni usuarios/privilegios de MySQL (el esquema actual no los usa).
- Una restauración parcial por tabla no está soportada.
- La prueba de ida y vuelta contra un MySQL real (`db:backup` → `db:restore`) debe ejecutarse con autorización en un destino de pruebas.
