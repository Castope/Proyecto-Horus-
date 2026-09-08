import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SettingsService } from './settings.service';

@ApiTags('Configuración')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener información y datos públicos de contacto de la empresa' })
  @ApiResponse({ status: 200, description: 'Configuración institucional de contacto y redes' })
  async getPublicSettings() {
    return this.settingsService.getPublicSettings();
  }
}
