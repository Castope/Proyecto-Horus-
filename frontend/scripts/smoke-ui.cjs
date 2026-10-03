// UI smoke test with isolated HTTP fixtures, using Edge and its DevTools protocol.
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict'),{spawn}=require('node:child_process');
const root=path.resolve(__dirname,'../dist'),browser=process.env.SMOKE_BROWSER||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const fixtureCourse={id:1,titulo:'Curso de prueba',tipo:'curso',modalidad:'virtual',duracion:'20 horas',descripcion:'Descripción de prueba',temario:'Temario de prueba',fecha_inicio:'2099-01-01',estado:'publicado'};
const fixtureCap={...fixtureCourse,id:2,titulo:'Capacitación de prueba',tipo:'capacitacion'};
const fixtureConvenio={id:1,nombre:'Convenio de prueba',sigla:'CDP',logo_url:null,descripcion_corta:'Resumen del convenio de prueba',descripcion_completa:'Descripción completa del convenio de prueba',informacion_adicional:null,orden:1,visible:true,fotos:[]};
const {originalServices,originalCourses,originalGallery}=require('../../backend/dist/content-original/data');
const serviceEntries=originalServices.map((x,i)=>({...x,id:i+1}));
const programEntries=originalCourses.map((x,i)=>({...x,id:i+10}));
const galleryEntries=originalGallery.map((x,i)=>({...x,id:i+10}));
const importBodies=[];
const service={id:1,titulo:'Servicio de prueba',descripcion:'Descripción del servicio',categoria:'cableado',alcance:'Alcance de prueba',estado:'publicado'};
const quote={id:1,numero:'COT-PRUEBA',cliente:'Cliente de prueba',email:'test@example.com',telefono:'',documento:'',direccion:'',emisor:'Emisor de prueba',datos_emisor:'',moneda:'PEN',validez:'2099-12-31',condiciones:'Condiciones de prueba',conceptos:[{descripcion:'Servicio',cantidad:1,precio:100,importe:100}],subtotal:'100.00',descuento:0,tasa:18,impuesto:'18.00',total:'118.00',estado:'borrador',revision:1,historial:[{accion:'Creada como borrador',usuario:1,fecha:'2026-01-01T00:00:00Z'}]};
let chunkError=false,faqError=false,meUnavailable=false,attention={estado:'nuevo',responsable:'',notas:'',respuesta:'',revision:1,historial:[]},bodies=[],contactBodies=[];
const server=http.createServer(async(req,res)=>{
 try{const u=new URL(req.url,'http://localhost'),p=u.pathname;
 if(p.startsWith('/api/')){
 res.setHeader('Content-Type','application/json');const json=(data,status=200)=>{res.statusCode=status;res.end(JSON.stringify(data))};
 if(p==='/api/contacto'&&req.method==='POST'){let body='';for await(const chunk of req)body+=chunk;contactBodies.push(JSON.parse(body));return json({ok:true,mensaje:'Consulta registrada.',correo_enviado:false})}
 if(p==='/api/settings')return json({ok:true,settings:{}});
 if(p==='/api/admin/me'){if(meUnavailable)return json({message:'Servicio temporalmente no disponible'},503);return json({ok:true,user:{id:1,nombre:'Admin de prueba',email:'admin@example.com'}})}
 if(p==='/api/admin/cotizaciones')return json({ok:true,items:[quote],pagination:{total:1,pages:1}});
 if(p==='/api/admin/cotizaciones/1')return json({ok:true,item:quote});
 if(p.endsWith('/correo'))return json({message:'No se pudo enviar el correo de prueba.'},503);
 if(p==='/api/admin/messages')return json({ok:true,messages:[{id:1,nombre:'Consulta de prueba',email:'test@example.com',telefono:'',asunto:'Asunto de prueba',mensaje:'Mensaje de prueba',estado:attention.estado,createdAt:'2026-01-01'}],pagination:{total:1,pages:1},metrics:{nuevo:1,en_proceso:0,atendido:0}});
 if(p==='/api/admin/seguimiento/messages/1'){if(req.method==='PUT'){let body='';for await(const chunk of req)body+=chunk;const input=JSON.parse(body);bodies.push(input);attention={...input,revision:input.revision+1,historial:[]};}return json({ok:true,item:attention})}
 if(p==='/api/admin/contenido-original')return json({ok:true,sections:[{key:'servicios',label:'Servicios originales',total:19,titles:originalServices.map(x=>x.titulo)},{key:'capacitaciones',label:'Programas originales',total:4,titles:originalCourses.map(x=>x.titulo)},{key:'galeria',label:'Galería original',total:61,titles:originalGallery.map(x=>x.titulo)}]});
 if(p.startsWith('/api/admin/contenido-original/')&&req.method==='POST'){let body='';for await(const chunk of req)body+=chunk;importBodies.push(JSON.parse(body));return json({ok:true,created:0,existing:19,mensaje:'0 registros recuperados. Los existentes se conservaron.'})}
 if(p==='/api/admin/servicios/1'){if(req.method==='PUT'){let body='';for await(const chunk of req)body+=chunk;Object.assign(serviceEntries[0],JSON.parse(body));}return json({ok:true,item:serviceEntries[0]})}
 if(p==='/api/cursos/1')return json({ok:true,item:fixtureCourse});
 if(p==='/api/servicios/1')return json({ok:true,item:service});
 if(p==='/api/convenios/1')return json({ok:true,item:fixtureConvenio});
 if(p==='/api/convenios')return json({ok:true,items:[fixtureConvenio],pagination:{page:1,limit:6,total:1,pages:1}});
 if(p==='/api/preguntas-frecuentes'&&faqError)return json({message:'Fallo de prueba'},503);
 let items=p==='/api/cursos'?[fixtureCourse,fixtureCap,...programEntries].filter(x=>(!u.searchParams.get('tipo')||x.tipo===u.searchParams.get('tipo'))&&(!u.searchParams.get('modalidad')||x.modalidad===u.searchParams.get('modalidad'))):['/api/servicios','/api/admin/servicios'].includes(p)?serviceEntries.filter(x=>!u.searchParams.get('categoria')||x.categoria===u.searchParams.get('categoria')):p==='/api/preguntas-frecuentes'?[{id:1,pregunta:'Pregunta de prueba',respuesta:'Respuesta de prueba',categoria:'General'}]:p==='/api/galeria'?galleryEntries.filter(x=>!u.searchParams.get('categoria')||x.categoria===u.searchParams.get('categoria')):[];
 const total=items.length,page=Number(u.searchParams.get('page')||1),limit=Number(u.searchParams.get('limit')||24);items=items.slice((page-1)*limit,page*limit);
 return json({ok:true,items,categorias:[...new Set(galleryEntries.map(x=>x.categoria))],pagination:{total,pages:Math.ceil(total/limit)}});
 }
 if(chunkError&&p.startsWith('/assets/AdminDashboard-')&&p.endsWith('.js')){res.statusCode=503;return res.end('Isolated chunk failure')}
 let filename=path.resolve(root,'.'+decodeURIComponent(p));
 if(!filename.startsWith(root+path.sep))filename=path.join(root,'index.html');
 if(!fs.existsSync(filename)||fs.statSync(filename).isDirectory())filename=path.join(root,'index.html');
 const ext=path.extname(filename);res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp'})[ext]||'application/octet-stream');res.end(fs.readFileSync(filename));
 }catch{res.statusCode=500;res.end('Fixture failure')}
});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function main(){
 if(!fs.existsSync(browser))throw new Error('Configura SMOKE_BROWSER con una instalación de Edge/Chromium.');
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
 const reserve=http.createServer();await new Promise(r=>reserve.listen(0,'127.0.0.1',r));const port=reserve.address().port;await new Promise(r=>reserve.close(r));
 const tmp=fs.realpathSync(os.tmpdir()),profile=fs.mkdtempSync(path.join(tmp,'horus-ui-'));let socket,child,closeBrowser;const pending=new Map();let seq=0;
 try{
 child=spawn(browser,['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--remote-debugging-port='+port,'--user-data-dir='+profile,'about:blank'],{windowsHide:true,stdio:'ignore'});
 let target;for(let i=0;i<100&&!target;i++){await sleep(100);try{target=await fetch('http://127.0.0.1:'+port+'/json/new?about:blank',{method:'PUT'}).then(r=>r.json())}catch{}}
 if(!target?.webSocketDebuggerUrl)throw new Error('No se pudo iniciar Edge para la revisión.');
 socket=new WebSocket(target.webSocketDebuggerUrl);await new Promise((r,j)=>{socket.onopen=r;socket.onerror=j});
 socket.onmessage=event=>{const msg=JSON.parse(event.data);if(msg.id){const p=pending.get(msg.id);pending.delete(msg.id);if(msg.error)p?.reject(new Error(msg.error.message));else p?.resolve(msg.result)}};
 const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}))});
 closeBrowser=()=>send('Browser.close');
 const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw new Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value};
 const wait=async expression=>{for(let i=0;i<100;i++){if(await evaluate(expression))return;await sleep(100)}throw new Error('No se cumplió: '+expression)};
 const navigate=async route=>{await send('Page.navigate',{url:origin+route});await wait('document.readyState==="complete"');await sleep(300)};
 const click=label=>evaluate('Array.from(document.querySelectorAll("button,a")).find(x=>x.textContent.trim()==='+JSON.stringify(label)+')?.click()');
 await send('Page.enable');await send('Runtime.enable');
 await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
 await navigate('/educacion/cursos');await wait('document.body.innerText.includes("Curso de prueba")');assert.equal(await evaluate('document.body.innerText.includes("Capacitación de prueba")'),false);
 const courseCard='[...document.querySelectorAll("article")].find(a=>a.textContent.includes("Curso de prueba"))';
 assert.equal(await evaluate(courseCard+'.querySelector("summary").textContent.trim()'),'Ver temario');
 assert.equal(await evaluate(courseCard+'.querySelector("details").open'),false);
 await evaluate(courseCard+'.querySelector("summary").click()');await wait(courseCard+'.querySelector("details").open===true');assert.equal(await evaluate(courseCard+'.querySelector("details p").textContent'),'Temario de prueba');
 assert.equal(await evaluate(courseCard+'.querySelector("a").getAttribute("aria-label")'),'Consultar sobre Curso de prueba');
 await click('Consultar información');await wait('location.pathname==="/contactos"');assert.equal(await evaluate('document.getElementById("asunto").value'),'','La tarjeta del catálogo abre Contacto sin asunto prefijado.');
 await navigate('/educacion/cursos/1');await wait('document.body.innerText.includes("Temario de prueba")');await click('Solicitar información');await wait('document.getElementById("asunto")?.value==="Consulta sobre Curso de prueba"');
 await evaluate(`(()=>{const values={nombre:'Ana de prueba',email:'test@example.com',telefono:'+51 999 888 777',mensaje:'Consulta de prueba'};for(const [name,value] of Object.entries(values)){const el=document.getElementById(name);Object.getOwnPropertyDescriptor(el.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype,'value').set.call(el,value);el.dispatchEvent(new Event('input',{bubbles:true}));}})()`);await sleep(100);await evaluate('document.getElementById("nombre").form.requestSubmit()');await wait('document.body.innerText.includes("Mensaje registrado. La notificación por correo está pendiente")');assert.equal(contactBodies.length,1);assert.equal(contactBodies[0].telefono,'+51 999 888 777');assert.equal(contactBodies[0].asunto,'Consulta sobre Curso de prueba');
 await navigate('/preguntas-frecuentes');await wait('!!document.querySelector("details")');await evaluate('document.querySelector("summary").click()');assert.equal(await evaluate('document.querySelector("details").open'),true);
 faqError=true;await click('Actualizar');await wait('!!document.querySelector("[role=alert]")');faqError=false;await click('Reintentar');await wait('!!document.querySelector("details")');
 console.log('UI: catálogo, consultas y FAQ comprobados.');
 await navigate('/galeria');await wait('!!document.querySelector(".gl-item")');await evaluate('document.querySelector(".gl-item").focus();document.querySelector(".gl-item").click()');await wait('!!document.querySelector("dialog[open]")');await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27,nativeVirtualKeyCode:27});await wait('!document.querySelector("dialog[open]")');assert.equal(await evaluate('document.activeElement.classList.contains("gl-item")'),true);
 await navigate('/');await wait('!!document.querySelector(".home-conv-card")');await evaluate('document.querySelector(".home-conv-card").click()');await wait('!!document.querySelector("#home-conv-center #convDesc")');assert.equal(await evaluate('document.querySelector("#convNombre").textContent'),'Convenio de prueba');await evaluate('document.querySelector("#convClose").click()');await wait('!document.querySelector("#home-conv-center #convDesc")');
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await navigate('/educacion/cursos');await wait('!!document.querySelector(".nav-toggle")');await evaluate('document.querySelector(".nav-toggle").click()');await wait('document.querySelector(".nav-toggle").getAttribute("aria-expanded")==="true"');await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27,nativeVirtualKeyCode:27});await wait('document.querySelector(".nav-toggle").getAttribute("aria-expanded")==="false"');
 assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth+1'),true);
 console.log('UI: diálogos, foco y menú móvil comprobados.');
 await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
 await evaluate('localStorage.setItem("horus-admin-token","isolated-ui-test-token")');

 const capture=async(name,selector)=>{if(!process.env.SMOKE_SCREENSHOTS)return;await evaluate('document.querySelector('+JSON.stringify(selector)+')?.scrollIntoView({block:"start"})');await sleep(300);const result=await send('Page.captureScreenshot',{format:'png'});fs.mkdirSync(process.env.SMOKE_SCREENSHOTS,{recursive:true});fs.writeFileSync(path.join(process.env.SMOKE_SCREENSHOTS,name+'.png'),Buffer.from(result.data,'base64'));};
 await navigate('/tecnologias/cableado-estructurado');await wait('document.querySelectorAll("[role=tab]").length===4');
 await evaluate('document.querySelector("[role=tab]").focus()');await send('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowRight',code:'ArrowRight',windowsVirtualKeyCode:39,nativeVirtualKeyCode:39});
 await wait('document.querySelector("[role=tab][aria-selected=true]").textContent.includes("Cat 5e")');
 assert.equal(await evaluate('document.activeElement.getAttribute("aria-selected")'),"true");
 await wait('document.querySelector(".panel-img img")?.naturalWidth>0');await capture('cableado-desktop','#categorias');
 await navigate('/tecnologias/camaras-seguridad');await wait('document.querySelectorAll(".cam-service").length===4');assert.equal(await evaluate('document.querySelectorAll(".cam-service-visual").length'),4);await capture('camaras-desktop','#soluciones');
 await navigate('/tecnologias/soporte-mantenimiento');await wait('document.querySelectorAll(".sop-card").length===4');await capture('soporte-desktop','#servicios');
 await navigate('/educacion/asesoramiento');await wait('document.querySelectorAll(".ed-type-card").length===3');assert.equal(await evaluate('document.querySelectorAll(".ed-benefit").length'),4);await capture('asesoramiento-desktop','#ed-detail');
 await navigate('/educacion/capacitaciones');await wait('document.querySelectorAll(".public-course-card").length===5');assert.equal(await evaluate('Array.from(document.querySelectorAll(".public-course-card h3")).some(h=>h.textContent.includes("Capacitación de prueba"))'),true);await capture('capacitaciones-desktop','#catalogo-cursos');
 await navigate('/galeria');await wait('document.querySelectorAll(".gl-strip").length===2');await wait('document.querySelector(".gl-strip-img img")?.naturalWidth>0');await capture('galeria-carrusel','.gl-hero');
 await evaluate('Array.from(document.querySelectorAll(".gf-btn")).find(x=>x.textContent.trim()==="Capacitaciones").click()');await wait('document.querySelector(".gf-btn.active")?.textContent==="Capacitaciones"');assert.equal(await evaluate('Array.from(document.querySelectorAll(".gl-item-cat")).every(x=>x.textContent==="Capacitaciones")'),true);await capture('galeria-desktop','#galeria');
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
 for(const [route,selector] of [['/tecnologias/cableado-estructurado','#categorias'],['/tecnologias/camaras-seguridad','#soluciones'],['/tecnologias/soporte-mantenimiento','#servicios'],['/educacion/asesoramiento','#ed-detail'],['/educacion/capacitaciones','#catalogo-cursos'],['/galeria','#galeria']]){
  await navigate(route);await wait('!document.querySelector("[role=status]")?.textContent.includes("Cargando")');await sleep(200);assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth+1'),true,'Desbordamiento móvil: '+route);await capture(route.split('/').at(-1)+'-mobile',selector);
 }
 await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
 await evaluate('localStorage.setItem("horus-admin-token","isolated-ui-test-token")');
 await navigate('/tecnologias/cableado-estructurado');await wait('document.querySelectorAll("[role=tab]").length===4');
 // A second real tab saves the panel form. The open public tab receives the browser storage event.
 const adminTarget=await fetch('http://127.0.0.1:'+port+'/json/new?'+encodeURIComponent(origin+'/admin/dashboard?section=servicios'),{method:'PUT'}).then(r=>r.json());
 const adminSocket=new WebSocket(adminTarget.webSocketDebuggerUrl);await new Promise((r,j)=>{adminSocket.onopen=r;adminSocket.onerror=j});
 let adminSeq=0;const adminPending=new Map();adminSocket.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const pending=adminPending.get(m.id);adminPending.delete(m.id);m.error?pending?.reject(new Error(m.error.message)):pending?.resolve(m.result)}};
 const adminSend=(method,params={})=>new Promise((resolve,reject)=>{const id=++adminSeq;adminPending.set(id,{resolve,reject});adminSocket.send(JSON.stringify({id,method,params}))});
 const adminEval=async expression=>{const result=await adminSend('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(result.exceptionDetails)throw new Error(result.exceptionDetails.text);return result.result.value};
 const adminWait=async expression=>{for(let i=0;i<100;i++){if(await adminEval(expression))return;await sleep(100)}throw new Error('Panel: '+expression)};
 try{
  await adminWait('document.querySelectorAll(".hw-resource").length===8');
  await adminEval('document.querySelector(".hw-resource footer button").click()');await adminWait('!!document.getElementById("field-nombre_corto")');
  await adminEval(`(()=>{for(const [name,value] of Object.entries({titulo:'Servicio actualizado desde el panel',nombre_corto:'Cat editable',etiquetas:'Etiqueta actualizada'})){const el=document.getElementById('field-'+name);Object.getOwnPropertyDescriptor(el.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype,'value').set.call(el,value);el.dispatchEvent(new Event('input',{bubbles:true}));}})()`);
  await sleep(100);await adminEval('document.querySelector("dialog form").requestSubmit()');await adminWait('document.body.innerText.includes("Cambios guardados correctamente.")');
  await wait('document.querySelector(".panel-info h3")?.textContent==="Servicio actualizado desde el panel"');assert.equal(await evaluate('document.querySelector("[role=tab]").textContent.includes("Cat editable")'),true);assert.equal(await evaluate('document.querySelector(".panel-tag").textContent'),"Etiqueta actualizada");
  await adminEval('Array.from(document.querySelectorAll("button")).find(x=>x.textContent.trim()==="Recuperar contenido original").click()');
  await adminWait('document.querySelector(".original-import-list")?.children.length===19');
  await adminEval('Array.from(document.querySelectorAll("dialog button")).find(x=>x.textContent.trim()==="Recuperar registros").click()');
  await adminWait('document.body.innerText.includes("0 registros recuperados.")');assert.deepEqual(importBodies,[{estado:'publicado'}]);
  assert.equal(serviceEntries[0].titulo,'Servicio actualizado desde el panel');
 }finally{await adminSend('Page.close').catch(()=>{});adminSocket.close()}
 console.log('UI: diseño original, pestañas con teclado, carrusel, filtros, móvil, importación y edición del panel reflejada en otra pestaña: OK.');

 await navigate('/admin/dashboard?section=cotizaciones');await wait('Array.from(document.querySelectorAll("button")).some(x=>x.textContent.trim()==="Ver propuesta"&&!x.disabled)');await click('Ver propuesta');await wait('!!document.querySelector(".hq-document")');assert.ok(await evaluate('document.querySelector(".hq-document").textContent.includes("118.00")'));await click('Enviar por correo');await wait('document.body.innerText.includes("No se pudo enviar el correo de prueba.")');await evaluate('document.querySelector("dialog header button").click()');
 await navigate('/admin/messages');await wait('document.body.innerText.includes("Consulta de prueba")');await evaluate('document.querySelector(".hw-inbox-list button").click()');await wait('document.body.innerText.includes("Seguimiento de atención")');await wait('document.querySelector(".hw-inbox-detail textarea")!==null');
 await click('Guardar seguimiento');await wait('document.body.innerText.includes("Seguimiento guardado.")');await wait('Array.from(document.querySelectorAll("button")).some(x=>x.textContent.trim()==="Guardar seguimiento"&&!x.disabled)');await click('Guardar seguimiento');await wait(''+JSON.stringify(true));await sleep(500);assert.equal(bodies.length,2);assert.deepEqual(Object.keys(bodies[1]).sort(),['estado','notas','responsable','respuesta','revision']);
 meUnavailable=true;await navigate('/admin/dashboard?section=cotizaciones');await wait('document.body.innerText.includes("No pudimos validar tu sesión")');assert.ok(await evaluate('localStorage.getItem("horus-admin-token")'));meUnavailable=false;assert.equal(await evaluate('!!document.querySelector(".hp-shell")'),false);await click('Reintentar');await wait('document.body.innerText.includes("Cotizaciones")');
 await send('Network.enable');await send('Network.setCacheDisabled',{cacheDisabled:true});chunkError=true;await navigate('/admin/dashboard?section=cotizaciones');await wait('document.body.innerText.includes("No pudimos abrir esta página")');chunkError=false;await click('Recargar página');await wait('document.body.innerText.includes("Cotizaciones")');
 console.log('UI: carga de pantallas y recuperación de error comprobados.');
 console.log('UI: catálogo, detalle, consulta, FAQ/reintento, galería/foco, convenio, menú móvil, cotización, error de correo, seguimiento y sesión transitoria: OK.');
 }finally{try{if(closeBrowser)await Promise.race([closeBrowser(),sleep(1000)])}catch{}try{socket?.close()}catch{}child?.kill();await new Promise(r=>server.close(r));await sleep(500);if(path.dirname(profile)!==tmp||!path.basename(profile).startsWith('horus-ui-'))throw new Error('Perfil fuera del directorio temporal');for(let attempt=0;attempt<8;attempt++){try{fs.rmSync(profile,{recursive:true,force:true});break}catch{if(attempt===7)console.log('El perfil temporal del navegador sigue en uso.');else await sleep(250)}}}}
main().catch(e=>{console.error(e.message);process.exitCode=1;server.close()});
