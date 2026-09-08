import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { GaleriaItem } from './galeria.model';
import { GaleriaController } from './galeria.controller';
import { AdminGaleriaController } from './admin-galeria.controller';
import { GaleriaService } from './galeria.service';

@Module({
  imports: [SequelizeModule.forFeature([GaleriaItem])],
  controllers: [GaleriaController, AdminGaleriaController],
  providers: [GaleriaService],
  exports: [GaleriaService],
})
export class GaleriaModule {}
