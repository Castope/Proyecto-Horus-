"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAdminItem = exports.updateAdminItem = exports.createAdminItem = exports.getAdminItem = exports.getAdminItems = void 0;
const AdminItem_1 = __importDefault(require("../models/AdminItem"));
const panelValidators_1 = require("../validators/panelValidators");
const handleError = (res, error, action) => {
    if (error instanceof panelValidators_1.ValidationError)
        res.status(400).json({ ok: false, mensaje: error.message });
    else {
        console.error(`Error al ${action} item:`, error);
        res.status(500).json({ ok: false, mensaje: `No se pudo ${action} el elemento.` });
    }
};
const getAdminItems = async (_req, res) => {
    try {
        res.json({ ok: true, items: await AdminItem_1.default.findAll({ order: [['createdAt', 'DESC']] }) });
    }
    catch (error) {
        handleError(res, error, 'obtener');
    }
};
exports.getAdminItems = getAdminItems;
const getAdminItem = async (req, res) => {
    try {
        const rawId = Array.isArray(req.params.id) ? '' : req.params.id;
        const item = await AdminItem_1.default.findByPk((0, panelValidators_1.validateId)(rawId));
        if (!item) {
            res.status(404).json({ ok: false, mensaje: 'Elemento no encontrado.' });
            return;
        }
        res.json({ ok: true, item });
    }
    catch (error) {
        handleError(res, error, 'obtener');
    }
};
exports.getAdminItem = getAdminItem;
const createAdminItem = async (req, res) => {
    try {
        const item = await AdminItem_1.default.create((0, panelValidators_1.validateItem)(req.body));
        res.status(201).json({ ok: true, mensaje: 'Elemento creado correctamente.', item });
    }
    catch (error) {
        handleError(res, error, 'crear');
    }
};
exports.createAdminItem = createAdminItem;
const updateAdminItem = async (req, res) => {
    try {
        const rawId = Array.isArray(req.params.id) ? '' : req.params.id;
        const item = await AdminItem_1.default.findByPk((0, panelValidators_1.validateId)(rawId));
        if (!item) {
            res.status(404).json({ ok: false, mensaje: 'Elemento no encontrado.' });
            return;
        }
        await item.update((0, panelValidators_1.validateItem)(req.body, true));
        res.json({ ok: true, mensaje: 'Elemento actualizado correctamente.', item });
    }
    catch (error) {
        handleError(res, error, 'actualizar');
    }
};
exports.updateAdminItem = updateAdminItem;
const deleteAdminItem = async (req, res) => {
    try {
        const rawId = Array.isArray(req.params.id) ? '' : req.params.id;
        const item = await AdminItem_1.default.findByPk((0, panelValidators_1.validateId)(rawId));
        if (!item) {
            res.status(404).json({ ok: false, mensaje: 'Elemento no encontrado.' });
            return;
        }
        await item.destroy();
        res.json({ ok: true, mensaje: 'Elemento eliminado correctamente.' });
    }
    catch (error) {
        handleError(res, error, 'eliminar');
    }
};
exports.deleteAdminItem = deleteAdminItem;
