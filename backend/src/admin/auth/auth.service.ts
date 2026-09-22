import { isUniqueViolation } from '../../database/serialization';
import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AdminUser } from '@prisma/client';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private generateToken(user: AdminUser): string {
    return this.jwtService.sign({ id: user.id, email: user.email });
  }

  async register(dto: RegisterDto) {
    const exists = await this.prisma.adminUser.findFirst({ where: { email: dto.email.toLowerCase().trim() } });
    if (exists) {
      throw new ConflictException({ ok: false, mensaje: 'Ya existe un administrador con ese correo.' });
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);
    let user: AdminUser;
    try {
      user = await this.prisma.adminUser.create({ data: {
        nombre: dto.nombre.trim(),
        email: dto.email.toLowerCase().trim(),
        password: hashedPassword,
      } });
    } catch (error) {
      if (isUniqueViolation(error)) throw new ConflictException({ ok: false, mensaje: 'Ya existe un administrador con ese correo.' });
      throw error;
    }

    const token = this.generateToken(user);

    return {
      ok: true,
      mensaje: 'Administrador registrado correctamente.',
      token,
      user: { id: user.id, nombre: user.nombre, email: user.email },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.adminUser.findFirst({ where: { email: dto.email.toLowerCase().trim() } });
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException({ ok: false, mensaje: 'Credenciales incorrectas.' });
    }

    const token = this.generateToken(user);

    return {
      ok: true,
      mensaje: 'Login correcto.',
      token,
      user: { id: user.id, nombre: user.nombre, email: user.email },
    };
  }
}
