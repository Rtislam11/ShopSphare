import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';

import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
  };
}

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@Req() req: AuthenticatedRequest) {
    return this.cartService.getCart(req.user.userId);
  }

  @Post('items')
  addItem(
    @Req() req: AuthenticatedRequest,
    @Body() dto: AddCartItemDto,
  ) {
    return this.cartService.addItem(req.user.userId, dto);
  }

  @Put('items/:id')
  updateItem(
    @Req() req: AuthenticatedRequest,
    @Param('id') itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(req.user.userId, itemId, dto);
  }


  @Delete('items/:id')
  removeItem(
    @Req() req: AuthenticatedRequest,
    @Param('id') itemId: string,
  ) {
    return this.cartService.removeItem(req.user.userId, itemId);
  }


  @Delete()
  clearCart(@Req() req: AuthenticatedRequest) {
    return this.cartService.clearCart(req.user.userId);
  }
}