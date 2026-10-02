import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ConveniosService } from './convenios.service';
import { ConveniosQueryDto, CreateConvenioDto, UpdateConvenioDto, CreateConvenioFotoDto, UpdateConvenioFotoDto, ReorderConvenioFotosDto } from './convenios.dto';

@ApiTags('Convenios')
@Controller('convenios')
export class ConveniosController {
  constructor(private readonly service: ConveniosService) {}
  @Get() list(@Query() q: ConveniosQueryDto) { return this.service.list(q, true); }
  @Get(':id') detail(@Param('id', ParseIntPipe) id: number) { return this.service.detail(id, true); }
}

@ApiTags('Administración de convenios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/convenios')
export class AdminConveniosController {
  constructor(private readonly service: ConveniosService) {}
  @Get() list(@Query() q: ConveniosQueryDto) { return this.service.list(q); }
  @Get(':id') detail(@Param('id', ParseIntPipe) id: number) { return this.service.detail(id); }
  @Post() create(@Body() dto: CreateConvenioDto) { return this.service.create(dto); }
  @Put(':id') update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateConvenioDto) { return this.service.update(id, dto); }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
  @Post(':id/fotos') addFoto(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateConvenioFotoDto) { return this.service.addFoto(id, dto); }
  @Put(':id/fotos/orden') reorder(@Param('id', ParseIntPipe) id: number, @Body() dto: ReorderConvenioFotosDto) { return this.service.reorderFotos(id, dto); }
  @Put(':id/fotos/:fotoId') updateFoto(@Param('id', ParseIntPipe) id: number, @Param('fotoId', ParseIntPipe) fotoId: number, @Body() dto: UpdateConvenioFotoDto) { return this.service.updateFoto(id, fotoId, dto); }
  @Delete(':id/fotos/:fotoId') removeFoto(@Param('id', ParseIntPipe) id: number, @Param('fotoId', ParseIntPipe) fotoId: number) { return this.service.removeFoto(id, fotoId); }
}
