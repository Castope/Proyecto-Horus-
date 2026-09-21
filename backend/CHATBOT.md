# Asistente Horus

## Uso

Inicia backend y frontend con sus comandos habituales (`npm run start:dev` y `npm run dev`).
El botón «Pregúntale a Horus» aparece en las páginas públicas, no en administración.
Publica cursos, servicios o preguntas frecuentes desde el panel para alimentar las respuestas.
Sin registros publicados, el asistente informa que no encontró información.

La primera versión recupera contenido mediante palabras clave en MySQL. No usa embeddings ni
entrenamiento adicional. Consulta en cada petición, por lo que los cambios publicados y el archivado
se reflejan en la siguiente consulta. No utiliza los textos estáticos de las páginas públicas.

## IA opcional

Por defecto funciona sin proveedor externo y muestra extractos del catálogo.
Para respuestas redactadas por IA, copia las variables de `chatbot.env.example` a `backend/.env`:
configura `OPENAI_API_KEY`, un `CHATBOT_MODEL` compatible con Responses API y
`CHATBOT_AI_ENABLED=true`. Reinicia el backend. No uses variables VITE para secretos.

Integración basada en [OpenAI: generación de texto](https://developers.openai.com/api/docs/guides/text).
La petición usa `store: false`; esto no equivale a una garantía de retención cero del proveedor.
Se envían la pregunta, hasta seis mensajes de contexto y hasta cuatro fuentes públicas.
El formulario de contacto no pasa por el modelo. Si el proveedor falla o no está configurado,
la respuesta vuelve al catálogo. La interfaz distingue ambos modos.

## Contacto y datos

«Solicitar atención» abre un formulario editable. Solo al enviarlo con autorización explícita
se guarda un contacto nuevo con prefijo [Chatbot], visible en Panel → Mensajes.
No confirma reservas ni inscripciones y no envía correos. Guarda la autorización en el texto
de la solicitud; no agrega una tabla de consentimientos ni un historial de conversaciones.
La conversación permanece en memoria del navegador hasta recargar o iniciar una nueva.
No se consulta información de administradores, mensajes, reclamaciones ni ajustes internos.

## Endpoints

- POST /api/chatbot/message: { message, history?: [{ role: user|assistant, content }] }
- POST /api/chatbot/contact: { nombre, email, telefono, asunto, mensaje, consentimiento: true }

El historial solo sirve como contexto; no es fuente autorizada. Los datos del catálogo y el historial
se delimitan como datos en la petición. Las fuentes se muestran como texto escapado por React.
No se interpretan HTML o enlaces generados por el modelo.

## Límites y alcance

Pregunta: 1000 caracteres; contexto: seis turnos de hasta 4000 caracteres.
Recuperación: hasta 18 candidatos por tabla, cuatro fuentes seleccionadas por coincidencia.
La búsqueda por palabras no garantiza recuperar sinónimos ni todo un catálogo extenso.
Los enlaces a detalles públicos no se generan porque esas páginas todavía son estáticas.

Hay límites en memoria por IP (20 consultas y cinco contactos por minuto), un límite global de
200 peticiones por minuto por proceso y cuatro llamadas simultáneas al proveedor.
Detrás de proxies se usa la IP que Express resuelve; no se confía directamente en X-Forwarded-For.
En despliegues con varias instancias/serverless estos límites no son compartidos:
usar un limitador persistente en el gateway y presupuesto del proveedor antes de exponer tráfico masivo.

La IA puede equivocarse. Evalúa preguntas reales y revisa los contenidos publicados antes del lanzamiento.
Una fecha publicada no demuestra que la convocatoria siga abierta. Los mensajes originales del
visitante se conservan en el formulario, sin resúmenes automáticos que puedan cambiar su intención.

## Verificación

`npm test` incluye validación de entradas, filtros públicos, falta de información,
respuesta y fallo del proveedor con fetch simulado, consentimiento, límites y endpoints HTTP.
Las pruebas HTTP usan modelos de base de datos simulados; no acreditan persistencia real en MySQL.

Prueba manual con una base local:
1. Publicar un curso y preguntar por su título; revisar «Información consultada».
2. Archivarlo y repetir la consulta: debe dejar de aparecer.
3. Enviar una solicitud desde el formulario y comprobarla en Panel → Mensajes.
4. Detener el backend: la interfaz debe permitir corregir/reintentar y abrir Contacto.
5. Revisar móvil, navegación con Tab, cierre con Escape y nueva conversación.

## Menú guiado
El widget incluye cursos, servicios, FAQ por categoría y contacto. Consulta las listas públicas paginadas y vuelve a comprobar el detalle publicado en cada acción. Los botones muestran datos directamente sin llamar a IA. El campo de texto libre sigue disponible; Volver al menú y Nueva conversación permiten reiniciar la navegación. Las solicitudes desde una selección incluyen su título en el formulario editable.
