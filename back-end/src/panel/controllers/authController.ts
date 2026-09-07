import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import AdminUser from '../models/AdminUser';
import { createAccessToken } from '../config/jwt';
import type { AuthenticatedRequest } from '../middleware/authMiddleware';
import { validateCredentials, ValidationError } from '../validators/panelValidators';

const publicUser = (user: AdminUser) => ({ id: user.id, nombre: user.nombre, email: user.email });
const sendError = (res: Response, error: unknown): void => {
  if (error instanceof ValidationError) res.status(400).json({ ok: false, mensaje: error.message });
  else { console.error('Error de autenticación del panel:', error); res.status(500).json({ ok: false, mensaje: 'Error interno del servidor.' }); }
};

export const registerAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, email, password } = validateCredentials(req.body, true);
    if (!nombre) throw new Error('No se pudo validar el nombre.');
    const exists = await AdminUser.findOne({ where: { email } });
    if (exists) { res.status(409).json({ ok: false, mensaje: 'Ya existe un administrador con ese correo.' }); return; }
    const user = await AdminUser.create({ nombre, email, password: await bcrypt.hash(password, 12) });
    res.status(201).json({ ok: true, mensaje: 'Administrador registrado correctamente.', token: createAccessToken({ id: user.id, email: user.email }), user: publicUser(user) });
  } catch (error) { sendError(res, error); }
};

export const loginAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = validateCredentials(req.body, false);
    const user = await AdminUser.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) { res.status(401).json({ ok: false, mensaje: 'Credenciales incorrectas.' }); return; }
    res.json({ ok: true, mensaje: 'Login correcto.', token: createAccessToken({ id: user.id, email: user.email }), user: publicUser(user) });
  } catch (error) { sendError(res, error); }
};

export const getCurrentAdmin = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  res.json({ ok: true, user: req.user });
};
