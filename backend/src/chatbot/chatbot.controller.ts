import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ChatbotService } from './chatbot.service';
import { ChatContactDto, ChatMessageDto } from './chatbot.dto';
import { ChatbotGuard } from './chatbot.guard';

@ApiTags('Chatbot')
@UseGuards(ChatbotGuard)
@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbot: ChatbotService) {}

  @Post('message')
  @HttpCode(200)
  message(@Body() dto: ChatMessageDto) { return this.chatbot.reply(dto); }

  @Post('contact')
  contact(@Body() dto: ChatContactDto) { return this.chatbot.contact(dto); }
}
