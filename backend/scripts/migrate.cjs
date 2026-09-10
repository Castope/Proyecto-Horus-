const { DataTypes, QueryTypes } = require('sequelize');
const { connect } = require('./database.cjs');
async function run() {
  const db = connect();
  let locked = false;
  try {
    const [result] = await db.query("SELECT GET_LOCK('horus_catalogo_migrations', 10) AS acquired", { type: QueryTypes.SELECT });
    if (Number(result.acquired) !== 1) throw new Error('Otra migración está en ejecución.');
    locked = true;
    const qi = db.getQueryInterface();
    await qi.createTable('horus_migrations', {
      name: { type: DataTypes.STRING(190), primaryKey: true, allowNull: false },
      applied_at: { type: DataTypes.DATE, allowNull: false },
    });
    const name = '20260909-create-catalogo';
    const existing = await db.query('SELECT name FROM horus_migrations WHERE name = :name', {
      replacements: { name }, type: QueryTypes.SELECT,
    });
    if (!existing.length) {
      await require('../migrations/' + name + '.cjs').up(qi);
      await qi.bulkInsert('horus_migrations', [{ name, applied_at: new Date() }]);
    }
    console.log('Migraciones de catálogo aplicadas. No se insertaron datos de ejemplo.');
  } finally {
    try { if (locked) await db.query("SELECT RELEASE_LOCK('horus_catalogo_migrations')"); }
    finally { await db.close(); }
  }
}
run().catch(() => { console.error('No se pudo aplicar la migración. Revisa la conexión, permisos y esquema de MySQL.'); process.exitCode = 1; });
