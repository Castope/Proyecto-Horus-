// Revisión de Home con fixtures HTTP y Edge; no usa MySQL, SMTP ni cuentas reales.
const http = require('node:http')
const fs = require('node:fs')
const path = require('node:path')
const os = require('node:os')
const assert = require('node:assert/strict')
const { spawn } = require('node:child_process')

const root = path.resolve(__dirname, '../dist')
const browser = process.env.SMOKE_BROWSER || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
const screenshots = process.env.SMOKE_SCREENSHOTS
const settings = {
  empresa_nombre: 'Empresa de prueba', ruc: '00000000000',
  direccion: 'Dirección de prueba 123', telefono_principal: '+51 900 000 001',
  horario_atencion: 'Lunes a viernes: 09:00–13:00\n15:00–18:00',
  whatsapp: '51900000001', email_contacto: 'contacto@example.com', facebook_url: 'https://example.com/facebook',
}

const fixturePng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jQxQAAAAASUVORK5CYII=', 'base64')
const convenioFixtures = Array.from({ length: 5 }, (_, i) => ({
  id: i + 1, nombre: 'Entidad de prueba ' + (i + 1), sigla: 'TEST ' + (i + 1),
  descripcion_corta: 'Descripción corta de la entidad de prueba ' + (i + 1),
  descripcion_completa: i === 1 ? 'Descripción completa de prueba.\n' + 'Información extensa '.repeat(100) : '',
  informacion_adicional: i === 1 ? 'Información adicional de prueba.' : '', orden: i, visible: true,
  logo_url: i === 0 ? null : i === 1 ? '/fixture-broken.png' : '/fixture-photo.png',
  fotos: i >= 2 ? Array.from({ length: i === 2 ? 1 : 2 }, (_, j) => ({
    id: i * 10 + j, convenio_id: i + 1, imagen_url: '/fixture-photo.png?photo=' + i + '-' + j, orden: j, createdAt: '2026-10-02T00:00:00Z',
  })) : [],
}))
let convenioSequence = 100, photoSequence = 1000, uploadCount = 0, conveniosFailure = false, convenioDetailFailure = false
const convenioRequests = []

