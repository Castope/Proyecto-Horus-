require('dotenv').config();
const { Sequelize } = require('sequelize');
function connect() {
  for (const key of ['DB_NAME', 'DB_USER', 'DB_PASS']) {
    if (process.env[key] === undefined) throw new Error('Falta configurar ' + key);
  }
  return new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    dialect: 'mysql', host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306), logging: false, pool: { max: 1, min: 0 },
  });
}
module.exports = { connect };
