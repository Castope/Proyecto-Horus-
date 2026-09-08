import { IsNotEmpty, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSettingsDto {
  @ApiProperty({
    example: {
      telefono: '+51 999 888 777',
      email: 'contacto@horusgroupsrl.com',
      whatsapp: '51999888777',
      direccion: 'Av. Principal 123, Oficina 401, Lima',
      ruc: '20608552174',
      horario: 'Lunes a Viernes 8:00 AM - 6:00 PM',
    },
    description: 'Diccionario clave-valor con los ajustes a actualizar',
  })
  @IsObject()
  @IsNotEmpty()
  ajustes: Record<string, string>;
}
