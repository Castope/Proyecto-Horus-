# Correo electrónico de Horus

El backend envía correo mediante `MailService` con dos proveedores, elegidos de forma **explícita** con `MAIL_PROVIDER`:

| Valor | Cuándo usarlo |
|---|---|
| `resend` | Proveedor principal (API HTTPS de Resend). |
| `gmail` | Alternativa (SMTP con contraseña de aplicación). Es el valor por defecto si `MAIL_PROVIDER` no está definido, para no romper instalaciones existentes. |

Un valor distinto impide el arranque. **No hay fallback automático**: si el proveedor elegido falla, el mensaje no se envía por el otro.

## Variables

| Variable | Proveedor | Descripción |
|---|---|---|
| `MAIL_PROVIDER` | ambos | `resend` o `gmail`. |
| `RESEND_API_KEY` | resend | Clave de la API. Solo en variables de entorno del servidor; nunca en el repositorio ni en el frontend. |
| `RESEND_FROM` | resend | Remitente: `correo@dominio` o `Nombre <correo@dominio>`. Debe pertenecer a un dominio verificado en Resend. |
| `MAIL_USER`, `MAIL_PASS` | gmail | Cuenta y contraseña de aplicación. Con `resend` no se exigen. |
| `MAIL_NOTIFY_TO` | ambos (opcional) | Destinatario interno de los avisos de Contacto y la copia oculta de la constancia del Libro de Reclamaciones. Si no se define, se usa el remitente (como antes). |

`backend/.env` no se versiona; `backend/.env.example` solo contiene valores ilustrativos.

## Configurar Resend

```
MAIL_PROVIDER=resend
RESEND_API_KEY=re_...          # desde el panel de Resend
RESEND_FROM="Horus Group <noreply@su-dominio-verificado>"
MAIL_NOTIFY_TO=equipo@su-dominio  # opcional
```

El remitente real siempre es `RESEND_FROM`; los módulos solo aportan el nombre visible (por ejemplo «Horus Group - Reclamaciones»).

### Limitación actual: sin dominio verificado

Mientras no exista un dominio propio verificado en Resend solo puede usarse el remitente de pruebas de Resend (`onboarding@resend.dev`), y Resend únicamente entrega a la dirección del titular de la cuenta. Por tanto **no pueden activarse envíos generales a destinatarios reales** (suscriptores, reclamantes, contactos). Sirve para desarrollo y pruebas controladas dirigidas al titular. Para producción: verificar el dominio (registros SPF y DKIM) y usar un remitente de ese dominio.

## Configurar Gmail

```
MAIL_PROVIDER=gmail
MAIL_USER=cuenta@gmail.com
MAIL_PASS=contraseña_de_aplicación
```

Requiere verificación en dos pasos y una contraseña de aplicación, y que la red permita SMTP (algunos hostings lo bloquean).

## Qué correos envía Horus

| Origen | Contenido |
|---|---|
| Recuperación de contraseña de administradores | Texto con enlace de un solo uso, vence en 30 minutos. Siempre se responde de forma genérica. |
| Contacto web | Aviso interno + confirmación al remitente (HTML). |
| Libro de Reclamaciones | Constancia HTML al reclamante con copia oculta interna. |
| Panel: reenvío de constancias | Reutiliza las dos plantillas anteriores. |
| Panel: seguimiento de consultas | Respuesta en texto al solicitante. |
| Cotizaciones | Cotización en texto al cliente. |
| Newsletter | Confirmación con enlace de baja. |

## Errores y resultados inciertos

`sendMail` devuelve `true` solo si el proveedor **aceptó** el mensaje. Aceptado no significa entregado: Resend confirma la entrega por webhooks, que no están integrados. Los registros distinguen:

- **No enviado**: configuración incompleta, clave inválida, remitente o dominio no autorizado, límite de envío, datos rechazados.
- **Incierto**: tiempo de espera (10 s), red caída, respuesta ilegible, 408/502/504. No se reintenta automáticamente porque podría duplicar el correo.

