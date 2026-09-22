import { serializeComplaint } from '../../database/serialization';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { QueryReclamacionesDto } from './dto/query-reclamaciones.dto';

@Injectable()
export class AdminReclamacionesService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findAll(query: QueryReclamacionesDto) {
    const where: any = {};

    if (query.tipo_registro) {
      where.tipo_registro = query.tipo_registro;
    }

    if (query.search) {
      const term = query.search.trim();
      where.OR = [
        { numero_reclamo: { contains: term } },
        { nombres: { contains: term } },
        { apellidos: { contains: term } },
        { email: { contains: term } },
        { num_doc: { contains: term } },
      ];
    }

    const reclamaciones = await this.prisma.reclamacion.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }],
    });

    return {
      ok: true,
      total: reclamaciones.length,
      reclamaciones: reclamaciones.map(serializeComplaint),
    };
  }

  async findOne(id: number) {
    const reclamacion = await this.prisma.reclamacion.findUnique({ where: { id } });
    if (!reclamacion) {
      throw new NotFoundException({ ok: false, mensaje: 'Reclamación no encontrada.' });
    }
    return { ok: true, reclamacion: serializeComplaint(reclamacion) };
  }

  async remove(id: number) {
    const reclamacion = await this.prisma.reclamacion.findUnique({ where: { id } });
    if (!reclamacion) {
      throw new NotFoundException({ ok: false, mensaje: 'Reclamación no encontrada.' });
    }
    await this.prisma.reclamacion.delete({ where: { id } });
    return { ok: true, mensaje: 'Reclamación eliminada correctamente.' };
  }
}
