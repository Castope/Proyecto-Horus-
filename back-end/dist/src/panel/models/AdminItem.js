"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../../config/database"));
class AdminItem extends sequelize_1.Model {
}
AdminItem.init({
    id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    titulo: { type: sequelize_1.DataTypes.STRING(150), allowNull: false },
    descripcion: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
    categoria: { type: sequelize_1.DataTypes.STRING(50), allowNull: false, defaultValue: 'general' },
    estado: { type: sequelize_1.DataTypes.STRING(20), allowNull: false, defaultValue: 'activo' },
}, { sequelize: database_1.default, tableName: 'admin_items', timestamps: true });
exports.default = AdminItem;
