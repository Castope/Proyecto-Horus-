// Explicit initialization of an EMPTY database. Never run during builds.
const { connect } = require('./database.cjs');
const { applySql } = require('./migrate.cjs');
async function init() {
  const db = await connect();
  let locked = false;
  try {
    const [[result]] = await db.query("SELECT GET_LOCK('horus_catalogo_migrations', 10) AS acquired");
    if (Number(result.acquired) !== 1) throw new Error('Otra migración está en ejecución.');
    locked = true;
    const [tables] = await db.query('SHOW TABLES');
    if (tables.length) throw new Error('La base no está vacía. Usa db:migrate para una base existente.');
    await applySql(db, '00000000-initial');
    console.log('Tablas creadas sin datos. Ejecuta db:migrate y después admin:create.');
  } finally {
    try { if (locked) await db.query("SELECT RELEASE_LOCK('horus_catalogo_migrations')"); }
    finally { await db.end(); }
  }
}
init().catch(error => {
  console.error(error.message?.startsWith('La base no está vacía') ? error.message : 'No se pudo inicializar la base. Revisa conexión, TLS y permisos.');
  process.exitCode = 1;
});
