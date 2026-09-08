import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Reclamacion } from './reclamacion.model';
import { ReclamacionesController } from './reclamaciones.controller';
import { ReclamacionesService } from './reclamaciones.service';

@Module({
  imports: [SequelizeModule.forFeature([Reclamacion])],
  controllers: [ReclamacionesController],
  providers: [ReclamacionesService],
  exports: [ReclamacionesService],
})
export class ReclamacionesModule {}
