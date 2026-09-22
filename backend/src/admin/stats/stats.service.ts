import { CatalogoService } from '../../catalogo/catalogo.service';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class StatsService {
  constructor(
    private readonly catalogoService: CatalogoService,
    private readonly prisma: PrismaService,
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
      this.prisma.contacto.count(),
      this.prisma.contacto.count({ where: { estado: 'nuevo' } }),
      this.prisma.contacto.count({ where: { estado: 'en_proceso' } }),
      this.prisma.contacto.count({ where: { estado: 'atendido' } }),
      this.prisma.reclamacion.count(),
      this.prisma.reclamacion.count({ where: { tipo_registro: 'reclamo' } }),
      this.prisma.reclamacion.count({ where: { tipo_registro: 'queja' } }),
      this.prisma.adminItem.count(),
      this.prisma.adminItem.count({ where: { estado: 'activo' } }),
      this.prisma.adminItem.count({ where: { estado: 'inactivo' } }),
      this.prisma.adminUser.count(),
      this.prisma.contacto.findMany({
        take: 5,
        orderBy: [{ createdAt: 'desc' }],
        select: { id: true, nombre: true, email: true, asunto: true, estado: true, createdAt: true },
      }),
      this.prisma.reclamacion.findMany({
        take: 5,
        orderBy: [{ createdAt: 'desc' }],
        select: { id: true, numero_reclamo: true, nombres: true, apellidos: true, tipo_registro: true, area: true, createdAt: true },
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
