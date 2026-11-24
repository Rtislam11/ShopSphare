
import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { RedisCacheService } from '@/providers/cache/redis/redis-cache.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly redisCacheService: RedisCacheService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET!,
    });
  }

  async validate(payload: any) {
  console.log('JWT PAYLOAD:', {
    sub: payload.sub,
    jti: payload.jti,
    exp: payload.exp,
  });

  if (!payload.jti) {
    throw new UnauthorizedException('Missing token ID');
  }

  const tokenKey = `blacklisted_token:${payload.jti}`;

  const isBlacklisted = await this.redisCacheService
    .getClient()
    .exists(tokenKey);

  console.log('TOKEN BLACKLISTED:', isBlacklisted);

  if (isBlacklisted) {
    throw new UnauthorizedException('Token has been revoked');
  }

  return {
    userId: payload.sub,
    email: payload.email,
    username: payload.username,
    roles: payload.roles,
  };
}
}
