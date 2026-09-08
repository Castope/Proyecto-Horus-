import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { GaleriaService } from './galeria.service';

@ApiTags('Galería')
@Controller('galeria')
export class GaleriaController {
  constructor(private readonly galeriaService: GaleriaService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener imágenes y proyectos públicos de la galería' })
  @ApiQuery({ name: 'categoria', required: false, description: 'Filtrar por categoría (ej. capacitaciones, servicio-tecnico)' })
  @ApiResponse({ status: 200, description: 'Listado de imágenes obtenido exitosamente' })
  async findPublic(@Query('categoria') categoria?: string) {
    return this.galeriaService.findPublic(categoria);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de un elemento de la galería' })
  @ApiResponse({ status: 200, description: 'Detalle del elemento' })
  @ApiResponse({ status: 404, description: 'Elemento no encontrado' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.galeriaService.findOne(id);
  }
}
