import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Contacto } from './contacto.model';
import { CreateContactoDto } from './dto/create-contacto.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class ContactoService {
  constructor(
    @InjectModel(Contacto)
    private readonly contactoModel: typeof Contacto,
    private readonly mailService: MailService,
  ) {}

  async create(dto: CreateContactoDto) {
    try {
      const nuevo = await this.contactoModel.create({
        ...dto,
        estado: 'nuevo',
      });

      // Envío asíncrono de correos de notificación y acuse de recibo
      void this.mailService.sendContactoNotificacion({
        nombre: dto.nombre,
        email: dto.email,
        telefono: dto.telefono,
        asunto: dto.asunto,
        mensaje: dto.mensaje,
      });

      return {
        ok: true,
        mensaje: 'Mensaje enviado correctamente. Nos pondremos en contacto pronto.',
        id: nuevo.id,
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error desconocido';
      throw new InternalServerErrorException({
        ok: false,
        mensaje: 'Error al enviar el mensaje. Intente más tarde.',
        error: msg,
      });
    }
  }
}

