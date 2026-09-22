import { Module } from '@nestjs/common';
import { AuthModule } from '../admin/auth/auth.module';
import { CatalogoService } from './catalogo.service';
import { CursoController, AdminCursoController, ServicioController, AdminServicioController, PreguntaFrecuenteController, AdminPreguntaFrecuenteController } from './catalogo.controllers';

@Module({
  imports: [AuthModule],
  controllers: [CursoController, AdminCursoController, ServicioController, AdminServicioController, PreguntaFrecuenteController, AdminPreguntaFrecuenteController],
  providers: [CatalogoService],
  exports: [CatalogoService],
})
export class CatalogoModule {}
