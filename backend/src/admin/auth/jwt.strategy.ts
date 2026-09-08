import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/sequelize';
import { AdminUser } from './admin-user.model';

export interface JwtPayload {
  id: number;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(AdminUser)
    private readonly adminUserModel: typeof AdminUser,
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
    const user = await this.adminUserModel.findByPk(payload.id);
    if (!user) {
      throw new UnauthorizedException({ ok: false, mensaje: 'Usuario no encontrado o inactivo.' });
    }
    return { id: user.id, nombre: user.nombre, email: user.email };
  }
}
