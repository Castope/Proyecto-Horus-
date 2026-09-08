import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Contacto } from '../contacto/contacto.model';
import { Reclamacion } from '../reclamaciones/reclamacion.model';
import { AdminUser } from '../admin/auth/admin-user.model';
import { AdminItem } from '../admin/items/admin-item.model';
import { GaleriaItem } from '../galeria/galeria.model';
import { Newsletter } from '../newsletter/newsletter.model';
import { Setting } from '../settings/settings.model';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        dialect: 'mysql',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: Number(configService.get<number>('DB_PORT', 3306)),
        username: configService.get<string>('DB_USER', 'root'),
        password: configService.get<string>('DB_PASS', '123456789'),
        database: configService.get<string>('DB_NAME', 'horus_db'),
        models: [Contacto, Reclamacion, AdminUser, AdminItem, GaleriaItem, Newsletter, Setting],
        autoLoadModels: true,
        synchronize: true,
        sync: { alter: true },
        logging: false,
      }),
    }),
  ],
})
export class DatabaseModule {}
