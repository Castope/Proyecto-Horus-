import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Contacto } from './contacto.model';
import { ContactoController } from './contacto.controller';
import { ContactoService } from './contacto.service';

@Module({
  imports: [SequelizeModule.forFeature([Contacto])],
  controllers: [ContactoController],
  providers: [ContactoService],
  exports: [ContactoService, SequelizeModule],
})
export class ContactoModule {}
