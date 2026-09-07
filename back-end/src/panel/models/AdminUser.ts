import { DataTypes, Model, type Optional } from 'sequelize';
import sequelize from '../../config/database';

interface AdminUserAttributes {
  id: number;
  nombre: string;
  email: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}

type AdminUserCreationAttributes = Optional<AdminUserAttributes, 'id' | 'createdAt' | 'updatedAt'>;

class AdminUser extends Model<AdminUserAttributes, AdminUserCreationAttributes> implements AdminUserAttributes {
  declare id: number;
  declare nombre: string;
  declare email: string;
  declare password: string;
  declare createdAt: Date;
  declare updatedAt: Date;
}

AdminUser.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nombre: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(254), allowNull: false, unique: true, validate: { isEmail: true } },
    password: { type: DataTypes.STRING, allowNull: false },
  },
  { sequelize, tableName: 'admin_users', timestamps: true },
);

export default AdminUser;
