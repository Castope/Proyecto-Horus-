"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentAdmin = exports.loginAdmin = exports.registerAdmin = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const AdminUser_1 = __importDefault(require("../models/AdminUser"));
const jwt_1 = require("../config/jwt");
const panelValidators_1 = require("../validators/panelValidators");
const publicUser = (user) => ({ id: user.id, nombre: user.nombre, email: user.email });
const sendError = (res, error) => {
    if (error instanceof panelValidators_1.ValidationError)
        res.status(400).json({ ok: false, mensaje: error.message });
    else {
        console.error('Error de autenticación del panel:', error);
        res.status(500).json({ ok: false, mensaje: 'Error interno del servidor.' });
    }
};
const registerAdmin = async (req, res) => {
    try {
        const { nombre, email, password } = (0, panelValidators_1.validateCredentials)(req.body, true);
        if (!nombre)
            throw new Error('No se pudo validar el nombre.');
        const exists = await AdminUser_1.default.findOne({ where: { email } });
        if (exists) {
            res.status(409).json({ ok: false, mensaje: 'Ya existe un administrador con ese correo.' });
            return;
        }
        const user = await AdminUser_1.default.create({ nombre, email, password: await bcryptjs_1.default.hash(password, 12) });
        res.status(201).json({ ok: true, mensaje: 'Administrador registrado correctamente.', token: (0, jwt_1.createAccessToken)({ id: user.id, email: user.email }), user: publicUser(user) });
    }
    catch (error) {
        sendError(res, error);
    }
};
exports.registerAdmin = registerAdmin;
const loginAdmin = async (req, res) => {
    try {
        const { email, password } = (0, panelValidators_1.validateCredentials)(req.body, false);
        const user = await AdminUser_1.default.findOne({ where: { email } });
        if (!user || !(await bcryptjs_1.default.compare(password, user.password))) {
            res.status(401).json({ ok: false, mensaje: 'Credenciales incorrectas.' });
            return;
        }
        res.json({ ok: true, mensaje: 'Login correcto.', token: (0, jwt_1.createAccessToken)({ id: user.id, email: user.email }), user: publicUser(user) });
    }
    catch (error) {
        sendError(res, error);
    }
};
exports.loginAdmin = loginAdmin;
const getCurrentAdmin = async (req, res) => {
    res.json({ ok: true, user: req.user });
};
exports.getCurrentAdmin = getCurrentAdmin;
