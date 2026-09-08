import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AdminItem } from './admin-item.model';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class ItemsService {
  constructor(
    @InjectModel(AdminItem)
    private readonly adminItemModel: typeof AdminItem,
  ) {}

  async findAll() {
    const items = await this.adminItemModel.findAll({
      order: [['createdAt', 'DESC']],
    });
    return { ok: true, items };
  }

  async findOne(id: number) {
    const item = await this.adminItemModel.findByPk(id);
    if (!item) {
      throw new NotFoundException({ ok: false, mensaje: 'Elemento no encontrado.' });
    }
    return { ok: true, item };
  }

  async create(dto: CreateItemDto) {
    const item = await this.adminItemModel.create({
      titulo: dto.titulo.trim(),
      descripcion: dto.descripcion.trim(),
      categoria: dto.categoria || 'general',
      estado: dto.estado || 'activo',
    });
    return { ok: true, mensaje: 'Elemento creado correctamente.', item };
  }

  async update(id: number, dto: UpdateItemDto) {
    const item = await this.adminItemModel.findByPk(id);
    if (!item) {
      throw new NotFoundException({ ok: false, mensaje: 'Elemento no encontrado.' });
    }

    const updates: Partial<AdminItem> = {};
    if (dto.titulo !== undefined) updates.titulo = dto.titulo.trim();
    if (dto.descripcion !== undefined) updates.descripcion = dto.descripcion.trim();
    if (dto.categoria !== undefined) updates.categoria = dto.categoria;
    if (dto.estado !== undefined) updates.estado = dto.estado;

    await item.update(updates);
    return { ok: true, mensaje: 'Elemento actualizado correctamente.', item };
  }

  async remove(id: number) {
    const item = await this.adminItemModel.findByPk(id);
    if (!item) {
      throw new NotFoundException({ ok: false, mensaje: 'Elemento no encontrado.' });
    }
    await item.destroy();
    return { ok: true, mensaje: 'Elemento eliminado correctamente.' };
  }
}
