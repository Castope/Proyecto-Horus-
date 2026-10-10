# Procedimiento externo propuesto: atención de reclamaciones y quejas

> **Estado: PROPUESTA — NO IMPLANTADA.** Este documento describe un procedimiento que **todavía no existe en operación**.
> Todo lo marcado como **[PENDIENTE DE APROBACIÓN]** debe ser decidido por el responsable del proyecto y de Horus Group SRL.
> No se ha inventado ningún responsable, buzón, sistema ni plazo interno. No debe usarse como único mecanismo de atención
> hasta completar la sección 12 («Condiciones previas a depender de este procedimiento»).

## 1. Contexto y motivo

El panel administrativo de Horus **ya no ofrece** una pantalla para revisar, responder, archivar ni consultar las reclamaciones
(se retiró la sección «Reclamaciones» y la tarjeta correspondiente del resumen). Lo que **sí se conserva**:

- El formulario público del Libro de Reclamaciones.
- El almacenamiento de cada registro en la tabla `reclamaciones` de MySQL (historial intacto).
- Los endpoints administrativos del backend (`/api/admin/reclamaciones` y `/api/admin/seguimiento/reclamaciones/:id`), que
  siguen existiendo pero **no tienen interfaz** en el panel.
- La constancia de recepción enviada por correo a la persona (si el envío funciona).

Mientras no exista una interfaz, la atención debe apoyarse en un mecanismo externo. Este documento propone cómo hacerlo.

## 2. Datos que hoy guarda cada registro (verificados en el código)

Número de reclamo (`HG-AAAAMMDD-<UUID>`), nombres, apellidos, tipo y número de documento, correo, teléfono, dirección,
tipo de registro (`queja` o `reclamo`), área, fecha del incidente, bien o servicio, detalle, aceptación de comunicaciones y
fecha de registro. El texto público promete una respuesta en **un plazo máximo de 15 días hábiles**.

El registro **no** almacena hoy un responsable asignado visible, fecha de respuesta ni evidencia de respuesta fuera del
seguimiento administrativo (`attention_records`), que ya no tiene interfaz.

## 3. Responsables

| Rol | Persona / cargo | Estado |
| --- | --- | --- |
| Responsable de atención del Libro de Reclamaciones | — | **[PENDIENTE DE APROBACIÓN]** |
| Suplente (ausencias y vencimientos) | — | **[PENDIENTE DE APROBACIÓN]** |
| Responsable técnico de la reconciliación de registros | — | **[PENDIENTE DE APROBACIÓN]** |
| Responsable de protección de datos | — | **[PENDIENTE DE APROBACIÓN]** |

## 4. Canal y sistema de gestión

| Elemento | Propuesta | Estado |
| --- | --- | --- |
| Buzón corporativo que recibe el aviso de nuevos registros | — | **[PENDIENTE DE APROBACIÓN]** (no se asume ninguna dirección) |
| Sistema de seguimiento (hoja de control compartida, gestor de tickets u otro) | — | **[PENDIENTE DE APROBACIÓN]**; debe tener control de acceso y trazabilidad de cambios |
| Fuente de verdad de los registros | Tabla `reclamaciones` de MySQL | Existente |

Los avisos por correo **no son la fuente de verdad**: el registro en MySQL sí lo es.

## 5. Acceso seguro a los registros

1. Un **único** punto de consulta autorizado (por ejemplo, una exportación periódica de solo lectura realizada por la persona
   técnica responsable, o un endpoint administrativo consultado por una herramienta autorizada). **[PENDIENTE DE APROBACIÓN]**
2. Acceso con cuenta nominal; nunca compartir contraseñas ni tokens JWT.
3. Los archivos exportados contienen datos personales: almacenarlos solo en el sistema aprobado, con acceso restringido,
   y no enviarlos por canales no corporativos.
4. Registrar quién consulta o exporta y cuándo.

## 6. Identificador, recepción y plazo

- **Identificador del caso:** el `numero_reclamo` generado por el sistema. No se renumera.
- **Fecha de recepción:** la fecha de registro (`createdAt`).
- **Plazo de respuesta:** 15 días hábiles contados desde la recepción, según el texto público actual. Falta definir y aprobar
  el calendario de días hábiles aplicable y el criterio de cómputo. **[PENDIENTE DE APROBACIÓN]**
