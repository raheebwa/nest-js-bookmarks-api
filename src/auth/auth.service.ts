import { ForbiddenException, Injectable } from '@nestjs/common';
import * as argon from 'argon2';
import { AuthDto } from './dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}
  async login(dto: AuthDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        email: dto.email,
      },
    });

    if (!user) {
      throw new ForbiddenException('Invalid credentials');
    }

    const isValid = await argon.verify(user.hash, dto.password);
    if (!isValid) {
      throw new ForbiddenException('Invalid credentials');
    }

    return this.signToken(user.id, user.email);
  }
  async signup(dto: AuthDto) {
    // generate password hash
    const hash = await argon.hash(dto.password);
    // save new user to db
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
        },
      });

      delete user.hash;
      return user;
    } catch (err) {
      if (err.code === 'P2002') {
        throw new ForbiddenException('Credentials are taken');
      }
    }
  }

  async signToken(
    userID: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const data = {
      sub: userID,
      email,
    };

    const token = await this.jwt.signAsync(data, {
      expiresIn: '15m',
      secret: this.config.get('JWT_SECRET'),
    });

    return {
      access_token: token,
    };
  }
}
