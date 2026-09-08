import { IsEmail, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAdminMessageDto {
  @ApiProperty({ example: 'Mario Lopez' })
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  nombre: string;

  @ApiProperty({ example: 'mario@example.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: '998877665' })
  @IsString()
  @IsOptional()
  @Length(6, 30)
  telefono?: string;

  @ApiProperty({ example: 'Instalación de cámaras' })
  @IsString()
  @IsNotEmpty()
  @Length(3, 150)
  asunto: string;

  @ApiProperty({ example: 'Requiero instalación en 3 sucursales' })
  @IsString()
  @IsNotEmpty()
  @Length(3, 5000)
  mensaje: string;
}
