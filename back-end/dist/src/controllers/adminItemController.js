"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAdminItem = exports.updateAdminItem = exports.createAdminItem = exports.getAdminItems = void 0;
const AdminItem_1 = __importDefault(require("../models/AdminItem"));
const getAdminItems = async (_req, res) => {
    try {
        const items = await AdminItem_1.default.findAll({
            order: [['createdAt', 'DESC']],
        });
        res.json({ ok: true, items });
    }
    catch (error) {
        console.error('Error al listar items:', error);
        res.status(500).json({ ok: false, mensaje: 'No se pudieron obtener los elementos.' });
    }
};
exports.getAdminItems = getAdminItems;
const createAdminItem = async (req, res) => {
    try {
        const { titulo, descripcion, categoria, estado } = req.body;
        if (!titulo || !descripcion) {
            res.status(400).json({ ok: false, mensaje: 'Título y descripción son obligatorios.' });
            return;
        }
        const item = await AdminItem_1.default.create({
            titulo: String(titulo).trim(),
            descripcion: String(descripcion).trim(),
            categoria: categoria || 'general',
            estado: estado || 'activo',
        });
        res.status(201).json({ ok: true, mensaje: 'Elemento creado correctamente.', item });
    }
    catch (error) {
        console.error('Error al crear item:', error);
        res.status(500).json({ ok: false, mensaje: 'No se pudo crear el elemento.' });
    }
};
exports.createAdminItem = createAdminItem;
const updateAdminItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, descripcion, categoria, estado } = req.body;
        const item = await AdminItem_1.default.findByPk(Number(id));
        if (!item) {
            res.status(404).json({ ok: false, mensaje: 'Elemento no encontrado.' });
            return;
        }
        await item.update({
            titulo: titulo ? String(titulo).trim() : item.titulo,
            descripcion: descripcion ? String(descripcion).trim() : item.descripcion,
            categoria: categoria || item.categoria,
            estado: estado || item.estado,
        });
        res.json({ ok: true, mensaje: 'Elemento actualizado correctamente.', item });
    }
    catch (error) {
        console.error('Error al actualizar item:', error);
        res.status(500).json({ ok: false, mensaje: 'No se pudo actualizar el elemento.' });
    }
};
exports.updateAdminItem = updateAdminItem;
const deleteAdminItem = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await AdminItem_1.default.findByPk(Number(id));
        if (!item) {
            res.status(404).json({ ok: false, mensaje: 'Elemento no encontrado.' });
            return;
        }
        await item.destroy();
        res.json({ ok: true, mensaje: 'Elemento eliminado correctamente.' });
    }
    catch (error) {
        console.error('Error al eliminar item:', error);
        res.status(500).json({ ok: false, mensaje: 'No se pudo eliminar el elemento.' });
    }
};
exports.deleteAdminItem = deleteAdminItem;
