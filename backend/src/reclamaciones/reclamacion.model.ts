import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'reclamaciones', timestamps: true })
export class Reclamacion extends Model<Reclamacion> {
  @Column({ type: DataType.STRING, unique: true })
  numero_reclamo: string;

  @Column({ type: DataType.STRING, allowNull: false })
  nombres: string;

  @Column({ type: DataType.STRING, allowNull: false })
  apellidos: string;

  @Column({ type: DataType.STRING })
  tipo_doc: string;

  @Column({ type: DataType.STRING })
  num_doc: string;

  @Column({ type: DataType.STRING, allowNull: false })
  email: string;

  @Column({ type: DataType.STRING, allowNull: false })
  telefono: string;

  @Column({ type: DataType.STRING })
  direccion: string;

  @Column({ type: DataType.ENUM('reclamo', 'queja'), allowNull: false })
  tipo_registro: string;

  @Column({ type: DataType.STRING, allowNull: false })
  area: string;

  @Column({ type: DataType.DATEONLY, allowNull: false })
  fecha_incidente: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  descripcion_bien: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  detalle_reclamo: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  acepta_comunicaciones: boolean;
}
