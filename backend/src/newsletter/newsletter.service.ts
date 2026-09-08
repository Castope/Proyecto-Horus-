import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Newsletter } from './newsletter.model';
import { SubscribeNewsletterDto } from './dto/subscribe-newsletter.dto';

@Injectable()
export class NewsletterService {
  constructor(
    @InjectModel(Newsletter)
    private readonly newsletterModel: typeof Newsletter,
  ) {}

  async subscribe(dto: SubscribeNewsletterDto) {
    const email = dto.email.toLowerCase().trim();
    const existing = await this.newsletterModel.findOne({ where: { email } });

    if (existing) {
      if (!existing.activo) {
        await existing.update({ activo: true, interes: dto.interes || existing.interes });
      }
      return {
        ok: true,
        mensaje: '¡Gracias! Tu correo ya se encuentra registrado para recibir novedades.',
      };
    }

    await this.newsletterModel.create({
      email,
      interes: dto.interes || 'market',
      activo: true,
    });

    return {
      ok: true,
      mensaje: '¡Gracias por suscribirte! Te avisaremos cuando tengamos novedades.',
    };
  }

  async findAll() {
    const subscribers = await this.newsletterModel.findAll({
      order: [['createdAt', 'DESC']],
    });
    return {
      ok: true,
      total: subscribers.length,
      subscribers,
    };
  }

  async remove(id: number) {
    const subscriber = await this.newsletterModel.findByPk(id);
    if (!subscriber) {
      throw new NotFoundException({ ok: false, mensaje: 'Suscriptor no encontrado.' });
    }
    await subscriber.destroy();
    return {
      ok: true,
      mensaje: 'Suscriptor eliminado correctamente.',
    };
  }
}
