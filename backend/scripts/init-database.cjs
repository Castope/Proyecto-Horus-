// Explicit initialization of an EMPTY database. Never run during Vercel builds.
const { Sequelize } = require('sequelize-typescript');
const { connect } = require('./database.cjs');
const models = [
  require('../dist/contacto/contacto.model').Contacto,
  require('../dist/reclamaciones/reclamacion.model').Reclamacion,
  require('../dist/admin/auth/admin-user.model').AdminUser,
  require('../dist/admin/items/admin-item.model').AdminItem,
  require('../dist/galeria/galeria.model').GaleriaItem,
  require('../dist/newsletter/newsletter.model').Newsletter,
  require('../dist/settings/settings.model').Setting,
  ...Object.values(require('../dist/catalogo/catalogo.models')),
];
async function init() {
  const connection = connect();
  let db;
  try {
    const tables = await connection.getQueryInterface().showAllTables();
    if (tables.length) throw new Error('La base no está vacía. Usa las migraciones para una base existente.');
    db = new Sequelize({ ...connection.options, database: connection.config.database,
      username: connection.config.username, password: connection.config.password, models });
    await db.sync({ force: false, alter: false });
    console.log('Tablas creadas sin datos de ejemplo. Ejecuta db:migrate y después admin:create.');
  } finally { if (db) await db.close(); await connection.close(); }
}
init().catch(error => {
  console.error(error.message?.startsWith('La base no está vacía') ? error.message : 'No se pudo inicializar la base. Revisa conexión, TLS y permisos.');
  process.exitCode = 1;
});
