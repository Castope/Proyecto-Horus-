import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Contacto } from '../../contacto/contacto.model';
import { CreateAdminMessageDto } from './dto/create-message.dto';
import { UpdateMessageStatusDto } from './dto/update-message-status.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Contacto)
    private readonly contactoModel: typeof Contacto,
  ) {}

  async findAll() {
    const messages = await this.contactoModel.findAll({
      order: [['createdAt', 'DESC']],
    });
    return { ok: true, messages };
  }

  async findOne(id: number) {
    const message = await this.contactoModel.findByPk(id);
    if (!message) {
      throw new NotFoundException({ ok: false, mensaje: 'Mensaje no encontrado.' });
    }
    return { ok: true, message };
  }

  async create(dto: CreateAdminMessageDto) {
    const message = await this.contactoModel.create({
      ...dto,
      estado: 'nuevo',
    });
    return { ok: true, mensaje: 'Mensaje creado correctamente.', message };
  }

  async updateStatus(id: number, dto: UpdateMessageStatusDto) {
    const message = await this.contactoModel.findByPk(id);
    if (!message) {
      throw new NotFoundException({ ok: false, mensaje: 'Mensaje no encontrado.' });
    }
    await message.update({ estado: dto.estado });
    return { ok: true, mensaje: 'Estado del mensaje actualizado.', message };
  }

  async remove(id: number) {
    const message = await this.contactoModel.findByPk(id);
    if (!message) {
      throw new NotFoundException({ ok: false, mensaje: 'Mensaje no encontrado.' });
    }
    await message.destroy();
    return { ok: true, mensaje: 'Mensaje eliminado correctamente.' };
  }
}
