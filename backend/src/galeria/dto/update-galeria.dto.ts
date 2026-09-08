import { IsBoolean, IsInt, IsOptional, IsString, Length } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateGaleriaDto {
  @ApiPropertyOptional({ example: 'Capacitación en Primeros Auxilios' })
  @IsString()
  @IsOptional()
  @Length(2, 150)
  titulo?: string;

  @ApiPropertyOptional({ example: 'Taller práctico actualizado.' })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiPropertyOptional({ example: 'capacitaciones' })
  @IsString()
  @IsOptional()
  @Length(2, 50)
  categoria?: string;

  @ApiPropertyOptional({ example: '/galeria/capacitaciones/imagen-1.jpg' })
  @IsString()
  @IsOptional()
  @Length(3, 500)
  imagen_url?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @IsOptional()
  orden?: number;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
