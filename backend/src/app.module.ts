import { CatalogoModule } from './catalogo/catalogo.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { MailModule } from './mail/mail.module';
import { ContactoModule } from './contacto/contacto.module';
import { ReclamacionesModule } from './reclamaciones/reclamaciones.module';
import { AdminModule } from './admin/admin.module';
import { GaleriaModule } from './galeria/galeria.module';
import { NewsletterModule } from './newsletter/newsletter.module';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    CatalogoModule,
    MailModule,
    ContactoModule,
    ReclamacionesModule,
    AdminModule,
    GaleriaModule,
    NewsletterModule,
    SettingsModule,
  ],
})
export class AppModule {}

