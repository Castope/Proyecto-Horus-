import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'cursos', timestamps: true })
export class Curso extends Model {
  @Column({ type: DataType.STRING(160), allowNull: false, })
  declare titulo: string;
  @Column({ type: DataType.STRING(180), allowNull: false, unique: true, })
  declare slug: string;
  @Column({ type: DataType.TEXT, allowNull: false, })
  declare descripcion: string;
  @Column({ type: DataType.ENUM('curso', 'capacitacion'), allowNull: false, })
  declare tipo: string;
  @Column({ type: DataType.ENUM('presencial', 'virtual', 'hibrida'), allowNull: false, })
  declare modalidad: string;
  @Column({ type: DataType.STRING(120), allowNull: false, })
  declare duracion: string;
  @Column({ type: DataType.TEXT, allowNull: true, })
  declare temario: string;
  @Column({ type: DataType.STRING(2048), allowNull: true, })
  declare imagen_url: string;
  @Column({ type: DataType.DATE, allowNull: true, })
  declare fecha_inicio: Date;
  @Column({ type: DataType.ENUM('borrador', 'publicado', 'archivado'), allowNull: false, defaultValue: 'borrador', })
  declare estado: string;
}

@Table({ tableName: 'servicios', timestamps: true })
export class Servicio extends Model {
  @Column({ type: DataType.STRING(160), allowNull: false, })
  declare titulo: string;
  @Column({ type: DataType.STRING(180), allowNull: false, unique: true, })
  declare slug: string;
  @Column({ type: DataType.TEXT, allowNull: false, })
  declare descripcion: string;
  @Column({ type: DataType.ENUM('cableado', 'camaras', 'soporte', 'asesoramiento', 'otros'), allowNull: false, })
  declare categoria: string;
  @Column({ type: DataType.TEXT, allowNull: true, })
  declare alcance: string;
  @Column({ type: DataType.STRING(2048), allowNull: true, })
  declare imagen_url: string;
  @Column({ type: DataType.ENUM('borrador', 'publicado', 'archivado'), allowNull: false, defaultValue: 'borrador', })
  declare estado: string;
}

@Table({ tableName: 'preguntas_frecuentes', timestamps: true })
export class PreguntaFrecuente extends Model {
  @Column({ type: DataType.STRING(300), allowNull: false, })
  declare pregunta: string;
  @Column({ type: DataType.TEXT, allowNull: false, })
  declare respuesta: string;
  @Column({ type: DataType.STRING(100), allowNull: false, })
  declare categoria: string;
  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0, })
  declare orden: number;
  @Column({ type: DataType.ENUM('borrador', 'publicado', 'archivado'), allowNull: false, defaultValue: 'borrador', })
  declare estado: string;
}
