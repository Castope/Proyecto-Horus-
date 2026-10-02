import { Transform } from 'class-transformer';
import { IsBoolean, IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import { normalizeEmail, MaxUtf8Bytes } from '../../../common/validation';
export class ForgotPasswordDto { @Transform(normalizeEmail) @IsEmail() @Length(3,254) email:string; }
export class ResetPasswordDto {
 @IsString() @Length(1,3000) token:string;
 @IsString() @IsNotEmpty() @Length(8,72) @MaxUtf8Bytes(72) password:string;
}
export class ChangePasswordDto {
 @IsString() @IsNotEmpty() @Length(1,72) @MaxUtf8Bytes(72) current_password:string;
 @IsString() @IsNotEmpty() @Length(8,72) @MaxUtf8Bytes(72) password:string;
}
export class AccountStatusDto { @IsBoolean() activo:boolean; }
