import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Newsletter } from './newsletter.model';
import { NewsletterController } from './newsletter.controller';
import { AdminNewsletterController } from './admin-newsletter.controller';
import { NewsletterService } from './newsletter.service';

@Module({
  imports: [SequelizeModule.forFeature([Newsletter])],
  controllers: [NewsletterController, AdminNewsletterController],
  providers: [NewsletterService],
  exports: [NewsletterService],
})
export class NewsletterModule {}
