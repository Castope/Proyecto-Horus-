import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement } from 'sequelize-typescript';

@Table({ tableName: 'galeria_items', timestamps: true })
export class GaleriaItem extends Model<GaleriaItem> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id: number;

  @Column({ type: DataType.STRING(150), allowNull: false })
  titulo: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  descripcion: string;

  @Column({ type: DataType.STRING(50), allowNull: false, defaultValue: 'general' })
  categoria: string;

  @Column({ type: DataType.STRING(500), allowNull: false })
  imagen_url: string;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  orden: number;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  activo: boolean;
}
