import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Admin - Estadísticas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener métricas, estadísticas y actividad reciente del sistema' })
  @ApiResponse({ status: 200, description: 'Estadísticas consolidadas para el dashboard' })
  async getDashboardStats() {
    return this.statsService.getDashboardStats();
  }
}
