import 'reflect-metadata';
import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import { ValidationPipe, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { UniqueConstraintError } from 'sequelize';
import { CatalogoService } from '../src/catalogo/catalogo.service';
import { CatalogoQueryDto, CreateCursoDto, UpdateCursoDto, CreatePreguntaFrecuenteDto } from '../src/catalogo/catalogo.dto';
import { AdminCursoController, AdminServicioController, AdminPreguntaFrecuenteController } from '../src/catalogo/catalogo.controllers';
import { JwtAuthGuard } from '../src/common/guards/jwt-auth.guard';
import { AuthController } from '../src/admin/auth/auth.controller';
import { GaleriaService } from '../src/galeria/galeria.service';

const pipe = new ValidationPipe({
  whitelist: true, forbidNonWhitelisted: true, transform: true,
  transformOptions: { enableImplicitConversion: true },
});
const validate = (value: unknown, metatype: any) => pipe.transform(value, { type: 'body', metatype });
function service(model: object) { return new CatalogoService(model as any, model as any, model as any); }

test('public list cannot reveal drafts through the estado query', async () => {
  let options: any;
  const api = service({ findAndCountAll: async (input: any) => { options = input; return { rows: [], count: 0 }; } });
  const result = await api.list('cursos', { page: 2, limit: 10, estado: 'borrador' }, true);
  assert.equal(options.where.estado, 'publicado');
  assert.equal(options.offset, 10);
  assert.equal(result.pagination.total, 0);
  assert.deepEqual(result.items, []);
});

test('public detail filters publication and responds 404 for missing content', async () => {
  const api = service({ findOne: async ({ where }: any) => {
    assert.deepEqual(where, { id: 7, estado: 'publicado' });
    return null;
  } });
  await assert.rejects(() => api.detail('servicios', 7, true), NotFoundException);
});

test('admin detail can access drafts', async () => {
  const api = service({ findOne: async ({ where }: any) => {
    assert.deepEqual(where, { id: 7 });
    return { id: 7, estado: 'borrador' };
  } });
  assert.equal((await api.detail('cursos', 7)).item.get ? false : true, true);
});

test('pagination rejects zero, negative, non-integer and excessive limits', async () => {
  for (const value of [0, -1, 1.5, 101, 'abc', null]) {
    await assert.rejects(() => validate({ limit: value }, CatalogoQueryDto));
  }
  const dto = await validate({ page: '2', limit: '10' }, CatalogoQueryDto);
  assert.equal(dto.page, 2);
  assert.equal(dto.limit, 10);
});

test('course validation rejects whitespace, unknown fields, invalid dates and null updates', async () => {
  const valid = { titulo: 'Curso de redes', slug: 'curso-redes', descripcion: 'Descripción del curso', tipo: 'curso', modalidad: 'virtual', duracion: '20 horas' };
  await validate(valid, CreateCursoDto);
  for (const extra of [{ titulo: '   ' }, { fecha_inicio: '2026-02-30' }, { role: 'admin' }, { imagen_url: 'javascript:alert(1)' }]) {
    await assert.rejects(() => validate({ ...valid, ...extra }, CreateCursoDto));
  }
  await assert.rejects(() => validate({ titulo: null }, UpdateCursoDto));
  await assert.rejects(() => validate({ estado: 'activo' }, UpdateCursoDto));
});

test('FAQ requires a real question and answer', async () => {
  await assert.rejects(() => validate({ pregunta: 'Dónde', respuesta: ' ', categoria: 'general' }, CreatePreguntaFrecuenteDto));
});

test('archive preserves record and changes state', async () => {
  let updates: any;
  const item = { update: async (value: any) => { updates = value; } };
  await service({ findOne: async () => item }).archive('cursos', 4);
  assert.deepEqual(updates, { estado: 'archivado' });
});

test('duplicate slugs become HTTP 409 and empty updates are rejected', async () => {
  const api = service({ create: async () => { throw new UniqueConstraintError({ errors: [] }); } });
  await assert.rejects(() => api.create('cursos', { slug: 'duplicado' }), ConflictException);
  await assert.rejects(() => api.update('cursos', 1, {}), BadRequestException);
});

test('administrative content and administrator registration require JWT', () => {
  for (const controller of [AdminCursoController, AdminServicioController, AdminPreguntaFrecuenteController]) {
    assert.ok(Reflect.getMetadata(GUARDS_METADATA, controller).includes(JwtAuthGuard));
  }
  assert.ok(Reflect.getMetadata(GUARDS_METADATA, AuthController.prototype.register).includes(JwtAuthGuard));
});

test('gallery public detail excludes inactive entries', async () => {
  const gallery = new GaleriaService({ findOne: async ({ where }: any) => {
    assert.deepEqual(where, { id: 2, activo: true });
    return null;
  } } as any);
  await assert.rejects(() => gallery.findOne(2, true), NotFoundException);
});

test('catalog stats return database counts, including zero', async () => {
  const api = service({ count: async (options: any) => options?.where?.estado === 'publicado' ? 2 : options ? 0 : 2 });
  const stats = await api.stats();
  assert.deepEqual(stats.cursos, { total: 2, publicados: 2, borradores: 0, archivados: 0 });
});