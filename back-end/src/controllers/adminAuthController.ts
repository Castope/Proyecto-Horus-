import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import AdminUser from '../models/AdminUser';
import type { AuthenticatedRequest } from '../middleware/authMiddleware';

const JWT_SECRET = process.env.JWT_SECRET || 'horus-admin-secret';

const crearToken = (user: AdminUser): string => {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '8h' });
};

export const registerAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
      res.status(400).json({ ok: false, mensaje: 'Nombre, email y contraseña son obligatorios.' });
      return;
    }

    const emailNormalizado = String(email).trim().toLowerCase();

    const existe = await AdminUser.findOne({ where: { email: emailNormalizado } });
    if (existe) {
      res.status(409).json({ ok: false, mensaje: 'Ya existe un administrador con ese correo.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await AdminUser.create({
      nombre: String(nombre).trim(),
      email: emailNormalizado,
      password: passwordHash,
    });

    const token = crearToken(user);

    res.status(201).json({
      ok: true,
      mensaje: 'Administrador registrado correctamente.',
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Error al registrar admin:', error);
    res.status(500).json({ ok: false, mensaje: 'Error interno del servidor.' });
  }
};

export const loginAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ ok: false, mensaje: 'Email y contraseña son obligatorios.' });
      return;
    }

    const user = await AdminUser.findOne({ where: { email: String(email).trim().toLowerCase() } });

    if (!user) {
      res.status(401).json({ ok: false, mensaje: 'Credenciales incorrectas.' });
      return;
    }

    const passwordValida = await bcrypt.compare(password, user.password);
    if (!passwordValida) {
      res.status(401).json({ ok: false, mensaje: 'Credenciales incorrectas.' });
      return;
    }

    const token = crearToken(user);

    res.json({
      ok: true,
      mensaje: 'Login correcto.',
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ ok: false, mensaje: 'Error interno del servidor.' });
  }
};

export const getCurrentAdmin = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ ok: false, mensaje: 'No autorizado.' });
      return;
    }

    res.json({
      ok: true,
      user: req.user,
    });
  } catch (error) {
    console.error('Error al obtener admin:', error);
    res.status(500).json({ ok: false, mensaje: 'Error interno del servidor.' });
  }
};
