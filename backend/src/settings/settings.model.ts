import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, Unique } from 'sequelize-typescript';

@Table({ tableName: 'empresa_settings', timestamps: true })
export class Setting extends Model<Setting> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id: number;

  @Unique
  @Column({ type: DataType.STRING(50), allowNull: false })
  clave: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  valor: string;

  @Column({ type: DataType.STRING(200), allowNull: true })
  descripcion: string;

  @Column({ type: DataType.STRING(50), allowNull: false, defaultValue: 'general' })
  grupo: string;
}
