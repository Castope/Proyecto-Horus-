import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolveApiBase } from '../config/api-config.js'
test('development keeps the local API proxy', () => {
 assert.equal(resolveApiBase(undefined), '/api')
})
test('hosted builds require a public HTTPS API URL', () => {
 for (const value of [undefined, '/api', 'http://localhost:3000/api', 'https://localhost/api', 'https://api.example.com', 'https://user:password@api.example.com/api']) {
  assert.throws(() => resolveApiBase(value, true))
 }
 assert.equal(resolveApiBase('https://api.example.com/api/', true), 'https://api.example.com/api')
})
test('SPA routes are rewritten but API paths are not served as HTML', () => {
 const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url)))
 const route = new RegExp('^' + config.rewrites[0].source + '$')
 for (const path of ['/admin/dashboard', '/admin/login', '/educacion/cursos', '/']) assert.ok(route.test(path))
 for (const path of ['/api', '/api/admin/login']) assert.equal(route.test(path), false)
})