Los registros solo contienen categorías propias: nunca la clave, el cuerpo de la respuesta ni direcciones de correo. A los usuarios solo llegan los mensajes genéricos ya existentes.

## Despliegue

Solo se necesitan variables de entorno (Railway, Vercel, VPS o Docker Compose); no hay archivos ni servicios adicionales. Resend usa HTTPS saliente (443), por lo que funciona incluso donde SMTP está bloqueado.

## Envíos con resultado incierto: riesgo y propuesta

### Situación actual
`sendMail` devuelve un booleano: `true` solo si el proveedor aceptó el mensaje; `false` tanto si falló como si el resultado es **incierto** (tiempo de espera, red caída, respuesta ilegible, 408/502/504). Los registros sí los distinguen, pero los consumidores no pueden. No hay reintentos automáticos en ningún caso.

Sitios donde un `false` incierto puede inducir un reenvío que duplique el correo:

| Origen | Mensaje actual | Riesgo |
|---|---|---|
| Panel: respuesta de seguimiento (`attention.service`, `send`) | «…el correo no pudo enviarse. Puedes reintentar el envío.» | Alto: invita a reenviar. |
| Panel: cotización (`cotizaciones.service`) | «…Reintenta el envío.» | Alto: el cliente podría recibir dos cotizaciones. |
| Panel: reenviar constancia/aviso (`attention.service`, `receipt`) | «…no pudo entregarse. Revisa la configuración de correo.» | Medio: sugiere un problema de configuración. |
| Contacto web y Libro de Reclamaciones | `correo_enviado: false` | Bajo: los textos públicos ya dicen que no hace falta reenviar. |
| Newsletter | `correo_enviado: false` | Bajo. |
| Contacto web: dos correos por solicitud | Si el aviso interno se acepta y el de confirmación es incierto (o al revés), el resultado es `false` aunque uno ya se envió. | Medio. |

### Propuesta (no implementada: exige cambiar contratos, consumidores o frontend)
1. **Estado explícito.** Hacer público `deliver()` (ya existe) como método principal, con `accepted | failed | uncertain`, y dejar `sendMail` como envoltorio compatible (`accepted → true`).
2. **Consumidores del panel** (respuestas y cotizaciones): ante `uncertain`, responder con un mensaje distinto («No pudimos confirmar si el correo salió. Comprueba con el destinatario antes de reenviarlo») y **no** ofrecer «reintentar»; solo `failed` conserva el reintento.
3. **Contratos HTTP.** Añadir `correo_estado` junto a `correo_enviado` (que seguiría siendo booleano) en Contacto, Libro y Newsletter; el frontend decidiría el texto sin romper clientes antiguos.
4. **Contacto con dos correos.** Devolver el estado de cada uno por separado en vez de combinarlos con `&&`.
5. **Idempotencia.** Enviar a Resend una cabecera `Idempotency-Key` estable (por ejemplo `tipo:id:revisión`), lo que permitiría reintentar un envío incierto sin duplicados durante la ventana de validez de la clave.
6. **Persistencia opcional.** Guardar el último estado de envío en la entidad (requiere cambio de base de datos).
7. **Entrega real.** Integrar webhooks de Resend (`email.delivered`, `email.bounced`) para distinguir «aceptado» de «entregado».

## Pruebas y aislamiento de secretos
- `npm test` precarga `test/isolate-env.cjs`. Importar `@prisma/client` carga `backend/.env` en `process.env`; la precarga fuerza esa carga y elimina las variables que aporta, de modo que las pruebas nunca ven credenciales reales.
- Las pruebas de correo usan una configuración ficticia propia (no `ConfigService`, que también lee `process.env`), bloquean `fetch` por defecto y comprueban con mensajes fijos —sin imprimir valores— que el entorno está limpio.
- Para ejecutar un archivo suelto: `node --test -r ./test/isolate-env.cjs -r ts-node/register test/mail-providers.test.ts`.
