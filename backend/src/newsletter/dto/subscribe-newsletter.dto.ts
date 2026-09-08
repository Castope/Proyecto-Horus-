import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubscribeNewsletterDto {
  @ApiProperty({ example: 'cliente@gmail.com' })
  @IsEmail({}, { message: 'Debe ingresar un correo electrónico válido.' })
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({ example: 'market', default: 'market' })
  @IsString()
  @IsOptional()
  interes?: string;
}
