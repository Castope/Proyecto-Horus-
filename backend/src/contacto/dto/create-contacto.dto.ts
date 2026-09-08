import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateContactoDto {
  @ApiProperty({ example: 'Juan Perez', description: 'Nombre completo' })
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  nombre: string;

  @ApiProperty({ example: 'juan@example.com', description: 'Correo electrónico' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '999888777', description: 'Número telefónico' })
  @IsString()
  @IsNotEmpty()
  @Length(6, 30)
  telefono: string;

  @ApiProperty({ example: 'Consulta sobre cámaras', description: 'Asunto de la consulta' })
  @IsString()
  @IsNotEmpty()
  @Length(3, 150)
  asunto: string;

  @ApiProperty({ example: 'Quisiera cotizar 4 cámaras IP para mi negocio', description: 'Mensaje detallado' })
  @IsString()
  @IsNotEmpty()
  @Length(3, 5000)
  mensaje: string;
}
