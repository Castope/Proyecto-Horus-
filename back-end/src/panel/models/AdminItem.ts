import { DataTypes, Model, type Optional } from 'sequelize';
import sequelize from '../../config/database';

interface AdminItemAttributes {
  id: number;
  titulo: string;
  descripcion: string;
  categoria: string;
  estado: string;
  createdAt?: Date;
  updatedAt?: Date;
}

type AdminItemCreationAttributes = Optional<AdminItemAttributes, 'id' | 'createdAt' | 'updatedAt'>;

class AdminItem extends Model<AdminItemAttributes, AdminItemCreationAttributes> implements AdminItemAttributes {
  declare id: number;
  declare titulo: string;
  declare descripcion: string;
  declare categoria: string;
  declare estado: string;
  declare createdAt: Date;
  declare updatedAt: Date;
}

AdminItem.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    titulo: { type: DataTypes.STRING(150), allowNull: false },
    descripcion: { type: DataTypes.TEXT, allowNull: false },
    categoria: { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'general' },
    estado: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'activo' },
  },
  { sequelize, tableName: 'admin_items', timestamps: true },
);

export default AdminItem;
