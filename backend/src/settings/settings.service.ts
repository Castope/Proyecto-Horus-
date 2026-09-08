import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Setting } from './settings.model';
import { UpdateSettingsDto } from './dto/update-settings.dto';

const DEFAULT_SETTINGS: Record<string, { valor: string; descripcion: string; grupo: string }> = {
  empresa_nombre: { valor: 'Horus Group SRL', descripcion: 'Nombre oficial de la empresa', grupo: 'general' },
  ruc: { valor: '20608552174', descripcion: 'Registro Único de Contribuyentes (RUC)', grupo: 'general' },
  email_contacto: { valor: 'contacto@horusgroupsrl.com', descripcion: 'Correo institucional de contacto', grupo: 'contacto' },
  telefono_principal: { valor: '+51 987 654 321', descripcion: 'Teléfono o central telefónica', grupo: 'contacto' },
  whatsapp: { valor: '51987654321', descripcion: 'Número de WhatsApp para atención rápida', grupo: 'contacto' },
  direccion: { valor: 'Lima, Perú', descripcion: 'Dirección física u oficina', grupo: 'contacto' },
  horario_atencion: { valor: 'Lunes a Viernes: 8:00 AM - 6:00 PM', descripcion: 'Horarios de atención al público', grupo: 'contacto' },
  facebook_url: { valor: 'https://facebook.com/horusgroupsrl', descripcion: 'Página de Facebook', grupo: 'redes' },
  instagram_url: { valor: 'https://instagram.com/horusgroupsrl', descripcion: 'Perfil de Instagram', grupo: 'redes' },
  linkedin_url: { valor: 'https://linkedin.com/company/horusgroupsrl', descripcion: 'Perfil de LinkedIn', grupo: 'redes' },
};

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(Setting)
    private readonly settingModel: typeof Setting,
  ) {}

  private async ensureDefaults(): Promise<void> {
    const count = await this.settingModel.count();
    if (count === 0) {
      const records = Object.entries(DEFAULT_SETTINGS).map(([clave, data]) => ({
        clave,
        valor: data.valor,
        descripcion: data.descripcion,
        grupo: data.grupo,
      }));
      await this.settingModel.bulkCreate(records);
    }
  }

  async getPublicSettings(): Promise<{ ok: boolean; settings: Record<string, string> }> {
    await this.ensureDefaults();
    const rows = await this.settingModel.findAll();
    const settings: Record<string, string> = {};
    for (const row of rows) {
      settings[row.clave] = row.valor;
    }
    return { ok: true, settings };
  }

  async getAllSettingsAdmin(): Promise<{ ok: boolean; settings: Setting[] }> {
    await this.ensureDefaults();
    const settings = await this.settingModel.findAll({
      order: [
        ['grupo', 'ASC'],
        ['clave', 'ASC'],
      ],
    });
    return { ok: true, settings };
  }

  async updateSettings(dto: UpdateSettingsDto): Promise<{ ok: boolean; mensaje: string; actualizados: number }> {
    let count = 0;
    for (const [clave, valor] of Object.entries(dto.ajustes)) {
      const existing = await this.settingModel.findOne({ where: { clave } });
      if (existing) {
        await existing.update({ valor: String(valor) });
      } else {
        await this.settingModel.create({
          clave,
          valor: String(valor),
          descripcion: `Configuración de ${clave}`,
          grupo: 'general',
        });
      }
      count++;
    }

    return {
      ok: true,
      mensaje: 'Ajustes guardados correctamente.',
      actualizados: count,
    };
  }
}
