import { Body, Controller, Get, Module, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthModule } from '../admin/auth/auth.module';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AttentionDto, AttentionSendDto } from './attention.dto';
import { AttentionService } from './attention.service';
@ApiTags('Admin - Seguimiento')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/seguimiento/:recurso/:id')
export class AttentionController {
 constructor(private readonly service:AttentionService){}
 @Get() get(@Param('recurso') recurso:string,@Param('id',ParseIntPipe) id:number){return this.service.get(recurso,id);}
 @Put() save(@Param('recurso') recurso:string,@Param('id',ParseIntPipe) id:number,@Body() dto:AttentionDto,@CurrentUser('id') user:number){return this.service.save(recurso,id,dto,user);}
 @Post('constancia') receipt(@Param('recurso') recurso:string,@Param('id',ParseIntPipe) id:number){return this.service.receipt(recurso,id);}
 @Post('correo') send(@Param('recurso') recurso:string,@Param('id',ParseIntPipe) id:number,@Body() dto:AttentionSendDto){return this.service.send(recurso,id,dto.revision);}
}
@Module({imports:[AuthModule],controllers:[AttentionController],providers:[AttentionService]})
export class AttentionModule {}
