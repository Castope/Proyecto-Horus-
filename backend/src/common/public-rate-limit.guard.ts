import { CanActivate, ExecutionContext, HttpException, Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { PrismaService } from '../database/prisma.service';
import type { Request } from 'express';
const limits:Record<string,number>={'/admin/login':10,'/admin/register':5,'/admin/forgot-password':5,'/admin/reset-password':5,'/admin/password':5,'/contacto':5,'/reclamaciones':5,'/newsletter':5,'/newsletter/unsubscribe':5,'/chatbot/message':20,'/chatbot/contact':5};
@Injectable()
export class PublicRateLimitGuard implements CanActivate {
 constructor(private readonly prisma:PrismaService){}
 async canActivate(context:ExecutionContext) {
 const request=context.switchToHttp().getRequest<Request>();
 if(request.method!=='POST')return true;
 const scope=request.path.toLowerCase().replace(/^\/api(?=\/)/,'').replace(/\/$/,'');
 const limit=limits[scope];if(!limit)return true;
 const now=Date.now(),window=Math.floor(now/60000),expiresAt=new Date((window+2)*60000);
 const key=(value:string)=>createHash('sha256').update(value+':'+window).digest('hex');
 const id=key(scope+':'+(request.ip||request.socket.remoteAddress||'unknown')),global=key('all-public');
 // Atomic increments in MySQL share the quota between API processes.
 const [individual,total]=await this.prisma.$transaction(async tx=>{
 await tx.$executeRaw`INSERT INTO rate_limit_buckets (id, count, expiresAt) VALUES (${id}, 1, ${expiresAt}) ON DUPLICATE KEY UPDATE count = count + 1`;
 await tx.$executeRaw`INSERT INTO rate_limit_buckets (id, count, expiresAt) VALUES (${global}, 1, ${expiresAt}) ON DUPLICATE KEY UPDATE count = count + 1`;
 return Promise.all([tx.rateLimitBucket.findUniqueOrThrow({where:{id}}),tx.rateLimitBucket.findUniqueOrThrow({where:{id:global}})]);
 });
 await this.prisma.rateLimitBucket.deleteMany({where:{expiresAt:{lt:new Date(now)}}});
 if(individual.count>limit||total.count>200)throw new HttpException({ok:false,mensaje:'Has enviado varias solicitudes. Espera un minuto y vuelve a intentar.'},429);
 return true;
 }
}
