
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
  Req,
} from '@nestjs/common';
import { Request } from 'express';

import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { UpdateStockDto } from './dto/update-stock.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
  };
}

@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Get()
  getAllOffers() {
    return this.offersService.getAllOffers();
  }

  @Get(':id')
  getOfferById(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.offersService.getOfferById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  createOffer(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateOfferDto,
  ) {
    return this.offersService.createOffer(
      req.user.userId,
      dto,
    );
  }

  
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  updateOffer(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateOfferDto,
  ) {
    return this.offersService.updateOffer(
      id,
      req.user.userId,
      dto,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  deleteOffer(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.offersService.deleteOffer(
      id,
      req.user.userId,
    );
  }

  
  @Patch(':id/stock')
  @UseGuards(JwtAuthGuard)
  updateStock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateStockDto,
  ) {
    return this.offersService.updateStock(
      id,
      req.user.userId,
      dto,
    );
  }
}
