"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAccessToken = exports.createAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const getJwtSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length < 32) {
        throw new Error('JWT_SECRET debe estar configurado y tener al menos 32 caracteres.');
    }
    return secret;
};
const createAccessToken = (payload) => jsonwebtoken_1.default.sign(payload, getJwtSecret(), { expiresIn: '8h', issuer: 'horus-api', audience: 'horus-panel' });
exports.createAccessToken = createAccessToken;
const verifyAccessToken = (token) => jsonwebtoken_1.default.verify(token, getJwtSecret(), { issuer: 'horus-api', audience: 'horus-panel' });
exports.verifyAccessToken = verifyAccessToken;
