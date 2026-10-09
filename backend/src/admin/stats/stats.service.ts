import { CatalogoService } from '../../catalogo/catalogo.service';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { messageTotals, recentMessages } from '../../attention/message-state';

@Injectable()
export class StatsService {
  constructor(
    private readonly catalogoService: CatalogoService,
    private readonly prisma: PrismaService,
  ) {}

  async getDashboardStats() {
    const [
      mensajes,
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
      messageTotals(this.prisma),
      this.prisma.reclamacion.count(),
      this.prisma.reclamacion.count({ where: { tipo_registro: 'reclamo' } }),
      this.prisma.reclamacion.count({ where: { tipo_registro: 'queja' } }),
      this.prisma.adminItem.count(),
      this.prisma.adminItem.count({ where: { estado: 'activo' } }),
      this.prisma.adminItem.count({ where: { estado: 'inactivo' } }),
      this.prisma.adminUser.count(),
      recentMessages(this.prisma),
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
          total: mensajes.total,
          nuevos: mensajes.nuevo,
          enProceso: mensajes.en_proceso,
          atendidos: mensajes.atendido,
          archivados: mensajes.archivado,
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
