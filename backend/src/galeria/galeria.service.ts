import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GaleriaItem } from './galeria.model';
import { CreateGaleriaDto } from './dto/create-galeria.dto';
import { UpdateGaleriaDto } from './dto/update-galeria.dto';

@Injectable()
export class GaleriaService {
  constructor(
    @InjectModel(GaleriaItem)
    private readonly galeriaModel: typeof GaleriaItem,
  ) {}

  async findPublic(categoria?: string) {
    const where: any = { activo: true };
    if (categoria) {
      where.categoria = categoria;
    }

    const items = await this.galeriaModel.findAll({
      where,
      order: [
        ['orden', 'ASC'],
        ['createdAt', 'DESC'],
      ],
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

    const items = await this.galeriaModel.findAll({
      where,
      order: [
        ['orden', 'ASC'],
        ['createdAt', 'DESC'],
      ],
    });

    return {
      ok: true,
      total: items.length,
      items,
    };
  }

  async findOne(id: number, publico = false) {
    const item = await this.galeriaModel.findOne({ where: publico ? { id, activo: true } : { id } });
    if (!item) {
      throw new NotFoundException({ ok: false, mensaje: 'Elemento de galería no encontrado.' });
    }
    return { ok: true, item };
  }

  async create(dto: CreateGaleriaDto) {
    const item = await this.galeriaModel.create({
      ...dto,
      categoria: dto.categoria.trim().toLowerCase(),
      activo: dto.activo !== undefined ? dto.activo : true,
      orden: dto.orden || 0,
    });
    return {
      ok: true,
      mensaje: 'Elemento de galería creado exitosamente.',
      item,
    };
  }

  async update(id: number, dto: UpdateGaleriaDto) {
    const item = await this.galeriaModel.findByPk(id);
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

    await item.update(updates);
    return {
      ok: true,
      mensaje: 'Elemento de galería actualizado exitosamente.',
      item,
    };
  }

  async remove(id: number) {
    const item = await this.galeriaModel.findByPk(id);
    if (!item) {
      throw new NotFoundException({ ok: false, mensaje: 'Elemento de galería no encontrado.' });
    }
    await item.destroy();
    return {
      ok: true,
      mensaje: 'Elemento de galería eliminado exitosamente.',
    };
  }
}
