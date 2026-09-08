import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Contacto } from '../../contacto/contacto.model';
import { Reclamacion } from '../../reclamaciones/reclamacion.model';
import { AdminItem } from '../items/admin-item.model';
import { AdminUser } from '../auth/admin-user.model';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';

@Module({
  imports: [SequelizeModule.forFeature([Contacto, Reclamacion, AdminItem, AdminUser])],
  controllers: [StatsController],
  providers: [StatsService],
  exports: [StatsService],
})
export class StatsModule {}
