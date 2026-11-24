
import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { randomUUID, createHash } from 'crypto';

import { AuditService } from '../audit/audit.service';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Role } from '@/common/enums/role.enum';
import { RedisCacheService } from '@/providers/cache/redis/redis-cache.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly auditService: AuditService,

    private readonly jwtService: JwtService,

    private readonly redisCacheService: RedisCacheService,
  ) {}


  private hashToken(token: string): string {
    return createHash('sha256')
      .update(token)
      .digest('hex');
  }

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await argon2.hash(dto.password);

    const user = this.userRepository.create({
      name: dto.name.trim(),
      email,
      passwordHash,
      role: Role.USER,
      status: 'ACTIVE',
    });

    const savedUser = await this.userRepository.save(user);

    return {
      message: 'Registration successful',
      user: {
        userId: savedUser.userId,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role,
      },
    };
  }

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();

    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email })
      .getOne();

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status !== 'ACTIVE') {
      throw new ForbiddenException('Account is inactive');
    }

    const passwordMatches = await argon2.verify(
      user.passwordHash,
      dto.password,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const jti = randomUUID();
    const sessionId = randomUUID();

    const accessToken = await this.jwtService.signAsync(
      {
        sub: user.userId,
        jti,
        username: user.name,
        email: user.email,
        roles: [user.role],
      },
      {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: '15m',
      },
    );

    const refreshToken = await this.jwtService.signAsync(
      {
        sub: user.userId,
        sid: sessionId,
        type: 'refresh',
      },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d',
      },
    );

    await this.redisCacheService.getClient().set(
      `refresh_session:${sessionId}`,
      this.hashToken(refreshToken),
      { EX: 7 * 24 * 60 * 60 },
    );

    await this.auditService.log({
      userId: user.userId,
      action: 'LOGIN',
      entity: 'USER',
      entityId: user.userId,
      description: 'User logged in successfully',
    });

    return {
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async refresh(refreshToken: string) {
    let payload: {
      sub: string;
      sid: string;
      type: string;
    };

    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (!payload.sid || payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const redis = this.redisCacheService.getClient();
    const sessionKey = `refresh_session:${payload.sid}`;

    const storedHash = await redis.get(sessionKey);

    if (
      !storedHash ||
      storedHash !== this.hashToken(refreshToken)
    ) {
      throw new UnauthorizedException(
        'Refresh token revoked or reused',
      );
    }

    const user = await this.userRepository.findOne({
      where: { userId: payload.sub },
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('User is unavailable');
    }

    await redis.del(sessionKey);

    const newJti = randomUUID();
    const newSessionId = randomUUID();

    const newAccessToken = await this.jwtService.signAsync(
      {
        sub: user.userId,
        jti: newJti,
        username: user.name,
        email: user.email,
        roles: [user.role],
      },
      {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: '15m',
      },
    );

    const newRefreshToken = await this.jwtService.signAsync(
      {
        sub: user.userId,
        sid: newSessionId,
        type: 'refresh',
      },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d',
      },
    );
    await redis.set(
      `refresh_session:${newSessionId}`,
      this.hashToken(newRefreshToken),
      { EX: 7 * 24 * 60 * 60 },
    );

    return {
      message: 'Tokens refreshed successfully',
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

 
  async logout(token: string, refreshToken?: string) {
    let accessPayload: {
      sub?: string;
      jti?: string;
      exp?: number;
    };

    try {
      accessPayload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Invalid access token');
    }

    if (
      !accessPayload.sub ||
      !accessPayload.jti ||
      !accessPayload.exp
    ) {
      throw new UnauthorizedException('Invalid access token');
    }

    const redis = this.redisCacheService.getClient();

    const remainingSeconds =
      accessPayload.exp - Math.floor(Date.now() / 1000);

    if (remainingSeconds <= 0) {
      throw new UnauthorizedException('Access token expired');
    }

   
    await redis.set(
      `blacklisted_token:${accessPayload.jti}`,
      'revoked',
      { EX: remainingSeconds },
    );

   
    if (refreshToken) {
      try {
        const refreshPayload = await this.jwtService.verifyAsync(
          refreshToken,
          {
            secret: process.env.JWT_REFRESH_SECRET,
          },
        );

        if (
          refreshPayload.type === 'refresh' &&
          refreshPayload.sid
        ) {
          const sessionKey =
            `refresh_session:${refreshPayload.sid}`;

          const storedHash = await redis.get(sessionKey);

          if (
            storedHash &&
            storedHash === this.hashToken(refreshToken)
          ) {
            await redis.del(sessionKey);
          }
        }
      } catch {
      
      }
    }

    await this.auditService.log({
      userId: accessPayload.sub,
      action: 'LOGOUT',
      entity: 'USER',
      entityId: accessPayload.sub,
      description: 'User logged out successfully',
    });

    return {
      message: 'Logout successful',
    };
  }


  async getProfile(userId: string) {
    const user = await this.userRepository.findOne({
      where: { userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      userId: user.userId,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
    };
  }
}
