export type ChatSource = { id: string; title: string; text: string };
export type ChatTurn = { role: 'user' | 'assistant'; content: string; sources?: ChatSource[] };
export type ChatReply = { ok: boolean; answer: string; sources: ChatSource[]; mode: 'catalogo' | 'ia'; notice?: string };

export async function chatRequest<T>(path: 'message' | 'contact', body: unknown, signal: AbortSignal): Promise<T> {
  const response = await fetch('/api/chatbot/' + path, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body), signal,
  });
  if (!response.ok) {
    if (response.status === 429) throw new Error('Has enviado varias solicitudes. Espera un minuto y vuelve a intentar.');
    if (response.status === 400) throw new Error('Revisa los datos enviados y vuelve a intentar.');
    throw new Error('No pudimos completar la solicitud. Intenta nuevamente o visita Contacto.');
  }
  return response.json() as Promise<T>;
}
