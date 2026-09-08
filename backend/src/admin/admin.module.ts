import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ItemsModule } from './items/items.module';
import { MessagesModule } from './messages/messages.module';
import { AdminReclamacionesModule } from './reclamaciones/admin-reclamaciones.module';
import { StatsModule } from './stats/stats.module';

@Module({
  imports: [
    AuthModule,
    ItemsModule,
    MessagesModule,
    AdminReclamacionesModule,
    StatsModule,
  ],
  exports: [
    AuthModule,
    ItemsModule,
    MessagesModule,
    AdminReclamacionesModule,
    StatsModule,
  ],
})
export class AdminModule {}

