import type { ChatMessageDto } from './chatbot.dto';

const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/^[¿¡\s]+/, '').trim();
const followUp = (text: string) => /^(y\b|cuanto\b|cuando\b|que (modalidad|duracion|incluye|temario|horario)|cual es (su|la)\b|tiene(n)? cupos|como (me inscribo|puedo inscribirme)|donde (se dicta|se realiza))/.test(normalize(text));

// References only select published records; history never supplies factual answers.
export function retrievalQuery(dto: ChatMessageDto): string {
  if (!followUp(dto.message)) return dto.message;
  const context: string[] = [];
  for (const turn of [...(dto.history || [])].reverse()) {
    if (turn.role !== 'user') continue;
    context.unshift(turn.content);
    if (!followUp(turn.content)) break;
  }
  return [...context, dto.message].join(' ');
}
