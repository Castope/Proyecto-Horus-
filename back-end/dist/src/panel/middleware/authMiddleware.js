"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const AdminUser_1 = __importDefault(require("../models/AdminUser"));
const jwt_1 = require("../config/jwt");
const authMiddleware = async (req, res, next) => {
    try {
        const [scheme, token] = req.headers.authorization?.split(' ') ?? [];
        if (scheme !== 'Bearer' || !token) {
            res.status(401).json({ ok: false, mensaje: 'Token de acceso faltante o inválido.' });
            return;
        }
        const payload = (0, jwt_1.verifyAccessToken)(token);
        const user = await AdminUser_1.default.findByPk(payload.id);
        if (!user) {
            res.status(401).json({ ok: false, mensaje: 'Usuario no autorizado.' });
            return;
        }
        req.user = { id: user.id, email: user.email, nombre: user.nombre };
        next();
    }
    catch {
        res.status(401).json({ ok: false, mensaje: 'Token expirado o inválido.' });
    }
};
exports.authMiddleware = authMiddleware;
