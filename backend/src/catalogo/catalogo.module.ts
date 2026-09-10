import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from '../admin/auth/auth.module';
import { Curso, Servicio, PreguntaFrecuente } from './catalogo.models';
import { CatalogoService } from './catalogo.service';
import { CursoController, AdminCursoController, ServicioController, AdminServicioController, PreguntaFrecuenteController, AdminPreguntaFrecuenteController } from './catalogo.controllers';

@Module({
  imports: [AuthModule, SequelizeModule.forFeature([Curso, Servicio, PreguntaFrecuente])],
  controllers: [CursoController, AdminCursoController, ServicioController, AdminServicioController, PreguntaFrecuenteController, AdminPreguntaFrecuenteController],
  providers: [CatalogoService],
  exports: [CatalogoService],
})
export class CatalogoModule {}
