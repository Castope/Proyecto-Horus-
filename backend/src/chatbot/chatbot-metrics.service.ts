import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { cleanQuestion, questionFingerprint, retentionCutoff } from './chatbot-privacy';

const PURGE_EVERY_MS = 3_600_000; // la limpieza se intenta como máximo una vez por hora y por instancia

export type ChatInteraction = { modo: 'ia' | 'catalogo'; resuelta: boolean; fuentes: number; pregunta?: string };

// Métricas del chatbot. Registrar NUNCA debe afectar la respuesta al visitante: todo error se traga y se deja una advertencia sin datos.
// Solo se guarda texto de las preguntas sin respuesta, siempre redactado (correos, teléfonos y enlaces) y deduplicado por huella.
@Injectable()
export class ChatbotMetricsService {
  private readonly logger = new Logger(ChatbotMetricsService.name);
  private lastPurge = 0;
  constructor(private readonly prisma: PrismaService) {}

  // Elimina lo anterior a RETENTION_DAYS (90 días): preguntas sin respuesta (desde su última aparición) y métricas. Nunca lanza.
  async purgeExpired(now = new Date()): Promise<void> {
    try {
      const cutoff = retentionCutoff(now);
      await this.prisma.chatbotPreguntaSinRespuesta.deleteMany({ where: { updatedAt: { lt: cutoff } } });
      await this.prisma.chatbotInteraccion.deleteMany({ where: { createdAt: { lt: cutoff } } });
    } catch { this.logger.warn('Chatbot: no se pudo completar la limpieza por retención.'); }
  }

  async record(input: ChatInteraction): Promise<void> {
    try {
      await this.prisma.chatbotInteraccion.create({ data: { modo: input.modo, resuelta: input.resuelta, fuentes: input.fuentes } });
      if (!input.resuelta && input.pregunta) {
        const pregunta = cleanQuestion(input.pregunta);
        if (pregunta) {
          const huella = questionFingerprint(pregunta);
          await this.prisma.chatbotPreguntaSinRespuesta.upsert({ where: { huella }, create: { huella, pregunta }, update: { veces: { increment: 1 } } });
        }
      }
    } catch { this.logger.warn('Chatbot: no se pudieron registrar las métricas de interacción.'); }
    const now = Date.now();
    if (now - this.lastPurge >= PURGE_EVERY_MS) { this.lastPurge = now; await this.purgeExpired(new Date(now)); }
  }
}
