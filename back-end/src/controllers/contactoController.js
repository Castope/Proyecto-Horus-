const Contacto = require('../models/Contacto');
const transporter = require('../config/mailer');

exports.enviarContacto = async (req, res) => {
  try {
    const { nombre, email, telefono, asunto, mensaje } = req.body;
    
    // Lista de campos requeridos para validación más limpia
    const camposRequeridos = ['nombre', 'email', 'telefono', 'asunto', 'mensaje'];
    const faltantes = camposRequeridos.filter(campo => !req.body[campo]);

    if (faltantes.length > 0) {
      return res.status(400).json({ ok: false, mensaje: `Faltan campos obligatorios: ${faltantes.join(', ')}` });
    }

    await Contacto.create({ nombre, email, telefono, asunto, mensaje });
    res.status(201).json({ ok: true, mensaje: 'Mensaje enviado correctamente' });

    transporter.sendMail({
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
    }).catch(err => console.error('Correo admin falló:', err.message));

    transporter.sendMail({
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
    }).catch(err => console.error('Correo usuario falló:', err.message));

  } catch (error) {
    console.error('Error en contacto:', error);
    res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
  }
};
