import { isEmail, isURL } from 'class-validator';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Setting } from '@prisma/client';
import { UpdateSettingsDto } from './dto/update-settings.dto';

const DEFAULT_SETTINGS: Record<string, { valor: string; descripcion: string; grupo: string }> = {
  empresa_nombre: { valor: '', descripcion: 'Nombre oficial de la empresa', grupo: 'general' },
  ruc: { valor: '', descripcion: 'Registro Único de Contribuyentes (RUC)', grupo: 'general' },
  email_contacto: { valor: '', descripcion: 'Correo institucional de contacto', grupo: 'contacto' },
  telefono_principal: { valor: '', descripcion: 'Teléfono o central telefónica', grupo: 'contacto' },
  whatsapp: { valor: '', descripcion: 'Número de WhatsApp para atención rápida', grupo: 'contacto' },
  direccion: { valor: '', descripcion: 'Dirección física u oficina', grupo: 'contacto' },
  horario_atencion: { valor: '', descripcion: 'Horarios de atención al público', grupo: 'contacto' },
  facebook_url: { valor: '', descripcion: 'Página de Facebook', grupo: 'redes' },
  instagram_url: { valor: '', descripcion: 'Perfil de Instagram', grupo: 'redes' },
  linkedin_url: { valor: '', descripcion: 'Perfil de LinkedIn', grupo: 'redes' },
};

@Injectable()
export class SettingsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getPublicSettings(): Promise<{ ok: boolean; settings: Record<string, string> }> {
    const rows = await this.prisma.setting.findMany();
    const settings: Record<string, string> = Object.fromEntries(Object.keys(DEFAULT_SETTINGS).map(key => [key, '']));
    for (const row of rows) {
      if (Object.prototype.hasOwnProperty.call(DEFAULT_SETTINGS, row.clave)) settings[row.clave] = row.valor;
    }
    return { ok: true, settings };
  }

  async getAllSettingsAdmin(): Promise<{ ok: boolean; settings: Pick<Setting, 'clave' | 'valor' | 'descripcion' | 'grupo'>[] }> {
    const rows = await this.prisma.setting.findMany();
    const settings = Object.entries(DEFAULT_SETTINGS).map(([clave, data]) => ({ ...data, clave, valor: rows.find(row => row.clave === clave)?.valor ?? '' }));
    settings.sort((a, b) => a.grupo.localeCompare(b.grupo) || a.clave.localeCompare(b.clave));
    return { ok: true, settings };
  }

  async updateSettings(dto: UpdateSettingsDto): Promise<{ ok: boolean; mensaje: string; actualizados: number }> {
    if (!dto.ajustes || typeof dto.ajustes !== 'object' || Array.isArray(dto.ajustes) || !Object.keys(dto.ajustes).length) {
      throw new BadRequestException('Envía al menos un ajuste válido.');
    }
    const entries = Object.entries(dto.ajustes).map(([clave, raw]) => {
      if (!Object.prototype.hasOwnProperty.call(DEFAULT_SETTINGS, clave) || typeof raw !== 'string') throw new BadRequestException('Ajuste desconocido o valor inválido.');
      const valor = raw.trim();
      if (valor.length > 5000 || (valor && (
        (clave === 'email_contacto' && !isEmail(valor)) ||
        (clave.endsWith('_url') && !isURL(valor, { protocols: ['https', 'http'], require_protocol: true })) ||
        (clave === 'whatsapp' && !/^\+?\d{7,15}$/.test(valor))
      ))) throw new BadRequestException('Valor inválido para ' + clave + '.');
      return { clave, valor };
    });
    await this.prisma.$transaction(async transaction => {
      for (const { clave, valor } of entries) {
        await transaction.setting.upsert({
          where: { clave }, update: { valor }, create: { ...DEFAULT_SETTINGS[clave], clave, valor },
        });
      }
    });

    return {
      ok: true,
      mensaje: 'Ajustes guardados correctamente.',
      actualizados: entries.length,
    };
  }
}
