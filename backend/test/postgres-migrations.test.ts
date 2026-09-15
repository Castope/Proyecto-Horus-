import { test } from 'node:test';
import * as assert from 'node:assert/strict';
const { migrate } = require('../scripts/migrate.cjs');

function fakeDb(applied: boolean, acquired = true, failTable = '') {
  const transaction = {};
  const created: string[] = [];
  const inserted: string[] = [];
  const queries: string[] = [];
  const qi = {
    createTable: async (name: string, _columns: unknown, options: any) => {
      assert.equal(options.transaction, transaction);
      if (name === failTable) throw new Error('DDL failed');
      created.push(name);
    },
    bulkInsert: async (name: string, _rows: unknown, options: any) => {
      assert.equal(options.transaction, transaction);
      inserted.push(name);
    },
  };
  return {
    created, inserted, queries,
    transaction: async (fn: any) => fn(transaction),
    getQueryInterface: () => qi,
    query: async (sql: string, options: any) => {
      assert.equal(options.transaction, transaction);
      queries.push(sql);
      return sql.includes('pg_try_advisory_xact_lock') ? [{ acquired }] : applied ? [{ name: 'existing' }] : [];
    },
  };
}
test('an imported migration does not recreate catalog tables or insert history', async () => {
  const db = fakeDb(true);
  await migrate(db);
  assert.deepEqual(db.created, ['horus_migrations']);
  assert.deepEqual(db.inserted, []);
});
test('all new migration DDL and history use the locked transaction', async () => {
  const db = fakeDb(false);
  await migrate(db);
  assert.deepEqual(db.created, ['horus_migrations', 'cursos', 'servicios', 'preguntas_frecuentes']);
  assert.deepEqual(db.inserted, ['horus_migrations']);
});
test('an unavailable migration lock prevents schema changes', async () => {
  const db = fakeDb(false, false);
  await assert.rejects(migrate(db), /Otra migracion/);
  assert.deepEqual(db.created, []);
});
test('failed DDL propagates to transaction rollback and does not record success', async () => {
  const db = fakeDb(false, true, 'servicios');
  await assert.rejects(migrate(db), /DDL failed/);
  assert.deepEqual(db.inserted, []);
});
