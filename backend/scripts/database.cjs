require('dotenv').config();
const mysql = require('mysql2/promise');
const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');

function options() {
  for (const key of ['DB_NAME', 'DB_USER', 'DB_PASS']) {
    if (process.env[key] === undefined) throw new Error('Falta configurar ' + key);
  }
  return {
    host: process.env.DB_HOST || 'localhost', port: Number(process.env.DB_PORT || 3306),
    database: process.env.DB_NAME, user: process.env.DB_USER, password: process.env.DB_PASS,
    connectTimeout: 10000,
    ...(process.env.DB_SSL === 'true' ? {
      ssl: { rejectUnauthorized: true, ...(process.env.DB_SSL_CA ? { ca: process.env.DB_SSL_CA.replace(/\\n/g, '\n') } : {}) },
    } : {}),
  };
}
// One dedicated connection keeps GET_LOCK/RELEASE_LOCK on the same MySQL session.
function connect() { return mysql.createConnection({ ...options(), timezone: 'Z' }); }
function prisma() {
  return new PrismaClient({ adapter: new PrismaMariaDb({ ...options(), connectionLimit: 1, timezone: '+00:00' }) });
}
module.exports = { connect, prisma };
