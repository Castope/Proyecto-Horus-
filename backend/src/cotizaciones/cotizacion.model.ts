import { Table, Column, Model, DataType } from 'sequelize-typescript';
@Table({ tableName: 'cotizaciones', timestamps: true })
export class Cotizacion extends Model {
  @Column({ type: DataType.STRING(60), allowNull: false, unique: true }) declare numero: string;
  @Column({ type: DataType.STRING(160), allowNull: false }) declare cliente: string;
  @Column({ type: DataType.STRING(254), allowNull: false }) declare email: string;
  @Column({ type: DataType.STRING(30), allowNull: false }) declare telefono: string;
  @Column({ type: DataType.STRING(30), allowNull: false }) declare documento: string;
  @Column({ type: DataType.STRING(300), allowNull: false }) declare direccion: string;
  @Column({ type: DataType.STRING(160), allowNull: false }) declare emisor: string;
  @Column({ type: DataType.STRING(500), allowNull: false }) declare datos_emisor: string;
  @Column({ type: DataType.STRING(3), allowNull: false }) declare moneda: string;
  @Column({ type: DataType.DATEONLY, allowNull: false }) declare validez: string;
  @Column({ type: DataType.TEXT, allowNull: false }) declare condiciones: string;
  @Column({ type: DataType.JSON, allowNull: false }) declare conceptos: { descripcion: string; cantidad: number; precio: number; importe: number }[];
  @Column({ type: DataType.DECIMAL(14,2), allowNull: false }) declare subtotal: number;
  @Column({ type: DataType.DECIMAL(14,2), allowNull: false }) declare descuento: number;
  @Column({ type: DataType.DECIMAL(5,2), allowNull: false }) declare tasa: number;
  @Column({ type: DataType.DECIMAL(14,2), allowNull: false }) declare impuesto: number;
  @Column({ type: DataType.DECIMAL(14,2), allowNull: false }) declare total: number;
  @Column({ type: DataType.STRING(20), allowNull: false, defaultValue: 'borrador' }) declare estado: string;
  @Column({ type: DataType.INTEGER, allowNull: true }) declare contacto_id: number;
  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 1 }) declare revision: number;
  @Column({ type: DataType.JSON, allowNull: false }) declare historial: { accion: string; usuario: number; fecha: string }[];
}
