import { Module } from '@nestjs/common';
import { GaleriaController } from './galeria.controller';
import { AdminGaleriaController } from './admin-galeria.controller';
import { GaleriaService } from './galeria.service';

@Module({
  imports: [],
  controllers: [GaleriaController, AdminGaleriaController],
  providers: [GaleriaService],
  exports: [GaleriaService],
})
export class GaleriaModule {}
