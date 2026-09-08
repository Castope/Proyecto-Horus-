import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AdminUser } from './admin-user.model';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(AdminUser)
    private readonly adminUserModel: typeof AdminUser,
    private readonly jwtService: JwtService,
  ) {}

  private generateToken(user: AdminUser): string {
    return this.jwtService.sign({ id: user.id, email: user.email });
  }

  async register(dto: RegisterDto) {
    const exists = await this.adminUserModel.findOne({ where: { email: dto.email.toLowerCase() } });
    if (exists) {
      throw new ConflictException({ ok: false, mensaje: 'Ya existe un administrador con ese correo.' });
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);
    const user = await this.adminUserModel.create({
      nombre: dto.nombre.trim(),
      email: dto.email.toLowerCase().trim(),
      password: hashedPassword,
    });

    const token = this.generateToken(user);

    return {
      ok: true,
      mensaje: 'Administrador registrado correctamente.',
      token,
      user: { id: user.id, nombre: user.nombre, email: user.email },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.adminUserModel.findOne({ where: { email: dto.email.toLowerCase().trim() } });
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
