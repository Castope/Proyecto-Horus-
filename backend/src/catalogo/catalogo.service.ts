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
    if (recurso === 'cursos') {
      if (query.tipo) where.tipo = query.tipo;
      if (query.modalidad) where.modalidad = query.modalidad;
    } else if (query.categoria) {
      if (recurso === 'servicios' && !['cableado', 'camaras', 'soporte', 'asesoramiento', 'otros'].includes(query.categoria)) {
        throw new BadRequestException('Categoría de servicio inválida.');
      }
      where.categoria = query.categoria;
    }
    if (recurso === 'cursos' && query.periodo) {
      if (!publico && !query.estado) where.estado = { not: 'archivado' };
      const today = new Date(new Date().toLocaleDateString('en-CA',{timeZone:'America/Lima'})+'T00:00:00Z');
      where.fecha_inicio = query.periodo === 'unscheduled' ? null : query.periodo === 'past' ? { lt: today } : { gte: today };
    }
    if (query.search) where[recurso === 'preguntas-frecuentes' ? 'pregunta' : 'titulo'] = { contains: query.search };
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const model = this.model(recurso);
    const [rows, count] = await Promise.all([
      model.findMany({ where, take: limit, skip: (page - 1) * limit,
        orderBy: recurso === 'cursos' && query.periodo ? [{fecha_inicio:'asc'},{id:'asc'}] : recurso === 'preguntas-frecuentes' ? [{ orden: 'asc' }, { id: 'desc' }] : [{ orden: 'asc' }, { id: 'desc' }] }),
      model.count({ where }),
    ]);
    let metrics: Record<string,number> | undefined;
    if (recurso==='cursos' && query.periodo && !publico) {
      const today=new Date(new Date().toLocaleDateString('en-CA',{timeZone:'America/Lima'})+'T00:00:00Z');
      const [total,upcoming,unscheduled]=await Promise.all([model.count({where:{estado:{not:'archivado'}}}),model.count({where:{estado:{not:'archivado'},fecha_inicio:{gte:today}}}),model.count({where:{estado:{not:'archivado'},fecha_inicio:null}})]);
      metrics={total,upcoming,unscheduled};
    }
    return { ok: true, ...(metrics?{metrics}:{}), items: rows, pagination: { page, limit, total: count, pages: Math.ceil(count / limit) } };
  }

  async detail(recurso: Recurso, id: number, publico = false) {
    const item = await this.model(recurso).findFirst({ where: publico ? { id, estado: 'publicado' } : { id } });
    if (!item) throw new NotFoundException({ ok: false, mensaje: 'Contenido no encontrado.' });
    return { ok: true, item };
  }

  private payload(dto: object, recurso: Recurso) {
    if (!Object.keys(dto).length || Object.values(dto).some(value => value === null)) {
      throw new BadRequestException({ ok: false, mensaje: 'Envía al menos un campo válido; no se aceptan valores null.' });
    }
    const data = { ...dto } as Record<string, unknown>;
    const limpiar = data.limpiar as string[] | undefined;
    delete data.limpiar;
    if (limpiar?.length) {
      const allowed = recurso === 'cursos' ? ['imagen_url','fecha_inicio','temario','area','certificacion','icono','modalidad','duracion'] : recurso === 'servicios' ? ['imagen_url','alcance','nombre_corto','destacado','dato_principal','dato_secundario','etiquetas','icono'] : [];
      for (const field of limpiar) {
        if (!allowed.includes(field)) throw new BadRequestException('Campo no permitido para limpiar.');
        if (data[field] !== undefined) throw new BadRequestException('No puedes modificar y quitar el mismo campo.');
        data[field] = null;
      }
    }
    if (!Object.keys(data).length) throw new BadRequestException('Envía al menos un cambio.');
    if (data.fecha_inicio !== undefined && data.fecha_inicio !== null) data.fecha_inicio = new Date(String(data.fecha_inicio));
    return data;
  }

  async create(recurso: Recurso, dto: object) {
    const data = this.payload(dto, recurso);
    if(recurso==='cursos'&&data.tipo==='curso'&&(!data.modalidad||!data.duracion))throw new BadRequestException('Un curso necesita modalidad y duración.');
    try {
      const item = await this.model(recurso).create({ data });
      return { ok: true, item };
    } catch (error) {
      if (isUniqueViolation(error)) throw new ConflictException({ ok: false, mensaje: 'Ese slug ya está en uso.' });
      throw error;
    }
  }

  async update(recurso: Recurso, id: number, dto: object) {
    const data = this.payload(dto, recurso);
    const {item:previous} = await this.detail(recurso, id);
    if(recurso==='cursos'){
      const next={...previous,...data};
      if(next.tipo==='curso'&&(!next.modalidad||!next.duracion))throw new BadRequestException('Un curso necesita modalidad y duración. Completa ambos campos.');
    }
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
