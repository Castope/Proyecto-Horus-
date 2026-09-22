import { Module } from '@nestjs/common';
import { AdminReclamacionesController } from './admin-reclamaciones.controller';
import { AdminReclamacionesService } from './admin-reclamaciones.service';

@Module({
  imports: [],
  controllers: [AdminReclamacionesController],
  providers: [AdminReclamacionesService],
  exports: [AdminReclamacionesService],
})
export class AdminReclamacionesModule {}
