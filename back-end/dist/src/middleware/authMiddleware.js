"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const AdminUser_1 = __importDefault(require("../models/AdminUser"));
const JWT_SECRET = process.env.JWT_SECRET || 'horus-admin-secret';
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ ok: false, mensaje: 'Token no válido o faltante.' });
            return;
        }
        const token = authHeader.split(' ')[1];
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const user = await AdminUser_1.default.findByPk(decoded.id);
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
    }
    catch (error) {
        console.error('Error en authMiddleware:', error);
        res.status(401).json({ ok: false, mensaje: 'Token inválido o expirado.' });
    }
};
exports.authMiddleware = authMiddleware;
