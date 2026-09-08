import { IsIn, IsOptional, IsString, Length } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateItemDto {
  @ApiPropertyOptional({ example: 'Título actualizado' })
  @IsString()
  @IsOptional()
  @Length(3, 150)
  titulo?: string;

  @ApiPropertyOptional({ example: 'Descripción actualizada' })
  @IsString()
  @IsOptional()
  @Length(3, 5000)
  descripcion?: string;

  @ApiPropertyOptional({ enum: ['general', 'servicio', 'contenido'] })
  @IsString()
  @IsOptional()
  @IsIn(['general', 'servicio', 'contenido'])
  categoria?: string;

  @ApiPropertyOptional({ enum: ['activo', 'inactivo'] })
  @IsString()
  @IsOptional()
  @IsIn(['activo', 'inactivo'])
  estado?: string;
}
