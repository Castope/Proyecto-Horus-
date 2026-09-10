import { Body, Controller, Get, Post, Put, Delete, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CatalogoService } from './catalogo.service';
import { CatalogoQueryDto, CreateCursoDto, UpdateCursoDto, CreateServicioDto, UpdateServicioDto, CreatePreguntaFrecuenteDto, UpdatePreguntaFrecuenteDto } from './catalogo.dto';

@ApiTags('cursos')
@Controller('cursos')
export class CursoController {
  constructor(private readonly service: CatalogoService) {}
  @Get()
  @ApiOperation({ summary: 'Listar contenido publicado con paginación y búsqueda' })
  list(@Query() query: CatalogoQueryDto) { return this.service.list('cursos', query, true); }
  @Get(':id')
  detail(@Param('id', ParseIntPipe) id: number) { return this.service.detail('cursos', id, true); }
}

@ApiTags('Admin - cursos')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('admin/cursos')
export class AdminCursoController {
  constructor(private readonly service: CatalogoService) {}
  @Get()
  list(@Query() query: CatalogoQueryDto) { return this.service.list('cursos', query); }
  @Get(':id')
  detail(@Param('id', ParseIntPipe) id: number) { return this.service.detail('cursos', id); }
  @Post()
  create(@Body() dto: CreateCursoDto) { return this.service.create('cursos', dto); }
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCursoDto) {
    return this.service.update('cursos', id, dto);
  }
  @Delete(':id')
  @ApiOperation({ summary: 'Archivar contenido sin borrar su registro' })
  archive(@Param('id', ParseIntPipe) id: number) { return this.service.archive('cursos', id); }
}

@ApiTags('servicios')
@Controller('servicios')
export class ServicioController {
  constructor(private readonly service: CatalogoService) {}
  @Get()
  @ApiOperation({ summary: 'Listar contenido publicado con paginación y búsqueda' })
  list(@Query() query: CatalogoQueryDto) { return this.service.list('servicios', query, true); }
  @Get(':id')
  detail(@Param('id', ParseIntPipe) id: number) { return this.service.detail('servicios', id, true); }
}

@ApiTags('Admin - servicios')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('admin/servicios')
export class AdminServicioController {
  constructor(private readonly service: CatalogoService) {}
  @Get()
  list(@Query() query: CatalogoQueryDto) { return this.service.list('servicios', query); }
  @Get(':id')
  detail(@Param('id', ParseIntPipe) id: number) { return this.service.detail('servicios', id); }
  @Post()
  create(@Body() dto: CreateServicioDto) { return this.service.create('servicios', dto); }
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateServicioDto) {
    return this.service.update('servicios', id, dto);
  }
  @Delete(':id')
  @ApiOperation({ summary: 'Archivar contenido sin borrar su registro' })
  archive(@Param('id', ParseIntPipe) id: number) { return this.service.archive('servicios', id); }
}

@ApiTags('preguntas-frecuentes')
@Controller('preguntas-frecuentes')
export class PreguntaFrecuenteController {
  constructor(private readonly service: CatalogoService) {}
  @Get()
  @ApiOperation({ summary: 'Listar contenido publicado con paginación y búsqueda' })
  list(@Query() query: CatalogoQueryDto) { return this.service.list('preguntas-frecuentes', query, true); }
  @Get(':id')
  detail(@Param('id', ParseIntPipe) id: number) { return this.service.detail('preguntas-frecuentes', id, true); }
}

@ApiTags('Admin - preguntas-frecuentes')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('admin/preguntas-frecuentes')
export class AdminPreguntaFrecuenteController {
  constructor(private readonly service: CatalogoService) {}
  @Get()
  list(@Query() query: CatalogoQueryDto) { return this.service.list('preguntas-frecuentes', query); }
  @Get(':id')
  detail(@Param('id', ParseIntPipe) id: number) { return this.service.detail('preguntas-frecuentes', id); }
  @Post()
  create(@Body() dto: CreatePreguntaFrecuenteDto) { return this.service.create('preguntas-frecuentes', dto); }
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePreguntaFrecuenteDto) {
    return this.service.update('preguntas-frecuentes', id, dto);
  }
  @Delete(':id')
  @ApiOperation({ summary: 'Archivar contenido sin borrar su registro' })
  archive(@Param('id', ParseIntPipe) id: number) { return this.service.archive('preguntas-frecuentes', id); }
}
