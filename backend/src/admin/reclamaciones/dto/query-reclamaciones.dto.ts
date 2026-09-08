import { IsIn, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryReclamacionesDto {
  @ApiPropertyOptional({ enum: ['reclamo', 'queja'] })
  @IsString()
  @IsOptional()
  @IsIn(['reclamo', 'queja'])
  tipo_registro?: 'reclamo' | 'queja';

  @ApiPropertyOptional({ description: 'Búsqueda por número de reclamo, nombres, apellidos o email' })
  @IsString()
  @IsOptional()
  search?: string;
}
