"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.enviarContacto = void 0;
const Contacto_1 = __importDefault(require("../models/Contacto"));
const mailer_1 = __importDefault(require("../config/mailer"));
const enviarContacto = async (req, res) => {
    try {
        const { nombre, email, telefono, asunto, mensaje } = req.body;
        const camposRequeridos = ['nombre', 'email', 'telefono', 'asunto', 'mensaje'];
        const faltantes = camposRequeridos.filter((campo) => !req.body[campo]);
        if (faltantes.length > 0) {
            res.status(400).json({ ok: false, mensaje: `Faltan campos obligatorios: ${faltantes.join(', ')}` });
            return;
        }
        await Contacto_1.default.create({ nombre, email, telefono, asunto, mensaje });
        res.status(201).json({ ok: true, mensaje: 'Mensaje enviado correctamente' });
        mailer_1.default.sendMail({
            from: `"Web Horus Group" <${process.env.MAIL_USER}>`,
            to: process.env.MAIL_USER,
            subject: `Nuevo mensaje web: ${asunto}`,
            html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">
          <h2 style="color:#1a2e4a;">Nuevo mensaje de contacto</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px;font-weight:bold;">Nombre:</td><td style="padding:8px;">${nombre}</td></tr>
            <tr style="background:#f5f5f5;"><td style="padding:8px;font-weight:bold;">Email:</td><td style="padding:8px;">${email}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;">Teléfono:</td><td style="padding:8px;">${telefono}</td></tr>
            <tr style="background:#f5f5f5;"><td style="padding:8px;font-weight:bold;">Asunto:</td><td style="padding:8px;">${asunto}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;">Mensaje:</td><td style="padding:8px;">${mensaje}</td></tr>
          </table>
        </div>
      `,
        }).catch((err) => console.error('Correo admin falló:', err.message));
        mailer_1.default.sendMail({
            from: `"Horus Group SRL" <${process.env.MAIL_USER}>`,
            to: email,
            subject: 'Recibimos tu mensaje - Horus Group SRL',
            html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">
          <h2 style="color:#1a2e4a;">Hola ${nombre},</h2>
          <p>Recibimos tu mensaje correctamente. Te responderemos a la brevedad.</p>
          <p><strong>Asunto:</strong> ${asunto}</p>
          <br>
          <p style="color:#888;">Equipo Horus Group SRL</p>
        </div>
      `,
        }).catch((err) => console.error('Correo usuario falló:', err.message));
    }
    catch (error) {
        console.error('Error en contacto:', error);
        res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
    }
};
exports.enviarContacto = enviarContacto;
