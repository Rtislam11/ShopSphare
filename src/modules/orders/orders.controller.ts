import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Req,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';

import { Request } from 'express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../admin/guards/admin.guard';

import { OrdersService } from './orders.service';
import { CheckoutDto } from './dto/checkout.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { SellersService } from '../sellers/sellers.service';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    roles?: string[];
  };
}

@Controller()
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly sellersService: SellersService,
  ) {}


  @Post('checkout')
  checkout(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CheckoutDto,
  ) {
    return this.ordersService.checkout(req.user.userId, dto);
  }

  // GET /orders
  @Get('orders')
  getCustomerOrders(@Req() req: AuthenticatedRequest) {
    return this.ordersService.getCustomerOrders(req.user.userId);
  }


  @Get('orders/seller/orders')
  async getSellerOrders(@Req() req: AuthenticatedRequest) {
    const seller = await this.sellersService.getProfile(req.user.userId);

    if (!seller) {
      throw new ForbiddenException('Seller profile not found');
    }

    return this.ordersService.getSellerOrders(seller.sellerId);
  }


  @Get('orders/:id')
  getOrderById(
    @Req() req: AuthenticatedRequest,
    @Param('id') orderId: string,
  ) {
    return this.ordersService.getOrderById(req.user.userId, orderId);
  }


  @Patch('orders/:id/status')
  @UseGuards(AdminGuard)
  updateOrderStatus(
    @Param('id') orderId: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateOrderStatus(orderId, dto);
  }


  @Post('orders/:id/payment')
  simulatePayment(
    @Req() req: AuthenticatedRequest,
    @Param('id') orderId: string,
  ) {
    return this.ordersService.simulatePayment(req.user.userId, orderId);
  }
}