- Toda reclamación debe incorporarse al sistema de seguimiento externo dentro de un plazo máximo de revisión
  (por ejemplo, un día hábil). **[PENDIENTE DE APROBACIÓN]**

## 7. Clasificación y estados

- Clasificar cada caso como **queja** o **reclamo** según el campo `tipo_registro`; revisar manualmente si la descripción
  indica una clasificación distinta y dejar constancia.
- Estados mínimos propuestos: `recibido` → `en análisis` → `respondido` → `cerrado` (más `vencido` como alerta).
  Definición definitiva **[PENDIENTE DE APROBACIÓN]**.

## 8. Asignación y respuesta

Para cada caso se registra, como mínimo:

- Responsable asignado y fecha de asignación.
- Fecha, medio (correo, teléfono u otro) y **evidencia** de la respuesta (copia del mensaje enviado o constancia).
- Estado final y fecha de cierre.

La respuesta debe ir al correo o contacto proporcionado por la persona. No se debe responder a destinatarios distintos.

## 9. Reconciliación de registros con notificación fallida

El backend registra el reclamo **antes** de enviar la constancia por correo. Si el correo falla, el registro igualmente existe
(la respuesta pública indica `correo_enviado: false`) y **puede pasar inadvertido** al no existir interfaz.

Procedimiento propuesto:

1. Revisión periódica (por ejemplo, diaria en días hábiles) de los registros nuevos directamente en el origen de datos aprobado,
   **sin depender** de que llegue un aviso por correo. **[PENDIENTE DE APROBACIÓN]** la periodicidad.
2. Comparar los registros contra el sistema de seguimiento externo; incorporar los que falten.
3. Si la constancia no llegó a la persona, enviarla manualmente desde el canal autorizado (un envío por caso; no reintentos
   automáticos cuando el resultado fue incierto).
4. Dejar constancia de la reconciliación (fecha, quién, casos incorporados).

Un correo «aceptado por el proveedor» no equivale a «entregado»; ver `backend/MAIL.md`.

## 10. Conservación y protección de datos

- Los registros históricos de MySQL **no se eliminan** como consecuencia de retirar la interfaz.
- Plazo de conservación de los registros y de las evidencias: **[PENDIENTE DE APROBACIÓN]** (debe alinearse con la
  política de privacidad y la normativa aplicable; este documento no la fija).
- Mínimo acceso necesario, sin copiar datos personales a canales informales, y destrucción segura de exportaciones temporales.
- Cualquier incidente (acceso indebido, envío al destinatario equivocado) se comunica de inmediato al responsable de
  protección de datos.

## 11. Alertas de vencimiento y contingencias

- Alertas escalonadas respecto al plazo de 15 días hábiles (por ejemplo, al llegar a 50 % y 80 % del plazo y el día del
  vencimiento) dirigidas al responsable y al suplente. Mecanismo y umbrales **[PENDIENTE DE APROBACIÓN]**.
- **Si el servicio de correo no está disponible:** continuar la revisión directa en el origen de datos; responder por otro
  canal autorizado; documentar la indisponibilidad.
- **Si la base de datos o el panel no están disponibles:** escalar al responsable técnico; mantener el plazo de respuesta
  y registrar el motivo de cualquier retraso.
- **Si no hay responsable disponible:** actúa el suplente; si tampoco, escalar a la dirección. **[PENDIENTE DE APROBACIÓN]**

## 12. Condiciones previas a depender de este procedimiento

Antes de que Horus dependa **exclusivamente** de este mecanismo para atender reclamaciones en producción debe:

1. Aprobarse formalmente por el responsable del proyecto y la dirección de Horus Group SRL.
2. Designarse responsable, suplente y buzón/sistema (sección 3 y 4).
3. Configurarse y **probarse** el acceso seguro a los registros y la reconciliación (sección 5 y 9) con datos ficticios.
4. Probarse las alertas de vencimiento y la contingencia por indisponibilidad de correo.
5. Definirse la conservación de datos (sección 10).
6. Comunicarse al personal involucrado.

Hasta que esto ocurra, el equipo debe considerar el riesgo de que reclamaciones nuevas **no tengan hoy ninguna pantalla interna**
desde la que revisarlas.
