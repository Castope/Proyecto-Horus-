import { Module } from '@nestjs/common';
import { ReclamacionesController } from './reclamaciones.controller';
import { ReclamacionesService } from './reclamaciones.service';

@Module({
  imports: [],
  controllers: [ReclamacionesController],
  providers: [ReclamacionesService],
  exports: [ReclamacionesService],
})
export class ReclamacionesModule {}
