import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, Unique } from 'sequelize-typescript';

@Table({ tableName: 'newsletter_subscribers', timestamps: true })
export class Newsletter extends Model<Newsletter> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id: number;

  @Unique
  @Column({ type: DataType.STRING(254), allowNull: false })
  email: string;

  @Column({ type: DataType.STRING(100), allowNull: false, defaultValue: 'market' })
  interes: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  activo: boolean;
}
