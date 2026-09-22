import { Module } from '@nestjs/common';
import { NewsletterController } from './newsletter.controller';
import { AdminNewsletterController } from './admin-newsletter.controller';
import { NewsletterService } from './newsletter.service';

@Module({
  imports: [],
  controllers: [NewsletterController, AdminNewsletterController],
  providers: [NewsletterService],
  exports: [NewsletterService],
})
export class NewsletterModule {}
