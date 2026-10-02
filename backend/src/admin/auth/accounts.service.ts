import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { createHmac } from 'node:crypto';
import { PrismaService } from '../../database/prisma.service';
import { MailService } from '../../mail/mail.service';
import { corsOrigins } from '../../deployment.config';
import { ChangePasswordDto, ResetPasswordDto } from './dto/account.dto';
@Injectable()
export class AccountsService {
 constructor(private readonly prisma:PrismaService,private readonly jwt:JwtService,private readonly config:ConfigService,private readonly mail:MailService){}
 private resetSecret(password:string){return createHmac('sha256',this.config.getOrThrow<string>('JWT_SECRET')).update('reset:'+password).digest('hex');}
 async forgot(email:string){
 const user=await this.prisma.adminUser.findUnique({where:{email}});
 if(user?.activo){const origin=corsOrigins(process.env)[0];if(origin){
 const token=this.jwt.sign({id:user.id},{secret:this.resetSecret(user.password),expiresIn:'30m',audience:'horus-password-reset'});
 const url=new URL('/admin/reset-password',origin);url.searchParams.set('token',token);
 await this.mail.sendMail({from:this.config.get<string>('MAIL_USER'),to:user.email,subject:'Restablecer contraseña de Horus',text:'Solicitaste cambiar tu contraseña. El enlace vence en 30 minutos y solo puede utilizarse una vez. Si no fuiste tú, ignora este mensaje.\n\n'+url.href});
 }}
 return {ok:true,mensaje:'Si el correo corresponde a una cuenta activa, recibirá un enlace de recuperación.'};
 }
 async reset(dto:ResetPasswordDto){
 const decoded=this.jwt.decode<{id?:number}>(dto.token);
 if(!decoded||!Number.isSafeInteger(decoded.id))throw new BadRequestException('Enlace inválido o vencido.');
 const user=await this.prisma.adminUser.findUnique({where:{id:decoded.id}});
 if(!user?.activo)throw new BadRequestException('Enlace inválido o vencido.');
 try{this.jwt.verify(dto.token,{secret:this.resetSecret(user.password),audience:'horus-password-reset',issuer:'horus-api'});}catch{throw new BadRequestException('Enlace inválido o vencido.');}
 const password=await bcrypt.hash(dto.password,12);
 const result=await this.prisma.adminUser.updateMany({where:{id:user.id,password:user.password,activo:true},data:{password,session_version:{increment:1}}});
 if(result.count!==1)throw new ConflictException('El enlace ya fue utilizado. Solicita otro.');
 return {ok:true,mensaje:'Contraseña actualizada. Inicia sesión nuevamente.'};
 }
 async password(id:number,dto:ChangePasswordDto){
 const user=await this.prisma.adminUser.findUnique({where:{id}});
 if(!user||!await bcrypt.compare(dto.current_password,user.password))throw new BadRequestException('La contraseña actual no coincide.');
 const password=await bcrypt.hash(dto.password,12);
 const result=await this.prisma.adminUser.updateMany({where:{id,password:user.password,activo:true},data:{password,session_version:{increment:1}}});
 if(result.count!==1)throw new ConflictException('La cuenta cambió. Inicia sesión nuevamente.');
 return {ok:true,mensaje:'Contraseña actualizada. Las sesiones anteriores fueron revocadas.'};
 }
 async list(){return {ok:true,users:await this.prisma.adminUser.findMany({select:{id:true,nombre:true,email:true,activo:true,createdAt:true},orderBy:{nombre:'asc'}})};}
 async status(id:number,activo:boolean,actor:number){
 if(id===actor&&!activo)throw new ConflictException('No puedes desactivar tu propia cuenta.');
 return this.prisma.$transaction(async tx=>{
 await tx.$queryRaw`SELECT id FROM admin_users ORDER BY id FOR UPDATE`;
 const user=await tx.adminUser.findUnique({where:{id}});if(!user)throw new NotFoundException('Cuenta no encontrada.');
 if(!activo&&user.activo&&await tx.adminUser.count({where:{activo:true}})<=1)throw new ConflictException('Debe quedar al menos un administrador activo.');
 await tx.adminUser.update({where:{id},data:{activo,session_version:{increment:1}}});
 return {ok:true,mensaje:activo?'Cuenta activada.':'Cuenta desactivada y sesiones revocadas.'};
 });
 }
}
