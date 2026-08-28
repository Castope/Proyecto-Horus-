"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const Reclamacion = database_1.default.define('Reclamacion', {
    numero_reclamo: { type: sequelize_1.DataTypes.STRING, unique: true },
    nombres: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    apellidos: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    tipo_doc: { type: sequelize_1.DataTypes.STRING },
    num_doc: { type: sequelize_1.DataTypes.STRING },
    email: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    telefono: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    direccion: { type: sequelize_1.DataTypes.STRING },
    tipo_registro: { type: sequelize_1.DataTypes.ENUM('reclamo', 'queja'), allowNull: false },
    area: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    fecha_incidente: { type: sequelize_1.DataTypes.DATEONLY, allowNull: false },
    descripcion_bien: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
    detalle_reclamo: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
    acepta_comunicaciones: { type: sequelize_1.DataTypes.BOOLEAN, defaultValue: false },
}, {
    tableName: 'reclamaciones',
    timestamps: true,
});
exports.default = Reclamacion;
