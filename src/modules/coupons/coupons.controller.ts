
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';

import { CouponsService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { ValidateCouponDto } from './dto/validate-coupon.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../admin/guards/admin.guard';

@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}


  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  createCoupon(@Body() dto: CreateCouponDto) {
    return this.couponsService.createCoupon(dto);
  }


  @Get()
  getActiveCoupons() {
    return this.couponsService.getActiveCoupons();
  }

  @Get(':id')
  getCouponById(@Param('id', ParseUUIDPipe) id: string) {
    return this.couponsService.getCouponById(id);
  }


  @Put(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  updateCoupon(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCouponDto,
  ) {
    return this.couponsService.updateCoupon(id, dto);
  }


  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  deleteCoupon(@Param('id', ParseUUIDPipe) id: string) {
    return this.couponsService.deleteCoupon(id);
  }


  @Post('validate')
  validateCoupon(@Body() dto: ValidateCouponDto) {
    return this.couponsService.validateCoupon(dto);
  }
}
