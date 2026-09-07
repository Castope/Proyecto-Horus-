import type { NextFunction, Request, Response } from 'express';
import AdminUser from '../models/AdminUser';
import { verifyAccessToken } from '../config/jwt';

export interface AuthenticatedRequest extends Request {
  user?: { id: number; email: string; nombre: string };
}

export const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [scheme, token] = req.headers.authorization?.split(' ') ?? [];
    if (scheme !== 'Bearer' || !token) {
      res.status(401).json({ ok: false, mensaje: 'Token de acceso faltante o inválido.' });
      return;
    }

    const payload = verifyAccessToken(token);
    const user = await AdminUser.findByPk(payload.id);
    if (!user) {
      res.status(401).json({ ok: false, mensaje: 'Usuario no autorizado.' });
      return;
    }

    req.user = { id: user.id, email: user.email, nombre: user.nombre };
    next();
  } catch {
    res.status(401).json({ ok: false, mensaje: 'Token expirado o inválido.' });
  }
};
