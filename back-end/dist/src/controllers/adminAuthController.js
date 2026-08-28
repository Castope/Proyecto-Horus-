"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentAdmin = exports.loginAdmin = exports.registerAdmin = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const AdminUser_1 = __importDefault(require("../models/AdminUser"));
const JWT_SECRET = process.env.JWT_SECRET || 'horus-admin-secret';
const crearToken = (user) => {
    return jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '8h' });
};
const registerAdmin = async (req, res) => {
    try {
        const { nombre, email, password } = req.body;
        if (!nombre || !email || !password) {
            res.status(400).json({ ok: false, mensaje: 'Nombre, email y contraseña son obligatorios.' });
            return;
        }
        const emailNormalizado = String(email).trim().toLowerCase();
        const existe = await AdminUser_1.default.findOne({ where: { email: emailNormalizado } });
        if (existe) {
            res.status(409).json({ ok: false, mensaje: 'Ya existe un administrador con ese correo.' });
            return;
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        const user = await AdminUser_1.default.create({
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
    }
    catch (error) {
        console.error('Error al registrar admin:', error);
        res.status(500).json({ ok: false, mensaje: 'Error interno del servidor.' });
    }
};
exports.registerAdmin = registerAdmin;
const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ ok: false, mensaje: 'Email y contraseña son obligatorios.' });
            return;
        }
        const user = await AdminUser_1.default.findOne({ where: { email: String(email).trim().toLowerCase() } });
        if (!user) {
            res.status(401).json({ ok: false, mensaje: 'Credenciales incorrectas.' });
            return;
        }
        const passwordValida = await bcryptjs_1.default.compare(password, user.password);
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
    }
    catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).json({ ok: false, mensaje: 'Error interno del servidor.' });
    }
};
exports.loginAdmin = loginAdmin;
const getCurrentAdmin = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ ok: false, mensaje: 'No autorizado.' });
            return;
        }
        res.json({
            ok: true,
            user: req.user,
        });
    }
    catch (error) {
        console.error('Error al obtener admin:', error);
        res.status(500).json({ ok: false, mensaje: 'Error interno del servidor.' });
    }
};
exports.getCurrentAdmin = getCurrentAdmin;
