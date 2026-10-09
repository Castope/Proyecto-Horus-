// Suite sobre la aplicación real compilada; comparte Edge y la API ficticia del smoke de conflictos.
module.exports = async function editorRace({ clean, set, state, session, choose, ck, sleep, KEY, TOKEN, release }) {
  const TABLE = '/admin/dashboard?section=mensajes&vista=tabla';
  const DIALOG = 'dialog.hp-dialog[open]:not(.hp-unsaved-dialog)';
  const FIELD = DIALOG + ' form fieldset select';
  const submit = p => p.evaluate('document.querySelector(' + JSON.stringify(DIALOG + ' form') + ').requestSubmit(); 1');
  const openRow = async (p, id) => {
    await p.wait('document.querySelector(' + JSON.stringify('button[aria-label="Editar Asunto ' + id + '"]') + ')', 'fila de mensaje');
    await p.clickText('button[aria-label="Editar Asunto ' + id + '"]', 'Editar Asunto ' + id);
    await p.wait('document.querySelector(' + JSON.stringify(FIELD) + ')', 'editor de estado');
  };
  const draft = p => p.type(FIELD, 0, 'en_proceso');
  const pending = async () => { const end = Date.now() + 8000; while (Date.now() < end) { if ((await state()).heldPuts === 1) return; await sleep(50); } throw new Error('No comenzó el PUT retenido.'); };
  const assertDraft = (p, id) => p.evaluate('document.querySelector(' + JSON.stringify(DIALOG + ' #field-asunto') + ')?.value === ' + JSON.stringify('Asunto ' + id) + ' && document.querySelector(' + JSON.stringify(FIELD) + ')?.value === "en_proceso"');

  console.log('\n== D4: CARRERA DE CIERRE DEL EDITOR');
  for (const width of [1280, 375]) {
    await clean(); await set({ holdPut: 1 }); const p = await session(TABLE, width); await openRow(p, 1); await draft(p);
    await p.evaluate('const f = document.querySelector(' + JSON.stringify(DIALOG + ' form') + '); f.requestSubmit(); f.requestSubmit(); 1');
    await pending();
    const locked = await p.evaluate('document.querySelector(' + JSON.stringify(DIALOG + ' > button') + ')?.disabled && document.querySelector(' + JSON.stringify(DIALOG + ' button[aria-label="Cerrar ventana"]') + ')?.disabled');
    ck(locked, width + ' px: Cancelar y X bloqueados durante PUT (regresión del cierre de A)');
    if (!locked) throw new Error('Regresión reproducida: el diálogo permite Cancelar durante el PUT.');
    await p.clickText(DIALOG + ' > button', 'Cancelar');
    await p.clickText(DIALOG + ' button[aria-label="Cerrar ventana"]', 'Cerrar ventana');
    await p.press('Escape', 'Escape', 27);
    await p.evaluate('document.querySelector(' + JSON.stringify(DIALOG) + ').dispatchEvent(new Event("cancel", {cancelable:true})); 1');
    await p.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: 1, y: 1, button: 'left', clickCount: 1 });
    await p.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 1, y: 1, button: 'left', clickCount: 1 });
    await p.clickText('button[aria-label="Editar Asunto 2"]', 'Editar Asunto 2');
    ck(await assertDraft(p, 1) && !(await p.evaluate('!!document.querySelector("dialog.hp-unsaved-dialog[open]")')), width + ' px: Escape, fondo y cambio de fila no cierran A ni abren confirmaciones contradictorias');
    ck(await p.evaluate('document.querySelector(' + JSON.stringify(DIALOG + ' form') + ')?.getAttribute("aria-busy") === "true" && [...document.querySelectorAll(' + JSON.stringify(DIALOG + ' [role=status]') + ')].some(e=>e.textContent.includes("Guardando"))'), width + ' px: operación pendiente anunciada de forma accesible');
    ck((await state()).writes.filter(w=>w.method==='PUT').length === 1, width + ' px: dos submits generan un solo PUT');
    await release(); await p.wait('!document.querySelector(' + JSON.stringify(DIALOG) + ') && document.body.innerText.includes("Cambios guardados correctamente.")', 'cierre de A tras éxito');
    await openRow(p, 2); ck(await p.evaluate('document.querySelector(' + JSON.stringify(FIELD) + ')?.value === "nuevo"'), width + ' px: tras guardar A se puede abrir B'); await p.close();
  }

  await clean(); await set({ holdPut: 1, putMode: 'fail' });
  {
    const p = await session(TABLE); await openRow(p, 1); await draft(p); await submit(p); await pending(); await release();
    await p.wait('document.querySelector(' + JSON.stringify(DIALOG + ' .hp-error') + ') && !document.querySelector(' + JSON.stringify(DIALOG + ' > button') + ').disabled', 'error y cierre disponible');
    ck(await assertDraft(p, 1), 'PUT fallido conserva el borrador y libera el diálogo');
    await set({ putMode: 'ok' }); await submit(p); await p.wait('!document.querySelector(' + JSON.stringify(DIALOG) + ')', 'reintento confirmado');
    ck((await state()).writes.length === 2 && (await state()).writes[1].applied, 'tras error, el reintento explícito funciona'); await p.close();
  }

  // El timeout libera el cierre, pero no implica rollback: se reabre otro editor dentro del MISMO ResourceManager.
  for (const id of [2, 1]) {
    await clean(); await set({ holdPut: 1 }); const p = await session(TABLE); await openRow(p, 1); await draft(p);
    await p.evaluate('window.__raceParent = document.querySelector(".hp-heading"); 1');
    await submit(p); await pending();
    await p.wait('document.querySelector(' + JSON.stringify(DIALOG + ' .hp-error') + ')?.textContent.includes("No pudimos confirmar") && !document.querySelector(' + JSON.stringify(DIALOG + ' > button') + ').disabled', 'timeout conserva borrador y libera cierre', 20000);
    ck(await assertDraft(p, 1) && (await state()).writes.length === 1 && (await state()).writes[0].applied, 'timeout no afirma rollback ni reintenta automáticamente; conserva borrador');
    await p.clickText(DIALOG + ' > button', 'Cancelar'); await p.wait('document.querySelector("dialog.hp-unsaved-dialog[open]")', 'descarte tras timeout');
    await p.clickText('dialog.hp-unsaved-dialog[open] .hp-btn-danger', 'Descartar cambios');
    await openRow(p, id); await p.type(FIELD, 0, 'archivado'); await release(); await sleep(500);
    ck(await p.evaluate('window.__raceParent === document.querySelector(".hp-heading") && document.querySelector(' + JSON.stringify(DIALOG + ' #field-asunto') + ')?.value === ' + JSON.stringify('Asunto ' + id) + ' && document.querySelector(' + JSON.stringify(FIELD) + ')?.value === "archivado"'), id === 1 ? 'mismo ResourceManager: reapertura del mismo ID conserva la nueva sesión tras respuesta tardía' : 'mismo ResourceManager: respuesta tardía de A no cierra B');
    await p.clickText(DIALOG + ' > button', 'Cancelar'); await p.wait('document.querySelector("dialog.hp-unsaved-dialog[open]")', 'dirty nuevo después de respuesta antigua');
    ck(true, 'la respuesta antigua no limpia la protección del nuevo borrador'); await p.close();
  }

  // Cierre obligatorio: petición en vuelo al restaurar sesión en el MISMO documento y abrir otra edición.
  for (const id of [2, 1]) {
    await clean(); await set({ holdPut: 1 });
    const p = await session(TABLE); await openRow(p, 1); await draft(p); await submit(p); await pending();
    if (id === 1) await p.evaluate('window.dispatchEvent(new CustomEvent("horus:session-expired", {detail:{token:localStorage.getItem(' + JSON.stringify(KEY) + ')}})); 1');
    else await p.evaluate('localStorage.removeItem(' + JSON.stringify(KEY) + '); window.dispatchEvent(new StorageEvent("storage", {key:' + JSON.stringify(KEY) + ',newValue:null})); 1');
    await p.wait('location.pathname === "/admin/login"', 'invalidación obligatoria durante PUT');
    ck(!(await p.evaluate('!!document.querySelector("dialog.hp-unsaved-dialog[open]")')) && (await p.evaluate('localStorage.getItem(' + JSON.stringify(KEY) + ')')) === null, (id === 1 ? 'invalidación' : 'logout desde otra pestaña') + ' desmonta A sin retener sesión ni confirmar descarte');
    await p.evaluate('localStorage.setItem(' + JSON.stringify(KEY) + ', ' + JSON.stringify(TOKEN) + '); window.dispatchEvent(new StorageEvent("storage", {key:' + JSON.stringify(KEY) + ',newValue:' + JSON.stringify(TOKEN) + '})); 1');
    await p.wait('location.pathname === "/admin/dashboard" && document.querySelector(".hp-body")', 'sesión ficticia revalidada');
    if (!(await p.evaluate('!!document.querySelector(".hp-table")'))) {
      await p.clickText('.hp-sidebar button', 'Mensajes');
      await p.wait('document.querySelector(' + JSON.stringify('a[href="' + TABLE + '"]') + ')', 'enlace a la tabla');
      await p.clickText('a[href="' + TABLE + '"]', 'Vista de registros');
      await p.wait('document.querySelector(".hp-table")', 'tabla tras navegación interna');
    }
    await openRow(p, id); await p.type(FIELD, 0, id === 1 ? 'archivado' : 'en_proceso');
    await release(); await sleep(500);
    ck(await p.evaluate('document.querySelector(' + JSON.stringify(DIALOG + ' #field-asunto') + ')?.value === ' + JSON.stringify('Asunto ' + id) + ' && document.querySelector(' + JSON.stringify(FIELD) + ')?.value === ' + JSON.stringify(id === 1 ? 'archivado' : 'en_proceso')), id === 1 ? 'respuesta de una edición anterior del mismo ID no cierra la nueva sesión ni cambia su borrador' : 'respuesta tardía de A no cierra B ni cambia su borrador');
    await p.clickText(DIALOG + ' > button', 'Cancelar'); await p.wait('document.querySelector("dialog.hp-unsaved-dialog[open]")', 'borrador nuevo sigue protegido');
    ck(true, 'el callback antiguo no limpia dirty de la edición nueva'); await p.close();
  }

  await clean();
  {
    const p = await session(TABLE); await openRow(p, 1); await draft(p);
    const remotePage = await session('/admin/messages?id=1');
    await remotePage.wait('document.querySelector(".hw-inbox-detail form fieldset select")', 'segundo administrador simulado');
    await remotePage.type('.hw-inbox-detail form fieldset select', 0, 'archivado');
    await remotePage.clickText('.hw-inbox-detail form button', 'Guardar seguimiento');
    await remotePage.wait('document.querySelector(".hw-detail-heading .hp-badge")?.textContent === "Archivado"', 'archivo concurrente'); await remotePage.close();
    await submit(p); await p.wait('document.querySelector(' + JSON.stringify(DIALOG + ' .hp-conflict-field') + ')', '409 con conflicto');
    ck(await assertDraft(p, 1), '409 mantiene borrador y conflicto explícito');
    await choose(p, 'Estado', 'Conservar mi versión'); await submit(p);
    await p.wait('!document.querySelector(' + JSON.stringify(DIALOG) + ')', 'resolución explícita D3');
    ck((await state()).attention['messages:1'].estado === 'en_proceso', 'resolución D3 guarda solo tras elección explícita'); await p.close();
  }
};
