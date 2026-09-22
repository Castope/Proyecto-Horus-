const { spawnSync } = require('node:child_process');
// Generation needs a syntactically valid URL, but never opens a database connection.
// Runtime and SQL scripts continue to use DB_* (including inline TLS certificates).
const result = spawnSync(process.execPath, [require.resolve('prisma/build/index.js'), 'generate'], {
  stdio: 'inherit', env: { ...process.env, DATABASE_URL: 'mysql://generate:generate@localhost:3306/horus_generate' },
});
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
