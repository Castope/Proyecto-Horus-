import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { createHmac } from 'node:crypto';
import { PrismaService } from '../../database/prisma.service';
import { MailService } from '../../mail/mail.service';
import { corsOrigins } from '../../deployment.config';
import { ChangePasswordDto, ResetPasswordDto } from './dto/account.dto';
import { BCRYPT_COST } from './password-security';
import { RecoveryThrottle } from './recovery-throttle';
@Injectable()
export class AccountsService implements OnModuleDestroy {
 private readonly logger=new Logger(AccountsService.name);
 // Envíos de recuperación en curso: se siguen para no perder ninguno al apagar y para limitar cuántos hay a la vez.
 private readonly pending=new Set<Promise<void>>();
 static readonly MAX_PENDING_MAIL=20;
 static readonly DRAIN_TIMEOUT_MS=10000;
 constructor(private readonly prisma:PrismaService,private readonly jwt:JwtService,private readonly config:ConfigService,private readonly mail:MailService){}
 private resetSecret(password:string){return createHmac('sha256',this.config.getOrThrow<string>('JWT_SECRET')).update('reset:'+password).digest('hex');}
 private readonly throttle=new RecoveryThrottle();
 async forgot(email:string){
 const user=await this.prisma.adminUser.findUnique({where:{email}});
 // Se cuenta toda solicitud (cuenta existente o no) y la respuesta no cambia: al superar el límite solo se omite el envío.
 const allowed=this.throttle.allow(email);
 if(user?.activo&&!allowed)this.logger.warn('Límite de recuperación por cuenta alcanzado: se omite el envío.');
 if(user?.activo&&allowed){const origin=corsOrigins(process.env)[0];if(origin){
 const token=this.jwt.sign({id:user.id},{secret:this.resetSecret(user.password),expiresIn:'30m',audience:'horus-password-reset'});
 const url=new URL('/admin/reset-password',origin);url.searchParams.set('token',token);
 await this.deliverResetMail({from:this.config.get<string>('MAIL_USER'),to:user.email,subject:'Restablecer contraseña de Horus',text:'Solicitaste cambiar tu contraseña. El enlace vence en 30 minutos y solo puede utilizarse una vez. Si no fuiste tú, ignora este mensaje.\n\n'+url.href});
 }}
 return {ok:true,mensaje:'Si el correo corresponde a una cuenta activa, recibirá un enlace de recuperación.'};
 }
 // La respuesta HTTP no espera al proveedor de correo: si esperara, una cuenta activa tardaría más que una inexistente.
 // El envío corre en este proceso, seguido en `pending`, con errores contenidos (sendMail no lanza) y un máximo simultáneo.
 // No es una cola persistente: si el proceso cae justo después de responder el correo se pierde y la persona puede volver a pedirlo.
 // En entornos serverless (VERCEL=1) no hay ejecución tras responder, así que allí se espera el envío como antes.
 private deliverResetMail(message:Parameters<MailService['sendMail']>[0]):Promise<void>{
 if(this.config.get<string>('VERCEL')==='1')return this.mail.sendMail(message).then(()=>undefined,()=>{this.logger.error('No se pudo enviar el enlace de recuperación.')});
 if(this.pending.size>=AccountsService.MAX_PENDING_MAIL){this.logger.warn('Demasiados envíos de recuperación en curso: se omite este envío.');return Promise.resolve();}
 const task:Promise<void>=this.mail.sendMail(message).then(()=>undefined,()=>{this.logger.error('No se pudo enviar el enlace de recuperación.')}).finally(()=>{this.pending.delete(task)});
 this.pending.add(task);return Promise.resolve();
 }
 async onModuleDestroy(){
 if(!this.pending.size)return;
 let timer:NodeJS.Timeout|undefined;
 await Promise.race([Promise.allSettled([...this.pending]),new Promise<void>(resolve=>{timer=setTimeout(resolve,AccountsService.DRAIN_TIMEOUT_MS)})]);
 clearTimeout(timer);
 }
 async reset(dto:ResetPasswordDto){
 const decoded=this.jwt.decode<{id?:number}>(dto.token);
 if(!decoded||!Number.isSafeInteger(decoded.id))throw new BadRequestException('Enlace inválido o vencido.');
 const user=await this.prisma.adminUser.findUnique({where:{id:decoded.id}});
 if(!user?.activo)throw new BadRequestException('Enlace inválido o vencido.');
 try{this.jwt.verify(dto.token,{secret:this.resetSecret(user.password),audience:'horus-password-reset',issuer:'horus-api'});}catch{throw new BadRequestException('Enlace inválido o vencido.');}
 const password=await bcrypt.hash(dto.password,BCRYPT_COST);
 const result=await this.prisma.adminUser.updateMany({where:{id:user.id,password:user.password,activo:true},data:{password,session_version:{increment:1}}});
 if(result.count!==1)throw new ConflictException('El enlace ya fue utilizado. Solicita otro.');
 return {ok:true,mensaje:'Contraseña actualizada. Inicia sesión nuevamente.'};
 }
 async password(id:number,dto:ChangePasswordDto){
 const user=await this.prisma.adminUser.findUnique({where:{id}});
 if(!user||!await bcrypt.compare(dto.current_password,user.password))throw new BadRequestException('La contraseña actual no coincide.');
 const password=await bcrypt.hash(dto.password,BCRYPT_COST);
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
