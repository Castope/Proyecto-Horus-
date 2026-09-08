import { IsIn, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateItemDto {
  @ApiProperty({ example: 'Nuevo Servicio de Fibra Óptica' })
  @IsString()
  @IsNotEmpty()
  @Length(3, 150)
  titulo: string;

  @ApiProperty({ example: 'Instalación y certificación de fibra monomodo y multimodo.' })
  @IsString()
  @IsNotEmpty()
  @Length(3, 5000)
  descripcion: string;

  @ApiPropertyOptional({ enum: ['general', 'servicio', 'contenido'], default: 'general' })
  @IsString()
  @IsOptional()
  @IsIn(['general', 'servicio', 'contenido'])
  categoria?: string;

  @ApiPropertyOptional({ enum: ['activo', 'inactivo'], default: 'activo' })
  @IsString()
  @IsOptional()
  @IsIn(['activo', 'inactivo'])
  estado?: string;
}
