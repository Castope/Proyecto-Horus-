require('reflect-metadata');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { spawnSync } = require('node:child_process');
const { connect, prisma } = require('../scripts/database.cjs');
const { check } = require('../scripts/check-database.cjs');
const { ConfigService } = require('@nestjs/config');
const { CatalogoService } = require('../dist/catalogo/catalogo.service');
const { CotizacionesService } = require('../dist/cotizaciones/cotizaciones.service');
const { ChatbotService } = require('../dist/chatbot/chatbot.service');
const { AdminReclamacionesService } = require('../dist/admin/reclamaciones/admin-reclamaciones.service');
const { GaleriaService } = require('../dist/galeria/galeria.service');
const { ItemsService } = require('../dist/admin/items/items.service');
const { MessagesService } = require('../dist/admin/messages/messages.service');
const { NewsletterService } = require('../dist/newsletter/newsletter.service');
const { SettingsService } = require('../dist/settings/settings.service');
const { AuthService } = require('../dist/admin/auth/auth.service');
const { JwtService } = require('@nestjs/jwt');
const { NestFactory } = require('@nestjs/core');

test('Prisma works against MySQL and legacy-compatible SQL in an isolated database', async t => {
  const db = await connect();
  const originalName = process.env.DB_NAME;
  const name = 'horus_prisma_test_' + randomUUID().replaceAll('-', '');
  assert.match(name, /^horus_prisma_test_[a-f0-9]{32}$/);
  let client, created = false;
  function script(file) {
    const result = spawnSync(process.execPath, ['scripts/' + file], { cwd: require('node:path').join(__dirname, '..'), env: process.env, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr || result.stdout);
  }
  try {
    await db.query('CREATE DATABASE ' + name + ' CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    created = true;
    process.env.DB_NAME = name;
    script('init-database.cjs');
    script('migrate.cjs');
    script('migrate.cjs');
    await db.query('USE ' + name);
    assert.deepEqual(await check(db), []);
    const [[{ total }]] = await db.query('SELECT COUNT(*) AS total FROM horus_migrations');
    assert.equal(total, 2);
    client = prisma();
    const catalog = new CatalogoService(client);
    await t.test('Nest modules initialize with the shared Prisma provider', async () => {
      const { AppModule } = require('../dist/app.module');
      const app = await NestFactory.createApplicationContext(AppModule, { logger: false, abortOnError: false });
      try {
        const { PrismaService } = require('../dist/database/prisma.service');
        const [row] = await app.get(PrismaService).$queryRawUnsafe('SELECT DATABASE() AS name');
        assert.equal(row.name, name);
      } finally { await app.close(); }
    });
    await t.test('catalog publication, search, dates, duplicate slug and archive', async () => {
      const { item } = await catalog.create('cursos', { titulo: 'Curso de redes', slug: 'redes', descripcion: 'Redes locales', tipo: 'curso', modalidad: 'virtual', duracion: '20 horas', fecha_inicio: '2026-09-21' });
      assert.equal(item.estado, 'borrador');
      assert.ok(item.createdAt instanceof Date);
      await assert.rejects(() => catalog.detail('cursos', item.id, true), e => e.getStatus() === 404);
      await catalog.update('cursos', item.id, { estado: 'publicado' });
      const result = await catalog.list('cursos', { page: 1, limit: 10, search: 'redes', estado: 'borrador' }, true);
      assert.equal(result.pagination.total, 1);
      assert.equal(result.items[0].fecha_inicio.toISOString(), '2026-09-21T00:00:00.000Z');
      await assert.rejects(() => catalog.create('cursos', { titulo: 'Duplicado', slug: 'redes', descripcion: 'Redes locales', tipo: 'curso', modalidad: 'virtual', duracion: '20 horas' }), e => e.getStatus() === 409);
      const config = { get: () => undefined };
      const chatbot = new ChatbotService(client, config);
      assert.equal((await chatbot.reply({ message: 'curso virtual de redes' })).sources[0].id, 'curso-' + item.id);
      await catalog.archive('cursos', item.id);
      assert.equal((await catalog.list('cursos', { page: 1, limit: 10 }, true)).pagination.total, 0);
    });
    await t.test('CRUD, booleans, settings, subscriptions and authentication', async () => {
      const items = new ItemsService(client);
      const { item } = await items.create({ titulo: 'Prueba', descripcion: 'Contenido' });
      assert.equal((await items.update(item.id, { estado: 'inactivo' })).item.estado, 'inactivo');
      await items.remove(item.id);
      await assert.rejects(() => items.findOne(item.id), e => e.getStatus() === 404);
      const gallery = new GaleriaService(client);
      const { item: picture } = await gallery.create({ titulo: 'Foto', categoria: 'general', imagen_url: '/foto.jpg', activo: false });
      assert.equal((await gallery.findPublic()).items.length, 0);
      assert.equal((await gallery.update(picture.id, { activo: true })).item.activo, true);
      assert.equal((await gallery.findPublic()).items.length, 1);
      const messages = new MessagesService(client);
      const { message } = await messages.create({ nombre: 'Ana', email: 'ana@example.com', asunto: 'Consulta', mensaje: 'Prueba' });
      assert.equal(message.telefono, '');
      assert.equal((await messages.updateStatus(message.id, { estado: 'atendido' })).message.estado, 'atendido');
      const newsletter = new NewsletterService(client);
      await newsletter.subscribe({ email: 'ANA@example.com' });
      await newsletter.subscribe({ email: 'ANA@example.com' });
      assert.equal((await newsletter.findAll()).total, 1);
      const settings = new SettingsService(client);
      await settings.getPublicSettings();
      await settings.updateSettings({ ajustes: { empresa_nombre: 'Empresa prueba' } });
      assert.equal((await settings.getPublicSettings()).settings.empresa_nombre, 'Empresa prueba');
      const auth = new AuthService(client, new JwtService({ secret: 'x'.repeat(32) }));
      await auth.register({ nombre: 'Admin', email: 'admin@example.com', password: 'Password123' });
      assert.ok((await auth.login({ email: 'admin@example.com', password: 'Password123' })).token);
    });
    await t.test('DATEONLY complaint responses and nullable fields', async () => {
      const item = await client.reclamacion.create({ data: { nombres: 'Ana', apellidos: 'Perez', email: 'ana@example.com', telefono: '999888777', tipo_registro: 'reclamo', area: 'Soporte', fecha_incidente: new Date('2026-02-28'), descripcion_bien: 'Servicio', detalle_reclamo: 'Detalle' } });
      const service = new AdminReclamacionesService(client);
      assert.equal((await service.findOne(item.id)).reclamacion.fecha_incidente, '2026-02-28');
      assert.equal((await service.findAll({ search: 'Ana' })).total, 1);
    });
    await t.test('quotes preserve decimals, JSON and optimistic concurrency', async () => {
      const service = new CotizacionesService(client);
      const dto = { cliente: 'Cliente', email: '', telefono: '', documento: '', direccion: '', emisor: 'Horus', datos_emisor: '', moneda: 'PEN', validez: '2099-12-31', condiciones: '', conceptos: [{ descripcion: 'Servicio', cantidad: 3, precio: 0.1 }], descuento: 0, tasa: 18 };
      const { item } = await service.create(dto, 1);
      assert.equal(item.subtotal, 0.3);
      const detail = (await service.detail(item.id)).item;
      assert.equal(detail.validez, '2099-12-31');
      assert.equal(detail.subtotal, '0.30');
      assert.equal(detail.total, '0.35');
      assert.equal(detail.historial.length, 1);
      assert.equal(detail.conceptos[0].cantidad, 3);
      const list = await service.list({ page: 1, limit: 12, search: 'Cliente', estado: '' });
      assert.equal(list.pagination.total, 1);
      assert.equal(list.items[0].total, '0.35');
      assert.ok(!('historial' in list.items[0]));
      const results = await Promise.allSettled([
        service.edit(item.id, { ...dto, cliente: 'Edicion A', revision: 1 }, 1),
        service.edit(item.id, { ...dto, cliente: 'Edicion B', revision: 1 }, 2),
      ]);
      assert.equal(results.filter(r => r.status === 'fulfilled').length, 1);
      assert.equal(results.find(r => r.status === 'fulfilled').value.item.total, 0.35);
      assert.equal(results.find(r => r.status === 'rejected').reason.getStatus(), 409);
      const edited = (await service.detail(item.id)).item;
      assert.equal(edited.revision, 2);
      assert.equal(edited.historial.length, 2);
      await service.status(item.id, { estado: 'enviada', revision: 2 }, 1);
      await assert.rejects(() => service.edit(item.id, { ...dto, revision: 3 }, 1), e => e.getStatus() === 409);
      const rolledBack = await client.cotizacion.findUnique({ where: { id: item.id } });
      assert.equal(rolledBack.revision, 3);
      assert.equal(rolledBack.historial.length, 3);
    });
    await t.test('migrations repeat safely and initialization refuses existing data', async () => {
      script('migrate.cjs');
      assert.equal(await client.adminUser.count(), 1);
      const result = spawnSync(process.execPath, ['scripts/init-database.cjs'], { env: process.env, encoding: 'utf8' });
      assert.equal(result.status, 1);
      assert.equal(await client.adminUser.count(), 1);
    });
  } finally {
    process.env.DB_NAME = originalName;
    if (client) await client.$disconnect();
    if (created) await db.query('DROP DATABASE ' + name);
    await db.end();
  }
});
