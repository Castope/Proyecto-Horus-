import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import { corsOrigins, validateDeployment } from '../src/deployment.config';
test('development supports local frontend origins', () => {
 assert.ok(corsOrigins({}).includes('http://localhost:5173'));
});
test('production requires exact HTTPS origins', () => {
 for (const origin of ['', '*', 'https://web.example.com/path', 'https://web.example.com/', 'http://web.example.com']) {
  assert.throws(() => corsOrigins({ NODE_ENV: 'production', CORS_ORIGINS: origin }));
 }
 assert.deepEqual(corsOrigins({ NODE_ENV: 'production', CORS_ORIGINS: 'https://web.example.com, https://preview.example.com' }), ['https://web.example.com', 'https://preview.example.com']);
});
test('hosted configuration rejects missing secrets, local DB and schema sync', () => {
 const env = { VERCEL: '1', CORS_ORIGINS: 'https://web.example.com', DB_HOST: 'mysql.example.com', DB_NAME: 'horus', DB_USER: 'horus', DB_PASS: 'test-value', JWT_SECRET: 'x'.repeat(32), DB_SYNC: 'false' };
 assert.equal(validateDeployment(env), env);
 for (const patch of [{ DB_HOST: 'localhost' }, { DB_PASS: '' }, { JWT_SECRET: 'short' }, { DB_SYNC: 'true' }]) {
  assert.throws(() => validateDeployment({ ...env, ...patch }));
 }
});
