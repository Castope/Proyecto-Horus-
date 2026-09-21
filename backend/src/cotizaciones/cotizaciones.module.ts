import { Module, Controller, Get, Post, Put, Param, ParseIntPipe, Body, Query, UseGuards } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthModule } from '../admin/auth/auth.module';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Contacto } from '../contacto/contacto.model';
import { Cotizacion } from './cotizacion.model';
import { CotizacionesService } from './cotizaciones.service';
import { CotizacionDto, CotizacionQueryDto, EditCotizacionDto, EstadoCotizacionDto } from './cotizacion.dto';

@ApiTags('Admin - Cotizaciones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/cotizaciones')
export class CotizacionesController {
  constructor(private readonly service: CotizacionesService) {}
  @Get() list(@Query() query: CotizacionQueryDto) { return this.service.list(query); }
  @Get(':id') detail(@Param('id', ParseIntPipe) id: number) { return this.service.detail(id); }
  @Post() create(@Body() dto: CotizacionDto, @CurrentUser('id') user: number) { return this.service.create(dto, user); }
  @Put(':id') edit(@Param('id', ParseIntPipe) id: number, @Body() dto: EditCotizacionDto, @CurrentUser('id') user: number) { return this.service.edit(id, dto, user); }
  @Post(':id/estado') status(@Param('id', ParseIntPipe) id: number, @Body() dto: EstadoCotizacionDto, @CurrentUser('id') user: number) { return this.service.status(id, dto, user); }
}
@Module({ imports: [AuthModule, SequelizeModule.forFeature([Cotizacion, Contacto])], controllers: [CotizacionesController], providers: [CotizacionesService] })
export class CotizacionesModule {}
