const { createInterface } = require('node:readline/promises');
const { stdin, stdout } = require('node:process');
const bcrypt = require('bcryptjs');
const { QueryTypes } = require('sequelize');
const { connect } = require('./database.cjs');
async function run() {
  const prompt = createInterface({ input: stdin, output: stdout });
  let nombre, email;
  try {
    nombre = (await prompt.question('Nombre del administrador: ')).trim();
    email = (await prompt.question('Correo del administrador: ')).trim().toLowerCase();
  } finally { prompt.close(); }
  const password = process.env.ADMIN_INITIAL_PASSWORD;
  delete process.env.ADMIN_INITIAL_PASSWORD;
  if (nombre.length < 2 || nombre.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      email.length > 254 || !password || password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) {
    throw new Error('invalid input');
  }
  const db = connect();
  try {
    const existing = await db.query('SELECT id FROM admin_users WHERE email = :email', {
      replacements: { email }, type: QueryTypes.SELECT,
    });
    if (existing.length) throw new Error('existing account');
    await db.getQueryInterface().bulkInsert('admin_users', [{
      nombre, email, password: await bcrypt.hash(password, 12), createdAt: new Date(), updatedAt: new Date(),
    }]);
    console.log('Administrador creado.');
  } finally { await db.close(); }
}
run().catch(() => { console.error('No se creó la cuenta. Revisa los datos, ADMIN_INITIAL_PASSWORD, duplicados y conexión a MySQL.'); process.exitCode = 1; });
