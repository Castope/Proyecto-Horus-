import type { Request, Response } from 'express';
import Reclamacion from '../models/Reclamacion';
import transporter from '../config/mailer';

function generarNumeroReclamo(): string {
  const hoy = new Date();
  const fecha = hoy.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `HG-${fecha}-${rand}`;
}

export const registrarReclamo = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      nombres,
      apellidos,
      tipo_doc,
      num_doc,
      email,
      telefono,
      direccion,
      tipo_registro,
      area,
      fecha_incidente,
      descripcion_bien,
      detalle_reclamo,
      acepta_comunicaciones,
    } = req.body;

    if (!nombres || !apellidos || !email || !tipo_registro || !detalle_reclamo) {
      res.status(400).json({ ok: false, mensaje: 'Faltan campos obligatorios' });
      return;
    }

    const numero_reclamo = generarNumeroReclamo();

    await Reclamacion.create({
      numero_reclamo,
      nombres,
      apellidos,
      tipo_doc: tipo_doc || '',
      num_doc: num_doc || '',
      email,
      telefono,
      direccion,
      tipo_registro,
      area,
      fecha_incidente,
      descripcion_bien,
      detalle_reclamo,
      acepta_comunicaciones: !!acepta_comunicaciones,
    });

    res.json({ ok: true, numero_reclamo });

    transporter.sendMail({
      from: `"Web Horus Group" <${process.env.MAIL_USER}>`,
      to: process.env.MAIL_USER,
      subject: `Nuevo ${tipo_registro}: ${numero_reclamo}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">
          <h2 style="color:#1a2e4a;">Nuevo ${tipo_registro} registrado</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px;font-weight:bold;">N° Reclamo:</td><td style="padding:8px;">${numero_reclamo}</td></tr>
            <tr style="background:#f5f5f5;"><td style="padding:8px;font-weight:bold;">Nombre:</td><td style="padding:8px;">${nombres} ${apellidos}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;">Email:</td><td style="padding:8px;">${email}</td></tr>
            <tr style="background:#f5f5f5;"><td style="padding:8px;font-weight:bold;">Teléfono:</td><td style="padding:8px;">${telefono}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;">Área:</td><td style="padding:8px;">${area}</td></tr>
            <tr style="background:#f5f5f5;"><td style="padding:8px;font-weight:bold;">Fecha incidente:</td><td style="padding:8px;">${fecha_incidente}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;">Bien/Servicio:</td><td style="padding:8px;">${descripcion_bien}</td></tr>
            <tr style="background:#f5f5f5;"><td style="padding:8px;font-weight:bold;">Detalle:</td><td style="padding:8px;">${detalle_reclamo}</td></tr>
          </table>
        </div>
      `,
    }).catch((err: Error) => console.error('Correo admin falló:', err.message));

    transporter.sendMail({
      from: `"Horus Group SRL" <${process.env.MAIL_USER}>`,
      to: email,
      subject: `Tu ${tipo_registro} fue registrado - ${numero_reclamo}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">
          <h2 style="color:#1a2e4a;">Hola ${nombres},</h2>
          <p>Tu ${tipo_registro} ha sido registrado exitosamente.</p>
          <div style="background:#f5f5f5;padding:16px;border-radius:8px;margin:16px 0;">
            <strong>Número de seguimiento:</strong>
            <span style="font-size:1.2em;color:#1a2e4a;"> ${numero_reclamo}</span>
          </div>
          <p>Te responderemos en un plazo máximo de <strong>15 días hábiles</strong>.</p>
          <br>
          <p style="color:#888;">Equipo Horus Group SRL</p>
        </div>
      `,
    }).catch((err: Error) => console.error('Correo usuario falló:', err.message));
  } catch (error) {
    console.error('Error en reclamación:', error);
    res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
  }
};
