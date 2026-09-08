import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Reclamacion } from '../../reclamaciones/reclamacion.model';
import { AdminReclamacionesController } from './admin-reclamaciones.controller';
import { AdminReclamacionesService } from './admin-reclamaciones.service';

@Module({
  imports: [SequelizeModule.forFeature([Reclamacion])],
  controllers: [AdminReclamacionesController],
  providers: [AdminReclamacionesService],
  exports: [AdminReclamacionesService],
})
export class AdminReclamacionesModule {}
