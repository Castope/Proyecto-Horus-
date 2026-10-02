import { Transform } from 'class-transformer';
import { Equals, IsEmail, IsString, Length, ValidateIf } from 'class-validator';
import { normalizeEmail, trimValue } from '../../common/validation';
export class SubscribeNewsletterDto {
 @Transform(normalizeEmail) @IsEmail() @Length(3,254) email:string;
 @ValidateIf((_o,value)=>value!==undefined) @Transform(trimValue) @IsString() @Length(1,100) interes?:string;
 @Equals(true,{message:'Debes autorizar la suscripción para recibir novedades.'}) consentimiento?:boolean;
}
export class UnsubscribeNewsletterDto { @IsString() @Length(1,500) token:string; }
