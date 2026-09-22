import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateGaleriaDto } from './dto/create-galeria.dto';
import { UpdateGaleriaDto } from './dto/update-galeria.dto';

@Injectable()
export class GaleriaService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findPublic(categoria?: string) {
    const where: any = { activo: true };
    if (categoria) {
      where.categoria = categoria;
    }

    const items = await this.prisma.galeriaItem.findMany({
      where,
      orderBy: [{ orden: 'asc' }, { createdAt: 'desc' }],
    });

    return {
      ok: true,
      total: items.length,
      items,
    };
  }

  async findAllAdmin(categoria?: string) {
    const where: any = {};
    if (categoria) {
      where.categoria = categoria;
    }

    const items = await this.prisma.galeriaItem.findMany({
      where,
      orderBy: [{ orden: 'asc' }, { createdAt: 'desc' }],
    });

    return {
      ok: true,
      total: items.length,
      items,
    };
  }

  async findOne(id: number, publico = false) {
    let item = await this.prisma.galeriaItem.findFirst({ where: publico ? { id, activo: true } : { id } });
    if (!item) {
      throw new NotFoundException({ ok: false, mensaje: 'Elemento de galería no encontrado.' });
    }
    return { ok: true, item };
  }

  async create(dto: CreateGaleriaDto) {
    let item = await this.prisma.galeriaItem.create({ data: {
      ...dto,
      categoria: dto.categoria.trim().toLowerCase(),
      activo: dto.activo !== undefined ? dto.activo : true,
      orden: dto.orden || 0,
    } });
    return {
      ok: true,
      mensaje: 'Elemento de galería creado exitosamente.',
      item,
    };
  }

  async update(id: number, dto: UpdateGaleriaDto) {
    if (!Object.values(dto).some(value => value !== undefined) || Object.values(dto).some(value => value === null)) {
      throw new BadRequestException({ ok: false, mensaje: 'Envía al menos un campo válido; no se aceptan valores null.' });
    }
    let item = await this.prisma.galeriaItem.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException({ ok: false, mensaje: 'Elemento de galería no encontrado.' });
    }

    const updates: any = {};
    if (dto.titulo !== undefined) updates.titulo = dto.titulo.trim();
    if (dto.descripcion !== undefined) updates.descripcion = dto.descripcion?.trim();
    if (dto.categoria !== undefined) updates.categoria = dto.categoria.trim().toLowerCase();
    if (dto.imagen_url !== undefined) updates.imagen_url = dto.imagen_url.trim();
    if (dto.orden !== undefined) updates.orden = dto.orden;
    if (dto.activo !== undefined) updates.activo = dto.activo;

    item = await this.prisma.galeriaItem.update({ where: { id }, data: updates });
    return {
      ok: true,
      mensaje: 'Elemento de galería actualizado exitosamente.',
      item,
    };
  }

  async remove(id: number) {
    let item = await this.prisma.galeriaItem.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException({ ok: false, mensaje: 'Elemento de galería no encontrado.' });
    }
    await this.prisma.galeriaItem.delete({ where: { id } });
    return {
      ok: true,
      mensaje: 'Elemento de galería eliminado exitosamente.',
    };
  }
}
