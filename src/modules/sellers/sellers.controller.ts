import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { Request } from 'express';

import { SellersService } from './sellers.service';
import { ApplySellerDto } from './dto/apply-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
  };
}

@Controller('sellers')
export class SellersController {
  constructor(private readonly sellersService: SellersService) {}

  
  @Post('apply')
  @UseGuards(JwtAuthGuard)
  apply(
    @Req() req: AuthenticatedRequest,
    @Body() dto: ApplySellerDto,
  ) {
    return this.sellersService.apply(req.user.userId, dto);
  }

 
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: AuthenticatedRequest) {
    return this.sellersService.getProfile(req.user.userId);
  }

 
  @Put('profile')
  @UseGuards(JwtAuthGuard)
  updateProfile(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateSellerDto,
  ) {
    return this.sellersService.updateProfile(req.user.userId, dto);
  }

  
  @Get(':id')
  getSellerById(@Param('id', ParseUUIDPipe) id: string) {
    return this.sellersService.getSellerById(id);
  }

  
  @Get(':id/reliability')
  getReliability(@Param('id', ParseUUIDPipe) id: string) {
    return this.sellersService.getReliability(id);
  }
}