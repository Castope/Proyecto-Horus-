"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const contactoRoutes_1 = __importDefault(require("./routes/contactoRoutes"));
const reclamacionRoutes_1 = __importDefault(require("./routes/reclamacionRoutes"));
const panel_1 = __importDefault(require("./panel"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: ['http://localhost:5173', 'http://localhost:4173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express_1.default.json());
app.use('/api/contacto', contactoRoutes_1.default);
app.use('/api/reclamaciones', reclamacionRoutes_1.default);
// El panel conserva este prefijo para que el frontend no necesite cambios.
app.use('/api/admin', panel_1.default);
exports.default = app;
