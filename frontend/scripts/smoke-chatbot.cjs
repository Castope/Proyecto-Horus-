// Chatbot y conversión (Fase F) con API simulada: nada real (ni datos, ni sesiones, ni correo, ni IA). Edge por DevTools.
// Widget público: «Solicitar cotización» (Contacto con origen chatbot, sin doble envío ni reintento). Panel: vista de solo lectura de preguntas sin respuesta.
const { start, sleep, TOKEN } = require('./smoke-kit.cjs');

const sim = { contact: 'ok', list: 'ok' };
const contacts = [];
const all = Array.from({ length: 25 }, (_, i) => ({ id: 25 - i, pregunta: 'Pregunta sin respuesta número ' + (25 - i), veces: 25 - i, createdAt: '2026-05-01T10:00:00.000Z', updatedAt: '2026-05-' + String(25 - i).padStart(2, '0') + 'T10:00:00.000Z' }));
const metrics = { dias: 30, interacciones: 40, resueltas: 31, sinRespuesta: 9, conIa: 12, conCatalogo: 28 };
const requests = [];

const handler = async (req, res, { route, url, json, body }) => {
  if (route.startsWith('/__s/')) { const [, , key, value] = route.split('/'); if (key === 'clear') { contacts.length = 0; requests.length = 0; sim.contact = 'ok'; sim.list = 'ok'; } else sim[key] = value; return json({ ok: true }) || true; }
  if (route === '/__state') return json({ contacts, requests }) || true;
  if (!route.startsWith('/api/')) return false;
  if (req.method !== 'GET') requests.push(req.method + ' ' + route);
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (route === '/api/settings') return json({ ok: true, settings: {} }) || true;
  if (route === '/api/chatbot/contact' && req.method === 'POST') { const data = await body(); contacts.push(data);
    return (sim.contact === 'error' ? json({ message: 'Internal server error ER_SECRET' }, 500) : json({ ok: true, id: 70 + contacts.length })) || true; }
  if (route === '/api/admin/me') return (token === TOKEN ? json({ ok: true, user: { id: 1, nombre: 'Ana Administradora', email: 'ana@example.test' } }) : json({}, 401)) || true;
  if (route === '/api/admin/chatbot/sin-respuesta') {
    if (token !== TOKEN) return json({ message: 'Unauthorized' }, 401) || true;
    if (sim.list === 'error') return json({ message: 'Internal server error ER_SECRET' }, 500) || true;
    if (sim.list === 'malformed') return json({ ok: true, items: 'no es una lista' }) || true;
    const search = (url.searchParams.get('search') || '').toLowerCase(), page = Number(url.searchParams.get('page') || 1), limit = Number(url.searchParams.get('limit') || 20);
    const rows = all.filter(r => !search || r.pregunta.toLowerCase().includes(search));
    if (sim.list === 'empty') return json({ ok: true, items: [], pagination: { total: 0, page: 1, limit, pages: 0 }, metrics: { ...metrics, interacciones: 0, resueltas: 0, sinRespuesta: 0, conIa: 0, conCatalogo: 0 } }) || true;
    return json({ ok: true, items: rows.slice((page - 1) * limit, page * limit), pagination: { total: rows.length, page, limit, pages: Math.ceil(rows.length / limit) }, metrics }) || true;
  }
  return json({ ok: true, items: [], pagination: { page: 1, total: 0, pages: 1 }, metrics: {} }) || true;
};

