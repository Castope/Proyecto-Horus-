"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMessage = exports.updateMessage = exports.createMessage = exports.getMessage = exports.getMessages = void 0;
const Contacto_1 = __importDefault(require("../../models/Contacto"));
const panelValidators_1 = require("../validators/panelValidators");
const handleError = (res, error, action) => {
    if (error instanceof panelValidators_1.ValidationError)
        res.status(400).json({ ok: false, mensaje: error.message });
    else {
        console.error(`Error al ${action} mensaje:`, error);
        res.status(500).json({ ok: false, mensaje: `No se pudo ${action} el mensaje.` });
    }
};
const rawId = (value) => Array.isArray(value) ? '' : value;
const getMessages = async (_req, res) => {
    try {
        res.json({ ok: true, messages: await Contacto_1.default.findAll({ order: [['createdAt', 'DESC']] }) });
    }
    catch (error) {
        handleError(res, error, 'obtener');
    }
};
exports.getMessages = getMessages;
const getMessage = async (req, res) => {
    try {
        const message = await Contacto_1.default.findByPk((0, panelValidators_1.validateId)(rawId(req.params.id)));
        if (!message) {
            res.status(404).json({ ok: false, mensaje: 'Mensaje no encontrado.' });
            return;
        }
        res.json({ ok: true, message });
    }
    catch (error) {
        handleError(res, error, 'obtener');
    }
};
exports.getMessage = getMessage;
const createMessage = async (req, res) => {
    try {
        const message = await Contacto_1.default.create({ ...(0, panelValidators_1.validateMessage)(req.body), estado: 'nuevo' });
        res.status(201).json({ ok: true, mensaje: 'Mensaje creado correctamente.', message });
    }
    catch (error) {
        handleError(res, error, 'crear');
    }
};
exports.createMessage = createMessage;
const updateMessage = async (req, res) => {
    try {
        const message = await Contacto_1.default.findByPk((0, panelValidators_1.validateId)(rawId(req.params.id)));
        if (!message) {
            res.status(404).json({ ok: false, mensaje: 'Mensaje no encontrado.' });
            return;
        }
        await message.update((0, panelValidators_1.validateMessageStatus)(req.body));
        res.json({ ok: true, mensaje: 'Estado del mensaje actualizado.', message });
    }
    catch (error) {
        handleError(res, error, 'actualizar');
    }
};
exports.updateMessage = updateMessage;
const deleteMessage = async (req, res) => {
    try {
        const message = await Contacto_1.default.findByPk((0, panelValidators_1.validateId)(rawId(req.params.id)));
        if (!message) {
            res.status(404).json({ ok: false, mensaje: 'Mensaje no encontrado.' });
            return;
        }
        await message.destroy();
        res.json({ ok: true, mensaje: 'Mensaje eliminado correctamente.' });
    }
    catch (error) {
        handleError(res, error, 'eliminar');
    }
};
exports.deleteMessage = deleteMessage;
