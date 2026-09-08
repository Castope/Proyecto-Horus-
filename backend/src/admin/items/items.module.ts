import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AdminItem } from './admin-item.model';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';

@Module({
  imports: [SequelizeModule.forFeature([AdminItem])],
  controllers: [ItemsController],
  providers: [ItemsService],
  exports: [ItemsService],
})
export class ItemsModule {}
