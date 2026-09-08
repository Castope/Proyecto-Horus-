import { IsBoolean, IsEmail, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReclamacionDto {
  @ApiProperty({ example: 'Carlos' })
  @IsString()
  @IsNotEmpty()
  nombres: string;

  @ApiProperty({ example: 'Ramirez' })
  @IsString()
  @IsNotEmpty()
  apellidos: string;

  @ApiPropertyOptional({ example: 'DNI' })
  @IsString()
  @IsOptional()
  tipo_doc?: string;

  @ApiPropertyOptional({ example: '76543210' })
  @IsString()
  @IsOptional()
  num_doc?: string;

  @ApiProperty({ example: 'carlos@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '987654321' })
  @IsString()
  @IsNotEmpty()
  telefono: string;

  @ApiPropertyOptional({ example: 'Av. Las Palmeras 123' })
  @IsString()
  @IsOptional()
  direccion?: string;

  @ApiProperty({ enum: ['reclamo', 'queja'], example: 'reclamo' })
  @IsIn(['reclamo', 'queja'])
  tipo_registro: 'reclamo' | 'queja';

  @ApiProperty({ example: 'Soporte y Mantenimiento' })
  @IsString()
  @IsNotEmpty()
  area: string;

  @ApiProperty({ example: '2026-03-01' })
  @IsString()
  @IsNotEmpty()
  fecha_incidente: string;

  @ApiProperty({ example: 'Servicio de mantenimiento de cámaras' })
  @IsString()
  @IsNotEmpty()
  descripcion_bien: string;

  @ApiProperty({ example: 'No se presentaron a la hora acordada' })
  @IsString()
  @IsNotEmpty()
  detalle_reclamo: string;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  acepta_comunicaciones?: boolean;
}
