import { Transform, Type } from 'class-transformer';
import { ArrayMaxSize, Equals, IsArray, IsEmail, IsIn, IsOptional, IsString, Length, ValidateNested } from 'class-validator';

const trim = ({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value;

export class ChatTurnDto {
  @IsIn(['user', 'assistant'])
  role: 'user' | 'assistant';

  @Transform(trim)
  @IsString()
  @Length(1, 4000)
  content: string;
}

export class ChatMessageDto {
  @Transform(trim)
  @IsString()
  @Length(1, 1000)
  message: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(6)
  @ValidateNested({ each: true })
  @Type(() => ChatTurnDto)
  history?: ChatTurnDto[];
}

export class ChatContactDto {
  @Transform(trim)
  @IsString()
  @Length(2, 100)
  nombre: string;

  @Transform(trim)
  @IsEmail()
  @Length(3, 254)
  email: string;

  @Transform(trim)
  @IsString()
  @Length(6, 30)
  telefono: string;

  @Transform(trim)
  @IsString()
  @Length(3, 140)
  asunto: string;

  @Transform(trim)
  @IsString()
  @Length(3, 5000)
  mensaje: string;

  // Preserve raw JSON: implicit conversion would turn the string "false" into true.
  @Transform(({ obj }) => obj.consentimiento)
  @Equals(true, { message: 'Debes autorizar que Horus te contacte.' })
  consentimiento: boolean;
}
