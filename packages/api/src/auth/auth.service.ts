import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email, is_deleted: false },
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.password_hash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const userRoles = await this.prisma.userRole.findMany({
      where: { user_id: user.user_id },
      include: { role: true },
    });

    const roles = userRoles.map((ur) => ur.role.role_name);
    const payload = { sub: user.user_id, email: user.email, roles };

    return {
      access_token: this.jwt.sign(payload),
      user: {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        roles,
        account_status: user.account_status,
      },
    };
  }
}
