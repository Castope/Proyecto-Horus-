import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Reclamacion } from './reclamacion.model';
import { CreateReclamacionDto } from './dto/create-reclamacion.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class ReclamacionesService {
  constructor(
    @InjectModel(Reclamacion)
    private readonly reclamacionModel: typeof Reclamacion,
    private readonly mailService: MailService,
  ) {}

  private generarNumeroReclamo(): string {
    const hoy = new Date();
    const fecha = hoy.toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(Math.random() * 9000) + 1000;
    return `HG-${fecha}-${rand}`;
  }

  async create(dto: CreateReclamacionDto) {
    try {
      const numero_reclamo = this.generarNumeroReclamo();

      const registro = await this.reclamacionModel.create({
        ...dto,
        numero_reclamo,
      });

      // Esperar al correo antes de finalizar la función en Vercel.
      await this.mailService.sendReclamoConstancia({
        email: dto.email,
        nombres: dto.nombres,
        apellidos: dto.apellidos,
        tipo_registro: dto.tipo_registro,
        numero_reclamo,
        area: dto.area,
        detalle_reclamo: dto.detalle_reclamo,
      });

      return {
        ok: true,
        mensaje: 'Su requerimiento fue registrado exitosamente.',
        numero_reclamo,
        id: registro.id,
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error desconocido';
      throw new InternalServerErrorException({
        ok: false,
        mensaje: 'Error al registrar la reclamación.',
        error: msg,
      });
    }
  }
}
