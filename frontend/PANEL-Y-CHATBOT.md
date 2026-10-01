# Panel y chatbot

## Panel

Desde la navegación del panel y los accesos del resumen:

- **Suscripciones**: consulta los correos registrados, filtra por interés y estado, busca por correo y abre el detalle.
- **Reclamaciones**: consulta reclamos y quejas; busca por número, persona, documento, correo o área y revisa la información completa.
- Ambas vistas muestran diez registros por página. **Exportar resultados** descarga todos los registros que coinciden con los filtros, no solo la página visible. El CSV conserva las tildes y neutraliza valores que podrían interpretarse como fórmulas.
- Las secciones consultan las rutas administrativas existentes mediante la sesión del panel. No modifican los registros ni envían correos. Los datos se cargan completos desde la API actual y se filtran localmente.

## Chatbot

- El menú permite buscar nombres sin distinguir tildes y filtrar cursos por modalidad. Las respuestas del menú vuelven a consultar el registro para comprobar que siga publicado.
- Las respuestas sobre cursos o servicios ofrecen botones para continuar preguntando sobre el primer resultado consultado.
- Las preguntas de seguimiento, incluso con signos de apertura y varias preguntas consecutivas, recuperan el tema desde los mensajes recientes del visitante. El historial del asistente no se utiliza como fuente de hechos.
- En **Solicitar atención del equipo**, **Añadir mis últimas consultas** incorpora hasta cuatro preguntas al campo editable. El visitante revisa el texto y autoriza el contacto antes de enviarlo. La consulta llega a **Mensajes**, identificada como Chatbot.
- Si el proveedor de IA falla, se muestra el aviso de respuesta directa desde el catálogo.

## Comprobación manual

1. Con una sesión administrativa, abrir ambas secciones; revisar carga, errores, vacío, filtros, paginación, exportación y detalle. Comprobar que Escape cierra el detalle y devuelve el foco al botón que lo abrió.
2. En el chatbot, buscar un curso con y sin tildes, cambiar modalidad, consultar un resultado y usar una pregunta sugerida.
3. Escribir un tema y después «¿Qué modalidad tiene?» y «¿Y cuándo empieza?». Comprobar las fuentes publicadas.
4. Abrir el formulario de atención, añadir preguntas, editar el texto y verificar que requiere consentimiento. Probar un fallo de envío y comprobar que conserva los datos.
5. Revisar escritorio y móvil, navegación por teclado y expiración de sesión.
