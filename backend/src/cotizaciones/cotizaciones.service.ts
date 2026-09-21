import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { randomUUID } from 'node:crypto';
import { Op } from 'sequelize';
import { Cotizacion } from './cotizacion.model';
import { Contacto } from '../contacto/contacto.model';
import { CotizacionDto, CotizacionQueryDto, EditCotizacionDto, EstadoCotizacionDto } from './cotizacion.dto';

export const transitions: Record<string, string[]> = { borrador: ['enviada', 'anulada'], enviada: ['aceptada', 'rechazada', 'anulada'], aceptada: [], rechazada: [], anulada: [] };
export function calculateQuote(dto: CotizacionDto) {
  const conceptos = dto.conceptos.map(item => {
    const cents = Math.round(item.precio * 100);
    if (!Number.isSafeInteger(cents) || cents < 0 || !Number.isInteger(item.cantidad) || item.cantidad < 1) throw new BadRequestException('Concepto inválido.');
    return { descripcion: item.descripcion, cantidad: item.cantidad, precio: cents / 100, importe: cents * item.cantidad / 100 };
  });
  const subtotal = conceptos.reduce((sum, item) => sum + Math.round(item.importe * 100), 0);
  const discount = Math.round(dto.descuento * 100);
  const rate = Math.round(dto.tasa * 100);
  if (!Number.isSafeInteger(discount) || discount < 0 || discount > subtotal || !Number.isInteger(rate) || rate < 0 || rate > 10000) throw new BadRequestException('Revisa el descuento y la tasa de impuesto.');
  const tax = Math.round((subtotal - discount) * rate / 10000);
  const total = subtotal - discount + tax;
  if (!Number.isSafeInteger(total) || total > 1_000_000_000_000) throw new BadRequestException('El importe supera el límite admitido.');
  return { conceptos, subtotal: subtotal / 100, descuento: discount / 100, tasa: rate / 100, impuesto: tax / 100, total: total / 100 };
}
@Injectable()
export class CotizacionesService {
  constructor(@InjectModel(Cotizacion) private readonly quotes: typeof Cotizacion, @InjectModel(Contacto) private readonly contacts: typeof Contacto) {}
  async list(query: CotizacionQueryDto) {
    const where = { ...(query.estado ? { estado: query.estado } : {}), ...(query.search ? { [Op.or]: ['numero', 'cliente', 'email'].map(field => ({ [field]: { [Op.like]: '%' + query.search + '%' } })) } : {}) };
    const { rows, count } = await this.quotes.findAndCountAll({ where, limit: query.limit, offset: (query.page - 1) * query.limit, order: [['createdAt', 'DESC']], attributes: { exclude: ['historial', 'conceptos', 'condiciones', 'datos_emisor'] } });
    return { ok: true, items: rows, pagination: { total: count, pages: Math.ceil(count / query.limit), page: query.page } };
  }
  async detail(id: number) {
    const item = await this.quotes.findByPk(id);
    if (!item) throw new NotFoundException('Cotización no encontrada.');
    return { ok: true, item };
  }
  private async payload(dto: CotizacionDto) {
    const date = new Date(dto.validez + 'T12:00:00Z');
    if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== dto.validez) throw new BadRequestException('La fecha de vigencia no es válida.');
    if (dto.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dto.email)) throw new BadRequestException('Correo del cliente inválido.');
    if (dto.contacto_id && !await this.contacts.findByPk(dto.contacto_id)) throw new BadRequestException('La consulta de origen ya no existe.');
    return { cliente: dto.cliente, email: dto.email, telefono: dto.telefono, documento: dto.documento, direccion: dto.direccion,
      emisor: dto.emisor, datos_emisor: dto.datos_emisor, moneda: dto.moneda, validez: dto.validez, condiciones: dto.condiciones,
      contacto_id: dto.contacto_id || null, ...calculateQuote(dto) };
  }
  async create(dto: CotizacionDto, user: number) {
    const data = await this.payload(dto);
    const item = await this.quotes.create({ ...data, numero: 'COT-' + new Date().getUTCFullYear() + '-' + randomUUID(), estado: 'borrador', revision: 1,
      historial: [{ accion: 'Creada como borrador', usuario: user, fecha: new Date().toISOString() }] });
    return { ok: true, item };
  }
  async edit(id: number, dto: EditCotizacionDto, user: number) {
    const data = await this.payload(dto);
    return this.mutate(id, dto.revision, user, 'Borrador actualizado', item => {
      if (item.estado !== 'borrador') throw new ConflictException('Solo se editan borradores. Duplica la cotización para preparar otra propuesta.');
      return data;
    });
  }
  async status(id: number, dto: EstadoCotizacionDto, user: number) {
    return this.mutate(id, dto.revision, user, 'Estado: ' + dto.estado, item => {
      if (!transitions[item.estado]?.includes(dto.estado)) throw new ConflictException('Ese cambio de estado no está permitido.');
      if (['enviada', 'aceptada'].includes(dto.estado)) {
        const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Lima' });
        if (item.validez < today) throw new ConflictException('La cotización está vencida. Prepara una nueva propuesta.');
      }
      return { estado: dto.estado };
    });
  }
  private async mutate(id: number, revision: number, user: number, action: string, changes: (item: Cotizacion) => object) {
    return this.quotes.sequelize.transaction(async transaction => {
      const item = await this.quotes.findByPk(id, { transaction, lock: transaction.LOCK.UPDATE });
      if (!item) throw new NotFoundException('Cotización no encontrada.');
      if (item.revision !== revision) throw new ConflictException('La cotización cambió en otra sesión. Recárgala antes de continuar.');
      await item.update({ ...changes(item), revision: item.revision + 1,
        historial: [...item.historial, { accion: action, usuario: user, fecha: new Date().toISOString() }] }, { transaction });
      return { ok: true, item };
    });
  }
}
