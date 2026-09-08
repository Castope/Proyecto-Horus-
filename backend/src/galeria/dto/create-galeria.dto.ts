import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGaleriaDto {
  @ApiProperty({ example: 'Capacitación en Primeros Auxilios' })
  @IsString()
  @IsNotEmpty()
  @Length(2, 150)
  titulo: string;

  @ApiPropertyOptional({ example: 'Taller práctico realizado con el personal.' })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiProperty({ example: 'capacitaciones' })
  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  categoria: string;

  @ApiProperty({ example: '/galeria/capacitaciones/imagen-1.jpg' })
  @IsString()
  @IsNotEmpty()
  @Length(3, 500)
  imagen_url: string;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @IsOptional()
  orden?: number;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
