import { Controller, Get } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

// Comprobación de vida para el healthcheck del despliegue: no toca la base de datos ni expone datos.
@ApiExcludeController()
@Controller('health')
export class HealthController {
  @Get()
  check() {
    return { ok: true };
  }
}
