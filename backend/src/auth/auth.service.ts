import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      user,
      token: this.jwtService.sign(payload),
    };
  }

  async register(registerDto: RegisterDto) {
    // Проверяем, существует ли пользователь
    const existingUser = await this.usersService
      .findByEmail(registerDto.email)
      .catch(() => null);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Создаем нового пользователя
    const user = await this.usersService.create(registerDto);

    // Возвращаем токен и данные пользователя
    return this.login(user);
  }

  async getCurrentUser(userId: string) {
    const user = await this.usersService.findOne(userId);
    return user;
  }
}
