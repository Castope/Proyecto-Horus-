import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement } from 'sequelize-typescript';

@Table({ tableName: 'admin_items', timestamps: true })
export class AdminItem extends Model<AdminItem> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id: number;

  @Column({ type: DataType.STRING(150), allowNull: false })
  titulo: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  descripcion: string;

  @Column({ type: DataType.STRING(50), allowNull: false, defaultValue: 'general' })
  categoria: string;

  @Column({ type: DataType.STRING(20), allowNull: false, defaultValue: 'activo' })
  estado: string;
}
