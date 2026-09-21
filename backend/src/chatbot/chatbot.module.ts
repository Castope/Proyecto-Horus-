import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Curso, Servicio, PreguntaFrecuente } from '../catalogo/catalogo.models';
import { Contacto } from '../contacto/contacto.model';
import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';
import { ChatbotGuard } from './chatbot.guard';

@Module({
  imports: [SequelizeModule.forFeature([Curso, Servicio, PreguntaFrecuente, Contacto])],
  controllers: [ChatbotController],
  providers: [ChatbotService, ChatbotGuard],
})
export class ChatbotModule {}
