import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { SubscribeNewsletterDto } from './dto/subscribe-newsletter.dto';

@Injectable()
export class NewsletterService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async subscribe(dto: SubscribeNewsletterDto) {
    const email = dto.email.toLowerCase().trim();
    const existing = await this.prisma.newsletter.findFirst({ where: { email } });

    if (existing) {
      if (!existing.activo) {
        await this.prisma.newsletter.update({ where: { id: existing.id }, data: { activo: true, interes: dto.interes || existing.interes } });
      }
      return {
        ok: true,
        mensaje: '¡Gracias! Tu correo ya se encuentra registrado para recibir novedades.',
      };
    }

    await this.prisma.newsletter.create({ data: {
      email,
      interes: dto.interes || 'market',
      activo: true,
    } });

    return {
      ok: true,
      mensaje: '¡Gracias por suscribirte! Te avisaremos cuando tengamos novedades.',
    };
  }

  async findAll() {
    const subscribers = await this.prisma.newsletter.findMany({
      orderBy: [{ createdAt: 'desc' }],
    });
    return {
      ok: true,
      total: subscribers.length,
      subscribers,
    };
  }

  async remove(id: number) {
    const subscriber = await this.prisma.newsletter.findUnique({ where: { id } });
    if (!subscriber) {
      throw new NotFoundException({ ok: false, mensaje: 'Suscriptor no encontrado.' });
    }
    await this.prisma.newsletter.delete({ where: { id } });
    return {
      ok: true,
      mensaje: 'Suscriptor eliminado correctamente.',
    };
  }
}
