
import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Headers,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';

import { Request } from 'express';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
    username: string;
    roles: string[];
  };
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  // USER REGISTRATION
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  // USER LOGIN
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // REFRESH TOKENS
  @Post('refresh')
  async refresh(
    @Body('refreshToken') refreshToken: string,
  ) {
    if (!refreshToken) {
      throw new UnauthorizedException(
        'Refresh token is required',
      );
    }

    return this.authService.refresh(refreshToken);
  }

  // USER PROFILE
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req: AuthenticatedRequest) {
    return this.authService.getProfile(
      req.user.userId,
    );
  }

  // USER LOGOUT
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(
    @Headers('authorization') authorization: string,
    @Body('refreshToken') refreshToken?: string,
  ) {
    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Bearer token is required',
      );
    }

    const accessToken = authorization.substring(7);

    return this.authService.logout(
      accessToken,
      refreshToken,
    );
  }
}