(async () => {
  const k = await start({ prefix: 'chatbot', handler });
  const { ck, session, open } = k;
  const ctl = (key, value = '1') => fetch(k.origin + '/__s/' + key + '/' + value);
  const state = () => fetch(k.origin + '/__state').then(r => r.json());
  const clean = async () => { await ctl('clear'); await k.closePages(); };
  const openChat = async p => { await p.go('/quienes-somos', 'document.querySelector(".hc-launcher")'); await p.click('.hc-launcher', ''); await p.wait('document.querySelector("dialog.hc-dialog[open] .hc-handoff")', 'chat abierto'); };
  const fillContact = async (p, phone = '987654321') => { await p.type('.hc-contact input', 0, 'Ana Prueba'); await p.type('.hc-contact input', 1, 'ana@example.test'); await p.type('.hc-contact input', 2, phone); await p.type('.hc-contact textarea', 0, 'Necesito cotizar cámaras'); await p.click('.hc-contact input[type=checkbox]', ''); };
  const submitContact = p => p.evaluate('document.querySelector(".hc-contact form").requestSubmit(); 1');

  console.log('\n== WIDGET PÚBLICO: SOLICITAR COTIZACIÓN');
  await clean();
  { const p = await open(1280); await openChat(p);
    ck(await p.evaluate('[...document.querySelectorAll(".hc-handoff")].map(b => b.textContent.trim()).join("|")') === 'Solicitar cotización|Solicitar atención del equipo', 'el chat ofrece «Solicitar cotización» además de «Solicitar atención del equipo»');
    await p.click('.hc-handoff', 'Solicitar cotización'); await p.wait('document.querySelector(".hc-contact form")', 'formulario');
    ck(/Solicita tu cotización/.test(await p.text('.hc-contact')) && /no es una compra ni una reserva/i.test(await p.text('.hc-contact')), 'el formulario se presenta como solicitud de cotización, aclarando que no es una compra ni una reserva');
    ck(await p.evaluate('document.querySelectorAll(".hc-contact input")[3].value') === 'Solicitud de cotización', 'el asunto se precarga');
    ck(await p.evaluate('document.querySelectorAll(".hc-contact input")[0].minLength') <= 0 && await p.evaluate('document.querySelectorAll(".hc-contact input")[2].minLength') <= 0, 'sin longitudes mínimas inventadas en los campos');
    await fillContact(p, 'abc'); await submitContact(p); await sleep(300);
    ck((await state()).contacts.length === 0 && await p.evaluate('!document.querySelector(".hc-contact input[type=tel]").validity.valid'), 'un teléfono con formato inválido no se envía (validación de formato)');
    await p.type('.hc-contact input', 2, '1'); await ctl('contact', 'error'); await submitContact(p); await p.wait('document.querySelector(".hc-error")', 'error de envío');
    const err = await p.text('.hc-error');
    ck(!/ER_SECRET|Internal/.test(err) && (await p.evaluate('document.querySelectorAll(".hc-contact input")[0].value')) === 'Ana Prueba' && (await state()).contacts.length === 1, 'un 500 muestra un mensaje seguro, conserva los datos y no reintenta solo', err);
    await ctl('contact', 'ok'); await p.evaluate('const f = document.querySelector(".hc-contact form"); f.requestSubmit(); f.requestSubmit(); 1'); await p.wait('document.querySelector(".hc-success")', 'éxito'); await sleep(300);
    const s = await state();
    ck(/Solicitud de cotización #\d+ registrada/.test(await p.text('.hc-success')) && s.contacts.length === 2, 'el éxito se anuncia solo tras la respuesta y el doble envío produce un único POST', s.contacts.length);
    ck(s.contacts[1].tipo === 'cotizacion' && s.contacts[1].consentimiento === true && s.contacts[1].asunto === 'Solicitud de cotización', 'el POST declara tipo cotizacion y el consentimiento', s.contacts[1]); await p.close(); }
  await clean();
  { const p = await open(1280); await openChat(p); await p.click('.hc-handoff', 'Solicitar atención del equipo'); await p.wait('document.querySelector(".hc-contact form")', 'formulario');
    ck(/Hablemos de lo que necesitas/.test(await p.text('.hc-contact')), 'la solicitud de atención normal conserva su texto');
    await fillContact(p); await submitContact(p); await p.wait('document.querySelector(".hc-success")', 'éxito');
    const s = await state(); ck(s.contacts.length === 1 && s.contacts[0].tipo === 'contacto', 'la atención normal se envía con tipo contacto'); await p.close(); }

  console.log('\n== PANEL: CONSULTAS DEL CHATBOT (SOLO LECTURA)');
  await clean();
  { const p = await session('/admin/dashboard?section=chatbot'); await p.wait('document.querySelector(".hp-table tbody tr")', 'tabla');
    const values = await p.evaluate('[...document.querySelectorAll(".hw-insights article strong")].map(x => x.textContent)');
    ck(values.join() === '40,31,9,12', 'las métricas muestran los valores reales de la API', values);
    ck(await p.evaluate('document.querySelectorAll(".hp-table tbody tr").length === 20') && /25 preguntas distintas/.test(await p.text('.hp-card-heading')), 'se listan 20 de 25 preguntas, paginadas');
    ck(await p.evaluate('document.title.includes("Consultas del chatbot") && [...document.querySelectorAll("aside .hp-nav-item")].some(b => b.textContent.includes("Consultas del chatbot"))'), 'la sección tiene entrada de menú y título');
    const buttons = await p.evaluate('[...document.querySelectorAll("main button")].map(b => b.textContent.trim()).filter(Boolean)');
    ck(buttons.every(t => /^(Actualizar|Buscar|Anterior|Siguiente)$/.test(t)) && !(await p.evaluate('!!document.querySelector("main input:not([type=search])")')), 'solo lectura: sin botones de crear, editar ni eliminar y sin formularios de datos', buttons);
    await p.click('main .hp-pagination button', 'Siguiente'); await p.wait('document.querySelectorAll(".hp-table tbody tr").length === 5', 'página 2');
    ck(/Página 2 de 2/.test(await p.text('.hp-pagination')), 'la paginación funciona');
    await p.type('input[aria-label="Buscar preguntas"]', 0, 'número 7'); await p.evaluate('document.querySelector("main form.hp-toolbar").requestSubmit(); 1'); await p.wait('document.querySelectorAll(".hp-table tbody tr").length === 1', 'búsqueda');
    ck((await state()).requests.length === 0, 'la vista no envía ninguna escritura'); await p.close(); }
  await clean();
  { await ctl('list', 'error'); const p = await session('/admin/dashboard?section=chatbot'); await p.wait('document.querySelector(".hp-error[role=alert]")', 'error');
    const text = await p.text('main'); const values = await p.evaluate('[...document.querySelectorAll(".hw-insights article strong")].map(x => x.textContent)');
    ck(!/ER_SECRET|Internal/.test(text) && values.every(v => v === '—') && !/Todavía no hay preguntas/.test(text), 'un 500 muestra un aviso seguro, métricas «—» y no un falso «sin preguntas»', text.slice(0, 160));
    await ctl('list', 'ok'); await p.click('main .hp-empty button', 'Reintentar'); await p.wait('document.querySelector(".hp-table tbody tr")', 'recuperación'); ck(true, 'Reintentar recupera la lista'); await p.close(); }
  await clean();
  { await ctl('list', 'malformed'); const p = await session('/admin/dashboard?section=chatbot'); await p.wait('document.querySelector(".hp-error[role=alert]")', 'error');
    ck(/formato inesperado/.test(await p.text('main')) && !(await p.evaluate('!!document.querySelector(".hp-table")')) && !/No pudimos abrir esta página/.test(await p.text()), 'una respuesta con forma inesperada es un error de carga, no una lista vacía ni una página rota'); await p.close(); }
  await clean();
  { await ctl('list', 'empty'); const p = await session('/admin/dashboard?section=chatbot'); await p.wait('document.querySelector(".hp-empty h3")', 'vacío');
    ck(/Todavía no hay preguntas sin respuesta/.test(await p.text('main')) && (await p.evaluate('[...document.querySelectorAll(".hw-insights article strong")].map(x => x.textContent)')).join() === '0,0,0,0', 'el estado vacío real muestra ceros reales y un mensaje claro'); await p.close(); }

  k.finish('Chatbot y consultas sin respuesta (Fase F)');
})().catch(error => { console.error(error); process.exit(1); });
