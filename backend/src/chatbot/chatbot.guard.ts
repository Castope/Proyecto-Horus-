import { CanActivate, ExecutionContext, HttpException, Injectable } from '@nestjs/common';

@Injectable()
export class ChatbotGuard implements CanActivate {
  private buckets = new Map<string, { count: number; expires: number }>();
  private total = { count: 0, expires: 0 };

  canActivate(context: ExecutionContext) {
    const now = Date.now();
    for (const [key, bucket] of this.buckets) {
      if (bucket.expires <= now) this.buckets.delete(key);
    }
    if (this.total.expires <= now) this.total = { count: 0, expires: now + 60_000 };
    const req = context.switchToHttp().getRequest();
    // Never trust a client-supplied forwarding header.
    const isContact = req.path?.endsWith('/contact');
    const key = String(req.ip || req.socket?.remoteAddress || 'unknown') + (isContact ? ':contact' : ':message');
    const bucket = this.buckets.get(key) || { count: 0, expires: now + 60_000 };
    const limit = isContact ? 5 : 20;
    if (bucket.count >= limit || this.total.count >= 200) {
      throw new HttpException({ ok: false, mensaje: 'Has enviado varias solicitudes. Espera un minuto y vuelve a intentar.' }, 429);
    }
    bucket.count++;
    this.total.count++;
    this.buckets.set(key, bucket);
    return true;
  }
}
