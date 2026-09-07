import type { Response } from 'express';
import AdminItem from '../models/AdminItem';
import type { AuthenticatedRequest } from '../middleware/authMiddleware';
import { validateId, validateItem, ValidationError } from '../validators/panelValidators';

const handleError = (res: Response, error: unknown, action: string): void => {
  if (error instanceof ValidationError) res.status(400).json({ ok: false, mensaje: error.message });
  else { console.error(`Error al ${action} item:`, error); res.status(500).json({ ok: false, mensaje: `No se pudo ${action} el elemento.` }); }
};

export const getAdminItems = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try { res.json({ ok: true, items: await AdminItem.findAll({ order: [['createdAt', 'DESC']] }) }); }
  catch (error) { handleError(res, error, 'obtener'); }
};

export const getAdminItem = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const rawId = Array.isArray(req.params.id) ? '' : req.params.id;
    const item = await AdminItem.findByPk(validateId(rawId));
    if (!item) { res.status(404).json({ ok: false, mensaje: 'Elemento no encontrado.' }); return; }
    res.json({ ok: true, item });
  } catch (error) { handleError(res, error, 'obtener'); }
};

export const createAdminItem = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try { const item = await AdminItem.create(validateItem(req.body)); res.status(201).json({ ok: true, mensaje: 'Elemento creado correctamente.', item }); }
  catch (error) { handleError(res, error, 'crear'); }
};

export const updateAdminItem = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const rawId = Array.isArray(req.params.id) ? '' : req.params.id;
    const item = await AdminItem.findByPk(validateId(rawId));
    if (!item) { res.status(404).json({ ok: false, mensaje: 'Elemento no encontrado.' }); return; }
    await item.update(validateItem(req.body, true));
    res.json({ ok: true, mensaje: 'Elemento actualizado correctamente.', item });
  } catch (error) { handleError(res, error, 'actualizar'); }
};

export const deleteAdminItem = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const rawId = Array.isArray(req.params.id) ? '' : req.params.id;
    const item = await AdminItem.findByPk(validateId(rawId));
    if (!item) { res.status(404).json({ ok: false, mensaje: 'Elemento no encontrado.' }); return; }
    await item.destroy();
    res.json({ ok: true, mensaje: 'Elemento eliminado correctamente.' });
  } catch (error) { handleError(res, error, 'eliminar'); }
};
