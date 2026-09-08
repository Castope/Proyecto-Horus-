import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMessageStatusDto {
  @ApiProperty({ enum: ['nuevo', 'en_proceso', 'atendido'], example: 'en_proceso' })
  @IsString()
  @IsNotEmpty()
  @IsIn(['nuevo', 'en_proceso', 'atendido'])
  estado: 'nuevo' | 'en_proceso' | 'atendido';
}
