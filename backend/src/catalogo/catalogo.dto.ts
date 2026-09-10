import { Transform, Type } from 'class-transformer';
import { IsString, Length, IsIn, IsInt, Min, Max, IsUrl, IsISO8601, Matches, ValidateIf } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

const trim = ({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value;

export class CatalogoQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @ValidateIf((_, value) => value !== undefined)
  @Type(() => Number)
  @IsInt() @Min(1) @Max(1000000)
  page = 1;

  @ApiPropertyOptional({ default: 20, maximum: 100 })
  @ValidateIf((_, value) => value !== undefined)
  @Type(() => Number)
  @IsInt() @Min(1) @Max(100)
  limit = 20;

  @ApiPropertyOptional()
  @ValidateIf((_, value) => value !== undefined)
  @Transform(trim) @IsString() @Length(1, 100)
  search?: string;

  @ApiPropertyOptional({ enum: ['borrador', 'publicado', 'archivado'] })
  @ValidateIf((_, value) => value !== undefined)
  @IsIn(['borrador', 'publicado', 'archivado'])
  estado?: string;
}

export class CreateCursoDto {
  @ApiProperty()
  @Transform(trim)
  @IsString() @Length(2, 160)
  titulo: string;

  @ApiProperty()
  @Transform(trim)
  @IsString() @Length(2, 180) @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  slug: string;

  @ApiProperty()
  @Transform(trim)
  @IsString() @Length(3, 20000)
  descripcion: string;

  @ApiProperty({ enum: ["curso","capacitacion"] })
  @Transform(trim)
  @IsIn(["curso","capacitacion"])
  tipo: string;

  @ApiProperty({ enum: ["presencial","virtual","hibrida"] })
  @Transform(trim)
  @IsIn(["presencial","virtual","hibrida"])
  modalidad: string;

  @ApiProperty()
  @Transform(trim)
  @IsString() @Length(2, 120)
  duracion: string;

  @ApiPropertyOptional()
  @ValidateIf((_, value) => value !== undefined)
  @Transform(trim)
  @IsString() @Length(2, 20000)
  temario?: string;

  @ApiPropertyOptional()
  @ValidateIf((_, value) => value !== undefined)
  @Transform(trim)
  @IsUrl({ protocols: ['https', 'http'], require_protocol: true }) @Length(1, 2048)
  imagen_url?: string;

  @ApiPropertyOptional()
  @ValidateIf((_, value) => value !== undefined)
  @Transform(trim)
  @IsISO8601({ strict: true })
  fecha_inicio?: string;

  @ApiPropertyOptional({ enum: ["borrador","publicado","archivado"] })
  @ValidateIf((_, value) => value !== undefined)
  @Transform(trim)
  @IsIn(["borrador","publicado","archivado"])
  estado?: string;
}
export class UpdateCursoDto extends PartialType(CreateCursoDto, { skipNullProperties: false }) {}

export class CreateServicioDto {
  @ApiProperty()
  @Transform(trim)
  @IsString() @Length(2, 160)
  titulo: string;

  @ApiProperty()
  @Transform(trim)
  @IsString() @Length(2, 180) @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  slug: string;

  @ApiProperty()
  @Transform(trim)
  @IsString() @Length(3, 20000)
  descripcion: string;

  @ApiProperty({ enum: ["cableado","camaras","soporte","asesoramiento","otros"] })
  @Transform(trim)
  @IsIn(["cableado","camaras","soporte","asesoramiento","otros"])
  categoria: string;

  @ApiPropertyOptional()
  @ValidateIf((_, value) => value !== undefined)
  @Transform(trim)
  @IsString() @Length(2, 20000)
  alcance?: string;

  @ApiPropertyOptional()
  @ValidateIf((_, value) => value !== undefined)
  @Transform(trim)
  @IsUrl({ protocols: ['https', 'http'], require_protocol: true }) @Length(1, 2048)
  imagen_url?: string;

  @ApiPropertyOptional({ enum: ["borrador","publicado","archivado"] })
  @ValidateIf((_, value) => value !== undefined)
  @Transform(trim)
  @IsIn(["borrador","publicado","archivado"])
  estado?: string;
}
export class UpdateServicioDto extends PartialType(CreateServicioDto, { skipNullProperties: false }) {}

export class CreatePreguntaFrecuenteDto {
  @ApiProperty()
  @Transform(trim)
  @IsString() @Length(2, 300)
  pregunta: string;

  @ApiProperty()
  @Transform(trim)
  @IsString() @Length(3, 12000)
  respuesta: string;

  @ApiProperty()
  @Transform(trim)
  @IsString() @Length(2, 100)
  categoria: string;

  @ApiPropertyOptional({ minimum: 0 })
  @ValidateIf((_, value) => value !== undefined)
  @IsInt() @Min(0) @Max(1000000)
  orden?: number;

  @ApiPropertyOptional({ enum: ["borrador","publicado","archivado"] })
  @ValidateIf((_, value) => value !== undefined)
  @Transform(trim)
  @IsIn(["borrador","publicado","archivado"])
  estado?: string;
}
export class UpdatePreguntaFrecuenteDto extends PartialType(CreatePreguntaFrecuenteDto, { skipNullProperties: false }) {}
