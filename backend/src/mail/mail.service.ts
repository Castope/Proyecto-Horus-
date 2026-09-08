import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    const user = this.configService.get<string>('MAIL_USER');
    const pass = this.configService.get<string>('MAIL_PASS');

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });
  }

  async sendMail(options: nodemailer.SendMailOptions): Promise<void> {
    try {
      await this.transporter.sendMail(options);
      this.logger.log(`Correo enviado exitosamente a ${options.to}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(`Error al enviar correo a ${options.to}: ${message}`);
    }
  }

  async sendReclamoConstancia(datos: {
    email: string;
    nombres: string;
    apellidos: string;
    tipo_registro: string;
    numero_reclamo: string;
    area: string;
    detalle_reclamo: string;
  }): Promise<void> {
    const sender = this.configService.get<string>('MAIL_USER');
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #1a3a6b; margin-bottom: 8px;">Horus Group SRL</h2>
        <h3 style="color: #333; margin-top: 0;">Constancia de Registro de ${datos.tipo_registro.toUpperCase()}</h3>
        <p>Estimado(a) <strong>${datos.nombres} ${datos.apellidos}</strong>,</p>
        <p>Hemos registrado su solicitud en nuestro Libro de Reclamaciones con el siguiente código:</p>
        <div style="background: #f0f4f8; padding: 12px; border-left: 4px solid #1a3a6b; font-size: 1.2rem; font-weight: bold; margin: 16px 0;">
          Código: ${datos.numero_reclamo}
        </div>
        <p><strong>Área:</strong> ${datos.area}</p>
        <p><strong>Detalle:</strong></p>
        <blockquote style="background: #fafafa; padding: 10px; border: 1px solid #eee; margin: 8px 0;">
          ${datos.detalle_reclamo}
        </blockquote>
        <p style="color: #666; font-size: 0.9rem; margin-top: 24px;">
          Conforme a ley, daremos respuesta a su requerimiento en un plazo no mayor a 15 días hábiles.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <small style="color: #999;">Horus Group SRL · RUC 20608552174</small>
      </div>
    `;

    await this.sendMail({
      from: `"Horus Group - Reclamaciones" <${sender}>`,
      to: datos.email,
      bcc: sender,
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
  }): Promise<void> {
    const sender = this.configService.get<string>('MAIL_USER');

    // Correo para el administrador
    await this.sendMail({
      from: `"Web Horus Group" <${sender}>`,
      to: sender,
      subject: `Nuevo mensaje web: ${datos.asunto}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #1a2e4a; margin-bottom: 12px;">Nuevo mensaje de contacto web</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px; font-weight: bold; width: 120px;">Nombre:</td><td style="padding: 8px;">${datos.nombre}</td></tr>
            <tr style="background: #f9f9f9;"><td style="padding: 8px; font-weight: bold;">Email:</td><td style="padding: 8px;"><a href="mailto:${datos.email}">${datos.email}</a></td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Teléfono:</td><td style="padding: 8px;">${datos.telefono || 'No proporcionado'}</td></tr>
            <tr style="background: #f9f9f9;"><td style="padding: 8px; font-weight: bold;">Asunto:</td><td style="padding: 8px;">${datos.asunto}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold; vertical-align: top;">Mensaje:</td><td style="padding: 8px; white-space: pre-wrap;">${datos.mensaje}</td></tr>
          </table>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <small style="color: #999;">Horus Group SRL · Notificación del sistema</small>
        </div>
      `,
    });

    // Correo de confirmación para el usuario remitente
    await this.sendMail({
      from: `"Horus Group SRL" <${sender}>`,
      to: datos.email,
      subject: 'Recibimos tu mensaje - Horus Group SRL',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #1a2e4a; margin-bottom: 12px;">Hola ${datos.nombre},</h2>
          <p>Hemos recibido tu mensaje correctamente a través de nuestra web. Nuestro equipo lo revisará y nos comunicaremos contigo a la brevedad posible.</p>
          <p><strong>Asunto:</strong> ${datos.asunto}</p>
          <br>
          <p style="color: #555; margin-bottom: 4px;">Atentamente,</p>
          <strong style="color: #1a2e4a;">Equipo Horus Group SRL</strong>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <small style="color: #999;">Horus Group SRL · RUC 20608552174</small>
        </div>
      `,
    });
  }
}
