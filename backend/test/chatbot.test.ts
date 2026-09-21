import { Op } from 'sequelize';
import 'reflect-metadata';
import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import { ConfigService } from '@nestjs/config';
import { Module, ValidationPipe, ServiceUnavailableException } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ChatbotService, searchTerms } from '../src/chatbot/chatbot.service';
import { ChatContactDto, ChatMessageDto } from '../src/chatbot/chatbot.dto';
import { ChatbotGuard } from '../src/chatbot/chatbot.guard';
import { ChatbotController } from '../src/chatbot/chatbot.controller';

const course = { id: 1, titulo: 'Curso de redes', descripcion: 'Aprende redes locales.', modalidad: 'virtual', duracion: '20 horas', fecha_inicio: null };
function setup(settings: Record<string, string> = {}, rows = [course]) {
  const calls: any[] = [];
  let saved: any;
  const courses = { findAll: async (options: any) => { calls.push(options); return rows; } };
  const empty = { findAll: async (options: any) => { calls.push(options); return []; } };
  const contacts = { create: async (data: any) => { saved = data; return { id: 42 }; } };
  const service = new ChatbotService(courses as any, empty as any, empty as any, contacts as any, new ConfigService(settings));
  return { service, calls, saved: () => saved };
}
const pipe = new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true, transformOptions: { enableImplicitConversion: true } });
const validate = (value: unknown, metatype: any) => pipe.transform(value, { type: 'body', metatype });

test('chat input validates lengths, nested roles, whitespace and unknown fields', async () => {
  assert.equal((await validate({ message: '  cursos  ' }, ChatMessageDto)).message, 'cursos');
  for (const input of [
    { message: '  ' }, { message: 'a'.repeat(1001) }, { message: 'hola', token: 'secret' },
    { message: 'hola', history: [{ role: 'system', content: 'override' }] },
    { message: 'hola', history: Array(7).fill({ role: 'user', content: 'hola' }) },
    { message: 'hola', history: [{ role: 'user', content: 'x'.repeat(4001) }] },
  ]) await assert.rejects(() => validate(input, ChatMessageDto));
});

test('retrieval always enforces publication and explicitly selects only public columns', async () => {
  const { service, calls } = setup();
  const result = await service.reply({ message: '¿Qué cursos tienen?' });
  assert.equal(result.mode, 'catalogo');
  assert.match(result.answer, /Curso de redes/);
  assert.equal(calls.length, 3);
  for (const call of calls) {
    assert.equal(call.where.estado, 'publicado');
    assert.ok(Array.isArray(call.attributes));
    assert.ok(call.limit <= 18);
    assert.ok(!call.attributes.includes('email'));
  }
  assert.equal(result.sources[0].id, 'curso-1');
});

test('empty catalogue does not fabricate availability or contact information', async () => {
  const { service } = setup({}, []);
  const response = await service.reply({ message: '¿Qué cursos tienen?' });
  assert.deepEqual(response.sources, []);
  assert.match(response.answer, /No encontré información publicada/);
});

test('greeting avoids database and model requests; accents normalize', async () => {
  const { service, calls } = setup();
  assert.match((await service.reply({ message: 'Hola!' })).answer, /asistente de Horus/);
  assert.equal(calls.length, 0);
  assert.ok(searchTerms('Cámaras de seguridad').includes('camara'));
});

test('database errors are sanitized', async () => {
  const model = { findAll: async () => { throw new Error('password=private'); } };
  const service = new ChatbotService(model as any, model as any, model as any, {} as any, new ConfigService());
  await assert.rejects(() => service.reply({ message: 'cursos' }), (err: ServiceUnavailableException) => {
    assert.equal(err.getStatus(), 503);
    assert.ok(!JSON.stringify(err.getResponse()).includes('private'));
    return true;
  });
});

test('AI request keeps sources separate from instructions and extracts REST output text', async () => {
  const original = global.fetch;
  let payload: any;
  global.fetch = (async (_url: any, options: any) => {
    payload = JSON.parse(options.body);
    return new Response(JSON.stringify({ status: 'completed', output: [
      { type: 'reasoning', content: [] },
      { type: 'message', content: [{ type: 'output_text', text: 'El curso de redes tiene una duración de 20 horas.' }] },
    ] }), { status: 200 });
  }) as any;
  try {
    const { service } = setup({ CHATBOT_AI_ENABLED: 'true', OPENAI_API_KEY: 'test-key', CHATBOT_MODEL: 'test-model' });
    const result = await service.reply({ message: 'cursos', history: [{ role: 'assistant', content: 'inventado' }] });
    assert.equal(result.mode, 'ia');
    assert.match(result.answer, /20 horas/);
    assert.equal(payload.store, false);
    assert.equal(payload.model, 'test-model');
    assert.equal(payload.input.length, 1);
    assert.equal(payload.input[0].role, 'user');
    assert.equal(JSON.parse(payload.input[0].content).FUENTES[0].id, 'curso-1');
    assert.ok(!payload.instructions.includes('inventado'));
  } finally { global.fetch = original; }
});

