import { Module } from '@nestjs/common';
import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';
import { ChatbotGuard } from './chatbot.guard';

@Module({
  imports: [],
  controllers: [ChatbotController],
  providers: [ChatbotService, ChatbotGuard],
})
export class ChatbotModule {}
