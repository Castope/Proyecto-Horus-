"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const Contacto = database_1.default.define('Contacto', {
    nombre: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    email: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    telefono: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    asunto: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    mensaje: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
}, {
    tableName: 'contactos',
    timestamps: true,
});
exports.default = Contacto;
