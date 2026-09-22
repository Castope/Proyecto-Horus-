import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { serializeQuote } from '../database/serialization';
import { randomUUID } from 'node:crypto';
import { Prisma } from '@prisma/client';


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
  constructor(private readonly prisma: PrismaService) {}
  async list(query: CotizacionQueryDto) {
    const where: Prisma.CotizacionWhereInput = { ...(query.estado ? { estado: query.estado } : {}), ...(query.search ? { OR: ['numero', 'cliente', 'email'].map(field => ({ [field]: { contains: query.search } })) } : {}) };
    const [rows, count] = await Promise.all([
      this.prisma.cotizacion.findMany({ where, take: query.limit, skip: (query.page - 1) * query.limit, orderBy: { createdAt: 'desc' }, omit: { historial: true, conceptos: true, condiciones: true, datos_emisor: true } }),
      this.prisma.cotizacion.count({ where }),
    ]);
    return { ok: true, items: rows.map(serializeQuote), pagination: { total: count, pages: Math.ceil(count / query.limit), page: query.page } };
  }
  async detail(id: number) {
    const item = await this.prisma.cotizacion.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Cotización no encontrada.');
    return { ok: true, item: serializeQuote(item) };
  }
  private async payload(dto: CotizacionDto) {
    const date = new Date(dto.validez + 'T12:00:00Z');
    if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== dto.validez) throw new BadRequestException('La fecha de vigencia no es válida.');
    if (dto.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dto.email)) throw new BadRequestException('Correo del cliente inválido.');
    if (dto.contacto_id && !await this.prisma.contacto.findUnique({ where: { id: dto.contacto_id } })) throw new BadRequestException('La consulta de origen ya no existe.');
    return { cliente: dto.cliente, email: dto.email, telefono: dto.telefono, documento: dto.documento, direccion: dto.direccion,
      emisor: dto.emisor, datos_emisor: dto.datos_emisor, moneda: dto.moneda, validez: new Date(dto.validez), condiciones: dto.condiciones,
      contacto_id: dto.contacto_id || null, ...calculateQuote(dto) };
  }
  async create(dto: CotizacionDto, user: number) {
    const data = await this.payload(dto);
    const item = await this.prisma.cotizacion.create({ data: { ...data, numero: 'COT-' + new Date().getUTCFullYear() + '-' + randomUUID(), estado: 'borrador', revision: 1,
      historial: [{ accion: 'Creada como borrador', usuario: user, fecha: new Date().toISOString() }] } });
    return { ok: true, item: { ...serializeQuote(item), ...calculateQuote(dto) } };
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
  private async mutate(id: number, revision: number, user: number, action: string,
    changes: (item: ReturnType<typeof serializeQuote<import('@prisma/client').Cotizacion>>) => Prisma.CotizacionUpdateManyMutationInput) {
    return this.prisma.$transaction(async tx => {
      const item = await tx.cotizacion.findUnique({ where: { id } });
      if (!item) throw new NotFoundException('Cotización no encontrada.');
      const conflict = () => new ConflictException('La cotización cambió en otra sesión. Recárgala antes de continuar.');
      if (item.revision !== revision) throw conflict();
      // Compare-and-swap makes concurrent edits mutually exclusive, including the audit history.
      const updates = changes(serializeQuote(item));
      const result = await tx.cotizacion.updateMany({ where: { id, revision }, data: {
        ...updates, revision: { increment: 1 },
        historial: [...(item.historial as Prisma.JsonArray), { accion: action, usuario: user, fecha: new Date().toISOString() }],
      } });
      if (result.count !== 1) throw conflict();
      const updated = serializeQuote(await tx.cotizacion.findUniqueOrThrow({ where: { id } }));
      // Sequelize returned numeric values for freshly calculated fields, strings for DB reads.
      for (const field of ['subtotal', 'descuento', 'tasa', 'impuesto', 'total']) {
        if (typeof updates[field] === 'number') updated[field] = updates[field];
      }
      return { ok: true, item: updated };
    });
  }
}
