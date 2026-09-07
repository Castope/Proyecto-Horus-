import type { Response } from 'express';
import Contacto from '../../models/Contacto';
import type { AuthenticatedRequest } from '../middleware/authMiddleware';
import { ValidationError, validateId, validateMessage, validateMessageStatus } from '../validators/panelValidators';

const handleError = (res: Response, error: unknown, action: string): void => {
  if (error instanceof ValidationError) res.status(400).json({ ok: false, mensaje: error.message });
  else { console.error(`Error al ${action} mensaje:`, error); res.status(500).json({ ok: false, mensaje: `No se pudo ${action} el mensaje.` }); }
};

const rawId = (value: string | string[]): string => Array.isArray(value) ? '' : value;

export const getMessages = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try { res.json({ ok: true, messages: await Contacto.findAll({ order: [['createdAt', 'DESC']] }) }); }
  catch (error) { handleError(res, error, 'obtener'); }
};

export const getMessage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const message = await Contacto.findByPk(validateId(rawId(req.params.id)));
    if (!message) { res.status(404).json({ ok: false, mensaje: 'Mensaje no encontrado.' }); return; }
    res.json({ ok: true, message });
  } catch (error) { handleError(res, error, 'obtener'); }
};

export const createMessage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try { const message = await Contacto.create({ ...validateMessage(req.body), estado: 'nuevo' }); res.status(201).json({ ok: true, mensaje: 'Mensaje creado correctamente.', message }); }
  catch (error) { handleError(res, error, 'crear'); }
};

export const updateMessage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const message = await Contacto.findByPk(validateId(rawId(req.params.id)));
    if (!message) { res.status(404).json({ ok: false, mensaje: 'Mensaje no encontrado.' }); return; }
    await message.update(validateMessageStatus(req.body));
    res.json({ ok: true, mensaje: 'Estado del mensaje actualizado.', message });
  } catch (error) { handleError(res, error, 'actualizar'); }
};

export const deleteMessage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const message = await Contacto.findByPk(validateId(rawId(req.params.id)));
    if (!message) { res.status(404).json({ ok: false, mensaje: 'Mensaje no encontrado.' }); return; }
    await message.destroy();
    res.json({ ok: true, mensaje: 'Mensaje eliminado correctamente.' });
  } catch (error) { handleError(res, error, 'eliminar'); }
};
