import { BadRequestException, ConflictException, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma.service';
import { MailService } from '../mail/mail.service';
import { isUniqueViolation } from '../database/serialization';
import { AttentionDto } from './attention.dto';
@Injectable()
export class AttentionService {
 constructor(private readonly prisma:PrismaService,private readonly mail:MailService,private readonly config:ConfigService){}
 private async record(recurso:string,id:number){
 if(recurso==='messages'){const item=await this.prisma.contacto.findUnique({where:{id}});if(!item)throw new NotFoundException('Consulta no encontrada.');return{email:item.email,subject:'Re: '+item.asunto,estado:item.estado};}
 if(recurso==='reclamaciones'){const item=await this.prisma.reclamacion.findUnique({where:{id}});if(!item)throw new NotFoundException('Reclamación no encontrada.');return{email:item.email,subject:'Respuesta a '+item.numero_reclamo,estado:'nuevo'};}
 throw new BadRequestException('Recurso no válido.');
 }
 async get(recurso:string,id:number){
 const record=await this.record(recurso,id);
 const item=await this.prisma.attentionRecord.findUnique({where:{recurso_registro_id:{recurso,registro_id:id}}});
 return{ok:true,item:item||{estado:record.estado,responsable:'',notas:'',respuesta:'',revision:1,historial:[]}};
 }
 async save(recurso:string,id:number,dto:AttentionDto,user:number){
 await this.record(recurso,id);
 if(dto.estado==='atendido'&&recurso==='reclamaciones'&&!dto.respuesta.trim())throw new BadRequestException('Registra la respuesta antes de marcar el caso como atendido.');
 try{return await this.prisma.$transaction(async tx=>{
 const where={recurso_registro_id:{recurso,registro_id:id}};
 const old=await tx.attentionRecord.findUnique({where});
 if(old&&old.revision!==dto.revision||!old&&dto.revision!==1)throw new ConflictException('El seguimiento cambió en otra sesión. Recarga el caso.');
 const historial=[...(old?.historial as Prisma.JsonArray||[]),{accion:'Seguimiento actualizado: '+dto.estado,usuario:user,fecha:new Date().toISOString()}];
 const data={estado:dto.estado,responsable:dto.responsable,notas:dto.notas,respuesta:dto.respuesta,historial,revision:(old?.revision||1)+1};
 if(old){const result=await tx.attentionRecord.updateMany({where:{id:old.id,revision:dto.revision},data});if(result.count!==1)throw new ConflictException('El seguimiento cambió en otra sesión. Recarga el caso.');}
 else await tx.attentionRecord.create({data:{...data,recurso,registro_id:id,...(recurso==='messages'?{contacto_id:id}:{reclamacion_id:id})}});
 if(recurso==='messages')await tx.contacto.update({where:{id},data:{estado:dto.estado==='archivado'?'atendido':dto.estado}});
 return{ok:true,item:await tx.attentionRecord.findUniqueOrThrow({where})};
 });}catch(e){if(e instanceof Prisma.PrismaClientKnownRequestError&&e.code==='P2003')throw new ConflictException('El registro de origen cambió. Recarga el caso.');if(isUniqueViolation(e))throw new ConflictException('El seguimiento cambió en otra sesión. Recarga el caso.');throw e;}
 }
 async receipt(recurso:string,id:number){
 let sent:boolean;
 if(recurso==='messages'){const item=await this.prisma.contacto.findUnique({where:{id}});if(!item)throw new NotFoundException('Consulta no encontrada.');sent=await this.mail.sendContactoNotificacion(item);}
 else if(recurso==='reclamaciones'){const item=await this.prisma.reclamacion.findUnique({where:{id}});if(!item)throw new NotFoundException('Reclamación no encontrada.');if(!item.numero_reclamo)throw new BadRequestException('El registro no tiene código de constancia.');sent=await this.mail.sendReclamoConstancia({...item,numero_reclamo:item.numero_reclamo});}
 else throw new BadRequestException('Recurso no válido.');
 if(!sent)throw new ServiceUnavailableException('El registro está guardado, pero la notificación no pudo entregarse. Revisa la configuración de correo.');
 return{ok:true,mensaje:'Notificación enviada.'};
 }
 async send(recurso:string,id:number,revision:number){
 const record=await this.record(recurso,id);const {item}=await this.get(recurso,id);
 if(item.revision!==revision)throw new ConflictException('La respuesta cambió. Recarga el caso antes de enviarla.');
 if(!item.respuesta.trim())throw new BadRequestException('Guarda una respuesta antes de enviarla.');
 if(!await this.mail.sendMail({from:this.config.get<string>('MAIL_USER'),to:record.email,subject:record.subject,text:item.respuesta}))throw new ServiceUnavailableException('La respuesta está guardada, pero el correo no pudo enviarse. Puedes reintentar el envío.');
 // Sending a saved snapshot does not silently close the case.
 return{ok:true,mensaje:'Respuesta enviada por correo.',revision:item.revision};
 }
}
