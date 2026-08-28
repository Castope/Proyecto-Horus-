import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import AdminUser from '../models/AdminUser';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    nombre: string;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'horus-admin-secret';

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ ok: false, mensaje: 'Token no válido o faltante.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    const user = await AdminUser.findByPk(decoded.id);

    if (!user) {
      res.status(401).json({ ok: false, mensaje: 'Usuario no encontrado.' });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
    };

    next();
  } catch (error) {
    console.error('Error en authMiddleware:', error);
    res.status(401).json({ ok: false, mensaje: 'Token inválido o expirado.' });
  }
};
