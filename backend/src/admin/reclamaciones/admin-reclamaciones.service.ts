import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Reclamacion } from '../../reclamaciones/reclamacion.model';
import { QueryReclamacionesDto } from './dto/query-reclamaciones.dto';

@Injectable()
export class AdminReclamacionesService {
  constructor(
    @InjectModel(Reclamacion)
    private readonly reclamacionModel: typeof Reclamacion,
  ) {}

  async findAll(query: QueryReclamacionesDto) {
    const where: any = {};

    if (query.tipo_registro) {
      where.tipo_registro = query.tipo_registro;
    }

    if (query.search) {
      const term = `%${query.search.trim()}%`;
      where[Op.or] = [
        { numero_reclamo: { [Op.like]: term } },
        { nombres: { [Op.like]: term } },
        { apellidos: { [Op.like]: term } },
        { email: { [Op.like]: term } },
        { num_doc: { [Op.like]: term } },
      ];
    }

    const reclamaciones = await this.reclamacionModel.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });

    return {
      ok: true,
      total: reclamaciones.length,
      reclamaciones,
    };
  }

  async findOne(id: number) {
    const reclamacion = await this.reclamacionModel.findByPk(id);
    if (!reclamacion) {
      throw new NotFoundException({ ok: false, mensaje: 'Reclamación no encontrada.' });
    }
    return { ok: true, reclamacion };
  }

  async remove(id: number) {
    const reclamacion = await this.reclamacionModel.findByPk(id);
    if (!reclamacion) {
      throw new NotFoundException({ ok: false, mensaje: 'Reclamación no encontrada.' });
    }
    await reclamacion.destroy();
    return { ok: true, mensaje: 'Reclamación eliminada correctamente.' };
  }
}