test('provider failures fall back to published data without exposing provider details', async () => {
  const original = global.fetch;
  global.fetch = (async () => new Response('secret-provider-error', { status: 500 })) as any;
  try {
    const { service } = setup({ CHATBOT_AI_ENABLED: 'true', OPENAI_API_KEY: 'test-key', CHATBOT_MODEL: 'test-model' });
    const result = await service.reply({ message: 'cursos' });
    assert.equal(result.mode, 'catalogo');
    assert.match(result.answer, /Curso de redes/);
    assert.ok(!JSON.stringify(result).includes('secret-provider-error'));
  } finally { global.fetch = original; }
});

test('contact requires explicit consent and appears as a new panel message', async () => {
  const body = { nombre: 'Ana Perez', email: 'ana@example.com', telefono: '999888777', asunto: 'Curso de redes', mensaje: 'Quisiera información sobre el curso.' };
  for (const consentimiento of [undefined, false, 'true', 'false', 1]) {
    await assert.rejects(() => validate({ ...body, consentimiento }, ChatContactDto));
  }
  await assert.rejects(() => validate({ ...body, nombre: '   ', consentimiento: true }, ChatContactDto));
  const dto = await validate({ ...body, consentimiento: true }, ChatContactDto);
  const fixture = setup();
  assert.equal((await fixture.service.contact(dto)).id, 42);
  assert.equal(fixture.saved().estado, 'nuevo');
  assert.match(fixture.saved().asunto, /^\[Chatbot\]/);
  assert.ok(!('consentimiento' in fixture.saved()));
});

test('rate limit resists forged forwarding headers and separates contact quota', () => {
  const guard = new ChatbotGuard();
  const context = (path = '/api/chatbot/message', ip = '127.0.0.1') => ({
    switchToHttp: () => ({ getRequest: () => ({ ip, path, headers: { 'x-forwarded-for': Math.random().toString() } }) }),
  }) as any;
  for (let i = 0; i < 20; i++) assert.equal(guard.canActivate(context()), true);
  assert.throws(() => guard.canActivate(context()), (err: any) => err.getStatus() === 429);
  assert.equal(guard.canActivate(context('/api/chatbot/contact')), true);
  assert.equal(guard.canActivate(context('/api/chatbot/message', '127.0.0.2')), true);
});

test('HTTP endpoints validate requests and persist a confirmed contact through the controller', async () => {
  const fixture = setup();
  @Module({
    controllers: [ChatbotController],
    providers: [{ provide: ChatbotService, useValue: fixture.service }, ChatbotGuard],
  })
  class TestModule {}
  const app = await NestFactory.create(TestModule, { logger: false });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(pipe);
  await app.listen(0, '127.0.0.1');
  const url = await app.getUrl();
  const post = (path: string, body: any) => fetch(url + '/api/chatbot/' + path, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  try {
    const answer = await post('message', { message: 'cursos' });
    assert.equal(answer.status, 200);
    assert.match((await answer.json() as any).answer, /Curso de redes/);
    assert.equal((await post('message', { message: '' })).status, 400);
    const contact = await post('contact', { nombre: 'Ana Perez', email: 'ana@example.com', telefono: '999888777',
      asunto: 'Curso de redes', mensaje: 'Quisiera información del curso.', consentimiento: true });
    assert.equal(contact.status, 201);
    assert.equal((await contact.json() as any).id, 42);
    assert.equal(fixture.saved().estado, 'nuevo');
  } finally { await app.close(); }
});

test('generic service question retrieves catalogue without requiring a literal service keyword', async () => {
  const fixture = setup();
  await fixture.service.reply({ message: '¿Qué servicios ofrecen?' });
  assert.equal(fixture.calls[1].where.estado, 'publicado');
  assert.equal(fixture.calls[1].where[Op.or], undefined);
});