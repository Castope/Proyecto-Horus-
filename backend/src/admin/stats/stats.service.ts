import { CatalogoService } from '../../catalogo/catalogo.service';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Contacto } from '../../contacto/contacto.model';
import { Reclamacion } from '../../reclamaciones/reclamacion.model';
import { AdminItem } from '../items/admin-item.model';
import { AdminUser } from '../auth/admin-user.model';

@Injectable()
export class StatsService {
  constructor(
    private readonly catalogoService: CatalogoService,
    @InjectModel(Contacto)
    private readonly contactoModel: typeof Contacto,
    @InjectModel(Reclamacion)
    private readonly reclamacionModel: typeof Reclamacion,
    @InjectModel(AdminItem)
    private readonly adminItemModel: typeof AdminItem,
    @InjectModel(AdminUser)
    private readonly adminUserModel: typeof AdminUser,
  ) {}

  async getDashboardStats() {
    const [
      totalMensajes,
      mensajesNuevos,
      mensajesEnProceso,
      mensajesAtendidos,
      totalReclamaciones,
      totalReclamos,
      totalQuejas,
      totalItems,
      itemsActivos,
      itemsInactivos,
      totalAdmins,
      ultimosMensajes,
      ultimasReclamaciones,
    ] = await Promise.all([
      this.contactoModel.count(),
      this.contactoModel.count({ where: { estado: 'nuevo' } }),
      this.contactoModel.count({ where: { estado: 'en_proceso' } }),
      this.contactoModel.count({ where: { estado: 'atendido' } }),
      this.reclamacionModel.count(),
      this.reclamacionModel.count({ where: { tipo_registro: 'reclamo' } }),
      this.reclamacionModel.count({ where: { tipo_registro: 'queja' } }),
      this.adminItemModel.count(),
      this.adminItemModel.count({ where: { estado: 'activo' } }),
      this.adminItemModel.count({ where: { estado: 'inactivo' } }),
      this.adminUserModel.count(),
      this.contactoModel.findAll({
        limit: 5,
        order: [['createdAt', 'DESC']],
        attributes: ['id', 'nombre', 'email', 'asunto', 'estado', 'createdAt'],
      }),
      this.reclamacionModel.findAll({
        limit: 5,
        order: [['createdAt', 'DESC']],
        attributes: ['id', 'numero_reclamo', 'nombres', 'apellidos', 'tipo_registro', 'area', 'createdAt'],
      }),
    ]);

    return {
      ok: true,
      stats: {
        catalogo: await this.catalogoService.stats(),
        mensajes: {
          total: totalMensajes,
          nuevos: mensajesNuevos,
          enProceso: mensajesEnProceso,
          atendidos: mensajesAtendidos,
        },
        reclamaciones: {
          total: totalReclamaciones,
          reclamos: totalReclamos,
          quejas: totalQuejas,
        },
        contenido: {
          total: totalItems,
          activos: itemsActivos,
          inactivos: itemsInactivos,
        },
        administradores: {
          total: totalAdmins,
        },
      },
      actividadReciente: {
        mensajes: ultimosMensajes,
        reclamaciones: ultimasReclamaciones,
      },
    };
  }
}
