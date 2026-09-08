import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Setting } from './settings.model';
import { SettingsController } from './settings.controller';
import { AdminSettingsController } from './admin-settings.controller';
import { SettingsService } from './settings.service';

@Module({
  imports: [SequelizeModule.forFeature([Setting])],
  controllers: [SettingsController, AdminSettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
