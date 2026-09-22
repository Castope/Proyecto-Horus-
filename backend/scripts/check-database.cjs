const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { connect } = require('./database.cjs');
function expectedColumns() {
  const sql = readFileSync(join(__dirname, '../migrations/00000000-initial.sql'), 'utf8');
  return [...sql.matchAll(/CREATE TABLE IF NOT EXISTS \x60([^\x60]+)\x60 \(\n([\s\S]*?)\n\)/g)].flatMap(([, table, body]) =>
    [...body.matchAll(/^\s*\x60([^\x60]+)\x60 (.+)$/gm)].map(([, name, definition]) => ({
      table, name, type: definition.match(/^(\w+(?:\([^)]*\))?)/)[1],
      nullable: !definition.includes('NOT NULL'),
      unique: definition.includes('UNIQUE') || name === 'id',
    })),
  );
}
function normalizeType(type) { return type.toLowerCase().replace(/\binteger\b/g, 'int').replace(/int\(\d+\)/g, 'int').replace(/\s/g, ''); }
async function check(db) {
  const [columns] = await db.query('SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE()');
  const [indexes] = await db.query('SELECT TABLE_NAME, INDEX_NAME, COLUMN_NAME, NON_UNIQUE FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE()');
  const problems = [];
  for (const expected of expectedColumns()) {
    const actual = columns.find(c => c.TABLE_NAME === expected.table && c.COLUMN_NAME === expected.name);
    const key = expected.table + '.' + expected.name;
    if (!actual) { problems.push(key + ': falta'); continue; }
    if (normalizeType(actual.COLUMN_TYPE) !== normalizeType(expected.type)) problems.push(key + ': tipo distinto (' + actual.COLUMN_TYPE + ' / ' + expected.type + ')');
    if ((actual.IS_NULLABLE === 'YES') !== expected.nullable) problems.push(key + ': nulabilidad distinta');
    if (expected.unique && !indexes.some(i => i.TABLE_NAME === expected.table && i.COLUMN_NAME === expected.name && Number(i.NON_UNIQUE) === 0 &&
      indexes.filter(j => j.TABLE_NAME === i.TABLE_NAME && j.INDEX_NAME === i.INDEX_NAME).length === 1)) problems.push(key + ': falta indice unico');
  }
  return problems;
}
if (require.main === module) (async () => {
  const db = await connect();
  try {
    const problems = await check(db);
    if (problems.length) { console.error(problems.join('\n')); process.exitCode = 1; }
    else console.log('Esquema compatible: tablas, columnas, tipos, nulabilidad e indices unicos. No se modificaron datos.');
  } finally { await db.end(); }
})().catch(() => { console.error('No se pudo verificar el esquema. Revisa conexion y permisos.'); process.exitCode = 1; });
module.exports = { check };
