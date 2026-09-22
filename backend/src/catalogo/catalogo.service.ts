import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { isUniqueViolation } from '../database/serialization';
import { CatalogoQueryDto } from './catalogo.dto';

export type Recurso = 'cursos' | 'servicios' | 'preguntas-frecuentes';
// Each route validates its own DTO before reaching this shared CRUD service.
interface CatalogDelegate {
  findMany(args: object): Promise<any[]>;
  findFirst(args: object): Promise<any>;
  count(args?: object): Promise<number>;
  create(args: { data: any }): Promise<any>;
  update(args: { where: { id: number }; data: any }): Promise<any>;
}

@Injectable()
export class CatalogoService {
  constructor(private readonly prisma: PrismaService) {}
  private model(recurso: Recurso): CatalogDelegate {
    return { cursos: this.prisma.curso, servicios: this.prisma.servicio, 'preguntas-frecuentes': this.prisma.preguntaFrecuente }[recurso];
  }

  async list(recurso: Recurso, query: CatalogoQueryDto, publico = false) {
    const where: Record<string, unknown> = {};
    if (publico) where.estado = 'publicado';
    else if (query.estado) where.estado = query.estado;
    if (query.search) where[recurso === 'preguntas-frecuentes' ? 'pregunta' : 'titulo'] = { contains: query.search };
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const model = this.model(recurso);
    const [rows, count] = await Promise.all([
      model.findMany({ where, take: limit, skip: (page - 1) * limit,
        orderBy: recurso === 'preguntas-frecuentes' ? [{ orden: 'asc' }, { id: 'desc' }] : [{ id: 'desc' }] }),
      model.count({ where }),
    ]);
    return { ok: true, items: rows, pagination: { page, limit, total: count, pages: Math.ceil(count / limit) } };
  }

  async detail(recurso: Recurso, id: number, publico = false) {
    const item = await this.model(recurso).findFirst({ where: publico ? { id, estado: 'publicado' } : { id } });
    if (!item) throw new NotFoundException({ ok: false, mensaje: 'Contenido no encontrado.' });
    return { ok: true, item };
  }

  private payload(dto: object) {
    if (!Object.keys(dto).length || Object.values(dto).some(value => value === null)) {
      throw new BadRequestException({ ok: false, mensaje: 'Envía al menos un campo válido; no se aceptan valores null.' });
    }
    const data = { ...dto } as Record<string, unknown>;
    if (data.fecha_inicio !== undefined) data.fecha_inicio = new Date(String(data.fecha_inicio));
    return data;
  }

  async create(recurso: Recurso, dto: object) {
    const data = this.payload(dto);
    try {
      const item = await this.model(recurso).create({ data });
      return { ok: true, item };
    } catch (error) {
      if (isUniqueViolation(error)) throw new ConflictException({ ok: false, mensaje: 'Ese slug ya está en uso.' });
      throw error;
    }
  }

  async update(recurso: Recurso, id: number, dto: object) {
    const data = this.payload(dto);
    await this.detail(recurso, id);
    try {
      const item = await this.model(recurso).update({ where: { id }, data });
      return { ok: true, item };
    } catch (error) {
      if (isUniqueViolation(error)) throw new ConflictException({ ok: false, mensaje: 'Ese slug ya está en uso.' });
      throw error;
    }
  }

  async archive(recurso: Recurso, id: number) {
    await this.detail(recurso, id);
    const item = await this.model(recurso).update({ where: { id }, data: { estado: 'archivado' } });
    return { ok: true, mensaje: 'Contenido archivado.', item };
  }

  async stats() {
    const entries = await Promise.all((['cursos', 'servicios', 'preguntas-frecuentes'] as Recurso[]).map(async key => {
      const model = this.model(key);
      const [total, publicados, borradores, archivados] = await Promise.all([
        model.count(), model.count({ where: { estado: 'publicado' } }),
        model.count({ where: { estado: 'borrador' } }), model.count({ where: { estado: 'archivado' } }),
      ]);
      return [key, { total, publicados, borradores, archivados }];
    }));
    return Object.fromEntries(entries);
  }
}