const courseRequests = []
let settingsRequests = 0, settingsSaves = 0, chatRequests = 0, settingsFailure = false
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost'), route = url.pathname
    const json = (data, status = 200) => {
      res.writeHead(status, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(data))
    }

    if (route === '/fixture-photo.png' || route.startsWith('/api/uploads/')) {
      res.writeHead(200, { 'Content-Type': 'image/png' }); return res.end(fixturePng)
    }
    if (route === '/fixture-broken.png') { res.writeHead(404); return res.end() }
    if (route === '/api/admin/uploads') {
      for await (const chunk of req) void chunk
      uploadCount++
      await new Promise(resolve => setTimeout(resolve, 150))
      return json({ ok: true, path: '/uploads/00000000-0000-0000-0000-' + String(uploadCount).padStart(12, '0') + '.png' })
    }
    if (/^\/api\/(?:admin\/)?convenios(?:\/|$)/.test(route)) {
      const adminRoute = route.startsWith('/api/admin/')
      if (adminRoute && !req.headers.authorization) return json({ message: 'Sin sesión' }, 401)
      const segments = route.replace(/^\/api\/(?:admin\/)?convenios\/?/, '').split('/').filter(Boolean)
      const id = segments.length ? Number(segments[0]) : null
      const item = convenioFixtures.find(row => row.id === id && (adminRoute || row.visible))
      if (req.method === 'GET') {
        convenioRequests.push(route + url.search)
        if (!adminRoute && ((id === null && conveniosFailure) || (id !== null && convenioDetailFailure))) return json({ message: 'Fallo aislado de convenios' }, 503)
        if (id !== null) return item ? json({ ok: true, item: { ...item, fotos: [...item.fotos].sort((a, b) => a.orden - b.orden || a.id - b.id) } }) : json({ message: 'Convenio no encontrado.' }, 404)
        const search = (url.searchParams.get('search') || '').toLowerCase(), estado = url.searchParams.get('estado')
        const all = convenioFixtures.filter(row => (adminRoute || row.visible) && (!adminRoute || !estado || row.visible === (estado === 'visible')) && row.nombre.toLowerCase().includes(search))
          .sort((a, b) => a.orden - b.orden || a.id - b.id)
        const page = Number(url.searchParams.get('page') || 1), limit = Number(url.searchParams.get('limit') || 20)
        return json({ ok: true, items: all.slice((page - 1) * limit, page * limit), pagination: { page, limit, total: all.length, pages: Math.ceil(all.length / limit) } })
      }
      let raw = ''; for await (const chunk of req) raw += chunk
      const body = raw ? JSON.parse(raw) : {}
      if (!adminRoute) return json({ message: 'No permitido' }, 405)
      if (id === null && req.method === 'POST') {
        const created = { id: ++convenioSequence, ...body, fotos: [] }; convenioFixtures.push(created)
        return json({ ok: true, item: created }, 201)
      }
      if (!item) return json({ message: 'Convenio no encontrado.' }, 404)
      if (segments[1] === 'fotos') {
        if (segments[2] === 'orden') { for (const foto of body.fotos) Object.assign(item.fotos.find(f => f.id === foto.id), { orden: foto.orden }); return json({ ok: true }) }
        if (req.method === 'POST') { const foto = { id: ++photoSequence, convenio_id: id, ...body, createdAt: '2026-10-02T00:00:00Z' }; item.fotos.push(foto); return json({ ok: true, item: foto }, 201) }
        const photoId = Number(segments[2])
        if (req.method === 'DELETE') { item.fotos = item.fotos.filter(f => f.id !== photoId); return json({ ok: true }) }
        Object.assign(item.fotos.find(f => f.id === photoId), body); return json({ ok: true })
      }
      if (req.method === 'DELETE') { convenioFixtures.splice(convenioFixtures.indexOf(item), 1); return json({ ok: true }) }
      Object.assign(item, body); return json({ ok: true, item })
    }
    if (route === '/api/settings') {
      settingsRequests++
      return settingsFailure ? json({ message: 'Fallo aislado de prueba' }, 503) : json({ ok: true, settings })
    }
    if (route === '/api/admin/me') return json({ ok: true, user: { id: 1, nombre: 'Administrador de prueba', email: 'admin@example.com' } })
    if (route === '/api/admin/settings') {
      if (req.method === 'PUT') {
        let body = ''
        for await (const chunk of req) body += chunk
        Object.assign(settings, JSON.parse(body).ajustes)
        settingsSaves++
        return json({ ok: true, mensaje: 'Ajustes guardados correctamente.' })
      }
      return json({ ok: true, settings: Object.entries(settings).map(([clave, valor]) => ({ clave, valor, descripcion: clave, grupo: 'general' })) })
    }
    if (route === '/api/chatbot/message') {
      chatRequests++
      return json({ ok: true, answer: 'Respuesta de prueba del asistente.', sources: [], mode: 'catalogo' })
    }
    if (route === '/api/cursos') {
      const tipo = url.searchParams.get('tipo'), page = Number(url.searchParams.get('page') || 1)
      courseRequests.push(url.search)
      const title = (tipo === 'capacitacion' ? 'Capacitacion' : 'Curso') + ' de prueba pagina ' + page
      return json({ ok: true, items: [{ id: (tipo === 'capacitacion' ? 200 : 100) + page,
        titulo: title, descripcion: 'Contenido aislado de prueba.', tipo: tipo || 'curso',
        modalidad: 'presencial', duracion: '12 horas', fecha_inicio: null, imagen_url: null, temario: null,
      }], pagination: { page, limit: 12, total: 13, pages: 2 } })
    }
    if (route.startsWith('/api/')) return json({ ok: true, items: [], pagination: { page: 1, limit: 12, total: 0, pages: 0 } })
    let filename = path.resolve(root, '.' + decodeURIComponent(route))
    if (!filename.startsWith(root + path.sep) || !fs.existsSync(filename) || fs.statSync(filename).isDirectory()) filename = path.join(root, 'index.html')
    const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp' }
    res.writeHead(200, { 'Content-Type': types[path.extname(filename)] || 'application/octet-stream' })
    res.end(fs.readFileSync(filename))
  } catch { res.writeHead(500); res.end('Fixture failure') }
})
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
async function main() {
  assert.ok(fs.existsSync(browser), 'Configura SMOKE_BROWSER con Edge/Chromium.')
  assert.ok(fs.existsSync(path.join(root, 'index.html')), 'Compila frontend antes de la revisión.')
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  const origin = 'http://127.0.0.1:' + server.address().port
  const reserve = http.createServer()
  await new Promise(resolve => reserve.listen(0, '127.0.0.1', resolve))
  const port = reserve.address().port
  await new Promise(resolve => reserve.close(resolve))
  const tempRoot = fs.realpathSync(os.tmpdir())
  const profile = fs.mkdtempSync(path.join(tempRoot, 'horus-home-ui-'))
  let child, connection
  function connect(socketUrl) {
    const socket = new WebSocket(socketUrl), pending = new Map()
    const exceptions = []
    let sequence = 0
    socket.onmessage = event => {
      const message = JSON.parse(event.data)
      if (message.method === 'Runtime.exceptionThrown') exceptions.push(message.params.exceptionDetails.text)
      if (message.id) {
        const request = pending.get(message.id)
        pending.delete(message.id)
        message.error ? request?.reject(new Error(message.error.message)) : request?.resolve(message.result)
      }
    }
    const ready = new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject })
    const send = (method, params = {}) => new Promise((resolve, reject) => {
      const id = ++sequence
      pending.set(id, { resolve, reject })
      socket.send(JSON.stringify({ id, method, params }))
    })
    const evaluate = async expression => {
      const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
      if (result.exceptionDetails) throw new Error(result.exceptionDetails.text + ': ' + expression)
      return result.result.value
    }
    const wait = async expression => {
      for (let attempt = 0; attempt < 100; attempt++) {
        if (await evaluate(expression)) return
        await sleep(100)
      }
      throw new Error('No se cumplió: ' + expression)
    }
    return { socket, ready, send, evaluate, wait, exceptions }
  }
  try {
    child = spawn(browser, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
      '--remote-debugging-port=' + port, '--user-data-dir=' + profile, 'about:blank'], { windowsHide: true, stdio: 'ignore' })
    let target
    for (let attempt = 0; attempt < 100 && !target; attempt++) {
      await sleep(100)
      try { target = await fetch('http://127.0.0.1:' + port + '/json/new?about:blank', { method: 'PUT' }).then(response => response.json()) } catch {}
    }
    assert.ok(target?.webSocketDebuggerUrl, 'No se pudo iniciar el navegador.')
    connection = connect(target.webSocketDebuggerUrl)
    await connection.ready
    const { send, evaluate, wait } = connection
    await send('Page.enable')
    await send('Runtime.enable')
    await send('Page.addScriptToEvaluateOnNewDocument', { source: "window.__homeWelcomeReview = { appearances: 0, start: null, end: null, duration: null }\nlet welcomeVisible = false\nnew MutationObserver(() => {\n  const element = document.querySelector('.home-welcome')\n  const record = window.__homeWelcomeReview\n  if (element && !welcomeVisible) {\n    record.appearances++\n    record.start = performance.now()\n    const style = getComputedStyle(element)\n    record.pointerEvents = style.pointerEvents\n    record.animation = style.animationName\n    record.bodyOverflow = document.body.style.overflow\n    record.greeting = element.textContent\n    record.bounds = { width: element.getBoundingClientRect().width, viewport: innerWidth }\n    welcomeVisible = true\n  } else if (!element && welcomeVisible) {\n    record.end = performance.now()\n    record.duration = record.end - record.start\n    welcomeVisible = false\n  }\n}).observe(document, { childList: true, subtree: true })\n" })
    const navigate = async route => {
      await send('Page.navigate', { url: origin + route })
      await wait('document.readyState === "complete"')
      await sleep(250)
    }
    const viewport = (width, height = 1000) => send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 768 })
    const key = key => send('Input.dispatchKeyEvent', { type: 'keyDown', key, code: key, windowsVirtualKeyCode: key === 'Escape' ? 27 : 9, nativeVirtualKeyCode: key === 'Escape' ? 27 : 9 })
    const capture = async (name, selector) => {
      if (!screenshots) return
      await evaluate('document.querySelector(' + JSON.stringify(selector) + ').scrollIntoView({block:"start",behavior:"instant"})')
      await sleep(450)
      const result = await send('Page.captureScreenshot', { format: 'png' })
      fs.mkdirSync(screenshots, { recursive: true })
      fs.writeFileSync(path.join(screenshots, name + '.png'), Buffer.from(result.data, 'base64'))
    }
    await viewport(1440)
    await navigate('/')
    await wait('typeof window.__homeWelcomeReview?.end === "number"')
    const welcome = await evaluate('window.__homeWelcomeReview')
    assert.equal(welcome.appearances, 1, 'Una bienvenida al abrir Home inicialmente.')
    assert.ok(welcome.duration >= 300 && welcome.duration < 1500, 'La bienvenida debe ser breve: ' + welcome.duration)
    assert.equal(welcome.pointerEvents, 'none', 'La bienvenida no intercepta la interacción.')
    assert.equal(welcome.bodyOverflow, '', 'La bienvenida no bloquea scroll.')
    assert.equal(welcome.greeting.includes('Te da la bienvenida'), true)
    assert.equal(welcome.bounds.width <= welcome.bounds.viewport, true)
    console.log('Home: bienvenida inicial breve, sin bloquear interacción ni scroll: OK.')
    await wait('document.querySelector(".home-loc-items").textContent.includes("Dirección de prueba 123")')
    await wait('document.querySelector(".home-slide.is-active img").naturalWidth > 0')
    assert.equal(settingsRequests, 1, 'Home debe reutilizar la petición de CompanySettingsProvider.')
    await wait('document.querySelectorAll(".home-conv-card").length === 5')
    assert.equal(await evaluate('document.querySelectorAll(".home-conv-card").length'), 5)
    assert.equal(await evaluate('document.querySelectorAll(".home-metric").length'), 4)
    assert.equal(await evaluate('document.querySelectorAll(".home-highlight").length'), 4)
    assert.equal(await evaluate('document.querySelectorAll(".home-svc-card").length'), 2)
    assert.equal(await evaluate('getComputedStyle(document.querySelector(".nav")).backgroundColor'), 'rgb(10, 37, 64)')
    assert.equal(await evaluate('getComputedStyle(document.querySelector("#home-title")).fontFamily.includes("Manrope")'), true)
    const services = await evaluate('Array.from(document.querySelectorAll(".home-svc-links a"), link => link.getAttribute("href"))')
    assert.deepEqual(services, ['/tecnologias/cableado-estructurado', '/tecnologias/camaras-seguridad', '/tecnologias/soporte-mantenimiento', '/educacion/asesoramiento', '/educacion/capacitaciones', '/educacion/cursos'])
    assert.equal(await evaluate('(()=>{const text=document.querySelector(".home-hero-copy").getBoundingClientRect(),image=document.querySelector(".home-slides").getBoundingClientRect();return text.right<=image.left+1})()'), true, 'El texto no debe tapar la fotografía.')
    await evaluate('document.querySelector(".home-carousel-pause").click()')
    await evaluate('document.querySelector("[aria-label=\\"Imagen siguiente\\"]").click()')
    assert.equal(await evaluate('document.querySelector(".home-carousel-dots [aria-pressed=true]").getAttribute("aria-label")'), 'Ver imagen 2')
    await evaluate('document.querySelector("[aria-label=\\"Imagen anterior\\"]").click()')
    assert.equal(await evaluate('document.querySelector(".home-carousel-dots [aria-pressed=true]").getAttribute("aria-label")'), 'Ver imagen 1')
    await capture('home-desktop-hero', '.home-hero')
    await evaluate('document.querySelector(".home-conv-card").focus();document.querySelector(".home-conv-card").click()')
    await wait('!!document.querySelector("#convModal[open]")')
    await key('Escape')
    await wait('!document.querySelector("#convModal")')
    assert.equal(await evaluate('document.activeElement.classList.contains("home-conv-card")'), true)
    await capture('home-desktop-servicios', '.home-services')
    await capture('home-desktop-convenios', '.home-convenios')
    await capture('home-desktop-diferenciales', '.home-highlights')
    await capture('home-desktop-ubicacion', '.home-location')
    await capture('home-desktop-footer', '.footer')
    console.log('Home: contenido conservado, carrusel, diálogo/foco y composición de escritorio: OK.')

    // Una segunda pestaña guarda desde el panel real contra los fixtures aislados.
    await evaluate('localStorage.setItem("horus-admin-token","isolated-home-ui-token")')
    const adminTarget = await fetch('http://127.0.0.1:' + port + '/json/new?' + encodeURIComponent(origin + '/admin/dashboard?section=ajustes'), { method: 'PUT' }).then(response => response.json())
    const admin = connect(adminTarget.webSocketDebuggerUrl)
    await admin.ready
    try {
      await admin.wait('document.querySelectorAll(".hp-settings-card input").length > 0')
      await admin.evaluate('(()=>{for(const [name,value] of Object.entries({direccion:"Dirección actualizada desde el panel",telefono_principal:"+51 900 000 002",horario_atencion:"Martes: 10:00–14:00"})){const input=Array.from(document.querySelectorAll(".hp-settings-card label")).find(label=>label.textContent===name).querySelector("input");Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value").set.call(input,value);input.dispatchEvent(new Event("input",{bubbles:true}));}})()')
      await sleep(100)
      await admin.evaluate('document.querySelector(".hp-settings-card").closest("form").requestSubmit()')
      await admin.wait('document.body.innerText.includes("La información de la empresa se guardó correctamente.")')
      await wait('document.querySelector(".home-loc-items").textContent.includes("Dirección actualizada desde el panel")')
      assert.equal(settingsSaves, 1)
      assert.equal(await evaluate('document.querySelector(".home-loc-items").textContent.includes("Martes: 10:00–14:00")'), true)
      assert.equal(await evaluate('document.querySelector(".home-loc-items").textContent.includes("+51 900 000 002")'), true)
      assert.equal(await evaluate('document.querySelector(".footer").textContent.includes("Dirección actualizada desde el panel")'), true)
      assert.equal(await evaluate('document.querySelector(".footer").textContent.includes("+51 900 000 002")'), true)
    } finally { await admin.send('Page.close').catch(() => {}); admin.socket.close() }
    await send('Page.bringToFront')
    console.log('Home: edición de dirección, teléfono y horario desde otra pestaña del panel reflejada sin recargar: OK.')


    // Convenios: información completa, fotos, teclado y estados de API.
    const openConvenio = async index => {
      await evaluate('(()=>{const b=document.querySelectorAll(".home-conv-card")[' + index + '];b.focus();b.click()})()')
      await wait('!!document.querySelector("#convDesc")')
    }
    await openConvenio(0)
    assert.equal(await evaluate('document.querySelector("#convDesc").textContent.includes("Descripción corta")'), true)
    assert.equal(await evaluate('!!document.querySelector(".home-conv-gallery,.home-conv-additional")'), false)
    assert.equal(await evaluate('document.querySelector("#convModal .home-conv-logo").textContent.includes("Sin imagen")'), true)
    await key('Escape'); await wait('!document.querySelector("#convModal")')
    await openConvenio(1)
    assert.equal(await evaluate('document.querySelector("#convDesc").textContent.includes("Descripción completa")'), true)
    assert.equal(await evaluate('document.querySelector(".home-conv-additional").textContent.includes("Información adicional de prueba")'), true)
    await wait('document.querySelector("#convModal .home-conv-logo").textContent.includes("Sin imagen")')
    await evaluate('document.querySelector("#convClose").click()'); await wait('!document.querySelector("#convModal")')
    await openConvenio(2)
    assert.equal(await evaluate('document.querySelector(".home-conv-photo figcaption").textContent'), 'Fotografía 1 de 1')
    assert.equal(await evaluate('!!document.querySelector(".home-conv-gallery-controls")'), false)
    await key('Escape'); await wait('!document.querySelector("#convModal")')
    await openConvenio(3)
    await evaluate('document.querySelector(".home-conv-gallery").scrollIntoView({block:"center"});document.querySelector(".home-conv-gallery").focus()')
    await wait('document.querySelector(".home-conv-photo img")?.naturalWidth > 0')
    assert.equal(await evaluate('getComputedStyle(document.querySelector(".home-conv-photo img")).objectFit'), 'contain')
    await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'ArrowRight', code: 'ArrowRight', windowsVirtualKeyCode: 39 })
    assert.equal(await evaluate('document.querySelector(".home-conv-photo figcaption").textContent'), 'Fotografía 2 de 2')
    await evaluate('Array.from(document.querySelectorAll("button")).find(b=>b.getAttribute("aria-label")==="Fotografía anterior").click()')
    assert.equal(await evaluate('document.querySelector(".home-conv-photo figcaption").textContent'), 'Fotografía 1 de 2')
    await key('Tab')
    assert.equal(await evaluate('document.querySelector("#convModal").contains(document.activeElement)'), true)
    await key('Escape'); await wait('!document.querySelector("#convModal")')
    convenioDetailFailure = true
    await evaluate('document.querySelector(".home-conv-card").click()')
    await wait('document.querySelector("#convModal [role=alert]")?.textContent.includes("Fallo aislado")')
    assert.equal(await evaluate('!!document.querySelector("#convDesc,.home-conv-gallery")'), false)
    convenioDetailFailure = false
    await evaluate('document.querySelector("#convModal .home-button").click()')
    await wait('!!document.querySelector("#convDesc")')
    await key('Escape'); await wait('!document.querySelector("#convModal")')
    conveniosFailure = true
    await evaluate('window.dispatchEvent(new CustomEvent("horus:content-updated",{detail:"convenios"}))')
    await wait('document.querySelector(".home-conv-notice")?.textContent.includes("Fallo aislado")')
    assert.equal(await evaluate('document.querySelectorAll(".home-conv-card").length'), 0, 'Sin fallback estático')
    conveniosFailure = false
    await evaluate('document.querySelector(".home-conv-notice button").click()')
    await wait('document.querySelectorAll(".home-conv-card").length === 5')
    const fixtureCopy = structuredClone(convenioFixtures)
    for (const row of convenioFixtures) row.visible = false
    await evaluate('window.dispatchEvent(new CustomEvent("horus:content-updated",{detail:"convenios"}))')
    await wait('document.querySelector(".home-conv-notice")?.textContent.includes("No hay convenios visibles")')
    assert.equal(await evaluate('Array.from(document.querySelectorAll(".home-metric")).find(e=>e.textContent.includes("Convenios activos")).querySelector("strong").textContent'), '0')
    convenioFixtures.splice(0, convenioFixtures.length, ...fixtureCopy)
    await evaluate('window.dispatchEvent(new CustomEvent("horus:content-updated",{detail:"convenios"}))')
    await wait('document.querySelectorAll(".home-conv-card").length === 5')
    assert.equal(await evaluate('Array.from(document.querySelectorAll(".home-metric")).find(e=>e.textContent.includes("Convenios activos")).querySelector("strong").textContent'), '5')
    assert.equal(convenioRequests.some(route => /convenios\/\d+\/fotos/.test(route)), false, 'Detalle y fotos en una petición')
    console.log('Convenios: descripción corta/completa, información adicional, 0/1/varias fotos, imagen fallida, teclado, error/reintento, vacío y contador: OK.')

    // CRUD mediante el panel real; los endpoints usan únicamente fixtures en memoria.
    const convenioAdminTarget = await fetch('http://127.0.0.1:' + port + '/json/new?' + encodeURIComponent(origin + '/admin/dashboard?section=convenios'), { method: 'PUT' }).then(response => response.json())
    const convenioAdmin = connect(convenioAdminTarget.webSocketDebuggerUrl)
    await convenioAdmin.ready
    const fillConvenio = async values => {
      await convenioAdmin.evaluate('(()=>{for(const [name,value] of Object.entries(' + JSON.stringify(values) + ')){const input=document.querySelector(".hp-convenio-form [name="+name+"]");const proto=input.tagName==="TEXTAREA"?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(proto,"value").set.call(input,value);input.dispatchEvent(new Event("input",{bubbles:true}));}})()')
      await sleep(50)
    }
    const photoUpload = async count => {
      await convenioAdmin.evaluate('(()=>{const input=document.querySelector(".hp-convenio-photos input[type=file]"),data=new DataTransfer();for(let i=0;i<' + count + ';i++)data.items.add(new File([Uint8Array.from(atob("' + fixturePng.toString('base64') + '"),c=>c.charCodeAt(0))],"test-"+i+".png",{type:"image/png"}));input.files=data.files;input.dispatchEvent(new Event("change",{bubbles:true}));})()')
    }
    try {
      await convenioAdmin.wait('document.querySelectorAll(".hp-convenios tbody tr").length === 5')
      await convenioAdmin.evaluate('Array.from(document.querySelectorAll(".hp-heading button")).find(b=>b.textContent.includes("Nuevo convenio")).click()')
      await convenioAdmin.wait('!!document.querySelector(".hp-convenio-form")')
      await fillConvenio({ nombre: 'Alianza creada en prueba UI', sigla: 'UI', descripcion_corta: 'Descripción de la alianza de prueba', descripcion_completa: 'Información completa editada en el panel', informacion_adicional: 'Información adicional editada', orden: '0' })
      await convenioAdmin.evaluate('document.querySelector(".hp-convenio-form [name=visible]").click();document.querySelector(".hp-convenio-form").requestSubmit()')
      await convenioAdmin.wait('!!document.querySelector(".hp-convenio-photos")')
      await wait('document.querySelectorAll(".home-conv-card").length === 6')
      assert.equal(await evaluate('Array.from(document.querySelectorAll(".home-metric")).find(e=>e.textContent.includes("Convenios activos")).querySelector("strong").textContent'), '6')
      const uploadsBefore = uploadCount
      await photoUpload(2)
      await convenioAdmin.wait('document.querySelectorAll(".hp-convenio-photo-grid li").length === 2 && !document.querySelector(".hp-convenio-form button").disabled')
      assert.equal(uploadCount - uploadsBefore, 2)
      const created = convenioFixtures.find(r => r.nombre === 'Alianza creada en prueba UI')
      assert.ok(created); assert.equal(created.fotos.length, 2)
      const firstPhoto = created.fotos[0].id
      await convenioAdmin.evaluate('Array.from(document.querySelectorAll("button")).find(b=>b.getAttribute("aria-label")==="Mover fotografía 1 después").click()')
      await convenioAdmin.wait('document.querySelector(".hp-convenio-photos [role=status]")?.textContent.includes("Orden")')
      assert.equal([...created.fotos].sort((a,b)=>a.orden-b.orden)[1].id, firstPhoto)
      await convenioAdmin.evaluate('Array.from(document.querySelectorAll("button")).find(b=>b.getAttribute("aria-label")==="Quitar fotografía 1").click()')
      await convenioAdmin.evaluate('Array.from(document.querySelectorAll(".hp-convenio-photo-grid button")).find(b=>b.textContent==="Confirmar retirada").click()')
      await convenioAdmin.wait('document.querySelectorAll(".hp-convenio-photo-grid li").length === 1 && !document.querySelector(".hp-convenio-form button").disabled')
      await fillConvenio({ nombre: 'Alianza editada en prueba UI', orden: '100' })
      await convenioAdmin.evaluate('document.querySelector(".hp-convenio-form").requestSubmit()')
      await convenioAdmin.wait('!document.querySelector(".hp-convenio-form button").disabled && document.querySelector(".hp-convenio-form [role=status]")?.textContent.includes("guardado")')
      await wait('Array.from(document.querySelectorAll(".home-conv-card")).some(e=>e.textContent.includes("Alianza editada en prueba UI"))')
      await convenioAdmin.evaluate('Array.from(document.querySelectorAll(".hp-convenio-form button")).find(b=>b.textContent==="Cerrar").click()')
      await convenioAdmin.wait('!document.querySelector(".hp-dialog")')
      await convenioAdmin.evaluate('Array.from(document.querySelectorAll(".hp-convenios tbody tr")).find(r=>r.textContent.includes("Alianza editada")).querySelectorAll("button")[1].click()')
      await wait('document.querySelectorAll(".home-conv-card").length === 5')
      await convenioAdmin.wait('Array.from(document.querySelectorAll(".hp-convenios tbody tr")).find(r=>r.textContent.includes("Alianza editada")).textContent.includes("Oculto")')
      await convenioAdmin.evaluate('Array.from(document.querySelectorAll(".hp-convenios tbody tr")).find(r=>r.textContent.includes("Alianza editada")).querySelectorAll("button")[1].click()')
      await wait('document.querySelectorAll(".home-conv-card").length === 6')
      await convenioAdmin.wait('!document.querySelector(".hp-convenios tbody tr button").disabled')
      await convenioAdmin.evaluate('Array.from(document.querySelectorAll("button")).find(b=>b.getAttribute("aria-label")==="Eliminar Alianza editada en prueba UI").click()')
      await convenioAdmin.wait('document.querySelector(".hp-dialog")?.textContent.includes("Eliminar convenio")')
      await convenioAdmin.evaluate('Array.from(document.querySelectorAll(".hp-dialog button")).find(b=>b.textContent==="Eliminar convenio").click()')
      await convenioAdmin.wait('!document.querySelector(".hp-dialog")')
      await wait('document.querySelectorAll(".home-conv-card").length === 5')
      assert.equal(convenioFixtures.some(r=>r.id===created.id), false)
      // Verifica que el uploader del logo conserve selección simple.
      await convenioAdmin.evaluate('document.querySelector(".hp-heading button").click()')
      await convenioAdmin.wait('!!document.querySelector(".hp-convenio-form")')
      assert.equal(await convenioAdmin.evaluate('document.querySelector(".hp-convenio-form input[type=file]").multiple'), false)
      await convenioAdmin.evaluate('(()=>{const input=document.querySelector(".hp-convenio-form input[type=file]"),data=new DataTransfer();data.items.add(new File([Uint8Array.from(atob("' + fixturePng.toString('base64') + '"),c=>c.charCodeAt(0))],"logo.png",{type:"image/png"}));input.files=data.files;input.dispatchEvent(new Event("change",{bubbles:true}));})()')
      await convenioAdmin.wait('document.querySelector(".hp-convenio-form [name=logo_url]").value.includes("/api/uploads/") && !document.querySelector(".hp-convenio-form button").disabled')
      await convenioAdmin.evaluate('Array.from(document.querySelectorAll(".hp-convenio-form button")).find(b=>b.textContent==="Cerrar").click()')
      assert.deepEqual(convenioAdmin.exceptions, [])
    } finally { await convenioAdmin.send('Page.close').catch(() => {}); convenioAdmin.socket.close() }
    await send('Page.bringToFront')
    console.log('Convenios panel: crear/editar, logo simple, uploads múltiples, ordenar/retirar fotos, publicar/ocultar, eliminar y actualización de Home entre pestañas: OK.')

    for (const width of [1920, 1280, 1024, 768, 540, 390, 320]) {
      await viewport(width, width < 768 ? 844 : 1000)
      await evaluate('window.scrollTo(0,0)')
      await sleep(250)
      assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth + 1'), true, 'Desbordamiento: ' + width)
      assert.equal(await evaluate('Array.from(document.querySelectorAll(".home-conv-card,.home-metric,.home-svc-card,.home-highlight"),element=>element.getBoundingClientRect()).every(rect=>rect.left>=-1&&rect.right<=innerWidth+1)'), true, 'Tarjetas fuera de pantalla: ' + width)
      assert.equal(await evaluate('Array.from(document.querySelectorAll(".home-page h2"),element=>parseFloat(getComputedStyle(element).fontSize)).every(size=>size>=27.2&&size<=40)'), true, 'Títulos fuera de escala: ' + width)
      assert.equal(await evaluate('parseFloat(getComputedStyle(document.querySelector("#home-title")).fontSize)<=64'), true)
      await evaluate('document.querySelector(".nav-toggle").getAttribute("aria-expanded")==="true"&&document.querySelector(".nav-toggle").click()')
    }
    await viewport(390, 844)
    await evaluate('window.scrollTo(0,0)')
    await capture('home-mobile-hero', '.home-hero')
    await capture('home-mobile-servicios', '.home-services')
    await capture('home-mobile-convenios', '.home-convenios')
    await capture('home-mobile-diferenciales', '.home-highlights')
    await capture('home-mobile-ubicacion', '.home-location')
    await capture('home-mobile-footer', '.footer')
    await evaluate('window.scrollTo(0,0);document.querySelector(".nav-toggle").click()')
    await wait('document.querySelector(".nav-toggle").getAttribute("aria-expanded")==="true"')
    await key('Escape')
    await wait('document.querySelector(".nav-toggle").getAttribute("aria-expanded")==="false"')
    await wait('document.activeElement.classList.contains("nav-toggle")')
    assert.equal(await evaluate('document.activeElement.classList.contains("nav-toggle")'), true)
    await evaluate('document.querySelector(".home-conv-card").click()')
    await wait('!!document.querySelector("#convModal[open]")')
    assert.equal(await evaluate('getComputedStyle(document.querySelector("#convModal")).display'), 'block')
    await capture('home-mobile-convenio-dialog', '#convModal')
    assert.equal(await evaluate('(()=>{const rect=document.querySelector("#convModal").getBoundingClientRect();return rect.left>=0&&rect.right<=innerWidth&&rect.height<=innerHeight})()'), true)
    await evaluate('document.querySelector("#convClose").click()')
    await wait('!document.querySelector("#convModal")')

    await evaluate('document.querySelector(".hc-launcher").focus();document.querySelector(".hc-launcher").click()')
    await wait('!!document.querySelector("#horus-chat[open]")')
    await evaluate('(()=>{const input=document.getElementById("hc-question");Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value").set.call(input,"Consulta de prueba");input.dispatchEvent(new Event("input",{bubbles:true}));})()')
    await sleep(100)
    await evaluate('document.getElementById("hc-question").form.requestSubmit()')
    await wait('document.querySelector(".hc-log").textContent.includes("Respuesta de prueba del asistente.")')
    assert.equal(chatRequests, 1)
    await key('Escape')
    await wait('!document.querySelector("#horus-chat[open]")')
    await wait('document.activeElement.classList.contains("hc-launcher")')
    assert.equal(await evaluate('document.activeElement.classList.contains("hc-launcher")'), true)

    await openConvenio(1)
    assert.equal(await evaluate('(()=>{const d=document.querySelector("#convModal");return d.scrollHeight>d.clientHeight&&d.getBoundingClientRect().height<=innerHeight&&d.scrollWidth<=d.clientWidth})()'), true, 'Texto largo desplazable dentro del diálogo móvil')
    await key('Escape'); await wait('!document.querySelector("#convModal")')
    await openConvenio(3)
    await evaluate('(()=>{const target=document.querySelector(".home-conv-gallery");target.scrollIntoView({block:"center"});const a=new Touch({identifier:1,target,clientX:240,clientY:200}),b=new Touch({identifier:1,target,clientX:100,clientY:205});target.dispatchEvent(new TouchEvent("touchstart",{touches:[a],changedTouches:[a],bubbles:true}));target.dispatchEvent(new TouchEvent("touchend",{touches:[],changedTouches:[b],bubbles:true}));})()')
    assert.equal(await evaluate('document.querySelector(".home-conv-photo figcaption").textContent'), 'Fotografía 2 de 2', 'Swipe móvil')
    await capture('home-mobile-galeria', '#convModal')
    await key('Escape'); await wait('!document.querySelector("#convModal")')
    await evaluate('document.querySelector(".home-conv-card").focus()')
    await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13, text: '\r', unmodifiedText: '\r' })
    await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13 })
    await wait('!!document.querySelector("#convDesc")')
    await key('Escape'); await wait('!document.querySelector("#convModal")')
    assert.equal(await evaluate('document.activeElement.classList.contains("home-conv-card")'), true)

    console.log('Home: tamaños 320–1920 px, menú móvil, diálogo y chatbot conectado a fixtures: OK.')

    await evaluate('document.querySelector(".home-carousel-pause[aria-pressed=true]")?.click()')
    await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
    await wait('!document.querySelector(".home-carousel-pause")')
    await evaluate('document.querySelector(".home-hero-copy a").focus()')
    const imageBefore = await evaluate('document.querySelector(".home-carousel-dots [aria-pressed=true]").getAttribute("aria-label")')
    await sleep(5200)
    assert.equal(await evaluate('document.querySelector(".home-carousel-dots [aria-pressed=true]").getAttribute("aria-label")'), imageBefore)
    assert.equal(await evaluate('getComputedStyle(document.querySelector(".home-slide")).transitionDuration'), '0s')
    assert.equal(await evaluate('getComputedStyle(document.querySelector(".home-highlight")).opacity'), '1')

    await openConvenio(3)
    assert.equal(await evaluate('getComputedStyle(document.querySelector("#convModal")).animationName'), 'none')
    await key('Escape'); await wait('!document.querySelector("#convModal")')

    await send('Emulation.setEmulatedMedia', { features: [] })
    await viewport(1440)
    await evaluate('document.querySelector(".nav-logo").click()')
    await wait('location.pathname === "/"')
    await evaluate('document.querySelector(".nav-links a[href=\\"/quienes-somos\\"]").click()')
    await wait('location.pathname === "/quienes-somos" && !document.querySelector(".home-layout")')
    assert.equal(await evaluate('getComputedStyle(document.querySelector(".nav")).height'), '68px')
    await wait('getComputedStyle(document.querySelector(".nav")).backgroundColor === "rgb(13, 20, 40)"')
    assert.equal(await evaluate('getComputedStyle(document.querySelector(".nav")).backgroundColor'), 'rgb(13, 20, 40)')
    await evaluate('document.querySelector(".nav-logo").click()')
    await wait('!!document.querySelector(".home-layout")')
    assert.equal(await evaluate('getComputedStyle(document.querySelector(".nav")).height'), '78px')
    assert.equal(await evaluate('window.__homeWelcomeReview.appearances'), 1, 'La bienvenida no se repite en navegación interna.')
    await navigate('/educacion/cursos')
    await wait('document.querySelector(".public-course-card")?.textContent.includes("Curso de prueba pagina 1")')
    await evaluate('Array.from(document.querySelectorAll(".public-catalog-pagination button")).find(button=>button.textContent==="Siguiente").click()')
    await wait('document.querySelector(".public-course-card")?.textContent.includes("Curso de prueba pagina 2")')
    assert.equal(courseRequests.some(query=>{const params=new URLSearchParams(query);return params.get("tipo")==="curso"&&params.get("page")==="2"}), true)
    await evaluate('document.querySelector(".nav-logo").click()')
    await wait('!!document.querySelector(".home-layout")')
    await sleep(800)
    assert.equal(await evaluate('window.__homeWelcomeReview.appearances'), 0, 'Entrar por una página interna no muestra bienvenida al volver a Home.')
    await navigate('/educacion/capacitaciones')
    await wait('document.querySelector(".public-course-card")?.textContent.includes("Capacitacion de prueba pagina 1")')
    assert.equal(await evaluate('document.querySelector(".public-course-grid").textContent.includes("Curso de prueba")'), false)
    await evaluate('Array.from(document.querySelectorAll(".public-catalog-pagination button")).find(button=>button.textContent==="Siguiente").click()')
    await wait('document.querySelector(".public-course-card")?.textContent.includes("Capacitacion de prueba pagina 2")')
    assert.equal(courseRequests.some(query=>{const params=new URLSearchParams(query);return params.get("tipo")==="capacitacion"&&params.get("page")==="2"}), true)
    console.log('CatalogoCursos: filtros curso/capacitacion conservados en la paginacion: OK.')
    await evaluate('localStorage.removeItem("horus-admin-token")')
    await navigate('/admin/dashboard')
    await wait('location.pathname === "/admin/login"')
    assert.equal(await evaluate('!!document.querySelector(".home-layout")'), false)

    settingsFailure = true
    await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
    await viewport(320, 844)
    await navigate('/')
    await wait('typeof window.__homeWelcomeReview?.end === "number"')
    const reducedWelcome = await evaluate('window.__homeWelcomeReview')
    assert.equal(reducedWelcome.appearances, 1)
    assert.equal(reducedWelcome.animation, 'none')
    assert.ok(reducedWelcome.duration < 1000, 'Bienvenida estática breve incluso si falla la API.')
    await send('Emulation.setEmulatedMedia', { features: [] })
    console.log('Home: bienvenida reducida sin animación e independiente de errores de la API: OK.')

    await wait('document.querySelector(".home-loc-items").textContent.includes("Horario por confirmar")')
    assert.equal(await evaluate('document.querySelector(".footer").textContent.includes("Horus Group SRL")'), true)
    assert.equal(await evaluate('document.querySelectorAll(".home-conv-card").length'), 5)
    settingsFailure = false
    await evaluate('window.dispatchEvent(new CustomEvent("horus:content-updated",{detail:"settings"}))')
    await wait('document.querySelector(".home-loc-items").textContent.includes("Martes: 10:00–14:00")')
    assert.deepEqual(connection.exceptions, [], 'Errores JavaScript en la revisión.')
    console.log('Home: movimiento reducido, estilos aislados, React Router, guard administrativo y recuperación de ajustes: OK.')
    console.log('Revisión de Home terminada correctamente.')
  } finally {
    if (connection) { await Promise.race([connection.send('Browser.close').catch(() => {}), sleep(1000)]); connection.socket.close() }
    child?.kill()
    await new Promise(resolve => server.close(resolve))
    await sleep(500)
    const resolvedProfile = path.resolve(profile)
    if (path.dirname(resolvedProfile) !== tempRoot || !path.basename(resolvedProfile).startsWith('horus-home-ui-')) throw new Error('Perfil fuera del directorio temporal.')
    for (let attempt = 0; attempt < 8; attempt++) {
      try { fs.rmSync(resolvedProfile, { recursive: true, force: true }); break }
      catch { if (attempt === 7) console.log('El perfil temporal sigue en uso.'); else await sleep(250) }
    }
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; server.close() })
