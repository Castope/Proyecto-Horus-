import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateAdminMessageDto } from './dto/create-message.dto';
import { UpdateMessageStatusDto } from './dto/update-message-status.dto';

@Injectable()
export class MessagesService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findAll() {
    const messages = await this.prisma.contacto.findMany({
      orderBy: [{ createdAt: 'desc' }],
    });
    return { ok: true, messages };
  }

  async findOne(id: number) {
    let message = await this.prisma.contacto.findUnique({ where: { id } });
    if (!message) {
      throw new NotFoundException({ ok: false, mensaje: 'Mensaje no encontrado.' });
    }
    return { ok: true, message };
  }

  async create(dto: CreateAdminMessageDto) {
    let message = await this.prisma.contacto.create({ data: {
      ...dto,
      telefono: dto.telefono ?? '',
      estado: 'nuevo',
    } });
    return { ok: true, mensaje: 'Mensaje creado correctamente.', message };
  }

  async updateStatus(id: number, dto: UpdateMessageStatusDto) {
    let message = await this.prisma.contacto.findUnique({ where: { id } });
    if (!message) {
      throw new NotFoundException({ ok: false, mensaje: 'Mensaje no encontrado.' });
    }
    message = await this.prisma.contacto.update({ where: { id }, data: { estado: dto.estado } });
    return { ok: true, mensaje: 'Estado del mensaje actualizado.', message };
  }

  async remove(id: number) {
    let message = await this.prisma.contacto.findUnique({ where: { id } });
    if (!message) {
      throw new NotFoundException({ ok: false, mensaje: 'Mensaje no encontrado.' });
    }
    await this.prisma.contacto.delete({ where: { id } });
    return { ok: true, mensaje: 'Mensaje eliminado correctamente.' };
  }
}
