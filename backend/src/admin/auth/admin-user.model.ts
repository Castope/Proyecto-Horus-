import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, Unique } from 'sequelize-typescript';

@Table({ tableName: 'admin_users', timestamps: true })
export class AdminUser extends Model<AdminUser> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id: number;

  @Column({ type: DataType.STRING(100), allowNull: false })
  nombre: string;

  @Unique
  @Column({ type: DataType.STRING(254), allowNull: false })
  email: string;

  @Column({ type: DataType.STRING, allowNull: false })
  password: string;
}
