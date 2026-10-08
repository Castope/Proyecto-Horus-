import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

const escapeHtml = (value: unknown): string => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]!));

export type MailProvider = 'resend' | 'gmail';
// accepted: el proveedor aceptó el mensaje (no implica entrega en la bandeja del destinatario).
// uncertain: no sabemos si el proveedor lo aceptó (timeout, red, respuesta ilegible): reenviar podría duplicarlo.
// failed: rechazado o no enviado.
export type MailOutcome = { status: 'accepted' | 'failed' | 'uncertain'; reason?: string };

export const MAIL_PROVIDERS: MailProvider[] = ['resend', 'gmail'];
const RESEND_URL = 'https://api.resend.com/emails';
const RESEND_TIMEOUT_MS = 10_000; // igual que el socketTimeout de Gmail

// Acepta "correo@dominio", "Nombre <correo@dominio>" o { name, address }.
export function parseMailbox(value: unknown): { name?: string; address: string } | undefined {
  let text = '';
  if (typeof value === 'string') text = value.trim();
  else if (value && typeof value === 'object' && typeof (value as { name?: string; address: string }).address === 'string') {
    const { name, address } = value as { name?: string; address: string };
    text = name ? '"' + name + '" <' + address + '>' : address;
  }
  if (!text) return undefined;
  const match = /^(?:"?([^"<]*?)"?\s*)?<([^<>\s]+)>$/.exec(text);
  const address = (match ? match[2] : text).trim();
  if (!/^[^\s@<>]+@[^\s@<>]+$/.test(address)) return undefined;
  return { name: match?.[1]?.trim() || undefined, address };
}
const addresses = (value: unknown): string[] => (Array.isArray(value) ? value : value === undefined || value === null ? [] : [value])
  .map(item => parseMailbox(item)?.address ?? '').filter(Boolean);

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private gmail?: nodemailer.Transporter;

  // No valida en el constructor: una configuración incompleta solo impide enviar y se informa sin exponer secretos.
  constructor(private readonly configService: ConfigService) {}

  // Selección explícita; sin MAIL_PROVIDER se conserva Gmail (instalaciones existentes). Nunca hay fallback entre proveedores.
  provider(): MailProvider | undefined {
    const value = String(this.configService.get<string>('MAIL_PROVIDER') ?? 'gmail').trim().toLowerCase();
    return (MAIL_PROVIDERS as string[]).includes(value) ? value as MailProvider : undefined;
  }

  // Dirección remitente del proveedor activo (la usan las plantillas para "from", copia y aviso interno).
  private sender(): string | undefined {
    return this.provider() === 'resend' ? parseMailbox(this.configService.get<string>('RESEND_FROM'))?.address : this.configService.get<string>('MAIL_USER');
  }

  // Destinatario interno de avisos (contacto y reclamos). MAIL_NOTIFY_TO es opcional; por defecto, el remitente como antes.
  private notifyTo(): string | undefined {
    return this.configService.get<string>('MAIL_NOTIFY_TO')?.trim() || this.sender();
  }

  async sendMail(options: nodemailer.SendMailOptions): Promise<boolean> {
    const outcome = await this.deliver(options);
    if (outcome.status === 'accepted') this.logger.log('Notificación aceptada por el proveedor (' + this.provider() + '); la entrega final no está confirmada.');
    else if (outcome.status === 'uncertain') this.logger.error('No se pudo confirmar si el proveedor aceptó la notificación (' + outcome.reason + '). No se reintenta para evitar duplicados.');
    else this.logger.error('No se pudo entregar la notificación (' + outcome.reason + ').');
    return outcome.status === 'accepted';
  }

  async deliver(options: nodemailer.SendMailOptions): Promise<MailOutcome> {
    const provider = this.provider();
    if (!provider) return { status: 'failed', reason: 'MAIL_PROVIDER inválido: usa resend o gmail' };
    return provider === 'resend' ? this.deliverResend(options) : this.deliverGmail(options);
  }

  private async deliverGmail(options: nodemailer.SendMailOptions): Promise<MailOutcome> {
    const user = this.configService.get<string>('MAIL_USER'), pass = this.configService.get<string>('MAIL_PASS');
    if (!user || !pass) return { status: 'failed', reason: 'configuración incompleta: faltan MAIL_USER o MAIL_PASS' };
    this.gmail ??= nodemailer.createTransport({ service: 'gmail', connectionTimeout: 5000, greetingTimeout: 5000, socketTimeout: 10000, auth: { user, pass } });
    try { await this.gmail.sendMail(options); return { status: 'accepted' }; }
    catch { return { status: 'failed', reason: 'SMTP rechazó o no pudo enviar; revisa la configuración SMTP' }; }
  }

  private async deliverResend(options: nodemailer.SendMailOptions): Promise<MailOutcome> {
    const key = this.configService.get<string>('RESEND_API_KEY')?.trim(), configured = parseMailbox(this.configService.get<string>('RESEND_FROM'));
    if (!key) return { status: 'failed', reason: 'configuración incompleta: falta RESEND_API_KEY' };
    if (!configured) return { status: 'failed', reason: 'configuración incompleta o inválida: RESEND_FROM' };
    if (options.attachments?.some(item => !item.content || item.path)) return { status: 'failed', reason: 'adjunto no compatible con Resend (solo contenido en memoria)' };
    const to = addresses(options.to);
    if (!to.length) return { status: 'failed', reason: 'sin destinatario válido' };
    // El remitente real es siempre RESEND_FROM (otro dominio sería rechazado); solo se conserva el nombre visible solicitado.
    const name = parseMailbox(options.from)?.name ?? configured.name;
    const body: Record<string, unknown> = { from: name ? '"' + name.replace(/"/g, '') + '" <' + configured.address + '>' : configured.address, to, subject: options.subject ?? '' };
    for (const [field, value] of [['cc', addresses(options.cc)], ['bcc', addresses(options.bcc)], ['reply_to', addresses(options.replyTo)]] as const) if (value.length) body[field] = value;
    if (typeof options.html === 'string') body.html = options.html;
    if (typeof options.text === 'string') body.text = options.text;
    if (options.attachments?.length) body.attachments = options.attachments.map(item => ({ filename: item.filename, content: Buffer.from(item.content as string | Buffer).toString('base64') }));

    const abort = new AbortController(), timer = setTimeout(() => abort.abort(), RESEND_TIMEOUT_MS);
    try {
      // Un único intento: reintentar un envío cuyo resultado se desconoce podría duplicar el correo.
      const response = await fetch(RESEND_URL, { method: 'POST', headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: abort.signal });
      if (response.ok) {
        const data = await response.json().catch(() => null) as { id?: unknown } | null;
        return typeof data?.id === 'string' && data.id ? { status: 'accepted' } : { status: 'uncertain', reason: 'respuesta ilegible de Resend' };
      }
      return this.resendFailure(response.status, await response.json().catch(() => null));
    } catch (error) {
      return { status: 'uncertain', reason: (error as { name?: string })?.name === 'AbortError' ? 'tiempo de espera agotado con Resend' : 'red caída o Resend inaccesible' };
    } finally { clearTimeout(timer); }
  }

  // Solo se registran categorías propias: ni el cuerpo de la respuesta ni la clave llegan a logs ni a usuarios.
  private resendFailure(status: number, data: unknown): MailOutcome {
    const message = String((data as { message?: unknown } | null)?.message ?? '').toLowerCase();
    if (status === 401) return { status: 'failed', reason: 'RESEND_API_KEY inválida' };
    if (status === 403) return { status: 'failed', reason: /domain|verif/.test(message) ? 'dominio de RESEND_FROM no verificado' : /testing|own email/.test(message) ? 'modo de prueba: solo puede enviar al correo del titular de la cuenta' : 'clave sin permiso o remitente no autorizado' };
    if (status === 400 || status === 422) return { status: 'failed', reason: /from/.test(message) ? 'remitente (RESEND_FROM) inválido' : 'Resend rechazó los datos del mensaje' };
    if (status === 429) return { status: 'failed', reason: 'límite de envío de Resend alcanzado' };
    if (status === 408 || status === 502 || status === 504) return { status: 'uncertain', reason: 'Resend respondió ' + status };
    return { status: 'failed', reason: 'Resend respondió ' + status };
  }

  async sendReclamoConstancia(datos: {
    email: string;
    nombres: string;
    apellidos: string;
    tipo_registro: string;
    numero_reclamo: string;
    area: string;
    detalle_reclamo: string;
  }): Promise<boolean> {
    const sender = this.sender(), notify = this.notifyTo();
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #1a3a6b; margin-bottom: 8px;">Horus Group SRL</h2>
        <h3 style="color: #333; margin-top: 0;">Constancia de Registro de ${escapeHtml(datos.tipo_registro.toUpperCase())}</h3>
        <p>Estimado(a) <strong>${escapeHtml(datos.nombres)} ${escapeHtml(datos.apellidos)}</strong>,</p>
        <p>Hemos registrado su solicitud en nuestro Libro de Reclamaciones con el siguiente código:</p>
        <div style="background: #f0f4f8; padding: 12px; border-left: 4px solid #1a3a6b; font-size: 1.2rem; font-weight: bold; margin: 16px 0;">
          Código: ${escapeHtml(datos.numero_reclamo)}
        </div>
        <p><strong>Área:</strong> ${escapeHtml(datos.area)}</p>
        <p><strong>Detalle:</strong></p>
        <blockquote style="background: #fafafa; padding: 10px; border: 1px solid #eee; margin: 8px 0;">
          ${escapeHtml(datos.detalle_reclamo)}
        </blockquote>
        <p style="color: #666; font-size: 0.9rem; margin-top: 24px;">
          Conforme a ley, daremos respuesta a su requerimiento en un plazo no mayor a 15 días hábiles.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <small style="color: #999;">Horus Group SRL · RUC 20608552174</small>
      </div>
    `;

    return this.sendMail({
      from: `"Horus Group - Reclamaciones" <${sender}>`,
      to: datos.email,
      bcc: notify,
      subject: `Constancia de Registro de ${datos.tipo_registro.toUpperCase()} - ${datos.numero_reclamo}`,
      html: htmlContent,
    });
  }

  async sendContactoNotificacion(datos: {
    nombre: string;
    email: string;
    telefono?: string;
    asunto: string;
    mensaje: string;
  }): Promise<boolean> {
    const sender = this.sender(), notify = this.notifyTo();

    // Correo para el administrador
    const adminSent = await this.sendMail({
      from: `"Web Horus Group" <${sender}>`,
      to: notify,
      subject: `Nuevo mensaje web: ${datos.asunto}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #1a2e4a; margin-bottom: 12px;">Nuevo mensaje de contacto web</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px; font-weight: bold; width: 120px;">Nombre:</td><td style="padding: 8px;">${escapeHtml(datos.nombre)}</td></tr>
            <tr style="background: #f9f9f9;"><td style="padding: 8px; font-weight: bold;">Email:</td><td style="padding: 8px;"><a href="mailto:${escapeHtml(datos.email)}">${escapeHtml(datos.email)}</a></td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Teléfono:</td><td style="padding: 8px;">${escapeHtml(datos.telefono || 'No proporcionado')}</td></tr>
            <tr style="background: #f9f9f9;"><td style="padding: 8px; font-weight: bold;">Asunto:</td><td style="padding: 8px;">${escapeHtml(datos.asunto)}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold; vertical-align: top;">Mensaje:</td><td style="padding: 8px; white-space: pre-wrap;">${escapeHtml(datos.mensaje)}</td></tr>
          </table>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <small style="color: #999;">Horus Group SRL · Notificación del sistema</small>
        </div>
      `,
    });

    // Correo de confirmación para el usuario remitente
    const userSent = await this.sendMail({
      from: `"Horus Group SRL" <${sender}>`,
      to: datos.email,
      subject: 'Recibimos tu mensaje - Horus Group SRL',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #1a2e4a; margin-bottom: 12px;">Hola ${escapeHtml(datos.nombre)},</h2>
          <p>Hemos recibido tu mensaje correctamente a través de nuestra web. Nuestro equipo lo revisará y nos comunicaremos contigo a la brevedad posible.</p>
          <p><strong>Asunto:</strong> ${escapeHtml(datos.asunto)}</p>
          <br>
          <p style="color: #555; margin-bottom: 4px;">Atentamente,</p>
          <strong style="color: #1a2e4a;">Equipo Horus Group SRL</strong>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <small style="color: #999;">Horus Group SRL · RUC 20608552174</small>
        </div>
      `,
    });
    return adminSent && userSent;
  }
}
