import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Administrador Principal' })
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  nombre: string;

  @ApiProperty({ example: 'admin@horus.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '12345678' })
  @IsString()
  @IsNotEmpty()
  @Length(8, 72)
  password: string;
}
