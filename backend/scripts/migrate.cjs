const { DataTypes, QueryTypes } = require('sequelize');
const { connect } = require('./database.cjs');

async function migrate(db) {
  // The lock and all DDL use the same connection and roll back together.
  await db.transaction(async transaction => {
    const options = { transaction };
    const [lock] = await db.query(
      'SELECT pg_try_advisory_xact_lock(684210, 1) AS acquired',
      { ...options, type: QueryTypes.SELECT },
    );
    if (!lock.acquired) throw new Error('Otra migracion esta en ejecucion.');
    const qi = db.getQueryInterface();
    await qi.createTable('horus_migrations', {
      name: { type: DataTypes.STRING(190), primaryKey: true, allowNull: false },
      applied_at: { type: DataTypes.DATE, allowNull: false },
    }, options);
    const name = '20260909-create-catalogo';
    const existing = await db.query('SELECT name FROM horus_migrations WHERE name = :name', {
      ...options, replacements: { name }, type: QueryTypes.SELECT,
    });
    if (!existing.length) {
      await require('../migrations/' + name + '.cjs').up(qi, options);
      await qi.bulkInsert('horus_migrations', [{ name, applied_at: new Date() }], options);
    }
  });
}

async function run() {
  const db = connect();
  try {
    await migrate(db);
    console.log('Migraciones de catalogo aplicadas. No se insertaron datos de ejemplo.');
  } finally {
    await db.close();
  }
}
if (require.main === module) {
  run().catch(() => {
    console.error('No se pudo aplicar la migracion. Revisa conexion, permisos y esquema de PostgreSQL.');
    process.exitCode = 1;
  });
}
module.exports = { migrate };
