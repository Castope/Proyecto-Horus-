import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Model, ModelStatic, Op, UniqueConstraintError, WhereOptions } from 'sequelize';
import { Curso, Servicio, PreguntaFrecuente } from './catalogo.models';
import { CatalogoQueryDto } from './catalogo.dto';

export type Recurso = 'cursos' | 'servicios' | 'preguntas-frecuentes';

@Injectable()
export class CatalogoService {
  private readonly models: Record<Recurso, ModelStatic<Model>>;

  constructor(
    @InjectModel(Curso) cursos: typeof Curso,
    @InjectModel(Servicio) servicios: typeof Servicio,
    @InjectModel(PreguntaFrecuente) preguntas: typeof PreguntaFrecuente,
  ) {
    this.models = { cursos, servicios, 'preguntas-frecuentes': preguntas };
  }

  async list(recurso: Recurso, query: CatalogoQueryDto, publico = false) {
    const where: WhereOptions = {};
    // Public callers cannot override the publication filter.
    if (publico) where.estado = 'publicado';
    else if (query.estado) where.estado = query.estado;
    if (query.search) {
      const field = recurso === 'preguntas-frecuentes' ? 'pregunta' : 'titulo';
      where[field] = { [Op.like]: '%' + query.search + '%' };
    }
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const { rows, count } = await this.models[recurso].findAndCountAll({
      where, limit, offset: (page - 1) * limit,
      order: recurso === 'preguntas-frecuentes' ? [['orden', 'ASC'], ['id', 'DESC']] : [['id', 'DESC']],
    });
    return { ok: true, items: rows, pagination: { page, limit, total: count, pages: Math.ceil(count / limit) } };
  }

  async detail(recurso: Recurso, id: number, publico = false) {
    const item = await this.models[recurso].findOne({
      where: publico ? { id, estado: 'publicado' } : { id },
    });
    if (!item) throw new NotFoundException({ ok: false, mensaje: 'Contenido no encontrado.' });
    return { ok: true, item };
  }

  private checkPayload(dto: object) {
    if (!Object.keys(dto).length || Object.values(dto).some(value => value === null)) {
      throw new BadRequestException({ ok: false, mensaje: 'Envía al menos un campo válido; no se aceptan valores null.' });
    }
  }

  async create(recurso: Recurso, dto: object) {
    this.checkPayload(dto);
    try {
      const item = await this.models[recurso].create({ ...dto });
      return { ok: true, item };
    } catch (error) {
      if (error instanceof UniqueConstraintError) throw new ConflictException({ ok: false, mensaje: 'Ese slug ya está en uso.' });
      throw error;
    }
  }

  async update(recurso: Recurso, id: number, dto: object) {
    this.checkPayload(dto);
    const { item } = await this.detail(recurso, id);
    try {
      await item.update(dto);
      return { ok: true, item };
    } catch (error) {
      if (error instanceof UniqueConstraintError) throw new ConflictException({ ok: false, mensaje: 'Ese slug ya está en uso.' });
      throw error;
    }
  }

  async archive(recurso: Recurso, id: number) {
    const { item } = await this.detail(recurso, id);
    await item.update({ estado: 'archivado' });
    return { ok: true, mensaje: 'Contenido archivado.', item };
  }

  async stats() {
    const entries = await Promise.all((Object.keys(this.models) as Recurso[]).map(async key => {
      const model = this.models[key];
      const [total, publicados, borradores, archivados] = await Promise.all([
        model.count(), model.count({ where: { estado: 'publicado' } }),
        model.count({ where: { estado: 'borrador' } }), model.count({ where: { estado: 'archivado' } }),
      ]);
      return [key, { total, publicados, borradores, archivados }];
    }));
    return Object.fromEntries(entries);
  }
}
