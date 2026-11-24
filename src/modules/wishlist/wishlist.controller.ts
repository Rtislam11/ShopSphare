
import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';

import { Request } from 'express';

import { WishlistService } from './wishlist.service';
import { AddWishlistItemDto } from './dto/add-wishlist-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
  };
}

@Controller('wishlist')
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(
    private readonly wishlistService: WishlistService,
  ) {}

  @Get()
  getWishlist(@Req() req: AuthenticatedRequest) {
    return this.wishlistService.getWishlist(
      req.user.userId,
    );
  }

  @Post('items')
  addItem(
    @Req() req: AuthenticatedRequest,
    @Body() dto: AddWishlistItemDto,
  ) {
    return this.wishlistService.addItem(
      req.user.userId,
      dto,
    );
  }


  @Delete('items/:id')
  removeItem(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) itemId: string,
  ) {
    return this.wishlistService.removeItem(
      req.user.userId,
      itemId,
    );
  }


  @Delete()
  clearWishlist(@Req() req: AuthenticatedRequest) {
    return this.wishlistService.clearWishlist(
      req.user.userId,
    );
  }
}
