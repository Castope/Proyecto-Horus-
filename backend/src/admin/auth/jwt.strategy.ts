import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';

export interface JwtPayload {
  id: number;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret || secret.length < 32) {
      throw new Error('JWT_SECRET debe tener al menos 32 caracteres.');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
      issuer: 'horus-api',
      audience: 'horus-panel',
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload || !Number.isSafeInteger(payload.id) || payload.id <= 0) {
      throw new UnauthorizedException({ ok: false, mensaje: 'Identidad no válida.' });
    }
    const user = await this.prisma.adminUser.findUnique({ where: { id: payload.id } });
    if (!user) {
      throw new UnauthorizedException({ ok: false, mensaje: 'Usuario no encontrado o inactivo.' });
    }
    return { id: user.id, nombre: user.nombre, email: user.email };
  }
}
