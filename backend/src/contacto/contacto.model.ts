import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'contactos', timestamps: true })
export class Contacto extends Model<Contacto> {
  @Column({ type: DataType.STRING, allowNull: false })
  nombre: string;

  @Column({ type: DataType.STRING, allowNull: false })
  email: string;

  @Column({ type: DataType.STRING, allowNull: false })
  telefono: string;

  @Column({ type: DataType.STRING, allowNull: false })
  asunto: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  mensaje: string;

  @Column({ type: DataType.STRING, allowNull: false, defaultValue: 'nuevo' })
  estado: string;
}
