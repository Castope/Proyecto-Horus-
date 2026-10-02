import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsString, Length, Min } from 'class-validator';
import { trimValue } from '../common/validation';
export class AttentionDto {
 @IsInt() @Min(1) revision:number;
 @IsIn(['nuevo','en_proceso','atendido','archivado']) estado:string;
 @Transform(trimValue) @IsString() @Length(0,100) responsable:string;
 @Transform(trimValue) @IsString() @Length(0,10000) notas:string;
 @Transform(trimValue) @IsString() @Length(0,10000) respuesta:string;
}
export class AttentionSendDto { @IsInt() @Min(1) revision:number; }
