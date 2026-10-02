const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { connect } = require('./database.cjs');
function expectedColumns() {
  const sql = readFileSync(join(__dirname, '../migrations/00000000-initial.sql'), 'utf8');
  const legacy = [...sql.matchAll(/CREATE TABLE IF NOT EXISTS \x60([^\x60]+)\x60 \(\n([\s\S]*?)\n\)/g)].flatMap(([, table, body]) =>
    [...body.matchAll(/^\s*\x60([^\x60]+)\x60 (.+)$/gm)].map(([, name, definition]) => ({
      table, name, type: definition.match(/^(\w+(?:\([^)]*\))?)/)[1],
      nullable: !definition.includes('NOT NULL'),
      unique: definition.includes('UNIQUE') || name === 'id',
    })),
  );
  const added = [
    ['admin_users','activo','tinyint',false],['admin_users','session_version','int',false],
    ['newsletter_subscribers','consent_at','datetime',true],
    ['attention_records','contacto_id','int',true],['attention_records','reclamacion_id','int',true],
    ...[['id','int'],['recurso','varchar(20)'],['registro_id','int'],['estado','varchar(20)'],['responsable','varchar(100)'],['notas','text'],['respuesta','text'],['revision','int'],['historial','json'],['updatedAt','datetime']].map(([name,type])=>['attention_records',name,type,false]),
    ...[['id','varchar(64)'],['count','int'],['expiresAt','datetime']].map(([name,type])=>['rate_limit_buckets',name,type,false]),
  ].map(([table,name,type,nullable])=>({table,name,type,nullable,unique:name==='id'}));
  const visual=[...['cursos','servicios'].map(table=>({table,name:'origen_original',type:'varchar(150)',nullable:true,unique:true})),...['area','certificacion','icono','color'].map((name,i)=>({table:'cursos',name,type:['varchar(80)','varchar(150)','varchar(30)','varchar(20)'][i],nullable:name!=='color',unique:false})),{table:'cursos',name:'orden',type:'int',nullable:false,unique:false},...['presentacion','nombre_corto','destacado','dato_principal','dato_secundario','etiquetas','icono','color','orden'].map((name,i)=>({table:'servicios',name,type:['varchar(30)','varchar(80)','varchar(100)','varchar(40)','varchar(100)','text','varchar(30)','varchar(20)','int'][i],nullable:!['presentacion','color','orden'].includes(name),unique:false})),{table:'galeria_items',name:'origen_original',type:'varchar(150)',nullable:true,unique:true}];
  return [...legacy.map(column=>column.table==='cursos'&&['modalidad','duracion'].includes(column.name)?{...column,nullable:true}:column),...added,...visual];
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
  const [constraints] = await db.query("SELECT CONSTRAINT_NAME, TABLE_NAME, REFERENCED_TABLE_NAME, DELETE_RULE FROM information_schema.REFERENTIAL_CONSTRAINTS WHERE CONSTRAINT_SCHEMA = DATABASE()");
  if (!constraints.some(row=>row.TABLE_NAME==='cotizaciones'&&row.REFERENCED_TABLE_NAME==='contactos'&&['RESTRICT','NO ACTION'].includes(row.DELETE_RULE))) problems.push('cotizaciones.contacto_id: falta protección de referencia');
  for(const referenced of ['contactos','reclamaciones']) if(!constraints.some(row=>row.TABLE_NAME==='attention_records'&&row.REFERENCED_TABLE_NAME===referenced&&['RESTRICT','NO ACTION'].includes(row.DELETE_RULE))) problems.push('attention_records: falta protección de referencia a '+referenced);
  if (!indexes.some(row=>row.TABLE_NAME==='attention_records'&&row.INDEX_NAME==='attention_record_resource'&&Number(row.NON_UNIQUE)===0)) problems.push('attention_records: falta índice único de recurso');
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
