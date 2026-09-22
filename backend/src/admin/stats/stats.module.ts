import { CatalogoModule } from '../../catalogo/catalogo.module';
import { Module } from '@nestjs/common';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';

@Module({
  imports: [CatalogoModule],
  controllers: [StatsController],
  providers: [StatsService],
  exports: [StatsService],
})
export class StatsModule {}
